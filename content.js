// ICheck Content Script
// Executes on all pages to check and alert about suspicious sites

(function() {
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
        <h1>SITE BLOCKED</h1>
        <p class="icheck-warning-message">
          You marked this site as <strong>UNTRUSTED</strong>
        </p>
        <p class="icheck-warning-domain">
          <strong>${hostname}</strong>
        </p>
        <p class="icheck-warning-info">
          This site is on your personal block list.
        </p>
        <div class="icheck-warning-buttons">
          <button id="icheck-go-back" class="icheck-btn icheck-btn-primary">
            ← Go Back Safely
          </button>
          <button id="icheck-proceed-anyway" class="icheck-btn icheck-btn-danger">
            Proceed Anyway (Not Recommended)
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

  // Check site when page loads
  async function initCheck() {
    const result = await checkCurrentSite();
    if (!result) return;

    currentStatus = result.status;

    // Show alert ONLY for sites marked as untrusted
    if (result.status === 'untrusted') {
      createUntrustedWarning(result.hostname);
    }
    // Unclassified sites (unknown) don't show alert
  }

  // Listener for status changes
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'siteStatusChanged') {
      removeWarning();
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
