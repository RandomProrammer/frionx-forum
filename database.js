const sqlite3 = require('sqlite3');
var databaseManager = {};

databaseManager.createDatabase = function(database, sql){
  let db = new sqlite3.Database(database);

  db.serialize(function(){
    db.run(sql);
  });

  db.close();
}

databaseManager.runQuery = function(database, query){
  let db = new sqlite3.Database(database);
  db.run(sql, function(err) {
    if (err) {
      return false;
    }
  });
  db.close();
  return true;
}

databaseManager.insertRow = function(database, sql, params){
    let db = new sqlite3.Database(database);

    // insert one row into the langs table
    db.run(sql, params, function(err) {
      if (err) {
        return false;
      }
      else{
        return true;
      }
    });

    // close the database connection
    db.close();
    return true;
}

module.exports = databaseManager;