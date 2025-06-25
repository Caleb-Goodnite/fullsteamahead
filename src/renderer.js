// Import the generateResponse function from ai.js
import { generateResponse } from './ai.js';

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const explicitToggle = document.getElementById('explicit-toggle');

// Check for API key on load
let apiKey = '';

// Add message to chat
function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message ml-auto bg-pink-900' : 'ai-message bg-gray-800'} rounded-lg p-4 max-w-3xl ${isUser ? 'mr-4' : 'ml-4'} mb-2`;
  messageDiv.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message text-red-400 p-4 text-center';
  errorDiv.textContent = message;
  chatContainer.appendChild(errorDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  // Remove error after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Handle send message
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Disable input while processing
  userInput.disabled = true;
  sendButton.disabled = true;
  
  // Add user message to chat
  addMessage(message, true);
  userInput.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.className = 'typing-indicator text-gray-400 italic p-4';
  typingIndicator.textContent = 'AI is thinking...';
  chatContainer.appendChild(typingIndicator);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    // Check if we have an API key
    if (!apiKey && window.electronAPI) {
      apiKey = await window.electronAPI.getApiKey();
      
      // Set up listener for API key updates
      if (window.electronAPI.onApiKeyUpdated) {
        window.electronAPI.onApiKeyUpdated((newKey) => {
          apiKey = newKey;
        });
      }
    }
    
    if (!apiKey) {
      throw new Error('API key not found. Please check your .env file.');
    }
    
    // Call the AI function
    const response = await generateResponse(message, explicitToggle.checked);
    
    // Remove typing indicator and show AI response
    typingIndicator.remove();
    addMessage(response);
  } catch (error) {
    console.error('Error:', error);
    typingIndicator.remove();
    showError(`Error: ${error.message}`);
  } finally {
    // Re-enable input
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

// Initialize the app
async function init() {
  try {
    // Get API key if available
    if (window.electronAPI) {
      apiKey = await window.electronAPI.getApiKey();
      
      // Set up listener for API key updates
      if (window.electronAPI.onApiKeyUpdated) {
        window.electronAPI.onApiKeyUpdated((newKey) => {
          apiKey = newKey;
        });
      }
    }
    
    // Set up event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // Focus the input field
    userInput.focus();
    
    // Add welcome message if chat is empty
    if (chatContainer.children.length === 0) {
      addMessage("Welcome to Steamy Storyteller AI! What kind of story would you like to hear today? You can toggle explicit content with the checkbox below.");
    }
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize the application. Please check the console for details.');
  }
}

// Initialize the app when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
