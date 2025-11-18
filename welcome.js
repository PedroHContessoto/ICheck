/**
 * ============================================================================
 * ICheck Welcome Script
 * ============================================================================
 * Welcome screen for first-time initialization
 *
 * @version 1.0.0
 * @license MIT
 */

'use strict';

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const btnUseSafeList = document.getElementById('btnUseSafeList');
const btnStartEmpty = document.getElementById('btnStartEmpty');
const loadingOverlay = document.getElementById('loadingOverlay');
const languageSelect = document.getElementById('languageSelect');

// ============================================================================
// I18N INITIALIZATION
// ============================================================================

/**
 * Initializes translation system
 */
async function initI18n() {
  // Initialize translation system (load JSONs)
  await initializeI18n();

  // Load saved language
  const lang = await getSelectedLanguage();
  languageSelect.value = lang;

  // Translate page
  translatePage();
}

// Change language when user selects
languageSelect.addEventListener('change', async (e) => {
  await setSelectedLanguage(e.target.value);
  location.reload(); // Reload to apply new language
});

// ============================================================================
// FUNCTIONS
// ============================================================================

// Load safe sites list from JSON file
async function loadSafeSites() {
  try {
    const response = await fetch(chrome.runtime.getURL('safe-sites.json'));
    const data = await response.json();
    return data.sites || [];
  } catch (error) {
    console.error('Error loading safe-sites.json:', error);
    return [];
  }
}

// Option 1: Use safe sites list
btnUseSafeList.addEventListener('click', async () => {
  loadingOverlay.classList.add('active');

  try {
    // Load safe sites list
    const safeSites = await loadSafeSites();

    if (safeSites.length === 0) {
      alert('Error loading safe sites list. Please try again.');
      loadingOverlay.classList.remove('active');
      return;
    }

    // Save to storage
    await chrome.storage.local.set({
      trustedSites: safeSites,
      untrustedSites: [],
      firstTimeSetup: true
    });

    // Wait a bit for visual feedback
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Close welcome tab
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id);
    });

  } catch (error) {
    console.error('Error setting up safe sites:', error);
    alert('Error saving settings. Please try again.');
    loadingOverlay.classList.remove('active');
  }
});

// Option 2: Start from scratch
btnStartEmpty.addEventListener('click', async () => {
  loadingOverlay.classList.add('active');

  try {
    // Save empty lists
    await chrome.storage.local.set({
      trustedSites: [],
      untrustedSites: [],
      firstTimeSetup: true
    });

    // Wait a bit for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    // Close welcome tab
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id);
    });

  } catch (error) {
    console.error('Error setting up empty mode:', error);
    alert('Error saving settings. Please try again.');
    loadingOverlay.classList.remove('active');
  }
});

// ============================================================================
// INITIALIZE
// ============================================================================

// Initialize translations when page loads
initI18n();
