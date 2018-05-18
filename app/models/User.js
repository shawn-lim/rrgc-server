import sqlite3 from 'sqlite3';
import ROS from  '../seeds/ros';
import { writeToPromise, readToPromise } from '../utils/helpers'

const db = new sqlite3.Database('rrgc.db');

const searchSQL = `
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
        writeToPromise(resolve, reject));
    });
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT rowid as id, * from users where rowid = ?', [id], readToPromise(resolve, reject));
    });
  },
  search: (search) => {
    if(search) {
      return new Promise((resolve, reject) => {
        db.all(searchSQL, { $keyword: `%${search}%` }, readToPromise(resolve, reject));
      });
    }
    else {
      return new Promise((resolve, reject) => {
        db.all("SELECT rowid as id, * FROM users where deleted = 0", readToPromise(resolve, reject));
      });
    }
  },
  officers: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT rowid as id, * FROM users WHERE range_officer = 1 AND deleted = 0", readToPromise(resolve, reject));
    });
  },
  getOfficer: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT rowid as id, * from users where rowid = ? AND range_officer=1;', [id], readToPromise(resolve, reject));
    });
  },
  removeOfficer: (id) => {
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET range_officer=0 WHERE rowid=?", [id], writeToPromise(resolve, reject));
    });
  },
  addOfficer: (id) => {
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET range_officer=1 WHERE rowid=?", [id], writeToPromise(resolve, reject));
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
        writeToPromise(resolve, reject));
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET deleted=1 WHERE rowid=?", [id], writeToPromise(resolve, reject));
    });
  }
}

export default User;
