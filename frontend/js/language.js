// This script enables language switching functionality on the website.
document.addEventListener("DOMContentLoaded", () => {
  const switchBtn = document.getElementById("lang-switch");
  let currentLang = localStorage.getItem("lang") || "en";

  function applyTranslations() {
    // Translate text content
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      el.innerHTML = translations[currentLang][key] || key;
    });

    // Translate placeholders (IMPORTANT FIX)
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (translations[currentLang][key]) {
        el.placeholder = translations[currentLang][key];
      }
    });
  }

  // Switch language
  switchBtn?.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "fi" : "en";
    localStorage.setItem("lang", currentLang);
    applyTranslations();
  });

  // Apply on page load
  applyTranslations();
});