import moment from 'moment';
import SignIns from './SignIns';
import sqlite3 from 'sqlite3';
import { writeToPromise, readToPromise } from '../utils/helpers';

const db = new sqlite3.Database('rrgc.db');
const DATE_FORMAT = 'YYYYMMDD';

const creatorSQL = `insert into sessions values ($ro_id, $name, $date, $start_float, 0, 0)`;
const updateSQL  = `UPDATE sessions SET 
name = $name,
start_float = $start_float,
end_float = $end_float,
down = $down
WHERE
rowid = $id`;

const Sessions = {
  get: (date) => {
    date =  date === 'today' ? moment().format(DATE_FORMAT) : date;
    return new Promise((resolve, reject) => {
      db.all(`
      SELECT sessions.rowid as id, * 
      FROM sessions 
      LEFT JOIN 
        (SELECT first_name ro_firstname, last_name as ro_lastname FROM users) as users 
      ON sessions.ro_id = users.rowid 
      where date = ?`, [date], (err, sessions) => { 
        if(err) reject(err)
        else {
          Promise.all(
            sessions.map((session) => {
              return SignIns.getFromSession(session.id);
            })
          ).then((responses) => {

            for(let i=0; i<sessions.length; i++) {

              sessions[i].calculated_down = responses[i].reduce((sum, signin) => {
                return sum + signin.fee;
              }, 0);
              sessions[i].calculated_float = sessions[i].start_float - sessions[i].calculated_down;

              sessions[i].signins = responses[i];
            }

            resolve(sessions);
          });
        };
      })

    });
  },
  getToday: () => {
    const date = moment().format(DATE_FORMAT);
    return Sessions.get(date);
  },
  create: (payload) => {
    return new Promise((resolve, reject) => {
      const date = moment().format(DATE_FORMAT);

      db.run(
        creatorSQL,
        {
          $ro_id: payload.user_id,
          $name: payload.name,
          $date: date,
          $start_float: payload.start_float,
        },
        (err, response) => {
          if(err) reject(err);
          else {
            resolve('success');
          }
        }
      );
    })
  },
  end: (payload) => {
    return new Promise((resolve, reject) => {
      db.run(
        updateSQL,
        {
          $id: payload.session_id,
          $name: payload.name,
          $start_float: payload.start_float,
          $end_float: payload.end_float,
          $down: payload.down,
        },
        (err, response) => {
          if(err) reject(err);
          else {
            resolve('success');
          }
        }
      );
    })
  }
};

export default Sessions;
