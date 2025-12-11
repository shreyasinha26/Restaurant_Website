// ---------- find-us.js ----------

document.addEventListener("DOMContentLoaded", () => {

  console.log("Find-Us page loaded ✔");

  // Button hover animation
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

  // Dropdown behaviour (Safari fix)
  const dropBtn = document.querySelector(".dropbtn");
  const dropContent = document.querySelector(".dropdown-content");

  if (dropBtn && dropContent) {
    dropBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dropContent.classList.toggle("show");
    });

    // Close dropdown if clicked outside
    window.addEventListener("click", (e) => {
      if (!dropBtn.contains(e.target)) {
        dropContent.classList.remove("show");
      }
    });
  }

});

