const sqlite3 = require("sqlite3");
const databaseManager = {};

databaseManager.createDatabase = function(database, sql) {
  const db = new sqlite3.Database(database);

  db.serialize(() => {
    db.run(sql);
  });

  db.close();
};

databaseManager.runQuery = function(database, query) {
  const db = new sqlite3.Database(database);
  db.run(sql, (err) => {
    if (err) {
      return false;
    }
  });
  db.close();
  return true;
};

databaseManager.insertRow = function(database, sql, params) {
  const db = new sqlite3.Database(database);

  // insert one row into the langs table
  db.run(sql, params, (err) => {
    if (err) {
      return false;
    }
    return true;

  });

  // close the database connection
  db.close();
  return true;
};

module.exports = databaseManager;

function addForumCategory(forumName) {

}