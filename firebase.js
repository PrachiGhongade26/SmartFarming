import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDoMkduMlsekkTSEmMfFPJTGN_V2RXccZc",
  authDomain: "smart-farming-7971b.firebaseapp.com",
  projectId: "smart-farming-7971b",
  storageBucket: "smart-farming-7971b.firebasestorage.app",
  messagingSenderId: "936332029789",
  appId: "1:936332029789:web:543ac117a45da17fa242b4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };


