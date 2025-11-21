# ICheck - Your Wall Against Phishing 🛡️

**Version:** 1.0.0
**Tagline:** Your personal wall against phishing. Simple, local, and 100% open source.

---

## 📋 About ICheck

**ICheck** is a browser extension that puts you back in control of your online security. Instead of blindly trusting third-party security lists, you teach ICheck which sites are legitimate.

### 🎯 The Problem

Phishing attacks are more sophisticated than ever. Fake sites are practically identical to the originals, fooling even the most experienced users. Traditional solutions:

- Are too complex for the average user
- Rely on lists that can be slow or incomplete
- May collect your browsing data
- Don't educate users about security

### ✨ The Solution

ICheck is different. It's an **active awareness tool** that:

- ✅ **100% Local** - Your data never leaves your computer
- ✅ **100% Open Source** - Auditable open code
- ✅ **Simple to Use** - If you know how to use "Bookmarks", you know how to use ICheck
- ✅ **Educational** - Creates the healthy habit of checking URLs

---

## 🚀 How It Works

### 1. Green Signal (Trusted Site)
Are you on your bank's official website? Click the ICheck icon and mark it as **"Trusted"**. ICheck stores this address in your local safe list.

### 2. Alert (Suspicious Site)
Days later, you receive a fake email and click on a similar link. ICheck sees that this address **is not on your trust list** and displays a full-screen alert, asking you to make a conscious decision.

### 3. Red Signal (Fake Site)
You can also actively mark sites as **"Untrusted"** to block them instantly whenever you try to access them.

---

## 📦 Installation

### For Chromium-based Browsers (Chrome, Edge, Brave, Opera)

1. **Download the extension**
   - Download the ZIP file or clone this repository

2. **Extract the files**
   - Extract all files to a folder on your computer

3. **Open browser extensions**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
   - Opera: `opera://extensions/`

4. **Enable Developer Mode**
   - Look for the "Developer mode" toggle in the top right corner and enable it

5. **Load the extension**
   - Click "Load unpacked" or "Load unpacked extension"
   - Select the folder where you extracted the ICheck files
   - The extension will be installed and appear in the toolbar

---

## 📖 How to Use

### Classify a Site

1. **Visit the site** you want to classify
2. **Click the ICheck icon** in the toolbar
3. **Choose an option:**
   - **Mark as Trusted** - Site will be added to the green list
   - **Mark as Untrusted** - Site will be automatically blocked

### Visual Badges on Icon

