// popup.js
// Handles the popup UI for FocusTube, including the toggle switch and status display

// DOM elements
const toggle = document.getElementById('toggle');
const statusText = document.getElementById('statusText');

// Updates the status text based on enabled state
function updateStatusText(enabled) {
  statusText.textContent = enabled ? 'FocusTube is ON' : 'FocusTube is OFF';
}

// Loads the current FocusTube state from Chrome storage and updates UI
function loadState() {
  chrome.storage.sync.get(['focusTubeEnabled'], (result) => {
    const enabled = result.focusTubeEnabled !== false; // Default ON
    toggle.checked = enabled;
    updateStatusText(enabled);
  });
}

// Handles toggle switch changes by user
function handleToggleChange() {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ focusTubeEnabled: enabled }, () => {
    updateStatusText(enabled);
    // Notify background.js of the state change
    chrome.runtime.sendMessage({ type: 'FOCUSTUBE_TOGGLE', enabled });
  });
}

// Listen for toggle changes
toggle.addEventListener('change', handleToggleChange);

// Initialize popup UI on load
document.addEventListener('DOMContentLoaded', loadState);

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('hideShorts');

  // Load current state
  chrome.storage.sync.get(['hideShorts'], (result) => {
    toggle.checked = result.hideShorts || false;
  });

  // Save state on change
  toggle.addEventListener('change', () => {
    chrome.storage.sync.set({ hideShorts: toggle.checked });
  });
});