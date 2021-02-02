const express = require("express");
const app = express();
const path = require("path");
// const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
// const rl = require('readline-sync');

const config = require('./config.json');
const dbManage = require('./database');


// template
app.set('view engine', 'ejs');
app.set('views', 'views');


// Public Directory
app.use(express.static(path.join(__dirname, "/public")));


// Stuff
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());


// Pages
app.get("/", (_, res) => {
  res.render("index");
});

app.get('/create-thread', (req, res) => {
  res.render("create-thread");
});


// API
app.post("/api/v1/login", (req, res) => {
  let db = new sqlite3.Database('./database/users.db');
  db.all("SELECT * FROM users WHERE username=? AND password=?", [req.body.username, req.body.password], (err, rows) => {
    if (rows.length >= 1) {
      res.status(200);
      res.send({ success: true });
    }
    else {
      res.status(400);
      res.send({ success: false, error: 'Incorrect login information' });
    }
  });
  db.close();
});

app.get('/api/v1/get-thread-info/:threadid', (req, res) => {
  let threadid = req.params.threadid;
var db = new sqlite3.Database('./database/forums.db');
  db.all("SELECT * FROM posts WHERE id=?", [threadid], function(err, rows) {
    if (rows.length >= 1) {
      res.send(rows[0]);
      res.status(200);
    }
    else {
      res.status(400);
      res.send({ success: false, error: 'No thread with that ID.' });
    }
  });
  db.close();
});

app.post('/api/v1/submit-thread', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let thread_title = req.body.thread_title;
  let thread_content = req.body.thread_content;
  let unixTimestamp = Math.round(new Date().getTime() / 1000);
  var db = new sqlite3.Database('./database/users.db');
  db.all("SELECT * FROM users WHERE username=? AND password=?", [username, password], function(err, rows) {
    let authorid = rows[0].id;
    if (rows.length >= 1) {
      // All Good with auth, continue
      if (thread_title < 3 || thread_title > 80) {
        res.status(400);
        res.send({ success: false, error: "Bad Title!" });
      }
      else {
        if (thread_content.length > 1000) {
          res.status(400);
          res.send({ success: false, error: "Thread Content is too large!" });
        }
        else{
          // All Good!!!
          // tablerepliesrepliesCREATE TABLE replies (content TEXT, author TEXT, postId TEXT, creationDate TEXT, editDate TEXT)s�EtablepostspostsCREATE TABLE posts (title TEXT, content TEXT, author TEXT, creationDate TEXT, editDate TEXT)
          let db = new sqlite3.Database('./database/forums.db');
          db.run('INSERT INTO posts(id, title, content, author, creationDate, editDate) values(NULL, ?, ?, ?, ?, NULL)', [thread_title, thread_content, authorid, unixTimestamp], function(err) {
            if (err) {
              res.status(500);
              res.send({success: false, error: "Could not successfully insert data into database!"});
              console.log(err);
            }
            else{
              res.status(200);
              res.send({success: true});
            }
          });
          db.close();
        }
      }
    }
    else {
      res.status(400);
      res.send({ success: false, error: 'Incorrect login information' });
    }
  });
  db.close();
});

app.post("/api/v1/signup", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let confirm_password = req.body.confirm_password;
  if (password != confirm_password) {
    res.status(400);
    res.send({ success: false, error: 'Passwords do not match.' });
  }
  else {
    if (username.includes(" ")) {
      res.status(400);
      res.send({ success: false, error: 'Username has spaces.' });
    }
    else {
      let tmp_password = password;
      tmp_password = tmp_password.replace(" ", "");
      if (tmp_password.length < 6) {
        res.status(400);
        res.send({ success: false, error: 'Incorrect password length.' });
        return;
      }
      else {
        let tmp_username = username;
        tmp_username = tmp_username.replace(" ", "");
        if (tmp_username.length < 3) {
          res.status(400);
          res.send({ success: false, error: 'incorrect username format.' });
        }
        else {
          var db = new sqlite3.Database('./database/users.db');
          db.all("SELECT * FROM users WHERE username=?", [req.body.username], function(err, rows) {
            if (rows.length >= 1) {
              res.status(250);
              res.send({ success: false, error: 'username already taken.' });
            }
            else {
              if (dbManage.insertRow("./database/users.db", "INSERT INTO users(username, password) VALUES(?, ?)", [req.body.username, req.body.password])) {
                res.status(200);
                res.send({ success: true });
              }
              else {
                res.status(500);
                res.send({ success: false, error: "Couldn't register account successfully" });
              }
            }
          });
          db.close();
        }
      }
    }
  }
});

app.listen(config.port, () => {
  console.log("Listening at https://frionx-forum.frionx.repl.co/");
});

//DB Creation Code

/*
dbManage.createDatabase(__dirname+'/database/users.db', 'CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, profile BLOB)');


dbManage.createDatabase(__dirname+'/database/forums.db', 'CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT, content TEXT, author TEXT, creationDate TEXT, editDate TEXT)');

dbManage.createDatabase(__dirname+'/database/forums.db', 'CREATE TABLE replies (id INTEGER PRIMARY KEY, content TEXT, author TEXT, postId TEXT, creationDate TEXT, editDate TEXT)');


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