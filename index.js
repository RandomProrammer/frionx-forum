const express = require("express");
const app = express();
const path = require("path");
// const bodyParser = require('body-parser');
const sqlite3 = require("sqlite3");
// const rl = require('readline-sync');
const bcrypt = require("bcrypt");
const config = require("./config.json");
const dbManage = require("./database");


// template
app.set("view engine", "ejs");
app.set("views", "views");


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

app.get("/create-thread", (req, res) => {
  res.render("create-thread");
});


app.get("/threads", (req, res) => {
  res.render("threads");
});

app.get("/view-thread/:threadid", (req, res) => {
  res.render("view-thread", { id: req.params.threadid });
});

app.get("/edit-thread/:threadid", (req, res) => {
  res.render("edit-thread", { id: req.params.threadid });
});

// API
app.post("/api/v1/login", (req, res) => {
  const db = new sqlite3.Database("./database/users.db");
  db.all("SELECT * FROM users WHERE username=?", [ req.body.username ], (err, rows) => {
    if (rows.length >= 1) {
      bcrypt.compare(req.body.password, rows[0].password).then(result => {
        if (result) {
          res.status(200);
          res.send({ success: true });
        } else {
          res.status(400);
          res.send({ success: false, error: "Incorrect login information!" });
        }
      });
    } else {
      res.status(400);
      res.send({ success: false, error: "Incorrect login information" });
    }
  });
  db.close();
});


app.get("/api/v1/get-username/:id", (req, res) => {
  const userid = req.params.id;
  const db = new sqlite3.Database("./database/users.db");
  db.all("SELECT id, username FROM users WHERE id=?", [ userid ], (err, rows) => {
    if (rows.length >= 1) {
      res.send(rows[0]);
      res.status(200);
    } else {
      res.status(400);
      res.send({ success: false, error: "No user with that ID." });
    }
  });
  db.close();
});

app.get("/api/v1/get-userinfo/:username", (req, res) => {
  const userid = req.params.username;
  const db = new sqlite3.Database("./database/users.db");
  db.all("SELECT id, username FROM users WHERE username=?", [ userid ], (err, rows) => {
    if (rows.length >= 1) {
      res.send(rows[0]);
      res.status(200);
    } else {
      res.status(400);
      res.send({ success: false, error: "No user with that username." });
    }
  });
  db.close();
});

app.get("/api/v1/get-thread-info/:threadid", (req, res) => {
  const threadid = req.params.threadid;
  const db = new sqlite3.Database("./database/forums.db");
  db.all("SELECT * FROM posts WHERE id=?", [ threadid ], (err, rows) => {
    if (rows.length >= 1) {
      res.send(rows[0]);
      res.status(200);
    } else {
      res.status(400);
      res.send({ success: false, error: "No thread with that ID." });
    }
  });
  db.close();
});

app.post("/api/v1/submit-reply", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const thread_content = req.body.thread_content;
  const thread_id = req.body.thread_id;
  const unixTimestamp = Math.round(new Date().getTime() / 1000);
  const db = new sqlite3.Database("./database/users.db");
  db.all("SELECT * FROM users WHERE username=?", [ req.body.username ], (err, rows) => {
    if (rows.length >= 1) {
      bcrypt.compare(req.body.password, rows[0].password).then(result => {
        if (result) {
          const authorid = rows[0].id;
          if (thread_content.length > 1000) {
            res.status(400);
            res.send({ success: false, error: "Thread Content is too large!" });
          } else {
            // All Good!!!
            // CREATE TABLE replies (id INTEGER PRIMARY KEY, content TEXT, author TEXT, postId TEXT, creationDate TEXT, editDate TEXT)
            const db = new sqlite3.Database("./database/forums.db");
            db.run("INSERT INTO replies(id, content, postId, author, creationDate, editDate) values(NULL, ?, ?, ?, ?, NULL)", [ thread_content, thread_id, authorid, unixTimestamp ], (err) => {
              if (err) {
                res.status(500);
                res.send({ success: false, error: "Could not successfully insert data into database!" });
                console.log(err);
              } else {
                res.status(200);
                res.send({ success: true });
              }
            });
            db.close();
          }
        } else {
          res.status(400);
          res.send({ success: false, error: "Incorrect login information!" });
        }
      });
    } else {
      res.status(400);
      res.send({ success: false, error: "Incorrect login information" });
    }
  });
  db.close();
});

app.post("/api/v1/submit-thread", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const thread_title = req.body.thread_title;
  const thread_content = req.body.thread_content;
  const unixTimestamp = Math.round(new Date().getTime() / 1000);
  const db = new sqlite3.Database("./database/users.db");
  db.all("SELECT * FROM users WHERE username=?", [ req.body.username ], (err, rows) => {
    if (rows.length >= 1) {
      bcrypt.compare(req.body.password, rows[0].password).then(result => {
        if (result) {
          const authorid = rows[0].id;
          // All Good with auth, continue
          if (thread_title < 3 || thread_title > 80) {
            res.status(400);
            res.send({ success: false, error: "Bad Title!" });
          } else if (thread_content.length > 1000) {
            res.status(400);
            res.send({ success: false, error: "Thread Content is too large!" });
          } else {
            // All Good!!!
            // tablerepliesrepliesCREATE TABLE replies (content TEXT, author TEXT, postId TEXT, creationDate TEXT, editDate TEXT)s�EtablepostspostsCREATE TABLE posts (title TEXT, content TEXT, author TEXT, creationDate TEXT, editDate TEXT)
            const db = new sqlite3.Database("./database/forums.db");
            db.run("INSERT INTO posts(id, title, content, author, creationDate, editDate) values(NULL, ?, ?, ?, ?, NULL)", [ thread_title, thread_content, authorid, unixTimestamp ], (err) => {
              if (err) {
                res.status(500);
                res.send({ success: false, error: "Could not successfully insert data into database!" });
                console.log(err);
              } else {
                res.status(200);
                res.send({ success: true });
              }
            });
            db.close();
          }
        } else {
          res.status(400);
          res.send({ success: false, error: "Incorrect login information!" });
        }
      });
    } else {
      res.status(400);
      res.send({ success: false, error: "Incorrect login information" });
    }
  });
  db.close();
});

