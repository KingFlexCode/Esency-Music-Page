// scripts/nav-toggle.js

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-bar, .nav-bar-music");

  if (!burger || !nav) return;

  // Toggle nav open/close
  burger.addEventListener("click", () => {
    burger.classList.toggle("active");
    nav.classList.toggle("open");
  });

  // Auto-close menu when clicking a link
  document.querySelectorAll(".nav-bar a").forEach(link => {
    link.addEventListener("click", () => {
      burger.classList.remove("active");
      nav.classList.remove("open");
    });
  });
});
