
document.addEventListener("DOMContentLoaded", () => {
  // Log for debugging
  console.log("Find-Us page loaded ✔");

  // Add smooth hover animation to each map button
  const mapButtons = document.querySelectorAll(".map-btn");

  mapButtons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-5px)";
      btn.style.boxShadow = "0 10px 20px rgba(0,0,0,0.30)";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0)";
      btn.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
    });
  });

  // (Dropdown behaviour is handled globally in home.js / nav, so nothing else needed here.)
});