The ICheck icon in the toolbar displays an overlaid **badge** that changes automatically:
- **✓ Green** - Trusted site (on your green list)
- **! Yellow** - Unclassified site (not yet marked)
- **✕ Red** - Blocked site (on your red list)
- **No badge** - Local/internal browser pages (chrome://, file://, etc)

### Automatic Alerts

When you try to access a site **marked as untrusted**, ICheck will block access with a full-screen red alert.

**Unclassified sites browse normally** - you can classify them by clicking the ICheck icon whenever you want.

### Manage Lists

1. **Click the ICheck icon**
2. **Click "⚙️ Manage Lists"**
3. In the panel you can:
   - **Search for specific sites** in the lists with the search field 🔍
   - View all classified sites (with automatic scrolling)
   - Remove sites from lists individually
   - Export your lists (JSON backup)
   - Import lists from another device
   - Clear all lists

---

## 🔒 Privacy and Security

### Your Data is Yours

- ✅ **100% Local Storage** - All lists are saved only in your browser
- ✅ **No Internet Connection** - ICheck doesn't send any data to external servers
- ✅ **No Tracking** - We don't collect information about your browsing
- ✅ **Open Source Code** - You can audit all source code

### Required Permissions

ICheck requests the following permissions:

- **storage** - To save your lists locally
- **tabs** - To check the current tab's URL
- **activeTab** - To interact with the active page
- **host_permissions** - To check all sites you visit

**All permissions are used exclusively for the extension's functionality and no data is transmitted externally.**

---

## 🎨 Features

- ✅ Intuitive and modern interface
- ✅ **Dynamic badge system** (✓, !, ✕) instead of multiple icons
- ✅ **Search field** to quickly find sites in lists
- ✅ **Automatic scrolling** for large lists (max height 300px)
- ✅ **Real-time badge update** when classifying sites
- ✅ Full-screen visual alerts for blocked sites
- ✅ Complete management panel
- ✅ List export/import (JSON format)
- ✅ Classified site statistics
- ✅ **Hidden badge on internal browser pages**
- ✅ **Bilingual support** (Portuguese/English)
- ✅ **190+ pre-curated safe sites** (optional first-time setup)

---

## 🛠️ Technologies Used

- **Manifest V3** - Latest version of Chrome's extension system
- **Vanilla JavaScript** - No external dependencies
- **CSS3** - Modern and responsive design
- **Chrome Storage API** - Secure local storage
- **Custom i18n System** - Dynamic language switching

---

## ⚡ Performance & Capacity

ICheck is designed to be lightweight and fast. Based on statistical analysis of storage usage and load times:

| Sites Stored | Storage Size | Load Time | Status |
| :--- | :--- | :--- | :--- |
| **1,000** | ~22 KB | 0.2 ms | ✅ Ultra Fast |
| **10,000** | ~220 KB | 1.2 ms | ✅ Very Fast |
| **100,000** | ~2.16 MB | 7.2 ms | ✅ Fast |
| **200,000** | ~4.32 MB | 15.2 ms | ⚠️ ~50% Capacity |
| **460,000** | ~10.00 MB | ~35 ms | ⛔ **Limit Reached** |

- **Capacity**: You can store approximately **450,000 sites** locally.
- **Speed**: Search operations take less than 1 millisecond even with large lists.
- **Privacy**: All this data remains 100% local on your machine.

---

## 📄 File Structure

```
icheck-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker (verification logic and badges)
├── content.js             # Script injected into pages (alerts)
├── popup.html             # Popup interface
├── popup.css              # Popup styles
├── popup.js               # Popup logic (real-time updates)
├── options.html           # Management panel
├── options.css            # Panel styles
├── options.js             # Panel logic (search and filters)
├── welcome.html           # First-time welcome screen
├── welcome.css            # Welcome screen styles
├── welcome.js             # Welcome screen logic
├── i18n.js                # Custom internationalization system
├── safe-sites.json        # Curated list of 190+ safe sites
├── _locales/              # Translation files
│   ├── pt_BR/
│   │   └── messages.json  # Portuguese (Brazil) translations
│   └── en/
│       └── messages.json  # English translations
├── icons/                 # Extension icons
│   ├── icone.png          # Original icon (eye with lock)
│   ├── icon16.png         # 16x16 (used by extension)
│   ├── icon48.png         # 48x48 (used by extension)
│   ├── icon128.png        # 128x128 (used by extension)
│   ├── accept.png         # Visual reference (green)
│   ├── mark.png           # Visual reference (yellow)
│   └── delete.png         # Visual reference (red)
├── .gitignore             # Files ignored by Git
└── README.md              # This file
```

---

## 🤝 Contributing

This is a **100% open source** project! Contributions are welcome:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/MyFeature`)
3. Commit your changes (`git commit -m 'Add MyFeature'`)
4. Push to the branch (`git push origin feature/MyFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## ⚠️ Important Notice

ICheck is an **educational and assistive tool**. It helps create awareness about online security, but doesn't replace other security measures such as:

- Updated antivirus
- Strong and unique passwords
- Two-factor authentication
- Common sense when clicking links

**Always use common sense and carefully verify site addresses before entering sensitive information.**
---

## 🌟 Why Trust ICheck?

### For Daily Users
If you know how to use "Bookmarks", you know how to use ICheck. It's 1-click security.

### For Your Privacy
Your list of trusted sites is **yours**. It's saved only in your browser.

### For Your Trust
100% open code. Anyone can read, audit, and verify.

### For Your Awareness
ICheck isn't just a blocker; it's a **teacher**. By making you actively confirm sites, it creates the healthy habit of always checking the address before entering your data.

---

**Developed with ❤️ to make the internet safer for everyone.**
**ICheck - You in control of your security.**
**Developer - Pedro Henrique Cavalhieri Contessoto.**
