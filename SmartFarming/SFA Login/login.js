// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDoMkduMlsekkTSEmMfFPJTGN_V2RXccZc",
  authDomain: "smart-farming-7971b.firebaseapp.com",
  projectId: "smart-farming-7971b",
  storageBucket: "smart-farming-7971b.firebasestorage.app",
  messagingSenderId: "936332029789",
  appId: "1:936332029789:web:543ac117a45da17fa242b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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