// Demo State
let currentFile = null;
let currentVideo = null;
let isProcessing = false;
let detectionBoxes = [];

// Initialize
function initDemo() {
    // Set up file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.addEventListener("change", handleFileSelect);
    }

    // Initialize status
    updateStatus("Ready");

    // Set up video event listeners
    const video = document.getElementById("outputVideo");
    if (video) {
        video.addEventListener("loadeddata", handleVideoLoaded);
        video.addEventListener("timeupdate", updateDetectionBoxes);
    }
}

// Handle File Selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    currentFile = file;

    // Create object URL for the file
    const fileURL = URL.createObjectURL(file);

    // Update preview in upload column
    const preview = document.getElementById("filePreview");
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (isVideo) {
        preview.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-video"></i>
                <p>${file.name}</p>
                <small>${(file.size / (1024 * 1024)).toFixed(1)} MB • Video</small>
            </div>
        `;

        // Set up video for playback
        setupVideoPlayback(fileURL, file.name);
    } else if (isImage) {
        preview.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-image"></i>
                <p>${file.name}</p>
                <small>${(file.size / (1024 * 1024)).toFixed(1)} MB • Image</small>
            </div>
        `;

        // Set up image for display
        setupImageDisplay(fileURL, file.name);
    }

    // Update status
    document.getElementById("fileName").textContent = file.name;
    updateStatus("File ready");

    // Enable process button
    document.getElementById("processBtn").disabled = false;
}

// Setup Video Playback
function setupVideoPlayback(videoURL, fileName) {
    const video = document.getElementById("outputVideo");
    const image = document.getElementById("outputImage");
    const placeholder = document.getElementById("videoPlaceholder");
    const overlay = document.getElementById("detectionOverlay");

    // Hide image and placeholder, show video
    image.style.display = "none";
    placeholder.style.display = "none";
    video.style.display = "block";

    // Set video source
    video.src = videoURL;
    video.load();

    // Store reference to video
    currentVideo = video;

    // Initialize overlay
    overlay.style.display = "block";
    overlay.innerHTML = ""; // Clear previous overlays

    // Reset detection boxes
    detectionBoxes = [];

    // Hide violation alert initially
    const alert = document.getElementById("violationAlert");
    alert.style.display = "none";
}

// Setup Image Display
function setupImageDisplay(imageURL, fileName) {
    const video = document.getElementById("outputVideo");
    const image = document.getElementById("outputImage");
    const placeholder = document.getElementById("videoPlaceholder");
    const overlay = document.getElementById("detectionOverlay");

    // Hide video and placeholder, show image
    video.style.display = "none";
    placeholder.style.display = "none";
    image.style.display = "block";

    // Set image source
    image.src = imageURL;

    // Initialize overlay
    overlay.style.display = "block";
    overlay.innerHTML = ""; // Clear previous overlays

    // Create detection boxes for image
    createDetectionBoxes();

    // Show violation alert for images too
    const alert = document.getElementById("violationAlert");
    alert.style.display = "flex";
}

// Handle Video Loaded
function handleVideoLoaded() {
    console.log("Video loaded, ready for processing");
    // Video is loaded and ready
}

