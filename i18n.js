/**
 * ============================================================================
 * ICheck Internationalization (i18n) Helper
 * ============================================================================
 * Sistema customizado de tradução com suporte a mudança dinâmica de idioma
 *
 * @version 2.0.0
 * @license MIT
 */

'use strict';

// ============================================================================
// CONSTANTES
// ============================================================================

const SUPPORTED_LANGUAGES = {
  'pt_BR': 'Português (Brasil)',
  'en': 'English'
};

const STORAGE_KEY = 'selectedLanguage';

// Cache de traduções carregadas
let translationsCache = {
  'pt_BR': null,
  'en': null
};

let currentLanguage = 'pt_BR';

// ============================================================================
// CARREGAMENTO DE TRADUÇÕES
// ============================================================================

/**
 * Carrega as traduções de um idioma específico
 * @param {string} lang - Código do idioma (pt_BR ou en)
 * @returns {Promise<Object>} Objeto com as traduções
 */
async function loadTranslations(lang) {
  if (translationsCache[lang]) {
    return translationsCache[lang];
  }

  try {
    const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
    const response = await fetch(url);
    const data = await response.json();

    translationsCache[lang] = data;
    return data;
  } catch (error) {
    console.error(`Erro ao carregar traduções para ${lang}:`, error);
    return {};
  }
}

/**
 * Inicializa o sistema de traduções
 * Carrega ambos os idiomas e define o idioma atual
 */
async function initializeI18n() {
  // Carregar ambos os idiomas em paralelo
  await Promise.all([
    loadTranslations('pt_BR'),
    loadTranslations('en')
  ]);

  // Definir idioma atual
  currentLanguage = await getSelectedLanguage();
}

// ============================================================================
// GERENCIAMENTO DE IDIOMA
// ============================================================================

/**
 * Obtém o idioma selecionado do storage
 * @returns {Promise<string>} Código do idioma
 */
async function getSelectedLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const lang = result[STORAGE_KEY];

      // Se não há idioma salvo, usar idioma do navegador ou pt_BR
      if (!lang) {
        let browserLang = chrome.i18n.getUILanguage().replace('-', '_');

        // Tenta correspondência exata
        if (SUPPORTED_LANGUAGES[browserLang]) {
          resolve(browserLang);
          return;
        }

        // Tenta correspondência parcial (ex: en_US -> en)
        const shortLang = browserLang.split('_')[0];
        if (SUPPORTED_LANGUAGES[shortLang]) {
          resolve(shortLang);
          return;
        }

        // Padrão para pt_BR
        resolve('pt_BR');
      } else {
        resolve(lang);
      }
    });
  });
}

/**
 * Salva o idioma selecionado no storage
 * @param {string} language - Código do idioma
 */
async function setSelectedLanguage(language) {
  return new Promise((resolve) => {
    currentLanguage = language;
    chrome.storage.local.set({ [STORAGE_KEY]: language }, resolve);
  });
}

// ============================================================================
// TRADUÇÃO
// ============================================================================

/**
 * Obtém a tradução de uma mensagem
 * @param {string} messageName - Nome da mensagem
 * @param {Array|string} substitutions - Substituições (opcional)
 * @returns {string} Texto traduzido
 */
function getMessage(messageName, substitutions) {
  const translations = translationsCache[currentLanguage];

  if (!translations || !translations[messageName]) {
    // Fallback para português se não encontrar
    const fallback = translationsCache['pt_BR'];
    if (fallback && fallback[messageName]) {
      return processMessage(fallback[messageName].message, substitutions);
    }
    return messageName;
  }

  return processMessage(translations[messageName].message, substitutions);
}

/**
 * Processa uma mensagem com substituições
 * @param {string} message - Mensagem original
 * @param {Array|string} substitutions - Substituições
 * @returns {string} Mensagem processada
 */
function processMessage(message, substitutions) {
  if (!substitutions) {
    return message;
  }

  // Se substitutions é array
  if (Array.isArray(substitutions)) {
    let result = message;
    substitutions.forEach((sub, index) => {
      result = result.replace(`$${index + 1}`, sub);
    });
    return result;
  }

  // Se substitutions é string
  return message.replace('$1', substitutions);
}

/**
 * Traduz todos os elementos com atributo data-i18n
 */
function translatePage() {
  // Traduzir elementos com data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getMessage(key);

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else if (element.tagName === 'TITLE') {
      document.title = translation;
    } else {
      element.textContent = translation;
    }
  });

  // Traduzir placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = getMessage(key);
  });

  // Traduzir títulos
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    element.title = getMessage(key);
  });
}

// ============================================================================
// EXPORTAR FUNÇÕES
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPPORTED_LANGUAGES,
    initializeI18n,
    getSelectedLanguage,
    setSelectedLanguage,
    getMessage,
    translatePage
  };
}
