// ICheck Content Script
// Executes on all pages to check and alert about suspicious sites

(function () {
  'use strict';

  let currentStatus = null;
  let warningOverlay = null;

  // Check current site status
  async function checkCurrentSite() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'checkSite', url: window.location.href },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('ICheck: Error checking site', chrome.runtime.lastError);
            resolve(null);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  // Create warning overlay for untrusted sites
  function createUntrustedWarning(hostname) {
    if (warningOverlay) return;

    warningOverlay = document.createElement('div');
    warningOverlay.id = 'icheck-untrusted-overlay';
    warningOverlay.innerHTML = `
      <div class="icheck-warning-content">
        <div class="icheck-warning-icon">⚠️</div>
        <h1>${getMessage('contentBlockedTitle')}</h1>
        <p class="icheck-warning-message">
          ${getMessage('contentBlockedMessage')}
        </p>
        <p class="icheck-warning-domain">
          <strong>${hostname}</strong>
        </p>
        <p class="icheck-warning-info">
          ${getMessage('contentBlockedInfo')}
        </p>
        <div class="icheck-warning-buttons">
          <button id="icheck-go-back" class="icheck-btn icheck-btn-primary">
            ${getMessage('contentBtnBack')}
          </button>
          <button id="icheck-proceed-anyway" class="icheck-btn icheck-btn-danger">
            ${getMessage('contentBtnProceed')}
          </button>
        </div>
      </div>
    `;

    // Inline styles to ensure they work
    const style = document.createElement('style');
    style.textContent = `
      #icheck-untrusted-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #dc2626;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .icheck-warning-content {
        background: white;
        padding: 3rem;
        border-radius: 1rem;
        max-width: 600px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      .icheck-warning-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      .icheck-warning-content h1 {
        color: #dc2626;
        font-size: 2rem;
        margin: 0 0 1rem 0;
        font-weight: 700;
      }
      .icheck-warning-message {
        font-size: 1.1rem;
        color: #374151;
        margin: 1rem 0;
      }
      .icheck-warning-domain {
        font-size: 1.3rem;
        color: #dc2626;
        margin: 1rem 0;
        padding: 1rem;
        background: #fee2e2;
        border-radius: 0.5rem;
      }
      .icheck-warning-info {
        color: #6b7280;
        margin: 1rem 0 2rem 0;
      }
      .icheck-warning-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .icheck-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .icheck-btn-primary {
        background: #059669;
        color: white;
      }
      .icheck-btn-primary:hover {
        background: #047857;
      }
      .icheck-btn-danger {
        background: #f3f4f6;
        color: #6b7280;
      }
      .icheck-btn-danger:hover {
        background: #e5e7eb;
      }
    `;

    document.documentElement.appendChild(style);
    document.documentElement.appendChild(warningOverlay);

    // Event listeners
    document.getElementById('icheck-go-back').addEventListener('click', () => {
      window.history.back();
    });

    document.getElementById('icheck-proceed-anyway').addEventListener('click', () => {
      removeWarning();
    });
  }

  // createUnknownWarning function removed - we no longer show alerts for unclassified sites

  function removeWarning() {
    if (warningOverlay) {
      warningOverlay.remove();
      warningOverlay = null;
    }
  }

  // Create popup for unclassified sites
  function createClassifyPopup(hostname) {
    if (document.getElementById('icheck-classify-popup')) return;

    const popup = document.createElement('div');
    popup.id = 'icheck-classify-popup';
    popup.innerHTML = `
      <div class="icheck-classify-content">
        <button id="icheck-classify-close" class="icheck-close-btn">×</button>
        <div class="icheck-classify-header">
          <div class="icheck-logo-small">🛡️</div>
          <h2>${getMessage('classifyTitle')}</h2>
        </div>
        <p>${getMessage('classifyQuestion')}</p>
        <div class="icheck-domain-badge">${hostname}</div>
        <div class="icheck-classify-actions">
          <button id="icheck-classify-trust" class="icheck-btn icheck-btn-primary">
            ${getMessage('btnTrusted')}
          </button>
          <button id="icheck-classify-block" class="icheck-btn icheck-btn-danger">
            ${getMessage('btnBlock')}
          </button>
        </div>
      </div>
    `;

    // Styles
    const style = document.createElement('style');
    style.textContent = `
      #icheck-classify-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 2147483646;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        backdrop-filter: blur(2px);
      }
      .icheck-classify-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        width: 90%;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        position: relative;
        animation: icheck-pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes icheck-pop-in {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .icheck-close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #9ca3af;
        padding: 0.25rem;
        line-height: 1;
      }
      .icheck-close-btn:hover { color: #374151; }
      .icheck-classify-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .icheck-classify-header h2 {
        font-size: 1.25rem;
        color: #111827;
        margin: 0;
      }
      .icheck-logo-small { font-size: 1.5rem; }
      .icheck-domain-badge {
        background: #f3f4f6;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-family: monospace;
        margin: 1rem 0;
        color: #374151;
        word-break: break-all;
      }
      .icheck-classify-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
    `;

    document.documentElement.appendChild(style);
    document.documentElement.appendChild(popup);

    // Event Listeners
    document.getElementById('icheck-classify-close').addEventListener('click', () => {
      popup.remove();
    });

    document.getElementById('icheck-classify-trust').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'addTrusted', url: window.location.href }, () => {
        popup.remove();
        // Optional: Show success feedback
      });
    });

    document.getElementById('icheck-classify-block').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'addUntrusted', url: window.location.href }, () => {
        popup.remove();
        // The page will be reloaded/blocked by the listener in initCheck/onMessage
      });
    });
  }

  // Check site when page loads
  async function initCheck() {
    // Initialize i18n first
    await initializeI18n();

    const result = await checkCurrentSite();
    if (!result) return;

    currentStatus = result.status;

    // Show alert ONLY for sites marked as untrusted
    if (result.status === 'untrusted') {
      createUntrustedWarning(result.hostname);
    }
    // Check if we should ask to classify
    else if (result.status === 'unknown') {
      chrome.storage.local.get(['askToClassify'], (settings) => {
        if (settings.askToClassify) {
          createClassifyPopup(result.hostname);
        }
      });
    }
  }

  // Listener for status changes
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'siteStatusChanged') {
      removeWarning();
      // Also remove classify popup if it exists
      const classifyPopup = document.getElementById('icheck-classify-popup');
      if (classifyPopup) classifyPopup.remove();

      if (request.status === 'untrusted') {
        checkCurrentSite().then(result => {
          if (result && result.status === 'untrusted') {
            createUntrustedWarning(result.hostname);
          }
        });
      }
    }
  });

  // Start verification
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheck);
  } else {
    initCheck();
  }
})();
