let showLogin = false;
let showSignup = false;

if (!localStorage.getItem("username") || !localStorage.getItem("password")) {
  $("#commentbox").hide();
}

$("#btn-login").click(() => {
  if (showSignup) {
    document.getElementById("form-signup").style.display = "none";
    showSignup = false;
  }
  if (showLogin != true) {
    document.getElementById("form-login").style.display = "block";
    showLogin = true;
  } else {
    document.getElementById("form-login").style.display = "none";
    showLogin = false;
  }
});

$("#btn-signup").click(() => {
  if (showLogin) {
    document.getElementById("form-login").style.display = "none";
    showLogin = false;
  }
  if (showSignup != true) {
    document.getElementById("form-signup").style.display = "block";
    showSignup = true;
  } else {
    document.getElementById("form-signup").style.display = "none";
    showSignup = false;
  }
});

$("#btn-form-signup").click(() => {
  const username = $("#txt-form-username").val();
  const password = $("#txt-form-password").val();
  const confirm_password = $("#txt-form-confirm-password").val();
  fetch("/api/v1/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password,
      confirm_password: confirm_password
    })
  }).then((e) => {
    console.log(e);
    switch (e.status) {
    case 400:
      $("#register-status").text("Incorrect form input sent.");
      break;
    case 250:
      $("#register-status").text("Username already taken");
      break;
    case 200:
      $("#register-status").text("Successfully registered!");
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      setTimeout(window.location.reload(), 1000);
      break;
    default:
      break;
    }
  });
});

$("#btn-form-login").click(() => {
  const username = $("#txt-login-username").val();
  const password = $("#txt-login-password").val();
  console.log(password);
  fetch("/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  }).then((e) => {
    e.json().then(data => {
      if (data.success) {
        $("#login-status").text("Successfully logged in!");
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        setTimeout(window.location.reload(), 1000);
      } else {
        $("#login-status").text(data.error);
      }
    });
    /*
    switch(e.status){
      case 200:
        $("#login-status").text("Successfully logged in!");
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        setTimeout(window.location.reload(), 1000);
        break;
      case 400:
        $("#login-status").text("Incorrect information provided.");
        break;
      default:
        break;
    }
    */
  });
});

function displayLoggedIn() {

}

if (localStorage.getItem("username") != null && localStorage.getItem("username") != "" && localStorage.getItem("password") != null && localStorage.getItem("password") != "") {
  fetch("/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: localStorage.getItem("username"),
      password: localStorage.getItem("password")
    })
  }).then((e) => {
    if (e.status == 200) {
      $("#btn-login").css("display", "none");
      $("#btn-signup").css("display", "none");
      $("#btn-logout").css("display", "block");
      displayLoggedIn();
    }
  });
}

$("#btn-logout").click(() => {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  window.location.reload();
});

/*
        <label class="forum-form-header" id="thread-title"></label>
        <textarea id="thread-content" class="forum-input-textarea" readonly></textarea>
        */
$.get(`/api/v1/get-thread-info/${threadId}`).then(e => {
  document.getElementById("thread-title").innerText = e.title;
  // At this moment you might call me crazy for not making it just text, but textareas dont recognize dom elements breaking any type of XSS!
  // brain
  document.getElementById("thread-content").innerHTML = e.content;

  $("#thread-date").text(
    `Created: ${
      new Date(Number(e.creationDate) * 1000).toLocaleDateString()}`
  );

  if (e.editDate) $("#edit-date").text(`Edited: ${new Date(Number(e.editDate) * 1000).toLocaleDateString()}`);
  $.get(`/api/v1/get-username/${e.author}`).then(e => {
    $("#thread-author").text(`Thread by: ${e.username}`);
    if (e.username.toLowerCase() == localStorage.getItem("username").toLowerCase()) {
      document.getElementById("edit-thread").style.display = "block";
    }


  });
});

$.get(`/api/v1/get-all-replies/${threadId}`, {
  cache: 'false'
}).then(e=>{
  if (e.replies.length <= 0){
    document.getElementById("replies").innerHTML += "Darn it! No replies yet!";
  }
  e.replies.forEach(function(reply){
      $.get(`/api/v1/get-username/${reply.author}`).then(e => {
        let divForum = document.createElement('div');
        divForum.setAttribute('class', 'forum-content-box miniforum reply-forum');
        let name = document.createElement('label');
        name.setAttribute('class', 'forum-form-header');
        name.innerText = e.username;
        let textarea = document.createElement('textarea');
        textarea.setAttribute('class', 'forum-input-textarea reply-box');
        textarea.setAttribute('readonly', '');
        textarea.innerHTML = reply.content;
        divForum.append(name);
        divForum.append(textarea);
        document.getElementById("replies").append(divForum);
      });
  });
});

$("#reply-submit").click(() => {
  const reply = $("#reply-content").val();
  fetch("../api/v1/submit-reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: localStorage.getItem("username"),
      password: localStorage.getItem("password"),
      thread_content: reply,
      thread_id: threadId
    })
  }).then((e) => {
    e.json().then(data => {
      if (data.success) {
        $("#status").text("Successfully submitted reply!");
        window.location.reload();
      } else {
        $("#status").text(data.error);
      }
    });
  });
});