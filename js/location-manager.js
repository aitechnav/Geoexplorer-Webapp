// Array to hold saved locations is now declared in index.html

/**
 * Handle map clicks - show info for clicked location
 * @param {google.maps.LatLng} latLng - Clicked position
 */
async function handleMapClick(latLng) {
    const lat = latLng.lat();
    const lng = latLng.lng();
    
    currentPosition = { lat, lng };
    
    // Update UI with coordinates
    document.getElementById("coordinatesDisplay").textContent = 
        `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
    
    // Enable save button
    document.getElementById("saveLocation").disabled = false;
    
    // Clear previous marker
    if (currentMarker) {
        currentMarker.setMap(null);
    }
    
    // Add new marker
    currentMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        animation: google.maps.Animation.DROP
    });
    
    // Show loading message
    infoWindow.setContent("<div class='info-window'>Loading information...</div>");
    infoWindow.setPosition(latLng);
    infoWindow.open(map, currentMarker);
    
    try {
        // Get address from coordinates
        const address = await reverseGeocode(latLng);
        document.getElementById("addressDisplay").textContent = `Address: ${address}`;
        
        // Generate content using Gemini API
        const content = await generateContent(lat, lng, address);
        
        // Update InfoWindow with the generated content
        infoWindow.setContent(`<div class='info-window'>
            <h3>${address}</h3>
            <p>${content}</p>
        </div>`);
    } catch (error) {
        console.error(error);
        document.getElementById("addressDisplay").textContent = "Address: Not available";
        
        // Generate content using Gemini API without address
        const content = await generateContent(lat, lng);
        
        // Update InfoWindow with the generated content
        infoWindow.setContent(`<div class='info-window'>
            <h3>Location Information</h3>
            <p>${content}</p>
        </div>`);
    }
}

/**
 * Save current location to favorites
 */
async function saveLocation() {
    if (!currentPosition) return;
    
    try {
        // Try to get address for location name
        const address = await reverseGeocode(currentPosition);
        const locationName = address.split(',')[0];
        
        const locationTitle = prompt("Enter a name for this location:", locationName);
        
        if (locationTitle) {
            const newLocation = {
                title: locationTitle,
                lat: currentPosition.lat,
                lng: currentPosition.lng,
                timestamp: new Date().toISOString()
            };
            
            savedLocations.push(newLocation);
            updateSavedLocationsUI();
            
            // Save to localStorage
            localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
        }
    } catch (error) {
        console.error(error);
        
        const locationTitle = prompt("Enter a name for this location:", "Unnamed Location");
        
        if (locationTitle) {
            const newLocation = {
                title: locationTitle,
                lat: currentPosition.lat,
                lng: currentPosition.lng,
                timestamp: new Date().toISOString()
            };
            
            savedLocations.push(newLocation);
            updateSavedLocationsUI();
            
            // Save to localStorage
            localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
        }
    }
}

/**
 * Load saved locations from localStorage
 */
function loadSavedLocations() {
    const saved = localStorage.getItem("savedLocations");
    if (saved) {
        try {
            savedLocations = JSON.parse(saved);
            updateSavedLocationsUI();
        } catch (e) {
            console.error("Error loading saved locations:", e);
        }
    }
}

/**
 * Delete a saved location
 * @param {number} index - Index of location to delete
 */
function deleteLocation(index) {
    if (confirm("Delete this saved location?")) {
        savedLocations.splice(index, 1);
        updateSavedLocationsUI();
        localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    }
}

/**
 * Search for a location by address
 * @param {string} address - Location to search for
 */
async function searchLocation(address) {
    try {
        const location = await geocodeAddress(address);
        map.setCenter(location);
        handleMapClick(location);
    } catch (error) {
        alert("Could not find location: " + error.message);
    }
}