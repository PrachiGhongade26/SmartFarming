const API = "http://localhost:5000";
//navbar
document.querySelectorAll("nav a").forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  });
});

const chatbot = document.querySelector(".chatbot");
const hero = document.querySelector(".hero");

// Initially hidden
chatbot.style.opacity = '0';
chatbot.style.transform = 'translateY(50px)';

// Scroll to show/hide
window.addEventListener("scroll", () => {
  const heroBottom = hero.offsetHeight;
  if (window.scrollY > heroBottom) {
    chatbot.style.opacity = '1';
    chatbot.style.transform = 'translateY(0)';
  } else {
    chatbot.style.opacity = '0';
    chatbot.style.transform = 'translateY(50px)';
  }
});

// Chatbot click alert
// chatbot.addEventListener("click", () => {
//   alert("Smart Assistant will be available soon!");
// });