// content.js
// Hides or shows the YouTube home video feed based on FocusTube state

let observer = null;
let isEnabled = true; // Default ON

const styleElement = document.createElement('style');

/**
 * Hides the YouTube home feed by removing the main video grid.
 */
function hideHomeFeed() {
  const feed = document.querySelector('ytd-rich-grid-renderer');
  if (feed) {
    feed.style.display = 'none';
  }
}

/**
 * Shows the YouTube home feed by restoring the main video grid.
 */
function showHomeFeed() {
  const feed = document.querySelector('ytd-rich-grid-renderer');
  if (feed) {
    feed.style.display = '';
  }
}

/**
 * Checks if the current page is the YouTube home page.
 * @returns {boolean}
 */
function isHomePage() {
  return location.pathname === '/' || location.pathname === '/feed/explore';
}

/**
 * Applies the FocusTube state: hides or shows the feed as needed.
 */
function applyFocusTubeState() {
  if (isEnabled && isHomePage()) {
    hideHomeFeed();
  } else {
    showHomeFeed();
  }
}

/**
 * Sets up a MutationObserver to keep hiding the feed on SPA navigation.
 */
function setupObserver() {
  if (observer) observer.disconnect();
  observer = new MutationObserver(() => {
    applyFocusTubeState();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Initializes the content script: gets state and sets up listeners.
 */
function init() {
  chrome.storage.sync.get(['focusTubeEnabled'], (result) => {
    isEnabled = result.focusTubeEnabled !== false; // Default ON
    applyFocusTubeState();
    setupObserver();
  });
}

// Listen for state updates from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FOCUSTUBE_STATE_UPDATE') {
    isEnabled = message.enabled;
    applyFocusTubeState();
  }
});

// Listen for SPA navigation (YouTube uses pushState)
window.addEventListener('yt-navigate-finish', () => {
  applyFocusTubeState();
});

// Initialize on load
init();

// Define the CSS to hide Shorts
const css = `
  ytd-rich-section-renderer.ytd-rich-grid-renderer, 
  ytd-reel-shelf-renderer, 
  ytd-guide-entry-renderer:has-text(Shorts) {
    display: none !important;
  }
`;

styleElement.id = 'shorts-hider-style';
styleElement.textContent = css;

function updateShortsVisibility() {
  chrome.storage.sync.get(['hideShorts'], (result) => {
    if (result.hideShorts) {
      if (!document.head.contains(styleElement)) {
        document.head.appendChild(styleElement);
      }
    } else {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    }
  });
}

// Run on load
updateShortsVisibility();

// Listen for storage changes in real-time
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.hideShorts) {
    updateShortsVisibility();
  }
});