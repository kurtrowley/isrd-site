// Light/dark toggle. The choice is a convenience only: if storage is unavailable the page follows the system.
(function () {
  var root = document.documentElement, key = "isrd-theme";
  try { var saved = localStorage.getItem(key); if (saved === "light" || saved === "dark") root.dataset.theme = saved; } catch (e) { /* ignore */ }
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("themeBtn");
    if (!btn) return;
    var isDark = function () { return root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
    var label = function () { btn.textContent = isDark() ? "☀" : "☾"; btn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode"); };
    label();
    btn.addEventListener("click", function () {
      root.dataset.theme = isDark() ? "light" : "dark";
      try { localStorage.setItem(key, root.dataset.theme); } catch (e) { /* ignore */ }
      label();
    });
  });
})();
