import sqlite3 from 'sqlite3';
import SERVICES_SEED from  '../seeds/services';
import { writeToPromise, readToPromise } from '../utils/helpers'

const db = new sqlite3.Database('rrgc.db');
const creatorSQL = `insert into services values ($name, $cost, 1)`;

const Services = {
  get: (id) => {
    if(id) {
      return new Promise((resolve, reject) => {
        db.get('SELECT * from services where service_id = ? AND active = 1', [id], readToPromise(resolve, reject));
      });
    }
    else {
      return new Promise((resolve, reject) => {
        db.all('SELECT * from services where active = 1', readToPromise(resolve, reject));
      });
    }
  }
};

export default Services;
