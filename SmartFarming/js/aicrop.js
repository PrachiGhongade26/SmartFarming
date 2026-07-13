function getCrop() {
  let soil = document.getElementById("soil").value;
  let temp = document.getElementById("temp").value;
  let humidity = document.getElementById("humidity").value;
  let rainfall = document.getElementById("rainfall").value;

  let crops = [];

  // SIMPLE AI LOGIC (you can upgrade later)
  if (temp > 25 && rainfall > 200) {
    crops.push("Rice");
  }
  if (soil === "Loamy") {
    crops.push("Wheat");
  }
  if (humidity > 60) {
    crops.push("Maize");
  }

  displayCrops(crops);
}

function displayCrops(crops) {
  let container = document.getElementById("cropCards");
  container.innerHTML = "";

  if (crops.length === 0) {
    container.innerHTML = "<p>No crops found 😢</p>";
    return;
  }

  crops.forEach(crop => {
    let card = document.createElement("div");
    card.classList.add("card");

    let img = "";
    if (crop === "Rice") img = "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2";
    if (crop === "Wheat") img = "https://images.unsplash.com/photo-1500382017468-9049fed747ef";
    if (crop === "Maize") img = "https://images.unsplash.com/photo-1605027990121-cbae9e0642a6";

    card.innerHTML = `
      <img src="${img}">
      <h3>${crop}</h3>
      <button>Learn More</button>
    `;

    container.appendChild(card);
  });
}