import sqlite3 from 'sqlite3';
import ROS from  '../seeds/ros';

const db = new sqlite3.Database('rrgc.db');

db.serialize(function() {
  db.run("CREATE TABLE if not exists users (first_name TEXT, last_name TEXT, phone_number TEXT, member_number INT, ac_number TEXT, range_officer INT, deleted INT)");
});

db.on('trace', (sql)=>{
  console.log('sql:', sql);
});

const cbToPromise = (resolve, reject) => {
  return (err, res) => { 
    console.log(err);
    if(err) reject(err);
    else resolve(res);
  };
};

const finderSQL = `
SELECT rowid as id, * FROM users
WHERE
first_name like $keyword 
OR
last_name like $keyword 
OR
member_number like $keyword 
OR
ac_number like $keyword 
AND deleted = 0
`;

const creatorSQL = `insert into users values ($fn, $ln, $pn, $mn, $an, $ro, 0)`;
const updateSQL = `
UPDATE users
SET 
first_name = $fn,
last_name = $ln,
phone_number = $pn,
member_number = $mn,
ac_number = $an
WHERE
rowid = $id
`;

const User = {
  create: (user) => {
    return new Promise((resolve, reject) => {
      db.run(creatorSQL, 
        {
          $fn: user.first_name,
          $ln: user.last_name,
          $pn: user.phone_number,
          $mn: user.member_number,
          $an: user.ac_number,
          $ro: user.range_officer,
        },
        cbToPromise(resolve, reject));
    });
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT rowid as id, * from users where rowid = ?', [id], cbToPromise(resolve, reject));
    });
  },
  find: (find) => {
    if(find) {
      return new Promise((resolve, reject) => {
        db.all(finderSQL, { $keyword: `%${find}%` }, cbToPromise(resolve, reject));
      });
    }
    else {
      return new Promise((resolve, reject) => {
        db.all("SELECT rowid as id, * FROM users where deleted = 0", cbToPromise(resolve, reject));
      });
    }
  },
  officers: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT rowid as id, * FROM users WHERE range_officer = 1 AND deleted = 0", cbToPromise(resolve, reject));
    });
  },
  update: (id, user) => {
    return new Promise((resolve, reject) => {
      db.run(updateSQL, 
        {
          $id: id,
          $fn: user.first_name,
          $ln: user.last_name,
          $pn: user.phone_number,
          $mn: user.member_number,
          $an: user.ac_number,
        }, 
        cbToPromise(resolve, reject));
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET deleted=1 WHERE rowid=?", [id], cbToPromise(resolve, reject));
    });
  }
}

export default User;