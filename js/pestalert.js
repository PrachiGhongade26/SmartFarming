// =============================================
//   Smart Farming Assistant - Pest Alert JS
//   Live Data: OpenWeatherMap API + Dynamic Risk
// =============================================

const API_KEY = "f386bfd933dd4e5f0e57cbd3d79ea38c";
const CITY = "Pune";

// ── Pest Database ─────────────────────────────
// Each pest is linked to weather conditions that favor it
const PEST_DATA = {
    hot_dry: {
        name: "Red Spider Mite",
        emoji: "🕷️",
        desc: "Thrives in hot, dry conditions. Causes yellowing and wilting of leaves.",
        crops: "Tomato, Brinjal, Beans, Cotton",
        risk: "high",
        tips: [
            "Spray water on undersides of leaves",
            "Use neem oil solution weekly",
            "Introduce predatory mites",
            "Avoid excessive nitrogen fertilizers"
        ]
    },
    hot_humid: {
        name: "Fall Armyworm",
        emoji: "🐛",
        desc: "A destructive pest favored by warm, humid conditions. Affects crops rapidly.",
        crops: "Corn, Millet, Sorghum, Wheat",
        risk: "high",
        tips: [
            "Monitor fields regularly at dawn",
            "Use pheromone traps for early detection",
            "Apply biological controls (Bt spray)",
            "Use pesticides as last resort"
        ]
    },
    rainy: {
        name: "Aphid Infestation",
        emoji: "🐞",
        desc: "Aphids multiply rapidly during rainy seasons, spreading plant viruses.",
        crops: "Cabbage, Mustard, Potato, Chilli",
        risk: "moderate",
        tips: [
            "Use yellow sticky traps in fields",
            "Spray neem-based insecticides",
            "Encourage ladybird beetles (natural predator)",
            "Remove heavily infested plant parts"
        ]
    },
    cold_dry: {
        name: "Whitefly",
        emoji: "🦟",
        desc: "Common in cooler, dry weather. Spreads viral diseases between plants.",
        crops: "Tomato, Cotton, Okra, Cucumber",
        risk: "moderate",
        tips: [
            "Use reflective mulches to repel whiteflies",
            "Set up yellow sticky traps",
            "Apply insecticidal soap spray",
            "Avoid planting susceptible crops together"
        ]
    },
    stormy: {
        name: "Locust Swarm",
        emoji: "🦗",
        desc: "Storm winds can carry locust swarms into your region. Stay alert.",
        crops: "All field crops at risk",
        risk: "high",
        tips: [
            "Report sightings to local agriculture dept",
            "Use sound devices to drive them away",
            "Apply recommended pesticides immediately",
            "Cover nursery beds with netting"
        ]
    }
};

