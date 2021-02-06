let showLogin = false;
let showSignup = false;

if (!localStorage.getItem("username") || !localStorage.getItem("password")) {
  $(".forum-content-box").hide();
  $("#login-warning").show();
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
    if (e.success) {
      $("#register-status").text("Successful Signup!");
    } else {
      $("#register-status").text(e.error);
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

document.getElementById("create-thread-form").onsubmit = function(e) {
  const threadtitle = $("#thread-title").val();
  const threadcontent = $("#thread-content").val();
  document.getElementById("thread-submit").setAttribute("disabled", "");
  e.preventDefault();
  const tmptitle = threadtitle.replace(" ", "");
  if (tmptitle.length > 80 || tmptitle.length < 3) {
    $("#status").text("Thread title too short.");
    document.getElementById("thread-submit").removeAttribute("disabled");

  } else if (threadcontent.length > 1000) {
    $("#status").text("Thread content too big");
    document.getElementById("thread-submit").removeAttribute("disabled");

  } else {
    fetch("/api/v1/submit-thread", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: localStorage.getItem("username"),
        password: localStorage.getItem("password"),
        thread_title: threadtitle,
        thread_content: threadcontent
      })
    }).then((e) => {
      e.json().then(data => {
        if (data.success) {
          $("#status").text("Successfully created thread!");
          window.location.href = "./threads";
          document.getElementById("thread-submit").removeAttribute("disabled");
        } else {
          $("#status").text(data.error);
          document.getElementById("thread-submit").removeAttribute("disabled");
        }
        // document.getElementById("thread-submit").removeAttribute("disabled");
      });
    });
  }
};