/**
 * GeoExplorer AI - Main Application
 * 
 * This file serves as the entry point for the application and
 * coordinates the interactions between different modules.
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('GeoExplorer AI is initializing...');
    
    // Initialize chat interface after DOM is loaded
    if (typeof initChatInterface === 'function') {
        initChatInterface();
    }
});

// Handle application errors
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    
    // Show error in a user-friendly way if it affects the main functionality
    if (e.error && e.error.message && e.error.message.includes('Google')) {
        alert('Error loading map services. Please check your API key and internet connection.');
    }
});

// Example of extending the application with additional features
// This function could be called from a button in the UI
function exportSavedLocations() {
    if (savedLocations.length === 0) {
        alert('No locations to export.');
        return;
    }
    
    // Format data for export
    const exportData = JSON.stringify(savedLocations, null, 2);
    
    // Create a download link
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'geoexplorer-locations.json';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// This function could be used to import locations
function importSavedLocations(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (Array.isArray(importedData) && importedData.every(loc => 
                typeof loc === 'object' && 
                'lat' in loc && 
                'lng' in loc && 
                'title' in loc)) {
                
                // Merge with existing locations
                savedLocations = [...savedLocations, ...importedData];
                updateSavedLocationsUI();
                localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
                
                alert(`Imported ${importedData.length} locations.`);
            } else {
                alert('Invalid import file format.');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing locations.');
        }
    };
    reader.readAsText(file);
}

// Application version information
const APP_VERSION = {
    number: '1.0.0',
    buildDate: '2025-03-22',
    environment: 'production'
};