// Create Detection Boxes
function createDetectionBoxes() {
    const overlay = document.getElementById("detectionOverlay");

    // Clear previous boxes
    overlay.innerHTML = "";
    detectionBoxes = [];

    // Create sample detection boxes
    const boxes = [
        { type: "car", top: 35, left: 25, confidence: 92, id: "car1" },
        { type: "car", top: 40, left: 60, confidence: 88, id: "car2" },
        {
            type: "pedestrian",
            top: 70,
            left: 50,
            confidence: 95,
            id: "person1",
        },
    ];

    boxes.forEach((box) => {
        const boxElement = document.createElement("div");
        boxElement.className = `detection-box ${box.type}`;
        boxElement.style.top = `${box.top}%`;
        boxElement.style.left = `${box.left}%`;
        boxElement.id = box.id;
        boxElement.innerHTML = `
            <div class="box-label">${box.type === "car" ? "Car" : "Person"} • ${box.confidence}%</div>
        `;

        overlay.appendChild(boxElement);
        detectionBoxes.push(boxElement);
    });

    // Create violation alert
    const alert = document.createElement("div");
    alert.className = "violation-alert";
    alert.id = "dynamicViolationAlert";
    alert.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>VIOLATION DETECTED</span>
    `;
    overlay.appendChild(alert);

    // Show the alert
    setTimeout(() => {
        alert.style.display = "flex";
    }, 1000);
}

// Update Detection Boxes (for video playback)
function updateDetectionBoxes() {
    if (!currentVideo) return;

    // Example: Move detection boxes slightly during playback for realism
    detectionBoxes.forEach((box, index) => {
        if (box.style.display !== "none") {
            // Add slight movement animation
            const currentTop = parseFloat(box.style.top);
            const newTop =
                currentTop + Math.sin(Date.now() * 0.001 + index) * 0.5;
            box.style.top = `${newTop}%`;
        }
    });
}

// Load Sample
function loadSample(type) {
    const samples = {
        busy: {
            name: "Red_Light_Traffic_Violation_Detection.mp4",
            size: 1.9,
            type: "video/mp4",
            url: "https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4", // Sample video URL
        },
        school: {
            name: "school_zone.mov",
            size: 22.5,
            type: "video/mov",
            url: "https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4", // Same sample for demo
        },
    };

    const sample = samples[type];
    currentFile = sample;

    // Update preview
    const preview = document.getElementById("filePreview");
    preview.innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-video"></i>
            <p>${sample.name}</p>
            <small>${sample.size} MB • Sample Video</small>
        </div>
    `;

    // Setup sample video
    setupVideoPlayback(sample.url, sample.name);

    // Update status
    document.getElementById("fileName").textContent = sample.name;
    updateStatus("Sample loaded");

    // Enable process button
    document.getElementById("processBtn").disabled = false;
}

// Update Status
function updateStatus(status) {
    const statusElement = document.getElementById("status");
    statusElement.textContent = status;

    if (status === "Ready") {
        statusElement.style.color = "#2ecc71";
    } else if (status === "Processing...") {
        statusElement.style.color = "#f39c12";
    } else if (status === "Complete") {
        statusElement.style.color = "#3498db";
    }
}

// Process Video/Image
function processVideo() {
    if (!currentFile || isProcessing) return;

    isProcessing = true;
    updateStatus("Processing...");
    document.getElementById("processBtn").disabled = true;

    // Simulate AI processing
    const progressInterval = setInterval(() => {
        updateStatus(`Processing... ${Math.floor(Math.random() * 30) + 70}%`);
    }, 300);

    setTimeout(() => {
        clearInterval(progressInterval);
        completeProcessing();
    }, 3000);
}

// Complete Processing
function completeProcessing() {
    isProcessing = false;
    updateStatus("Complete");

    // Create detection boxes
    createDetectionBoxes();

    // Generate random results
    const violations = Math.floor(Math.random() * 5) + 1;
    const vehicles = Math.floor(Math.random() * 10) + 5;
    const pedestrians = Math.floor(Math.random() * 8) + 3;

    // Update results
    document.getElementById("violationsCount").textContent = violations;
    document.getElementById("vehiclesCount").textContent = vehicles;
    document.getElementById("pedestriansCount").textContent = pedestrians;
    document.getElementById("totalViolations").textContent = violations;

    // Update time
    const now = new Date();
    document.getElementById("lastUpdate").textContent =
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

    // Update accuracy with slight variation
    const accuracy = 92 + Math.random() * 4;
    document.getElementById("accuracy").textContent = accuracy.toFixed(1) + "%";

    // Change process button to reset
    const processBtn = document.getElementById("processBtn");
    processBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Process Again';
    processBtn.disabled = false;
    processBtn.onclick = resetAll;

    // Auto-play the video
    setTimeout(() => {
        if (currentVideo) {
            currentVideo.play().catch((e) => {
                console.log("Auto-play prevented by browser:", e);
            });
        }
    }, 500);
}