app.post("/api/v1/edit-thread", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const thread_title = req.body.thread_title;
  const thread_content = req.body.thread_content;
  const thread_id = req.body.thread_id;
  const unixTimestamp = Math.round(new Date().getTime() / 1000);
  const db = new sqlite3.Database("./database/users.db");
  db.all("SELECT * FROM users WHERE username=?", [ req.body.username ], (err, rows) => {
    if (rows.length >= 1) {
      bcrypt.compare(req.body.password, rows[0].password).then(result => {
        if (result) {
          // All Good with auth, continue
          if (thread_title < 3 || thread_title > 80) {
            res.status(400);
            res.send({ success: false, error: "Bad Title!" });
          } else if (thread_content.length > 1000) {
            res.status(400);
            res.send({ success: false, error: "Thread Content is too large!" });
          } else {
            const db = new sqlite3.Database("./database/forums.db");
            db.all("SELECT id, author, title FROM posts WHERE id=?", [ thread_id ], (err, threadrows) => {
              if (err) {
                res.status(500);
                res.send({ success: false, error: "Could not successfully update data from database!" });
                console.log(err);
              } else if (threadrows.length >= 1) {
                if (threadrows[0].author == rows[0].id) {
                  const db = new sqlite3.Database("./database/forums.db");
                  db.run("UPDATE posts SET title=?, content=?, editDate=? WHERE id=?", [ thread_title, thread_content, unixTimestamp, thread_id ], (err) => {
                    if (err) {
                      res.status(500);
                      res.send({ success: false, error: "Could not successfully update data from database!" });
                      console.log(err);
                    } else {
                      res.status(200);
                      res.send({ success: true });
                    }
                  });
                  db.close();
                } else {
                  res.status(403);
                  res.send({ success: false, error: "Not allowed to edit this thread!" });
                }
              } else {
                res.status(500);
                res.send({ success: false, error: "Thread not found." });
              }
            });
            db.close();
            // All Good!!!
            // tablerepliesrepliesCREATE TABLE replies (content TEXT, author TEXT, postId TEXT, creationDate TEXT, editDate TEXT)s�EtablepostspostsCREATE TABLE posts (title TEXT, content TEXT, author TEXT, creationDate TEXT, editDate TEXT)
          }
        } else {
          res.status(400);
          res.send({ success: false, error: "Incorrect login information!" });
        }
      });
    } else {
      res.status(400);
      res.send({ success: false, error: "Incorrect login information" });
    }
  });
  db.close();
});

app.get("/api/v1/get-all-threads", (req, res) => {
  const db = new sqlite3.Database("./database/forums.db");
  const temp = { threads: [] };
  db.serialize(() => {
    db.each("SELECT * FROM posts ORDER by id DESC", (err, row) => {
      if (err) {
        throw err;
      }
      temp.threads.push({ id: row.id, title: row.title });
    }, () => {
      res.send(temp);
      db.close();
    }
    );
  });
});

app.get("/api/v1/get-all-replies/:id", (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database("./database/forums.db");
  const temp = { replies: [] };
  db.serialize(() => {
    db.each("SELECT * FROM replies where postId=? ORDER by id DESC", [ id.toString() ], (err, row) => {
      if (err) {
        throw err;
      }
      temp.replies.push(row);
    }, () => {
      res.send(temp);
      db.close();
    }
    );
  });
});

app.post("/api/v1/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;
  if (password != confirm_password) {
    res.status(400);
    res.send({ success: false, error: "Passwords do not match." });
  } else if (username.includes(" ")) {
    res.status(400);
    res.send({ success: false, error: "Username has spaces." });
  } else {
    let tmp_password = password;
    tmp_password = tmp_password.replace(" ", "");
    if (tmp_password.length < 6) {
      res.status(400);
      res.send({ success: false, error: "Incorrect password length." });

    } else {
      let tmp_username = username;
      tmp_username = tmp_username.replace(" ", "");
      if (tmp_username.length < 3) {
        res.status(400);
        res.send({ success: false, error: "incorrect username format." });
      } else {
        const db = new sqlite3.Database("./database/users.db");
        db.all("SELECT * FROM users WHERE username=?", [ req.body.username ], (err, rows) => {
          if (rows.length >= 1) {
            res.status(250);
            res.send({ success: false, error: "username already taken." });
          } else {
            bcrypt.hash(req.body.password, config.saltRounds).then((hash) => {
              if (dbManage.insertRow("./database/users.db", "INSERT INTO users(username, password) VALUES(?, ?)", [ req.body.username, hash ])) {
                res.status(200);
                res.send({ success: true });
              } else {
                res.status(500);
                res.send({ success: false, error: "Couldn't register account successfully" });
              }
            });
          }
        });
        db.close();
      }
    }
  }
});

app.listen(config.port, () => {
  console.log("Listening at https://frionx-forum.frionx.repl.co/");
});

// DB Creation Code

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