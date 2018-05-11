'use strict';

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('rrgc.db');

var ROS = require('../seeds/ros');

db.serialize(function () {

    db.run("CREATE TABLE if not exists users (first_name TEXT, last_name TEXT, phone_number TEXT, member_number INT, ac_number TEXT, range_officer INT)");
    console.log(ROS);
    // var stmt = db.prepare("INSERT INTO users VALUES (?)");
    // for (var i = 0; i < 10; i++) {
    // stmt.run("Ipsum " + i);
    // }
    // stmt.finalize();

    db.each("SELECT rowid AS id, info FROM user_info", function (err, row) {
        console.log(row.id + ": " + row.info);
    });
});

db.close();