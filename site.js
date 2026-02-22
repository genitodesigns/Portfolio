/* =========================
   Site Interactions
   ========================= */

(() => {
  console.log("site.js loaded");

  // Detect Bootstrap version pages (only bootstrap pages have this attribute)
  const isBootstrapVersion = document.body.dataset.bootstrap === "true";

  /* =========================
     Load saved Theme + Font
     ========================= */
  const savedTheme = localStorage.getItem("theme");
  const savedFont = localStorage.getItem("font");

  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  if (savedFont) document.documentElement.dataset.font = savedFont;

  /* =========================
     Dropdown menus (OLD custom system)
     Run ONLY on non-bootstrap pages
     ========================= */
  let closeAllMenus = () => {}; // safe no-op default for bootstrap pages

  if (!isBootstrapVersion) {
    const menuParents = document.querySelectorAll(".has-menu");

    closeAllMenus = (except = null) => {
      menuParents.forEach((li) => {
        if (li === except) return;

        const btn = li.querySelector(".menu-toggle");
        const menu = li.querySelector(".menu");
        if (!btn || !menu) return;

        btn.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      });
    };

    menuParents.forEach((li) => {
      const btn = li.querySelector(".menu-toggle");
      const menu = li.querySelector(".menu");
      if (!btn || !menu) return;

      btn.setAttribute("aria-expanded", "false");
      menu.hidden = true;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const isOpen = btn.getAttribute("aria-expanded") === "true";
        closeAllMenus(li);

        btn.setAttribute("aria-expanded", String(!isOpen));
        menu.hidden = isOpen;
      });
    });

    document.addEventListener("click", () => closeAllMenus());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllMenus();
    });
  }

  /* =========================
     Theme + Font actions
     Works on BOTH versions
     ========================= */
  document.addEventListener("click", (e) => {
    const themeBtn = e.target.closest("[data-theme]");
    const fontBtn = e.target.closest("[data-font]");

    if (themeBtn) {
      const theme = themeBtn.dataset.theme;
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("theme", theme);
      closeAllMenus(); // harmless on bootstrap pages
    }

    if (fontBtn) {
      const font = fontBtn.dataset.font;
      document.documentElement.dataset.font = font;
      localStorage.setItem("font", font);
      closeAllMenus(); // harmless on bootstrap pages
    }
  });
})();