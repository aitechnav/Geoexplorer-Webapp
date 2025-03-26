// Global map variables are now declared in index.html
// DO NOT redeclare them here

// Map configuration
function getMapConfig() {
    return {
        // Initial map center (Washington DC)
        center: { lat: 38.8920621, lng: -77.0199124 },
        zoom: 13,
        mapTypeId: "roadmap",
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true
    };
}

// Initialize map and related services
function initMap() {
    console.log("Map initialization started");
    // Initialize geocoder
    geocoder = new google.maps.Geocoder();
    
    // Create map
    map = new google.maps.Map(document.getElementById("map"), getMapConfig());
    
    // Create layers
    trafficLayer = new google.maps.TrafficLayer();
    transitLayer = new google.maps.TransitLayer();
    bicyclingLayer = new google.maps.BicyclingLayer();
    
    // Create InfoWindow
    infoWindow = new google.maps.InfoWindow({
        maxWidth: 350
    });
    
    // Try to get user's location
    getUserLocation();
    
    // Add click listener
    map.addListener("click", async (event) => {
        handleMapClick(event.latLng);
    });
    
    // Load saved locations
    loadSavedLocations();
    
    // Set up UI event listeners
    setupEventListeners();
}

// Try to get the user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
                
                // Add marker for user's location
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "#FFFFFF",
                        strokeWeight: 2,
                    },
                    title: "Your Location",
                });
            },
            () => {
                console.log("Error: The Geolocation service failed.");
            }
        );
    }
}

// Apply a map style
function applyMapStyle(styleValue) {
    if (styleValue === "default") {
        map.setMapTypeId("roadmap");
        map.setOptions({ styles: [] });
    } else if (styleValue === "satellite") {
        map.setMapTypeId("satellite");
    } else if (styleValue === "terrain") {
        map.setMapTypeId("terrain");
    } else if (mapStyles[styleValue]) {
        map.setMapTypeId("roadmap");
        map.setOptions({ styles: mapStyles[styleValue] });
    }
}

// Toggle map layers
function toggleLayer(layer, isVisible) {
    isVisible ? layer.setMap(map) : layer.setMap(null);
}