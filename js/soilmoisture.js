// =============================================
//   Smart Farming Assistant - Soil Moisture JS
//   Live Data: OpenWeatherMap API + Simulation
// =============================================

const API_KEY = "f386bfd933dd4e5f0e57cbd3d79ea38c";
const CITY = "Pune";

// ── Chart Setup ──────────────────────────────
const ctx = document.getElementById('chart').getContext('2d');

const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, "rgba(19, 155, 128, 0.9)");
gradient.addColorStop(0.5, "rgba(11, 110, 84, 0.9)");
gradient.addColorStop(1, "rgba(6, 32, 32, 0.9)");

const moistureChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Soil Moisture (%)',
            data: [20, 25, 40, 35, 30, 45, 38],
            fill: true,
            backgroundColor: gradient,
            borderColor: "#00e5ff",
            pointBackgroundColor: "#00e5ff",
            pointBorderColor: "#ffffff",
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { labels: { color: "white" } },
            tooltip: {
                enabled: true,
                backgroundColor: "rgba(0,0,0,0.8)",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
                borderColor: "#00e5ff",
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        return "Moisture: " + context.parsed.y + "%";
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: "white" },
                grid: { color: "rgba(255,255,255,0.1)" }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: "white",
                    callback: function (value) { return value + "%"; }
                },
                grid: { color: "rgba(255,255,255,0.1)" }
            }
        }
    }
});

// ── Update Chart with new moisture value ─────
function updateChart(newValue) {
    const data = moistureChart.data.datasets[0].data;
    data.shift();               // remove oldest value
    data.push(newValue);        // add new value at end
    moistureChart.update();
}

// ── Update Status Card ────────────────────────
function updateMoistureStatus(moisture) {
    const moistureEl = document.querySelector('#moisture');
    const statusEl = document.querySelector('.low');

    if (moistureEl) moistureEl.textContent = moisture + "%";

    if (statusEl) {
        if (moisture < 30) {
            statusEl.textContent = "🔴 Low — Needs Watering";
            statusEl.style.color = "rgb(200, 30, 30)";
        } else if (moisture >= 30 && moisture <= 60) {
            statusEl.textContent = "🟢 Optimal — Good to Go";
            statusEl.style.color = "rgb(20, 160, 80)";
        } else {
            statusEl.textContent = "🔵 High — Reduce Irrigation";
            statusEl.style.color = "rgb(30, 100, 200)";
        }
    }
}

// ── Update Temperature Card ───────────────────
function updateTemperature(temp) {
    // Targets the 2nd stat card paragraph (Soil Temperature)
    const tempEl = document.querySelectorAll('.stats .card p')[1];
    if (tempEl) tempEl.textContent = temp + "°C";
}

// ── Update Field Conditions ───────────────────
function updateFieldConditions(weatherDesc, humidity) {
    const titles = document.querySelectorAll('.field-item .title');
    const subs = document.querySelectorAll('.field-item .sub');

    if (!titles.length) return;

    // Row 1: Soil condition based on humidity
    if (humidity < 30) {
        titles[0].textContent = "Soil is Dry";
        subs[0].textContent = "Increase water retention, irrigation needed.";
    } else if (humidity >= 30 && humidity <= 65) {
        titles[0].textContent = "Soil is Moderate";
        subs[0].textContent = "Soil moisture is at a healthy level.";
    } else {
        titles[0].textContent = "Soil is Wet";
        subs[0].textContent = "Avoid over-irrigation, drainage may be needed.";
    }

    // Row 2: Weather condition
    const desc = weatherDesc.toLowerCase();
    if (desc.includes("rain")) {
        titles[1].textContent = "🌧️ Rainy Weather";
        subs[1].textContent = "Skip irrigation today, natural watering in progress.";
    } else if (desc.includes("cloud")) {
        titles[1].textContent = "⛅ Cloudy Weather";
        subs[1].textContent = "Good time for fieldwork, mild temperature expected.";
    } else if (desc.includes("thunder") || desc.includes("storm")) {
        titles[1].textContent = "⛈️ Stormy Weather";
        subs[1].textContent = "Avoid outdoor activity, secure equipment.";
    } else {
        titles[1].textContent = "☀️ Sunny Weather";
        subs[1].textContent = "Irrigate crops early morning, avoid midday heat.";
    }

    // Row 3: Action recommendation
    if (humidity < 30) {
        titles[2].textContent = "💧 Start Irrigation";
        subs[2].textContent = "Start irrigation early morning or evening.";
    } else if (desc.includes("rain")) {
        titles[2].textContent = "✅ No Irrigation Needed";
        subs[2].textContent = "Rain is providing natural watering today.";
    } else {
        titles[2].textContent = "👁️ Monitor Fields";
        subs[2].textContent = "Conditions are stable. Check again in a few hours.";
    }
}

// ── Fetch Live Data from OpenWeatherMap ───────
function fetchWeatherData() {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("API error: " + res.status);
            return res.json();
        })
        .then(data => {
            const temp = Math.round(data.main.temp);
            const humidity = data.main.humidity;
            const weatherDesc = data.weather[0].description;

            console.log(`[Live Data] Temp: ${temp}°C | Humidity: ${humidity}% | Weather: ${weatherDesc}`);

            // Update all UI elements with real data
            updateTemperature(temp);
            updateMoistureStatus(humidity);
            updateChart(humidity);
            updateFieldConditions(weatherDesc, humidity);
        })
        .catch(err => {
            console.warn("Weather API failed, using simulation:", err.message);
            simulateFallback();
        });
}

// ── Fallback Simulation (if API fails) ────────
function simulateFallback() {
    const moisture = Math.floor(Math.random() * 20) + 28; // 28–48%
    const temp = Math.floor(Math.random() * 10) + 18;     // 18–28°C

    updateTemperature(temp);
    updateMoistureStatus(moisture);
    updateChart(moisture);
}

// ── Simulate small live fluctuations every 5s ─
function simulateLiveFluctuation() {
    const moistureEl = document.querySelector('#moisture');
    if (!moistureEl) return;

    const current = parseInt(moistureEl.textContent) || 35;
    // Fluctuate ±2 around current real value
    const fluctuated = current + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
    const clamped = Math.min(Math.max(fluctuated, 10), 90); // keep between 10–90%

    updateMoistureStatus(clamped);
    updateChart(clamped);
}

// ── Refresh Button ────────────────────────────
function refreshData() {
    console.log("Refreshing live data...");
    fetchWeatherData();
}

// ── Init ──────────────────────────────────────
fetchWeatherData();                              // fetch real data on page load
setInterval(fetchWeatherData, 10 * 60 * 1000);  // re-fetch from API every 10 minutes
setInterval(simulateLiveFluctuation, 5000);      // small fluctuation every 5 seconds