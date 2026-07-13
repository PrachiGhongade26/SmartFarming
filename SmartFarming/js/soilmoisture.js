const ctx = document.getElementById('chart').getContext('2d');

// Create gradient
const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, "rgba(19, 155, 128, 0.9)");
gradient.addColorStop(0.5, "rgba(11, 110, 84, 0.9)");
gradient.addColorStop(1, "rgba(6, 32, 32, 0.9)");

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
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

        interaction: {
            mode: 'index',
            intersect: false
        },

        plugins: {
            legend: {
                labels: {
                    color: "white"
                }
            },

            tooltip: {
                enabled: true,
                backgroundColor: "rgba(0,0,0,0.8)",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
                borderColor: "#00e5ff",
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return "Moisture: " + context.parsed.y + "%";
                    }
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: "white"
                },
                grid: {
                    color: "rgba(255,255,255,0.1)"
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: "white",
                    callback: function(value) {
                        return value + "%";
                    }
                },
                grid: {
                    color: "rgba(255,255,255,0.1)"
                }
            }
        }
    }
});