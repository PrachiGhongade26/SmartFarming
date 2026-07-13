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