document.addEventListener("DOMContentLoaded", () => {
  const switchBtn = document.getElementById("lang-switch");
  let currentLang = localStorage.getItem("lang") || "en";

  // If translations object does not exist, stop script safely
  if (typeof translations === "undefined") {
    console.warn("⚠️ translations.js not loaded");
    return;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;

      if (translations[currentLang] && translations[currentLang][key]) {
        el.innerHTML = translations[currentLang][key];
      }
      // If missing translation, keep original text → no break
    });
  }

  // If button not found (admin pages etc.), do not attach event
  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      currentLang = currentLang === "en" ? "fi" : "en";
      localStorage.setItem("lang", currentLang);
      applyTranslations();
    });
  }

  applyTranslations();
});
