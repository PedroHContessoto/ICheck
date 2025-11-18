/**
 * ============================================================================
 * ICheck Background Service Worker
 * ============================================================================
 * Manages site verification logic and communication between components
 *
 * @version 1.0.0
 * @license MIT
 */

'use strict';

// ============================================================================
// CONSTANTS
// ============================================================================

const BADGE_CONFIG = {
  trusted: {
    text: '✓',
    color: '#4ADE80'
  },
  untrusted: {
    text: '✕',
    color: '#EF4444'
  },
  unknown: {
    text: '!',
    color: '#FCD34D'
  }
};

const LOCAL_PAGE_REGEX = /^(chrome|edge|about|file|chrome-extension):/;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Extension installation listener
 * Detects first installation and opens welcome page
 */
chrome.runtime.onInstalled.addListener((details) => {
  handleInstallation(details);
});

/**
 * Manages initial installation or extension update
 * @param {Object} details - Installation details
 */
function handleInstallation(details) {
  chrome.storage.local.get(['firstTimeSetup', 'trustedSites', 'untrustedSites'], (result) => {
    if (details.reason === 'install' && !result.firstTimeSetup) {
      openWelcomePage();
    } else {
      ensureStorageInitialized(result);
    }
  });
}

/**
 * Opens welcome page in new tab
 */
function openWelcomePage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('welcome.html')
  });
}

/**
 * Ensures site lists are initialized
 * @param {Object} storage - Storage data
 */
function ensureStorageInitialized(storage) {
  const updates = {};

  if (!storage.trustedSites) {
    updates.trustedSites = [];
  }
  if (!storage.untrustedSites) {
    updates.untrustedSites = [];
  }

  if (Object.keys(updates).length > 0) {
    chrome.storage.local.set(updates);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extracts hostname from URL
 * @param {string} url - Complete URL
 * @returns {string|null} Hostname or null if invalid
 */
function getHostname(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('ICheck: Invalid URL:', url);
    return null;
  }
}

/**
 * Checks if URL is from a local/internal page
 * @param {string} url - URL to check
 * @returns {boolean} True if it's a local page
 */
function isLocalPage(url) {
  return LOCAL_PAGE_REGEX.test(url);
}

// ============================================================================
// STATUS VERIFICATION
// ============================================================================

/**
 * Checks site status (trusted, untrusted, unknown)
 * @param {string} url - Site URL to check
 * @returns {Promise<Object>} Site status and hostname
 */
async function checkSiteStatus(url) {
  const hostname = getHostname(url);

  if (!hostname) {
    return { status: 'unknown', hostname: null };
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['trustedSites', 'untrustedSites'], (result) => {
      const trustedSites = result.trustedSites || [];
      const untrustedSites = result.untrustedSites || [];

      let status;
      if (untrustedSites.includes(hostname)) {
        status = 'untrusted';
      } else if (trustedSites.includes(hostname)) {
        status = 'trusted';
      } else {
        status = 'unknown';
      }

      resolve({ status, hostname });
    });
  });
}

// ============================================================================
// LIST MANAGEMENT
// ============================================================================

/**
 * Adds a site to the trusted list
 * @param {string} url - Site URL
 * @param {Function} sendResponse - Response callback
 * @param {Object} sender - Sender information
 */
function addTrustedSite(url, sendResponse, sender) {
  const hostname = getHostname(url);

  if (!hostname) {
    sendResponse({ success: false, message: 'Invalid URL' });
    return;
  }

  chrome.storage.local.get(['trustedSites', 'untrustedSites'], (result) => {
    const trustedSites = result.trustedSites || [];
    const untrustedSites = result.untrustedSites || [];

    if (trustedSites.includes(hostname)) {
      sendResponse({ success: false, message: 'Site already in list' });
      return;
    }

    // Add to trusted list
    trustedSites.push(hostname);

    // Remove from untrusted list if exists
    const filteredUntrusted = untrustedSites.filter(site => site !== hostname);

    chrome.storage.local.set({
      trustedSites,
      untrustedSites: filteredUntrusted
    }, () => {
      sendResponse({ success: true, hostname });

      if (sender.tab) {
        updateBadge(url, sender.tab.id);
        notifyTabStatusChange(sender.tab.id, 'trusted');
      }
    });
  });
}

