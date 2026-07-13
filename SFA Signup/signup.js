// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } 
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
window.togglePass = function () {
  let pass = document.getElementById("password");

  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
};

// Signup function
window.signup = function () {

  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;
  let confirm = document.getElementById("confirm").value;

  if (name === "" || email === "" || pass === "" || confirm === "") {
    alert("Please fill all fields 🌱");
    return;
  }

  if (pass.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  if (pass !== confirm) {
    alert("Passwords do not match ❌");
    return;
  }

  // 🔥 Firebase Signup
  createUserWithEmailAndPassword(auth, email, pass)
    .then((userCredential) => {
      alert("Account Created Successfully 🎉");
      window.location.href = "../SFA%20Login/login.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};