// Reset All
function resetAll() {
    // Reset file input
    document.getElementById("fileInput").value = "";
    currentFile = null;
    currentVideo = null;
    isProcessing = false;

    // Stop any playing video
    const video = document.getElementById("outputVideo");
    if (video) {
        video.pause();
        video.currentTime = 0;
        video.style.display = "none";
    }

    // Hide image
    const image = document.getElementById("outputImage");
    if (image) {
        image.style.display = "none";
    }

    // Reset preview
    document.getElementById("filePreview").innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-play-circle"></i>
            <p>Preview will appear here</p>
        </div>
    `;

    // Show placeholder
    document.getElementById("videoPlaceholder").style.display = "flex";

    // Hide overlay
    document.getElementById("detectionOverlay").style.display = "none";

    // Reset status
    document.getElementById("fileName").textContent = "None";
    updateStatus("Ready");

    // Reset process button
    const processBtn = document.getElementById("processBtn");
    processBtn.innerHTML = '<i class="fas fa-play"></i> Process with AI';
    processBtn.disabled = true;
    processBtn.onclick = processVideo;

    // Hide violation alert
    const alert = document.getElementById("violationAlert");
    if (alert) alert.style.display = "none";

    // Reset results to default
    document.getElementById("violationsCount").textContent = "0";
    document.getElementById("vehiclesCount").textContent = "0";
    document.getElementById("pedestriansCount").textContent = "0";
    document.getElementById("totalViolations").textContent = "0";
    document.getElementById("accuracy").textContent = "95.0%";
    document.getElementById("lastUpdate").textContent = "Just now";
}

// Video Controls
function playVideo() {
    if (currentVideo) {
        currentVideo.play().catch((e) => {
            console.log("Play failed:", e);
            // Fallback: Show message if play fails
            alert(
                "Click the video to play, or use the controls in the video player",
            );
        });
    }
}

function pauseVideo() {
    if (currentVideo) {
        currentVideo.pause();
    }
}

function restartVideo() {
    if (currentVideo) {
        currentVideo.currentTime = 0;
        currentVideo.play().catch((e) => console.log("Restart failed:", e));
    }
}

// Download Report
function downloadReport() {
    const report = `
SAFECROSS AI - DETECTION REPORT
===============================
Generated: ${new Date().toLocaleString()}

FILE ANALYZED:
- Name: ${currentFile ? currentFile.name : "Sample Video"}
- Type: ${currentFile ? currentFile.type : "Video/MP4"}
- Size: ${currentFile ? (currentFile.size / (1024 * 1024)).toFixed(1) + " MB" : "Sample"}

RESULTS SUMMARY:
- Violations Detected: ${document.getElementById("violationsCount").textContent}
- Vehicles Tracked: ${document.getElementById("vehiclesCount").textContent}
- Pedestrians Protected: ${document.getElementById("pedestriansCount").textContent}

DETAILED FINDINGS:
1. VIOLATIONS:
   - Failure to yield: ${document.getElementById("violationsCount").textContent} incidents
   - Speeding near crossing: ${Math.floor(Math.random() * 3)} incidents
   - Illegal parking: ${Math.floor(Math.random() * 2)} incidents

2. VEHICLE STATS:
   - Cars: 6
   - Motorcycles: 2
   - Trucks: ${Math.floor(Math.random() * 2)}

3. PEDESTRIAN SAFETY:
   - Safe crossings: 4
   - Near misses: 1
   - Average wait time: ${(Math.random() * 10 + 5).toFixed(1)} seconds

LICENSE PLATES RECOGNIZED:
1. ABC-123: VIOLATION (Failed to yield at pedestrian crossing)
2. XYZ-789: VIOLATION (Exceeded speed limit in school zone)
3. DEF-456: SAFE (Compliant with all traffic rules)

AI PERFORMANCE METRICS:
- Detection Accuracy: ${document.getElementById("accuracy").textContent}
- Processing Speed: 24 frames/second
- License Plate Recognition Rate: 96.8%
- System Confidence Level: High

RECOMMENDATIONS:
1. Issue automated violation notices for identified vehicles
2. Consider additional signage at this crossing
3. Review traffic light timing during peak hours

---
SafeCross AI MVP - For demonstration purposes only
Generated by AI Traffic Violation Detection System
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safecross_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initDemo);

// Initialize Dashboard Charts
function initDashboardCharts() {
    // Initialize violations chart
    initViolationsChart();

    // Initialize time chart
    initTimeChart();

    // Initialize vehicle chart
    initVehicleChart();

    // Initialize location chart
    initLocationChart();
}

// Chart 1: Violations Over Time
function initViolationsChart() {
    const ctx = document.getElementById("violationsChart").getContext("2d");

    // Generate data for last 30 days
    const labels = [];
    const data = [];

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(
            date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
        );

        // Generate realistic data with some variation
        const base = 40;
        const variation = Math.random() * 20;
        const trend = i > 20 ? -5 : i > 10 ? 0 : 5; // Trend over time
        data.push(Math.floor(base + variation + trend));
    }

    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Violations",
                    data: data,
                    borderColor: "#e74c3c",
                    backgroundColor: "rgba(231, 76, 60, 0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#e74c3c",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: "#3498db",
                    borderWidth: 1,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                        color: "#7f8c8d",
                    },
                    title: {
                        display: true,
                        text: "Number of Violations",
                        color: "#7f8c8d",
                    },
                },
                x: {
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                        color: "#7f8c8d",
                        maxRotation: 45,
                    },
                },
            },
        },
    });

    return chart;
}

