let showLogin = false;
let showSignup = false;
$("#btn-login").click(function(){
  if (showSignup){
    document.getElementById("form-signup").style.display = "none";
    showSignup = false;
  }
  if (showLogin != true){
    document.getElementById("form-login").style.display = "block";
    showLogin = true;
  }
  else{
    document.getElementById("form-login").style.display = "none";
    showLogin = false;
  }
});

$("#btn-signup").click(function(){
  if (showLogin){
    document.getElementById("form-login").style.display = "none";
    showLogin = false;
  }
  if (showSignup != true){
    document.getElementById("form-signup").style.display = "block";
    showSignup = true;
  }
  else{
    document.getElementById("form-signup").style.display = "none";
    showSignup = false;
  }
});

$("#btn-form-signup").click(function(){
  let username = $("#txt-form-username").val();
  let password = $("#txt-form-password").val();
  let confirm_password = $("#txt-form-confirm-password").val();
  fetch('/api/v1/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
        confirm_password: confirm_password
      })
  }).then(function(e){
    console.log(e);
    switch (e.status){
      case 400:
        $("#register-status").text("Incorrect form input sent.");
        break;
      case 250:
        $("#register-status").text("Username already taken");
        break;
      case 200:
        $("#register-status").text("Successfully registered!");
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        setTimeout(window.location.reload(), 1000);
        break;
      default:
        break;
    }
  });
});

$("#btn-form-login").click(function(){
  let username = $("#txt-login-username").val();
  let password = $("#txt-login-password").val();
  console.log(password);
  fetch('/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
  }).then(function(e){
    e.json().then(data=>{
      if (data.success){
        $("#login-status").text("Successfully logged in!");
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        setTimeout(window.location.reload(), 1000);
      }
      else{
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

function displayLoggedIn(){

}

if (localStorage.getItem('username') != null && localStorage.getItem('username') != "" && localStorage.getItem('password') != null && localStorage.getItem('password') != ""){
  fetch('/api/v1/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    })
  }).then(function(e){
    if (e.status == 200){
      $("#btn-login").css('display', 'none');
      $("#btn-signup").css('display', 'none');
      $("#btn-logout").css('display', 'block');
      displayLoggedIn();
    }
  });
}

$("#btn-logout").click(function(){
  localStorage.removeItem('username');
  localStorage.removeItem('password');
  window.location.reload();
});

// Quick hide Drop down code
let dropDowns = document.getElementsByClassName("fas fa-caret-down");
for (let i = 0; i < dropDowns.length; i++){
    dropDowns[i].parentElement.parentElement.getElementsByClassName("forum-block-bottom")[0].style.display = "block";
    let dropDown = dropDowns[i];
    dropDown.onclick = function(){
      if (dropDown.getAttribute("class") == "fas fa-caret-down"){
        dropDown.setAttribute('class', 'fas fa-caret-right block-border');
      }
      else{
        dropDown.setAttribute('class', 'fas fa-caret-down');
      }
      let element = dropDown.parentElement.parentElement.getElementsByClassName("forum-block-bottom")[0];
      if (element.style.display == "block"){
        element.style.display = "none";
      }
      else if (element.style.display == "none"){
        element.style.display = "block";
      }
    }
}