// ICheck Options Script
// Manages settings panel and lists

let trustedSites = [];
let untrustedSites = [];

// DOM Elements
const trustedCount = document.getElementById('trustedCount');
const untrustedCount = document.getElementById('untrustedCount');
const trustedList = document.getElementById('trustedList');
const untrustedList = document.getElementById('untrustedList');
const trustedEmpty = document.getElementById('trustedEmpty');
const untrustedEmpty = document.getElementById('untrustedEmpty');
const searchTrusted = document.getElementById('searchTrusted');
const searchUntrusted = document.getElementById('searchUntrusted');
const btnExportTrusted = document.getElementById('btnExportTrusted');
const btnExportUntrusted = document.getElementById('btnExportUntrusted');
const btnExportAll = document.getElementById('btnExportAll');
const btnImport = document.getElementById('btnImport');
const btnClearAll = document.getElementById('btnClearAll');
const fileInput = document.getElementById('fileInput');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const btnModalCancel = document.getElementById('btnModalCancel');
const btnModalConfirm = document.getElementById('btnModalConfirm');
const languageSelect = document.getElementById('languageSelect');

let pendingAction = null;
let trustedSearchTerm = '';
let untrustedSearchTerm = '';

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

// Load data from storage
function loadData() {
  chrome.storage.local.get(['trustedSites', 'untrustedSites'], (result) => {
    trustedSites = result.trustedSites || [];
    untrustedSites = result.untrustedSites || [];

    updateUI();
  });
}

// Update interface
function updateUI() {
  // Update counters
  trustedCount.textContent = trustedSites.length;
  untrustedCount.textContent = untrustedSites.length;

  // Filter and update trusted sites list
  const filteredTrusted = trustedSites.filter(site =>
    site.toLowerCase().includes(trustedSearchTerm.toLowerCase())
  );

  if (filteredTrusted.length === 0) {
    trustedList.style.display = 'none';
    trustedEmpty.style.display = 'block';
    if (trustedSearchTerm && trustedSites.length > 0) {
      trustedEmpty.innerHTML = `
        ${getMessage('optionsNoResults')} "<strong>${trustedSearchTerm}</strong>".
        <br>
        <small>${getMessage('optionsTryAgain')}</small>
      `;
    } else {
      trustedEmpty.innerHTML = `
        ${getMessage('optionsEmptyTrusted')}
        <br>
        <small>${getMessage('optionsEmptyTrustedHint')}</small>
      `;
    }
  } else {
    trustedList.style.display = 'flex';
    trustedEmpty.style.display = 'none';
    trustedList.innerHTML = filteredTrusted
      .sort()
      .map(site => createSiteItem(site, 'trusted'))
      .join('');
  }

  // Filter and update untrusted sites list
  const filteredUntrusted = untrustedSites.filter(site =>
    site.toLowerCase().includes(untrustedSearchTerm.toLowerCase())
  );

  if (filteredUntrusted.length === 0) {
    untrustedList.style.display = 'none';
    untrustedEmpty.style.display = 'block';
    if (untrustedSearchTerm && untrustedSites.length > 0) {
      untrustedEmpty.innerHTML = `
        ${getMessage('optionsNoResults')} "<strong>${untrustedSearchTerm}</strong>".
        <br>
        <small>${getMessage('optionsTryAgain')}</small>
      `;
    } else {
      untrustedEmpty.innerHTML = `
        ${getMessage('optionsEmptyUntrusted')}
        <br>
        <small>${getMessage('optionsEmptyUntrustedHint')}</small>
      `;
    }
  } else {
    untrustedList.style.display = 'flex';
    untrustedEmpty.style.display = 'none';
    untrustedList.innerHTML = filteredUntrusted
      .sort()
      .map(site => createSiteItem(site, 'untrusted'))
      .join('');
  }

  // Add event listeners to remove buttons
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hostname = e.target.dataset.hostname;
      removeSite(hostname);
    });
  });
}

// Create site item
function createSiteItem(hostname, type) {
  return `
    <div class="site-item">
      <span class="site-name">${hostname}</span>
      <button class="btn-remove" data-hostname="${hostname}">
        ${getMessage('optionsRemove')}
      </button>
    </div>
  `;
}

// Remove site
function removeSite(hostname) {
  chrome.runtime.sendMessage(
    { action: 'removeSite', hostname },
    (response) => {
      if (response && response.success) {
        loadData();
      }
    }
  );
}

// Export list
function exportList(sites, filename) {
  const data = JSON.stringify({ sites, exportDate: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Import list
function importList(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (!data.sites || !Array.isArray(data.sites)) {
        alert(getMessage('optionsInvalidFile'));
        return;
      }

      // Ask which list type to import
      showModal(
        getMessage('optionsImportTitle'),
        getMessage('optionsImportMessage', [data.sites.length]),
        () => {
          // Import as trusted
          const merged = [...new Set([...trustedSites, ...data.sites])];
          chrome.storage.local.set({ trustedSites: merged }, () => {
            loadData();
            alert(getMessage('optionsImportedTrusted', [data.sites.length]));
          });
        },
        getMessage('optionsTrustedLabel'),
        () => {
          // Import as untrusted
          const merged = [...new Set([...untrustedSites, ...data.sites])];
          chrome.storage.local.set({ untrustedSites: merged }, () => {
            loadData();
            alert(getMessage('optionsImportedUntrusted', [data.sites.length]));
          });
        },
        getMessage('optionsUntrustedLabel')
      );

    } catch (error) {
      alert(getMessage('optionsReadError'));
    }
  };
  reader.readAsText(file);
}

// Clear all lists
function clearAll() {
  showModal(
    getMessage('optionsClearAllTitle'),
    getMessage('optionsClearAllMessage'),
    () => {
      chrome.storage.local.set({ trustedSites: [], untrustedSites: [] }, () => {
        loadData();
        alert(getMessage('optionsClearedAll'));
      });
    }
  );
}

// Show modal
function showModal(title, message, confirmAction, confirmText = null, cancelAction = null, cancelText = null) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  btnModalConfirm.textContent = confirmText || getMessage('optionsConfirm');
  btnModalCancel.textContent = cancelText || getMessage('optionsCancel');

  pendingAction = confirmAction;
  modal.classList.add('active');
}

// Hide modal
function hideModal() {
  modal.classList.remove('active');
  pendingAction = null;
}

// Event Listeners
btnExportTrusted.addEventListener('click', () => {
  exportList(trustedSites, 'icheck-trusted-sites.json');
});

btnExportUntrusted.addEventListener('click', () => {
  exportList(untrustedSites, 'icheck-untrusted-sites.json');
});

btnExportAll.addEventListener('click', () => {
  const data = {
    trustedSites,
    untrustedSites,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'icheck-all-sites.json';
  a.click();
  URL.revokeObjectURL(url);
});

btnImport.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    importList(file);
  }
  fileInput.value = ''; // Clear input
});

btnClearAll.addEventListener('click', clearAll);

btnModalConfirm.addEventListener('click', () => {
  if (pendingAction) {
    pendingAction();
  }
  hideModal();
});

btnModalCancel.addEventListener('click', hideModal);

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    hideModal();
  }
});

// Event Listeners for search
searchTrusted.addEventListener('input', (e) => {
  trustedSearchTerm = e.target.value;
  updateUI();
});

searchUntrusted.addEventListener('input', (e) => {
  untrustedSearchTerm = e.target.value;
  updateUI();
});

// Initialize i18n and data
(async () => {
  await initI18n();
  loadData();
})();
