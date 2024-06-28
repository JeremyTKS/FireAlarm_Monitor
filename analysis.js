import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCF6OCzcKwrDS4W3JEiBVnZeiw4ACS5qYk",
    authDomain: "fire-alarm-monitoring-sy-be36f.firebaseapp.com",
    databaseURL: "https://fire-alarm-monitoring-sy-be36f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fire-alarm-monitoring-sy-be36f",
    storageBucket: "fire-alarm-monitoring-sy-be36f.appspot.com",
    messagingSenderId: "238251501710",
    appId: "1:238251501710:web:22e10e60b945a4879201df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to fetch history data
function fetchHistoryData() {
    return new Promise((resolve, reject) => {
        const historyRef = ref(database, 'History');
        onValue(historyRef, (snapshot) => {
            const data = snapshot.val();
            resolve(data);
        }, (error) => {
            reject(error);
        });
    });
}

// Function to process data based on selected type and rooms
function processDataByTypeAndRoom(data, type) {
    const rooms = ["L101", "L102", "L103", "L104", "L201", "L202", "L203", "L204"];
    const roomData = rooms.map(room => {
        const roomEntries = data[room] || {};
        let count = 0;

        for (const timestamp in roomEntries) {
            if (roomEntries.hasOwnProperty(timestamp)) {
                const record = roomEntries[timestamp];
                if (type === 'Smoke' && record.Smoke === 'High') {
                    count++;
                } else if (type === 'Heat' && record.Heat === 'High') {
                    count++;
                } else if (type === 'Fire' && record.Fire === 'On') {
                    count++;
                }
            }
        }
        return count;
    });

    return {
        labels: rooms,
        datasets: [{
            label: `${type} Sensor Data`,
            data: roomData,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'],
        }]
    };
}

// Function to render the selected chart
function renderSelectedChart(data) {
    const selectedDataType = document.getElementById('dataType').value;
    let chartData;

    if (selectedDataType === 'smoke') {
        chartData = processDataByTypeAndRoom(data, 'Smoke'); // Process data for smoke sensor
    } else if (selectedDataType === 'heat') {
        chartData = processDataByTypeAndRoom(data, 'Heat'); // Process data for heat sensor
    } else if (selectedDataType === 'fire') {
        chartData = processDataByTypeAndRoom(data, 'Fire'); // Process data for fire alarm
    }

    const selectedChartCtx = document.getElementById('selectedChart').getContext('2d');
    
    // Destroy the previous chart instance if it exists
    if (window.selectedChartInstance) {
        window.selectedChartInstance.destroy();
    }

    const selectedChart = new Chart(selectedChartCtx, {
        type: 'bar', // Use 'bar' chart for better visualization
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1, // Set the step size to 1
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null; // Display only integers
                        }
                    }
                }
            },
            responsive: false, // Disable responsiveness
            maintainAspectRatio: false, // Prevent aspect ratio from being maintained
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                }
            }
        }
    });

    window.selectedChartInstance = selectedChart;
}

// Event listener for the dropdown change event
document.getElementById('dataType').addEventListener('change', () => {
    fetchHistoryData().then((data) => {
        renderSelectedChart(data);
    }).catch((error) => {
        console.error('Error fetching data:', error);
    });
});

// Fetch data and render selected chart on load
fetchHistoryData().then((data) => {
    renderSelectedChart(data);
}).catch((error) => {
    console.error('Error fetching data:', error);
});
