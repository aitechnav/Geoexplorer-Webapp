/**
 * Chat interface for GeoExplorer AI
 * This file handles the chat functionality that integrates with the map
 */

// Chat state
let isChatOpen = false;
let chatMessages = [];
let currentChatQuery = '';

/**
 * Initialize chat interface
 */
function initChatInterface() {
    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.className = 'chat-container';
    document.body.appendChild(chatContainer);
    
    // Add chat toggle button
    const chatToggleBtn = document.createElement('button');
    chatToggleBtn.id = 'chat-toggle';
    chatToggleBtn.className = 'chat-toggle-btn';
    chatToggleBtn.innerHTML = '<i class="fas fa-comments"></i>';
    chatToggleBtn.title = 'Ask about locations';
    chatToggleBtn.onclick = toggleChat;
    document.body.appendChild(chatToggleBtn);
    
    // Create chat UI
    chatContainer.innerHTML = `
        <div class="chat-header">
            <h3>Location Assistant</h3>
            <button id="close-chat"><i class="fas fa-times"></i></button>
        </div>
        <div class="chat-messages" id="chat-messages">
            <div class="system-message">
                Ask me about any location on the map!
            </div>
        </div>
        <form id="chat-form" class="chat-input">
            <input type="text" id="chat-input" placeholder="Ask about this location...">
            <button type="submit"><i class="fas fa-paper-plane"></i></button>
        </form>
    `;
    
    // Set up event listeners
    document.getElementById('close-chat').addEventListener('click', toggleChat);
    document.getElementById('chat-form').addEventListener('submit', handleChatSubmit);
    
    // Load Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    // Add chat styles
    addChatStyles();
}

/**
 * Toggle chat visibility
 */
function toggleChat() {
    isChatOpen = !isChatOpen;
    const chatContainer = document.getElementById('chat-container');
    
    if (isChatOpen) {
        chatContainer.classList.add('open');
    } else {
        chatContainer.classList.remove('open');
    }
}

/**
 * Handle chat form submission
 * @param {Event} e - Form submit event
 */
async function handleChatSubmit(e) {
    e.preventDefault();
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    input.value = '';
    
    // Show loading indicator
    addLoadingIndicator();
    
    // Get current map position
    const center = map.getCenter();
    const lat = center.lat();
    const lng = center.lng();
    
    try {
        // Generate response using Gemini API
        const response = await generateChatResponse(message, lat, lng);
        
        // Remove loading indicator and add response
        removeLoadingIndicator();
        addMessageToChat('assistant', response);
        
    } catch (error) {
        console.error('Chat error:', error);
        removeLoadingIndicator();
        addMessageToChat('system', 'Sorry, I couldn\'t process your request. Please try again.');
    }
}

/**
 * Add a message to the chat interface
 * @param {string} role - Message sender (user, assistant, system)
 * @param {string} content - Message content
 */
function addMessageToChat(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `${role}-message`;
    messageEl.innerHTML = `<div class="message-bubble">${content}</div>`;
    messagesContainer.appendChild(messageEl);
    
    // Save message to state
    chatMessages.push({ role, content });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Add loading indicator to chat
 */
function addLoadingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const loadingEl = document.createElement('div');
    loadingEl.id = 'chat-loading';
    loadingEl.className = 'assistant-message';
    loadingEl.innerHTML = '<div class="message-bubble loading"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(loadingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Remove loading indicator from chat
 */
function removeLoadingIndicator() {
    const loadingEl = document.getElementById('chat-loading');
    if (loadingEl) {
        loadingEl.remove();
    }
}

/**
 * Generate chat response using Gemini API
 * @param {string} message - User's message
 * @param {number} lat - Latitude of current map center
 * @param {number} lng - Longitude of current map center
 * @returns {Promise<string>} - AI response
 */
async function generateChatResponse(message, lat, lng) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.geminiApiKey}`;
    
    // Get address if possible
    let address = '';
    try {
        address = await reverseGeocode(new google.maps.LatLng(lat, lng));
    } catch (error) {
        console.log('Could not get address for context');
    }
    
    const prompt = `
        You are a helpful location assistant for GeoExplorer AI.
        
        The user is currently looking at a map centered at:
        - Latitude: ${lat}
        - Longitude: ${lng}
        ${address ? `- Address: ${address}` : ''}
        
        The user's question is: ${message}
        
        Provide a helpful, informative response about this location relevant to their question.
        Include geographical, historical, or cultural information that would be useful.
        Keep your response concise but informative (2-3 paragraphs maximum).
    `;
    
    const requestBody = {
        "contents": [{
            "parts": [{ "text": prompt }]
        }]
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error('Unexpected API response format');
    }
}

/**
 * Add chat styles to the document
 */
function addChatStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .chat-toggle-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #4285F4;
            color: white;
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            z-index: 1000;
            font-size: 20px;
        }
        
        .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            height: 400px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            visibility: hidden;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        }
        
        .chat-container.open {
            visibility: visible;
            opacity: 1;
            transform: translateY(0);
        }
        
        .chat-header {
            background-color: #4285F4;
            color: white;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chat-header h3 {
            margin: 0;
            font-size: 16px;
        }
        
        .chat-header button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background-color: #f5f5f5;
        }
        
        .user-message, .assistant-message, .system-message {
            margin-bottom: 10px;
            display: flex;
        }
        
        .user-message {
            justify-content: flex-end;
        }
        
        .message-bubble {
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 16px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .user-message .message-bubble {
            background-color: #4285F4;
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .assistant-message .message-bubble {
            background-color: white;
            color: #333;
            border-bottom-left-radius: 4px;
        }
        
        .system-message .message-bubble {
            background-color: #f0f0f0;
            color: #666;
            font-style: italic;
            text-align: center;
            margin: 0 auto;
        }
        
        .loading span {
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #999;
            border-radius: 50%;
            margin: 0 2px;
            animation: bounce 1.4s infinite ease-in-out;
        }
        
        .loading span:nth-child(1) { animation-delay: 0s; }
        .loading span:nth-child(2) { animation-delay: 0.2s; }
        .loading span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        
        .chat-input {
            display: flex;
            border-top: 1px solid #e0e0e0;
            padding: 10px;
        }
        
        .chat-input input {
            flex: 1;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            padding: 8px 15px;
            outline: none;
        }
        
        .chat-input button {
            background-color: #4285F4;
            color: white;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            margin-left: 8px;
            cursor: pointer;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .chat-container {
                width: calc(100% - 40px);
                bottom: 70px;
            }
        }
    `;
    document.head.appendChild(style);
}