/**
 * Adds a site to the untrusted list
 * @param {string} url - Site URL
 * @param {Function} sendResponse - Response callback
 * @param {Object} sender - Sender information
 */
function addUntrustedSite(url, sendResponse, sender) {
  const hostname = getHostname(url);

  if (!hostname) {
    sendResponse({ success: false, message: 'Invalid URL' });
    return;
  }

  chrome.storage.local.get(['trustedSites', 'untrustedSites'], (result) => {
    const trustedSites = result.trustedSites || [];
    const untrustedSites = result.untrustedSites || [];

    if (untrustedSites.includes(hostname)) {
      sendResponse({ success: false, message: 'Site already in list' });
      return;
    }

    // Add to untrusted list
    untrustedSites.push(hostname);

    // Remove from trusted list if exists
    const filteredTrusted = trustedSites.filter(site => site !== hostname);

    chrome.storage.local.set({
      trustedSites: filteredTrusted,
      untrustedSites
    }, () => {
      sendResponse({ success: true, hostname });

      if (sender.tab) {
        updateBadge(url, sender.tab.id);
        notifyTabStatusChange(sender.tab.id, 'untrusted');
      }
    });
  });
}

/**
 * Removes a site from both lists
 * @param {string} hostname - Site hostname
 * @param {Function} sendResponse - Response callback
 */
function removeSite(hostname, sendResponse) {
  chrome.storage.local.get(['trustedSites', 'untrustedSites'], (result) => {
    const trustedSites = (result.trustedSites || []).filter(site => site !== hostname);
    const untrustedSites = (result.untrustedSites || []).filter(site => site !== hostname);

    chrome.storage.local.set({ trustedSites, untrustedSites }, () => {
      sendResponse({ success: true });
    });
  });
}

/**
 * Notifies tab about status change
 * @param {number} tabId - Tab ID
 * @param {string} status - New status
 */
function notifyTabStatusChange(tabId, status) {
  chrome.tabs.sendMessage(tabId, {
    action: 'siteStatusChanged',
    status
  }).catch(() => {
    // Ignore error if content script is not loaded
  });
}

// ============================================================================
// BADGE MANAGEMENT
// ============================================================================

/**
 * Updates extension badge based on site status
 * @param {string} url - Current URL
 * @param {number} tabId - Tab ID
 */
async function updateBadge(url, tabId) {
  // Clear badge for local/internal pages
  if (isLocalPage(url)) {
    clearBadge(tabId);
    return;
  }

  const result = await checkSiteStatus(url);
  const config = BADGE_CONFIG[result.status] || BADGE_CONFIG.unknown;

  setBadge(tabId, config.text, config.color);
}

/**
 * Sets badge text and color
 * @param {number} tabId - Tab ID
 * @param {string} text - Badge text
 * @param {string} color - Badge color (hex)
 */
function setBadge(tabId, text, color) {
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
}

/**
 * Clears badge (removes text)
 * @param {number} tabId - Tab ID
 */
function clearBadge(tabId) {
  chrome.action.setBadgeText({ tabId, text: '' });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Listener for messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handlers = {
    checkSite: () => {
      checkSiteStatus(request.url).then(sendResponse);
      return true;
    },
    addTrusted: () => {
      addTrustedSite(request.url, sendResponse, sender);
      return true;
    },
    addUntrusted: () => {
      addUntrustedSite(request.url, sendResponse, sender);
      return true;
    },
    removeSite: () => {
      removeSite(request.hostname, sendResponse);
      return true;
    }
  };

  const handler = handlers[request.action];
  if (handler) {
    return handler();
  }

  return false;
});

/**
 * Listener for active tab change
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      updateBadge(tab.url, activeInfo.tabId);
    }
  } catch (error) {
    console.error('ICheck: Error updating badge:', error);
  }
});

/**
 * Listener for tab update
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    updateBadge(changeInfo.url, tabId);
  }
});
