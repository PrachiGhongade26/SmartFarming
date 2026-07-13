// ─── CLOCK ───────────────────────────────────────────────────────
function updateTime() {
  let now = new Date();
  let options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  document.getElementById("dateTime").innerHTML =
    now.toLocaleString("en-IN", options);
}
updateTime();
setInterval(updateTime, 1000);

// ─── CONFIG ──────────────────────────────────────────────────────
const API_KEY = "d9a569ea366dd3d33d78a553540f0bd7";
const UNITS = "metric";

// ─── HELPERS ─────────────────────────────────────────────────────
function getIcon(id) {
  if (id >= 200 && id < 300) return "fa-bolt";
  if (id >= 300 && id < 400) return "fa-cloud-drizzle";
  if (id >= 500 && id < 600) return "fa-cloud-rain";
  if (id >= 600 && id < 700) return "fa-snowflake";
  if (id >= 700 && id < 800) return "fa-smog";
  if (id === 800)             return "fa-sun";
  if (id === 801 || id === 802) return "fa-cloud-sun";
  return "fa-cloud";
}

function getDayName(unixTime) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return days[new Date(unixTime * 1000).getDay()];
}

function capitalize(str) {
  return str.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function getFarmingTip(id, temp) {
  if (id >= 500 && id < 600) return "🌧 Rain detected. Avoid pesticide spraying today.";
  if (temp > 35)             return "🌡 High heat alert! Increase irrigation frequency.";
  if (id === 800)            return "☀ Clear sky. Good day for harvesting or field work.";
  if (id >= 200 && id < 300) return "⚡ Thunderstorm risk. Keep farmers off open fields.";
  return "🌱 Conditions look stable. Normal farming activities OK.";
}

// ─── MAIN WEATHER LOADER ─────────────────────────────────────────
async function loadWeather(lat, lon, cityDisplayName) {
  try {

    // Build URLs using coordinates
    const weatherURL  = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}`;

    // 1. CURRENT WEATHER
    const res = await fetch(weatherURL);
    const current = await res.json();

    if (current.cod !== 200) {
      console.error("API Error:", current.message);
      document.querySelector(".weather-main h1").textContent = "API Error";
      document.querySelector(".weather-main p").textContent = current.message;
      return;
    }

    // location — use the reverse-geocoded city name, not API's city name
    document.querySelector(".loc-top p").textContent = cityDisplayName;

    // temp + condition
    document.querySelector(".weather-main h1").textContent =
      `${Math.round(current.main.temp)}°C`;
    document.querySelector(".weather-main p").textContent =
      capitalize(current.weather[0].description);

    // icon
    document.querySelector(".weather-main .icon i").className =
      `fa-solid ${getIcon(current.weather[0].id)}`;

    // details row
    const divs = document.querySelectorAll(".weather-details div");
    const rainChance = current.rain ? Math.round((current.rain["1h"] || 0) * 10) : 0;
    divs[0].innerHTML = `🌧 Rain Chance<h3>${rainChance}%</h3>`;
    divs[1].innerHTML = `💧 Humidity<h3>${current.main.humidity}%</h3>`;
    divs[2].innerHTML = `💨 Wind<h3>${Math.round(current.wind.speed * 3.6)} km/h</h3>`;

    // alerts
    const alerts = [];
    if (current.wind.speed * 3.6 > 40) alerts.push("🌀 Strong winds. Secure equipment.");
    if (current.rain)                   alerts.push("🌧 Rain in progress. Protect crops.");
    if (current.main.temp > 38)         alerts.push("🌡 Extreme heat. Increase irrigation.");
    document.querySelector(".alerts").innerHTML =
      `<h3>⚠ Weather Alerts</h3>` +
      (alerts.length
        ? alerts.map(a => `<p>${a}</p>`).join("")
        : "<p>✅ No major alerts right now.</p>");

    // farming tip
    document.querySelector(".farming-info .farming-tips").innerHTML = `
      <h3>🌱 Farming Tips</h3>
      <p>${getFarmingTip(current.weather[0].id, current.main.temp)}</p>
    `;

    // 2. FORECAST
    const fRes = await fetch(forecastURL);
    const forecast = await fRes.json();

    // hourly (next 4 slots)
    const hourBoxes = document.querySelectorAll(".hour");
    forecast.list.slice(0, 4).forEach((item, i) => {
      const h = new Date(item.dt * 1000).getHours();
      const label = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h-12} PM`;
      hourBoxes[i].innerHTML = `
        <p>${label}</p>
        <i class="fa-solid ${getIcon(item.weather[0].id)}"></i>
        <h4>${Math.round(item.main.temp)}°C</h4>
      `;
    });

    // today card
    const today = forecast.list[0];
    document.querySelectorAll(".day-card")[0].innerHTML = `
      <h3>Today</h3>
      <i class="fa-solid ${getIcon(today.weather[0].id)}"
         style="font-size:60px;color:#f4a100;margin:15px 0;display:block"></i>
      <p class="status">${capitalize(today.weather[0].description)}</p>
      <div class="temp">
        <span>H: ${Math.round(today.main.temp_max)}°C</span>
        <span>L: ${Math.round(today.main.temp_min)}°C</span>
      </div>
      <p class="rain">🌧 ${Math.round(today.pop * 100)}% Rain</p>
    `;

    // tomorrow card
    const tmr = forecast.list[8] || forecast.list[4];
    document.querySelectorAll(".day-card")[1].innerHTML = `
      <h3>Tomorrow</h3>
      <i class="fa-solid ${getIcon(tmr.weather[0].id)}"
         style="font-size:60px;color:#f4a100;margin:15px 0;display:block"></i>
      <p class="status">${capitalize(tmr.weather[0].description)}</p>
      <div class="temp">
        <span>H: ${Math.round(tmr.main.temp_max)}°C</span>
        <span>L: ${Math.round(tmr.main.temp_min)}°C</span>
      </div>
      <p class="rain">🌧 ${Math.round(tmr.pop * 100)}% Rain</p>
    `;

    // 7-day forecast
    const dailyMap = {};
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const key = date.toDateString();
      const h = date.getHours();
      if (!dailyMap[key] || Math.abs(h - 12) < Math.abs(new Date(dailyMap[key].dt * 1000).getHours() - 12))
        dailyMap[key] = item;
    });
    Object.values(dailyMap).slice(0, 7).forEach((item, i) => {
      const card = document.querySelectorAll(".day")[i];
      if (!card) return;
      card.innerHTML = `
        <p>${getDayName(item.dt)}</p>
        <i class="fa-solid ${getIcon(item.weather[0].id)}"></i>
        <h4>${Math.round(item.main.temp)}°C</h4>
      `;
    });

    // rainfall & soil
    const todayRain  = forecast.list.slice(0, 3).reduce((s, i) => s + (i.rain?.["3h"] || 0), 0);
    const weeklyRain = forecast.list.slice(0, 16).reduce((s, i) => s + (i.rain?.["3h"] || 0), 0);
    const moisture   = current.main.humidity > 70 ? "High" : current.main.humidity > 40 ? "Medium" : "Low";
    document.querySelector(".farming-info .tips").innerHTML = `
      <h3>🌧 Rainfall & Soil Info</h3>
      <p>Today's Rainfall: ${todayRain.toFixed(1)} mm</p>
      <p>Weekly Rainfall: ${weeklyRain.toFixed(1)} mm</p>
      <p>Soil Moisture: ${moisture}</p>
    `;

  } catch (err) {
    console.error("loadWeather failed:", err);
    document.querySelector(".weather-main h1").textContent = "Error";
    document.querySelector(".weather-main p").textContent = "Check console for details.";
  }
}

