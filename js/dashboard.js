let slides = document.querySelectorAll(".slide");

let index = 0;

function changeSlide(){

slides[index].classList.remove("active");

index++;

if(index >= slides.length){
index = 0;
}

slides[index].classList.add("active");

}

setInterval(changeSlide, 5000);

/*quote section*/
window.addEventListener("load", function(){
    const quote = document.querySelector(".quote-text");
    quote.style.opacity = "0";
    quote.style.transform = "translateY(20px)";
    quote.style.transition = "all 1s ease";

    setTimeout(()=>{
        quote.style.opacity = "1";
        quote.style.transform = "translateY(0)";
    },200);
});

/* cards section*/
function openPage(page){
    window.location.href = page;
}

// update every 5 seconds
setInterval(updateFarmData,5000);

function raiseQuery(){

    alert("Redirecting to Query Page...");

    // Example redirect
    window.location.href="query.html";
}

const year = new Date().getFullYear();

document.querySelector(".copyright")
.innerHTML = "© " + new Date().getFullYear() + " Smart Farming Assistant | All Rights Reserved";

// ── Raise Query Modal ─────────────────────────────────────
function raiseQuery() {
  document.getElementById('queryModal').style.display = 'flex';
  document.getElementById('successMsg').style.display = 'none';
}

function closeModal() {
  document.getElementById('queryModal').style.display = 'none';
  ['q_name', 'q_phone', 'q_crop', 'q_problem'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

async function submitQuery() {
  const name    = document.getElementById('q_name').value.trim();
  const phone   = document.getElementById('q_phone').value.trim();
  const cropType= document.getElementById('q_crop').value;
  const problem = document.getElementById('q_problem').value.trim();

  if (!name || !problem) {
    alert('⚠️ Please fill in your Name and describe the Problem.');
    return;
  }

  try {
    const res = await fetch(`${API}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, cropType, problem })
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('successMsg').style.display = 'block';
      setTimeout(closeModal, 3000);
    } else {
      alert('❌ Error: ' + data.message);
    }
  } catch (err) {
    alert('❌ Could not connect to Flask. Is it running?');
  }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
  const modal = document.getElementById('queryModal');
  if (e.target === modal) closeModal();
});