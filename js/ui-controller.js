/**
 * Set up all UI event listeners
 */
function setupEventListeners() {
    // Map style selector
    document.getElementById("mapStyle").addEventListener("change", function() {
        applyMapStyle(this.value);
    });
    
    // Layer toggles
    document.getElementById("trafficLayer").addEventListener("change", function() {
        toggleLayer(trafficLayer, this.checked);
    });
    
    document.getElementById("transitLayer").addEventListener("change", function() {
        toggleLayer(transitLayer, this.checked);
    });
    
    document.getElementById("bicyclingLayer").addEventListener("change", function() {
        toggleLayer(bicyclingLayer, this.checked);
    });
    
    // Save location button
    document.getElementById("saveLocation").addEventListener("click", function() {
        if (currentPosition) {
            saveLocation();
        }
    });
    
    // Search button
    document.getElementById("searchButton").addEventListener("click", function() {
        const address = document.getElementById("locationSearch").value;
        if (address) {
            searchLocation(address);
        }
    });
    
    // Search input enter key
    document.getElementById("locationSearch").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            const address = this.value;
            if (address) {
                searchLocation(address);
            }
        }
    });
}

/**
 * Update the UI to display saved locations
 */
function updateSavedLocationsUI() {
    const container = document.getElementById("savedLocations");
    
    if (savedLocations.length === 0) {
        container.innerHTML = "<p>No saved locations yet.</p>";
        return;
    }
    
    container.innerHTML = "";
    
    savedLocations.forEach((location, index) => {
        const locationEl = document.createElement("div");
        locationEl.className = "saved-location";
        locationEl.innerHTML = `
            <div>${location.title}</div>
            <div style="font-size: 0.8em; color: #666;">
                ${new Date(location.timestamp).toLocaleDateString()}
            </div>
            <div style="text-align: right;">
                <button class="delete-location" data-index="${index}" style="background-color: #f44336;">Delete</button>
            </div>
        `;
        
        locationEl.addEventListener("click", function(e) {
            // Don't trigger if the delete button was clicked
            if (e.target.classList.contains('delete-location')) return;
            
            const latLng = new google.maps.LatLng(location.lat, location.lng);
            map.setCenter(latLng);
            map.setZoom(15);
            handleMapClick(latLng);
        });
        
        container.appendChild(locationEl);
    });
    
    // Add delete button functionality
    document.querySelectorAll(".delete-location").forEach(button => {
        button.addEventListener("click", function(e) {
            e.stopPropagation();
            const index = parseInt(this.getAttribute("data-index"));
            deleteLocation(index);
        });
    });
}