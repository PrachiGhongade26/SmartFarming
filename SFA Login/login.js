// Import Firebase
import { auth } from "../firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Toggle password
window.togglePassword = function () {
  let pass = document.getElementById("password");

  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
};

// Login function
window.login = function () {

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  if (email === "" || password === "") {
    alert("Please fill all fields");
    return;
  }

  // 🔥 Firebase Login
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Login Successful 🌱");

      // redirect to main page (you can create dashboard.html later)
      window.location.href = "../html/dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

// Auto fill email
window.onload = function () {
  let savedEmail = localStorage.getItem("email");

  if (savedEmail) {
    document.getElementById("email").value = savedEmail;
  }
};