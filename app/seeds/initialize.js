import sqlite3 from 'sqlite3';
import SERVICES_SEED from './services';

const db = new sqlite3.Database('rrgc.db');

const creatorSQL = `insert into services values ($service_id, $name, $cost, 1)`;
db.serialize(function() {
  db.run('CREATE TABLE if not exists signins (user_id INT, date TEXT, time INT, fee INT, PRIMARY KEY (user_id, date))');
  db.run('CREATE TABLE if not exists users (first_name TEXT, last_name TEXT, phone_number TEXT, member_number INT, ac_number TEXT, range_officer INT, deleted INT)');
  db.run("CREATE TABLE if not exists services (service_id INT, name TEXT, cost INT, active INT, PRIMARY KEY (service_id))");
  SERVICES_SEED.forEach((service) => {
    db.run(creatorSQL, [service.service_id, service.name, service.cost], (err) => {});
  });
});

db.on('trace', (sql) => {
  console.log('sql:', sql);
});

db.close();