// Chart 2: Time of Day Analysis
function initTimeChart() {
    const ctx = document.getElementById("timeChart").getContext("2d");

    const labels = [
        "12 AM",
        "2 AM",
        "4 AM",
        "6 AM",
        "8 AM",
        "10 AM",
        "12 PM",
        "2 PM",
        "4 PM",
        "6 PM",
        "8 PM",
        "10 PM",
    ];

    // Create realistic data with peaks at rush hours
    const data = labels.map((label, index) => {
        if (index === 4) return 85; // 8 AM peak
        if (index === 5) return 72; // 10 AM
        if (index === 8) return 65; // 4 PM
        if (index === 9) return 58; // 6 PM
        if (index < 3 || index > 10) return Math.floor(Math.random() * 10) + 5; // Night
        return Math.floor(Math.random() * 30) + 20; // Daytime
    });

    const chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Violations",
                    data: data,
                    backgroundColor: [
                        "#3498db",
                        "#3498db",
                        "#3498db",
                        "#f39c12",
                        "#e74c3c",
                        "#e74c3c", // Morning rush
                        "#f39c12",
                        "#f39c12",
                        "#e74c3c", // Evening rush
                        "#e74c3c",
                        "#f39c12",
                        "#3498db",
                    ],
                    borderColor: "#2c3e50",
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                        color: "#7f8c8d",
                    },
                    title: {
                        display: true,
                        text: "Violations per hour",
                        color: "#7f8c8d",
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: "#7f8c8d",
                    },
                },
            },
        },
    });

    return chart;
}

// Chart 3: Vehicle Types
function initVehicleChart() {
    const ctx = document.getElementById("vehicleChart").getContext("2d");

    const chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Cars", "Trucks", "Motorcycles", "Buses", "Other"],
            datasets: [
                {
                    data: [68, 15, 12, 3, 2],
                    backgroundColor: [
                        "#e74c3c", // Cars - red
                        "#f39c12", // Trucks - orange
                        "#3498db", // Motorcycles - blue
                        "#2ecc71", // Buses - green
                        "#95a5a6", // Other - gray
                    ],
                    borderColor: "#ffffff",
                    borderWidth: 3,
                    hoverOffset: 15,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        padding: 20,
                        color: "#2c3e50",
                        font: {
                            size: 12,
                        },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                        },
                    },
                },
            },
            cutout: "65%",
        },
    });

    return chart;
}

// Chart 4: Location Heatmap
function initLocationChart() {
    const ctx = document.getElementById("locationChart").getContext("2d");

    // Simulate location data
    const locations = [
        "Main & 5th",
        "Park Ave",
        "Broadway",
        "Elm Street",
        "Oak Street",
    ];
    const violations = [42, 28, 15, 10, 5];

    const chart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: locations,
            datasets: [
                {
                    label: "Violation Frequency",
                    data: violations,
                    backgroundColor: "rgba(231, 76, 60, 0.2)",
                    borderColor: "#e74c3c",
                    borderWidth: 2,
                    pointBackgroundColor: "#e74c3c",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 50,
                    ticks: {
                        stepSize: 10,
                        color: "#7f8c8d",
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                    },
                    angleLines: {
                        color: "rgba(0, 0, 0, 0.1)",
                    },
                    pointLabels: {
                        color: "#2c3e50",
                        font: {
                            size: 11,
                        },
                    },
                },
            },
        },
    });

    return chart;
}

// Update Chart Data
function updateChart(chartId, value) {
    console.log(`Updating chart ${chartId} with value: ${value}`);

    // In a real application, you would fetch new data based on the filter
    // For this demo, we'll just show an alert and refresh the chart
    alert(
        `Chart data would update to show ${value} days of data in a real application.`,
    );

    // Example of how you might update the chart
    if (chartId === "violationsChart") {
        // Destroy existing chart and create new one
        const canvas = document.getElementById("violationsChart");
        const context = canvas.getContext("2d");

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Reinitialize chart with new data
        initViolationsChart();
    }
}

// Initialize dashboard on page load
document.addEventListener("DOMContentLoaded", function () {
    // Wait for Chart.js to load
    if (typeof Chart !== "undefined") {
        initDashboardCharts();
    } else {
        // If Chart.js hasn't loaded yet, wait a bit
        setTimeout(initDashboardCharts, 100);
    }
});