// ─── GPS LOCATION DETECTOR ───────────────────────────────────────
async function getLocationAndLoad() {
  if (!navigator.geolocation) {
    // Browser doesn't support GPS — fallback to Amravati
    fallbackLoad("Amravati", "Maharashtra");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        // Reverse geocode: coordinates → city name
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
        );
        const geoData = await geoRes.json();

        const city  = geoData[0]?.name  || "Your Location";
        const state = geoData[0]?.state || "Maharashtra";
        const displayName = `${city}, ${state}`;

        await loadWeather(latitude, longitude, displayName);

      } catch (err) {
        console.error("Reverse geocode failed:", err);
        // Coords known but name lookup failed — still load weather with coords
        await loadWeather(latitude, longitude, "Your Location, Maharashtra");
      }
    },
    (err) => {
      // User denied location OR timeout — fallback to Amravati
      console.warn("Geolocation denied or failed:", err.message);
      fallbackLoad("Amravati", "Maharashtra");
    },
    {
      timeout: 8000,          // wait max 8 seconds for GPS
      maximumAge: 300000      // reuse cached position if less than 5 min old
    }
  );
}

// ─── FALLBACK (if GPS denied) ────────────────────────────────────
async function fallbackLoad(city, state) {
  try {
    // Get coordinates for fallback city
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},IN&limit=1&appid=${API_KEY}`
    );
    const geoData = await geoRes.json();

    if (geoData.length > 0) {
      const { lat, lon } = geoData[0];
      document.querySelector(".loc-top p").textContent = `${city}, ${state}`;
      await loadWeather(lat, lon, `${city}, ${state}`);
    } else {
      document.querySelector(".weather-main h1").textContent = "Location Error";
      document.querySelector(".weather-main p").textContent = "Could not load weather.";
    }
  } catch (err) {
    console.error("Fallback load failed:", err);
  }
}

// ─── START ───────────────────────────────────────────────────────
getLocationAndLoad();
setInterval(getLocationAndLoad, 10 * 60 * 1000); // refresh every 10 minutes