import moment from 'moment';
import User from './User';
import Services from './Services';
import sqlite3 from 'sqlite3';
import { writeToPromise, readToPromise } from '../utils/helpers';

const db = new sqlite3.Database('rrgc.db');
const DATE_FORMAT = 'YYYYMMDD';

const creatorSQL = `insert into signins values ($uid, $session_id, $time, $fee)`;

const SignIns = {
  create: (payload) => {
    return new Promise((resolve, reject) => {
      Promise.all([Services.get(), User.get(payload.user_id)]).then(([services, user]) => {

        services = services.reduce((acc, service) => {
          acc[service.service_id] = service;
          return acc;
        }, {});

        console.log('services', services);

        const time = new Date().getTime();
        const date = moment().format(DATE_FORMAT);

        let range_fee;

        if (user.range_officer === 1) {
          range_fee = services.range_fee_ro.cost;
        } else if (user.member_id) {
          range_fee = services.range_fee_member.cost;
        } else {
          range_fee = services.range_fee_non_member.cost;
        }

        const cost = payload.rentals.services.reduce((sum, service_id) => {
          return sum + services[service_id].cost
        }, 
          payload.rentals.range * range_fee + 
          (payload.rentals.custom || 0)
        );

        const entry = {
          user_name: user.first_name,
          time: time,
          cost: cost
        };

        resolve(entry);
        db.run(
          creatorSQL,
          {
            $uid: payload.user_id,
            $session_id: payload.session_id,
            $time: time,
            $fee: cost
          },
          (err, res) => {
            if (err) {
              if (err.code === 'SQLITE_CONSTRAINT') {
                err = { error: 'ALREADY_SIGNED_IN' };
              }
              reject(err);
            } else {
              resolve(entry);
            }
          }
        );
      });
    });
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT rowid as id, * from signins where rowid = ?', [id], readToPromise(resolve, reject));
    });
  },
  getFromSession: (session_id) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT rowid as id, * from signins where session_id = ?', [session_id], readToPromise(resolve, reject));
    });
  }
};

export default SignIns;
