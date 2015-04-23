# stringtree-migrate-driver-mysql

A MySQL driver for [stringtree-migrate](https://github.com/stringtree/stringtree-migrate) - the simple, flexible, database-independent, way to manage automated schema updates.

## Installation

    $ npm install stringtree-migrate-driver-mysql

## Usage Example:
```js
 var credentials = {
   host: 'localhost', port: 3306,
   database: 'test', user: 'uu', password: 'pp'
 };
 var scripts = [
   { level: 1, up: "create table ugh ( aa int )" },
   { level: 23, up: [
       "insert into ugh (aa) values (33)",
       "insert into ugh (aa) values (44)"
     ]
   }
 ];

 var driver = require('stringtree-migrate-driver-mysql')(credentials);
 var migrate = require('stringtree-migrate')(driver, scripts);
 ...
 // ensure database is at level 23 or greater
 migrate.ensure(23, function(err, level) {
   .. code that needs the db ..;
 });
 
 ..or
  
 // ensure database has had all available updates applied
 migrate.ensure(function(err, level) {
   .. code that needs the db ..;
 });
```

For more details, see https://github.com/stringtree/stringtree-migrate

### Configuration

The built-in unit tests require a running mysql instance and some environment variables or code to tell the tests how to connect to the database.

### Related resources

* https://github.com/stringtree/stringtree-migrate