// ── Map Setup ─────────────────────────────────
var map = L.map('map').setView([18.5204, 73.8567], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Store circle references so we can update them
let highRiskCircle = L.circle([18.55, 73.85], {
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.5,
    radius: 5000
}).addTo(map).bindPopup("⚠️ High Risk Area — Active Pest Outbreak");

let warningCircle = L.circle([18.48, 73.90], {
    color: 'orange',
    fillColor: 'yellow',
    fillOpacity: 0.5,
    radius: 4000
}).addTo(map).bindPopup("⚠️ Warning Area — Monitor Closely");

let lowRiskCircle = L.circle([18.50, 73.80], {
    color: 'green',
    fillColor: 'lightgreen',
    fillOpacity: 0.4,
    radius: 3000
}).addTo(map).bindPopup("✅ Low Risk Area — Conditions Stable");

// ── Determine Weather Condition Key ──────────
function getConditionKey(temp, humidity, weatherDesc) {
    const desc = weatherDesc.toLowerCase();

    if (desc.includes("thunder") || desc.includes("storm")) return "stormy";
    if (desc.includes("rain") || desc.includes("drizzle"))   return "rainy";
    if (temp >= 28 && humidity >= 60)                        return "hot_humid";
    if (temp >= 28 && humidity < 60)                         return "hot_dry";
    return "cold_dry";
}

// ── Update Pest Details Section ───────────────
function updatePestDetails(pest) {
    const nameEl   = document.querySelector('.pest-name');
    const descEl   = document.querySelector('.pest-desc');
    const cropsEl  = document.querySelector('.pest-crops');

    if (nameEl)  nameEl.textContent  = pest.emoji + " " + pest.name;
    if (descEl)  descEl.textContent  = pest.desc;
    if (cropsEl) cropsEl.innerHTML   = `<strong>Affected Crops:</strong> ${pest.crops}`;
}

// ── Update Prevention Tips ────────────────────
function updatePreventionTips(pest) {
    const ul = document.querySelector('.prevention-text ul');
    if (!ul) return;

    ul.innerHTML = pest.tips
        .map(tip => `<li>${tip}</li>`)
        .join('');
}

// ── Update Recent Alerts ──────────────────────
function updateAlerts(pest, temp, humidity, weatherDesc) {
    const alertsContainer = document.querySelector('.alerts');
    if (!alertsContainer) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const riskBadge = pest.risk === "high"
        ? "🔴 HIGH RISK"
        : pest.risk === "moderate"
        ? "🟡 MODERATE"
        : "🟢 LOW RISK";

    // Build live alert HTML
    const liveAlert = `
        <div class="alert-item" style="border-left: 4px solid ${pest.risk === 'high' ? 'red' : pest.risk === 'moderate' ? 'orange' : 'green'}; padding-left: 10px;">
            ${pest.emoji} <strong>${pest.name}</strong> — ${riskBadge}
            <small>Live update · ${dateStr} at ${timeStr} · Temp: ${temp}°C · Humidity: ${humidity}%</small>
        </div>
    `;

    // Keep old alerts + prepend live one
    const existingAlerts = alertsContainer.querySelectorAll('.alert-item');
    const h2 = alertsContainer.querySelector('h2');
    const link = alertsContainer.querySelector('a');

    // Remove old alerts to re-insert fresh
    existingAlerts.forEach(el => el.remove());

    // Insert: live first, then static historical ones
    const staticAlerts = `
        <div class="alert-item">
            ⚠️ Fall Armyworm detected
            <small>In North Region - 2 days ago</small>
        </div>
        <div class="alert-item">
            🐞 Aphid infestation
            <small>In Central Area - 4 days ago</small>
        </div>
        <div class="alert-item">
            🦗 Locust swarm spotted
            <small>Spotted Near East Farms - 1 week ago</small>
        </div>
    `;

    h2.insertAdjacentHTML('afterend', liveAlert + staticAlerts);
}

// ── Update Map Risk Circles ───────────────────
function updateMapRisk(riskLevel) {
    if (riskLevel === "high") {
        // Expand red zone, shrink green
        highRiskCircle.setRadius(7000);
        highRiskCircle.setStyle({ color: 'red', fillColor: 'red', fillOpacity: 0.6 });
        warningCircle.setRadius(5000);
        lowRiskCircle.setRadius(2000);
    } else if (riskLevel === "moderate") {
        highRiskCircle.setRadius(4000);
        warningCircle.setRadius(5000);
        warningCircle.setStyle({ color: 'orange', fillColor: 'yellow', fillOpacity: 0.5 });
        lowRiskCircle.setRadius(4000);
    } else {
        // Low risk — shrink danger zones, expand green
        highRiskCircle.setRadius(2000);
        warningCircle.setRadius(2500);
        lowRiskCircle.setRadius(6000);
        lowRiskCircle.setStyle({ color: 'green', fillColor: 'lightgreen', fillOpacity: 0.5 });
    }
}

// ── Update Page Header Subtitle ──────────────
function updateHeaderSubtitle(pest, temp, humidity) {
    const subtitle = document.querySelector('.header p');
    if (subtitle) {
        subtitle.textContent = `Live Risk: ${pest.emoji} ${pest.name} · ${temp}°C · Humidity ${humidity}% · Updated just now`;
    }
}

// ── Main: Fetch Live Weather & Update All ─────
function fetchPestData() {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("API error: " + res.status);
            return res.json();
        })
        .then(data => {
            const temp        = Math.round(data.main.temp);
            const humidity    = data.main.humidity;
            const weatherDesc = data.weather[0].description;

            console.log(`[Pest Alert] Temp: ${temp}°C | Humidity: ${humidity}% | Weather: ${weatherDesc}`);

            // Pick pest based on weather
            const conditionKey = getConditionKey(temp, humidity, weatherDesc);
            const pest = PEST_DATA[conditionKey];

            // Update all sections
            updatePestDetails(pest);
            updatePreventionTips(pest);
            updateAlerts(pest, temp, humidity, weatherDesc);
            updateMapRisk(pest.risk);
            updateHeaderSubtitle(pest, temp, humidity);
        })
        .catch(err => {
            console.warn("Weather API failed, using fallback:", err.message);
            // Fallback: use hot_humid as default
            const pest = PEST_DATA["hot_humid"];
            updatePestDetails(pest);
            updatePreventionTips(pest);
            updateMapRisk(pest.risk);
        });
}

// ── Save Preferences ──────────────────────────
function savePreferences() {
    const emailChecked = document.querySelectorAll('input[type="checkbox"]')[0].checked;
    const smsChecked   = document.querySelectorAll('input[type="checkbox"]')[1].checked;

    let msg = "✅ Preferences saved!\n";
    if (emailChecked) msg += "📧 Email alerts enabled\n";
    if (smsChecked)   msg += "📱 SMS alerts enabled\n";
    if (!emailChecked && !smsChecked) msg += "⚠️ No alert method selected.";

    alert(msg);
}

// ── Init ──────────────────────────────────────
fetchPestData();                              // fetch on page load
setInterval(fetchPestData, 10 * 60 * 1000);  // refresh every 10 minutes