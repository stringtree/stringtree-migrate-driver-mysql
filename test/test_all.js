/*jslint node: true */
"use strict";

var test = require('tape');
var util = require('util');
var async = require('async');
var mysql = require('mysql');

var credentials = {
  host     : process.env.MYSQL_TEST_HOST     || 'localhost',
  port     : process.env.MYSQL_TEST_PORT     || 3306,
  user     : process.env.MYSQL_TEST_USER     || 'test',
  password : process.env.MYSQL_TEST_PASSWORD || 'test',
  database : process.env.MYSQL_TEST_DATABASE || 'test'
};
var driver = require('../stringtree-migrate-driver-mysql')(credentials);

var dname = "mysql";

// general purpose db wrapper to use when verifying what the driver has (or has not) done
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

function setup(next) {
  db("show tables", function(err, tables) {
    if (err) return next(err);
    if (tables && tables.length > 0) {
      async.forEach(tables, function(table, done) {
        var tname = table['Tables_in_' + credentials.database];
        var sql = "drop table " + tname;
        db(sql, function(err) {
          done(err);
        });
      }, function(err) {
        return next(err, driver);
      });
    } else {
      return next(null, driver);
    }
  });
}

test('(' + dname + ') open and close database', function(t) {
  driver.open(function(err) {
    driver.close(function(err) {
      t.end();
    });
  });
});

test('(' + dname + ') open database for following tests', function(t) {
  driver.open(function(err) {
    t.end();
  });
});

test('(' + dname + ') check/create migration table', function(t) {
  t.plan(5);
  setup(function(err, driver) {
    driver.check(function(err, present) {
      t.error(err, 'check should not error');
      t.notok(present, "migration table should not be present");
      driver.create(function(err) {
        t.error(err, 'create should not error');
        driver.check(function(err, present) {
          t.error(err, 'check should not error');
          t.ok(present, "migration table should be present now");
        });
      });
    });
  });
});

test('(' + dname + ') read/set current level', function(t) {
  t.plan(5);
  setup(function(err, driver) {
    driver.create(function(err) {
      driver.current(function(err, level) {
        t.error(err, 'current should not error');
        t.notok(level, "current level should start undefined");
        driver.update(2, function(err) {
          t.error(err, 'update should not error');
          driver.current(function(err, level) {
            t.error(err, 'current should not error');
            t.equal(level, 2, "curret should report new level");
          });
        });
      });
    });
  });
});

test('(' + dname + ') close database', function(t) {
  driver.close(function(err) {
    t.end();
  });
});
