const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const rl = require('readline-sync');
var config = require('./config.json');
var dbManage = require('./database');
// Public Directory
app.use(express.static(path.join(__dirname, "/public")));

// Stuff
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Directories
const views = __dirname + "/views/";
const imageDir = __dirname + "/images/";

// Pages

app.get("/", (_, res) => {
  res.sendFile(views + "index.html");
});

// API
app.post("/api/v1/login", (req, res) => {
        var db = new sqlite3.Database('./database/users.db');
        db.all("SELECT * FROM users WHERE username=? AND password=?", [req.body.username, req.body.password], function(err, rows) {
        if (rows.length >= 1){
          res.status(200);
          res.send({success: true});
        }
        else{
          res.status(400);
          res.send({success: false, error: 'Incorrect login information'});
        }
        });	
        db.close();
});

app.post("/api/v1/signup", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let confirm_password = req.body.confirm_password;
  if (password != confirm_password){
    res.status(400);
    res.send({success: false, error: 'Passwords do not match.'});
  }
  else{
    if (username.includes(" ")){
      res.status(400);
      res.send({success: false, error: 'Passwords do not match.'});
    }
    else{
      var db = new sqlite3.Database('./database/users.db');
      db.all("SELECT * FROM users WHERE username=?", [req.body.username], function(err, rows) {
       if (rows.length >= 1){
        res.status(250);
        res.send({success: false, error: 'username already taken.'});
       }
       else{
        if (dbManage.insertRow("./database/users.db", "INSERT INTO users(username, password) VALUES(?, ?)", [req.body.username, req.body.password])){
          res.status(200);
          res.send({success: true});
        }
        else{
          res.status(500);
          res.send({success: false, error: "Couldn't register account successfully"});
        }
       }
      });	
      db.close();
    }
  }
});

app.listen(config.port, () => {
  console.log("Listening at https://frionx-forum.frionx.repl.co/");
});
/*
  let db = new sqlite3.Database('./database/users.db');

  db.serialize(function(){
    db.run('CREATE TABLE users (username TEXT, password TEXT, profile BLOB)');
  });

  db.close();
*/
//dbManage.createDatabase(__dirname+'/database/users.db', 'CREATE TABLE users (username TEXT, password TEXT, profile BLOB)');
/*
function commandHandle(){
  let command = rl.question("==> ");
  switch (command.toLowerCase()){
    case "create table":
      dbManage.createDatabase('./database/users.db', 'CREATE TABLE users (username TEXT, password TEXT, profile BLOB)');
      console.log('done');
      break;
    case "drop table":
      dbManage.runQuery('./database/users.db', 'DROP TABLE users');
      break;
    default:
      console.log("Incorrect command");
      break;
  }
  commandHandle();
}

commandHandle();
*/