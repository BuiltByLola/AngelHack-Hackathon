// High contrast mode toggle.
// Adds/removes the "high-contrast" class on <body> and keeps the user's
// preference in localStorage so it survives page reloads.

(function () {
  var STORAGE_KEY = "highContrast";
  var CLASS_NAME  = "high-contrast";

  var button = document.querySelector(".hc-toggle");
  if (!button) return;

  // Restore saved preference before first paint
  var saved = false;
  try { saved = localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) {}
  if (saved) apply(true);

  button.addEventListener("click", function () {
    var isOn = document.body.classList.contains(CLASS_NAME);
    apply(!isOn);
  });

  // Also allow keyboard users who focused the button to toggle with Enter/Space
  // (<button> fires click on both natively, so no extra keydown needed here.)

  function apply(on) {
    if (on) {
      document.body.classList.add(CLASS_NAME);
      button.setAttribute("aria-pressed", "true");
      button.textContent = "Standard mode";
      button.title = "Switch to standard colour mode";
    } else {
      document.body.classList.remove(CLASS_NAME);
      button.setAttribute("aria-pressed", "false");
      button.textContent = "High contrast";
      button.title = "Switch to high contrast mode";
    }
    try { localStorage.setItem(STORAGE_KEY, on ? "1" : "0"); } catch (e) {}
  }
})();
