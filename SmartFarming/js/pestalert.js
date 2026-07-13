// Map initialization
var map = L.map('map').setView([18.5204, 73.8567], 10);

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// High Risk Zone
L.circle([18.55, 73.85], {
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.5,
    radius: 5000
}).addTo(map).bindPopup("High Risk Area");

// Warning Zone
L.circle([18.48, 73.90], {
    color: 'orange',
    fillColor: 'yellow',
    fillOpacity: 0.5,
    radius: 4000
}).addTo(map).bindPopup("Warning Area");

function savePreferences() {
    alert("Preferences saved!");
}