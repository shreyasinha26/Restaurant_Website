document.addEventListener("DOMContentLoaded", () => {
  const switchBtn = document.getElementById("lang-switch");
  let currentLang = localStorage.getItem("lang") || "en";

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      el.innerHTML = translations[currentLang][key] || key;
    });
  }

  switchBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "fi" : "en";
    localStorage.setItem("lang", currentLang);
    applyTranslations();
  });

  applyTranslations();
});

// This script enables language switching functionality on the website.
