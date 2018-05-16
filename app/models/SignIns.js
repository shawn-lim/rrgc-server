import moment from 'moment';
import User from './User';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('rrgc.db');

db.serialize(function() {
  db.run("CREATE TABLE if not exists signins (user_id INT, date TEXT, time INT, range_fee INT, bow_fee INT, arrow_fee INT, misc_fee INT, target_fee INT, custom_fee INT, PRIMARY KEY (user_id, date))");
});

const PRICE_SHEET = {
  ro_range: 0,
  member_range: 5,
  public_range: 10,
  bow: 2,
  arrows: 2,
  misc: 1,
  target_face: 1
};

const creatorSQL = `insert into signins values ($uid, $date, $time, $range, $bow, $arrow, $misc, $target, $custom)`;

const SignIns = {
  create: (payload) => {
    return new Promise((resolve, reject) => {
      User.get(payload.user_id).then((user) => {
        const time = new Date().getTime();
        const date = moment().format('L');

        console.log(date);

        let range_fee;

        if(user.range_officer === 1) {
          range_fee = PRICE_SHEET.ro_range;
        }
        else if (user.member_id) {
          range_fee = PRICE_SHEET.member_range;
        }
        else {
          range_fee = PRICE_SHEET.public_range;
        }

        let cost = 
          payload.rentals.range       * range_fee               +
          payload.rentals.bow         * PRICE_SHEET.bow         +
          payload.rentals.arrows      * PRICE_SHEET.arrows      +
          payload.rentals.misc        * PRICE_SHEET.misc        +
          payload.rentals.target_face * PRICE_SHEET.target_face +
          (payload.rentals.custom || 0 )
        ;

        const entry = {
          user_name: user.first_name,
          time: time,
          cost: cost
        };

        db.run(creatorSQL, 
          {
            $uid    : payload.user_id,
            $date   : date,
            $time   : time,
            $range  : payload.rentals.range       * range_fee,
            $bow    : payload.rentals.bow         * PRICE_SHEET.bow,
            $arrow  : payload.rentals.arrows      * PRICE_SHEET.arrows,
            $misc   : payload.rentals.misc        * PRICE_SHEET.misc,
            $target : payload.rentals.target_face * PRICE_SHEET.target_face,
            $custom : payload.rentals.custom
          },
          (err, res) => { 
            if(err) {
              if(err.code === 'SQLITE_CONSTRAINT') {
                err = { error: 'ALREADY_SIGNED_IN' };
              }
              reject(err);
            }
            else {
              resolve(entry);
            }
          }
        );
      });
    });
  }
}

export default SignIns;
