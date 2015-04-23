/*jslint node: true */
"use strict";

var test = require('tape');
var util = require('util');
var async = require('async');
var mysql = require('mysql');

var testsuite = require('stringtree-migrate-driver-testsuite');

var credentials = {
  host     : process.env.MYSQL_TEST_HOST     || 'localhost',
  port     : process.env.MYSQL_TEST_PORT     || 3306,
  user     : process.env.MYSQL_TEST_USER     || 'test',
  password : process.env.MYSQL_TEST_PASSWORD || 'test',
  database : process.env.MYSQL_TEST_DATABASE || 'test'
};
var driver = require('../stringtree-migrate-driver-mysql')(credentials);

var dname = "mysql";

/** general purpose db wrapper to use when verifying what the driver has (or has not) done */
function db(sql, params, next) {
  var connection = mysql.createConnection(credentials);
  connection.connect(function(err) {
    if (err) throw(err);
    if ('function' == typeof(params)) {
      next = params;
      connection.query(sql, function(err, rows) {
        next(err, rows);
        connection.end();
      });
    } else {
      connection.query(sql, params, function(err, rows) {
        next(err, rows);
        connection.end();
      });
    }
  });
}

/** a function to pass to the conformance tests, so they can reset the db before each test
 * This one just drops the migrations table used by this driver
 */
function setup(next) {
  db("drop table if exists st_migrate", function(err) {
    return next(err, driver);
  });
}

/** run the standard conformance tests against this driver */
testsuite(driver, 'MySQL', setup);

/** test the driver-specific bits */
test('execute some sql', function(t) {
  t.plan(7);
  driver.open(function(err) {
    t.error(err, 'open should not error');
    driver.execute('create table st_zz ( name varchar(20) )', function(err) {
      t.error(err, 'execute should not error');
      driver.execute('insert into st_zz ( name ) values ( "Frank" )', function(err) {
        t.error(err, 'execute should not error');
        db('select name from st_zz', function(err, values) {
          t.error(err, 'db select should not error');
          t.equal(values[0].name, 'Frank', 'db tools should find the correct stored value');
          db('drop table st_zz', function(err) {
            t.error(err, 'db drop table should not error');
            driver.close(function(err) {
              t.error(err, 'close should not error');
              t.end();
            });
          });
        });
      });
    });
  });
});
