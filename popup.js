/**
 * ============================================================================
 * ICheck Popup Script
 * ============================================================================
 * Manages popup interface and user actions
 *
 * @version 1.0.0
 * @license MIT
 */

'use strict';

// ============================================================================
// CONSTANTS
// ============================================================================

const BADGE_COLORS = {
  trusted: '#4ADE80',
  untrusted: '#EF4444'
};

const STATUS_ICONS = {
  trusted: '✓',
  untrusted: '!',
  unknown: '?'
};

const STATUS_MESSAGES = {
  trusted: 'popupSiteTrusted',
  untrusted: 'popupSiteUntrusted',
  unknown: 'popupSiteUnknown'
};

const UPDATE_DELAY = 300; // ms

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

let currentUrl = '';
let currentHostname = '';
let currentStatus = '';

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
  statusSection: document.getElementById('statusSection'),
  statusIcon: document.getElementById('statusIcon'),
  statusMessage: document.getElementById('statusMessage'),
  siteUrl: document.getElementById('siteUrl'),
  actions: document.getElementById('actions'),
  btnAccept: document.getElementById('btnAccept'),
  btnDeny: document.getElementById('btnDeny'),
  btnSettings: document.getElementById('btnSettings')
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes popup and checks current site status
 */
async function init() {
  try {
    const tab = await getCurrentTab();

    if (!tab || !tab.url) {
      showError(getMessage('popupErrorNoInfo'));
      return;
    }

    currentUrl = tab.url;

    if (isInternalPage(currentUrl)) {
      showError(getMessage('popupErrorInternal'));
      return;
    }

    await checkCurrentSite();
  } catch (error) {
    console.error('ICheck: Error initializing popup:', error);
    showError(getMessage('popupErrorLoad'));
  }
}

/**
 * Gets current browser tab
 * @returns {Promise<Object>} Current tab
 */
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Checks if it's an internal browser page
 * @param {string} url - URL to check
 * @returns {boolean} True if it's an internal page
 */
function isInternalPage(url) {
  return /^(chrome|edge|about|chrome-extension):/.test(url);
}

// ============================================================================
// STATUS VERIFICATION
// ============================================================================

/**
 * Checks current site status
 */
async function checkCurrentSite() {
  chrome.runtime.sendMessage(
    { action: 'checkSite', url: currentUrl },
    (response) => {
      if (chrome.runtime.lastError) {
        showError(getMessage('popupErrorCheck'));
        return;
      }

      if (response) {
        currentHostname = response.hostname;
        currentStatus = response.status;
        updateUI(response);
      }
    }
  );
}

// ============================================================================
// UI UPDATE
// ============================================================================

/**
 * Updates interface based on site status
 * @param {Object} response - Site status data
 */
function updateUI(response) {
  elements.siteUrl.textContent = response.hostname;

  const statusHandlers = {
    trusted: () => showTrustedStatus(),
    untrusted: () => showUntrustedStatus(),
    unknown: () => showUnknownStatus()
  };

  const handler = statusHandlers[response.status] || statusHandlers.unknown;
  handler();
}

/**
 * Displays trusted site status
 */
function showTrustedStatus() {
  elements.statusSection.className = 'status-section status-trusted';
  elements.statusIcon.textContent = STATUS_ICONS.trusted;
  elements.statusMessage.textContent = getMessage(STATUS_MESSAGES.trusted);
  hideActions();
}

/**
 * Displays blocked site status
 */
function showUntrustedStatus() {
  elements.statusSection.className = 'status-section status-untrusted';
  elements.statusIcon.textContent = STATUS_ICONS.untrusted;
  elements.statusMessage.textContent = getMessage(STATUS_MESSAGES.untrusted);
  hideActions();
}

/**
 * Displays unclassified site status
 */
function showUnknownStatus() {
  elements.statusSection.className = 'status-section status-unknown';
  elements.statusIcon.textContent = STATUS_ICONS.unknown;
  elements.statusMessage.textContent = getMessage(STATUS_MESSAGES.unknown);
  showActions();
}

/**
 * Shows action buttons
 */
function showActions() {
  elements.actions.style.display = 'grid';
  elements.btnAccept.disabled = false;
  elements.btnDeny.disabled = false;
}

/**
 * Hides action buttons
 */
function hideActions() {
  elements.actions.style.display = 'none';
}

/**
 * Displays error message
 * @param {string} message - Error message
 */
function showError(message) {
  elements.statusSection.className = 'status-section';
  elements.statusIcon.textContent = '❌';
  elements.statusMessage.textContent = message;
  elements.siteUrl.style.display = 'none';
  elements.actions.style.display = 'none';
}

/**
 * Displays temporary success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = 'message message-success';
  messageDiv.textContent = message;

  const container = document.querySelector('.popup-container');
  container.insertBefore(messageDiv, container.firstChild);

  setTimeout(() => messageDiv.remove(), 1500);
}

// ============================================================================
// USER ACTIONS
// ============================================================================

/**
 * Marks site as trusted
 */
async function markAsTrusted() {
  disableButtons();

  chrome.runtime.sendMessage(
    { action: 'addTrusted', url: currentUrl },
    async (response) => {
      if (response && response.success) {
        showSuccess(getMessage('popupSuccessTrusted'));
        currentStatus = 'trusted';

        await updateBadgeImmediately('trusted');

        setTimeout(() => {
          updateUI({ hostname: currentHostname, status: 'trusted' });
        }, UPDATE_DELAY);
      } else {
        enableButtons();
      }
    }
  );
}

/**
 * Marks site as untrusted
 */
async function markAsUntrusted() {
  disableButtons();

  chrome.runtime.sendMessage(
    { action: 'addUntrusted', url: currentUrl },
    async (response) => {
      if (response && response.success) {
        showSuccess(getMessage('popupSuccessUntrusted'));
        currentStatus = 'untrusted';

        await updateBadgeImmediately('untrusted');

        setTimeout(() => {
          updateUI({ hostname: currentHostname, status: 'untrusted' });
        }, UPDATE_DELAY);
      } else {
        enableButtons();
      }
    }
  );
}

/**
 * Updates badge immediately
 * @param {string} status - New status
 */
async function updateBadgeImmediately(status) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const badgeText = status === 'trusted' ? '✓' : '✕';
  const badgeColor = BADGE_COLORS[status];

  chrome.action.setBadgeText({ tabId: tab.id, text: badgeText });
  chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: badgeColor });
}

/**
 * Opens settings page
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * Disables action buttons
 */
function disableButtons() {
  elements.btnAccept.disabled = true;
  elements.btnDeny.disabled = true;
}

/**
 * Enables action buttons
 */
function enableButtons() {
  elements.btnAccept.disabled = false;
  elements.btnDeny.disabled = false;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

elements.btnAccept.addEventListener('click', markAsTrusted);
elements.btnDeny.addEventListener('click', markAsUntrusted);
elements.btnSettings.addEventListener('click', openSettings);

// ============================================================================
// I18N INITIALIZATION
// ============================================================================

// ============================================================================
// INITIALIZE
// ============================================================================

// Initialize i18n and popup
(async () => {
  await initializeI18n();
  translatePage();
  await init();
})();
