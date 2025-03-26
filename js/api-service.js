// API configuration
// CONFIG.geminiApiKey is defined in the index.html

/**
 * Generate content about a location using Google's Gemini API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} address - Optional address information
 * @returns {Promise<string>} - Location description
 */
async function generateContent(lat, lng, address = null) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.geminiApiKey}`;
    
    let prompt = `Provide a brief but informative description (2-3 paragraphs) about the location at latitude: ${lat}, longitude: ${lng}.`;
    
    if (address) {
        prompt += ` The address is: ${address}.`;
    }
    
    prompt += ` Include notable landmarks, historical significance, cultural relevance, or interesting facts if applicable. Also briefly mention the current typical weather conditions for this time of year.`;
    
    const requestBody = {
        "contents": [{
            "parts": [{ "text": prompt }]
        }]
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected response format:", data);
            return "Unable to retrieve information about this location.";
        }
    } catch (error) {
        console.error("Error fetching content:", error);
        return "Error retrieving information. Please try again later.";
    }
}

/**
 * Perform geocoding to find a location by address
 * @param {string} address - Location address or name
 * @returns {Promise<google.maps.LatLng|null>} - Coordinates or null if not found
 */
function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK" && results[0]) {
                resolve(results[0].geometry.location);
            } else {
                reject(new Error(`Geocoding failed: ${status}`));
            }
        });
    });
}

/**
 * Perform reverse geocoding to find address from coordinates
 * @param {google.maps.LatLng} latLng - Location coordinates
 * @returns {Promise<string|null>} - Formatted address or null if not found
 */
function reverseGeocode(latLng) {
    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === "OK" && results[0]) {
                resolve(results[0].formatted_address);
            } else {
                reject(new Error(`Reverse geocoding failed: ${status}`));
            }
        });
    });
}