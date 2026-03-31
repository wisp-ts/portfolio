// ========================
// NAV TOGGLE (FIXED)
// ========================
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navLinks.classList.toggle("open");
  });
}

// ========================
// PORTFOLIO PROJECT LOADER
// ========================
const projectGrid = document.getElementById("projectGrid");

if (projectGrid) {
  fetch("projects.json")
    .then(res => res.json())
    .then(projects => {
      projects.forEach((project, i) => {
        const article = document.createElement("article");
        article.className = "card project-card reveal" + (i % 2 === 1 ? " delay-1" : "");

        const stackHTML = project.stack.map(s => `<span>${s}</span>`).join("");
        const linksHTML = project.links.map(link => {
          const style = link.style === "secondary" ? "secondary" : "primary";
          const previewAttr = link.preview ? ` data-preview="${link.preview}"` : "";
          return `<a href="${link.url}" class="button ${style} small"${previewAttr}>${link.label}</a>`;
        }).join("");

        article.innerHTML = `
          <div class="project-top">
            <span class="project-tag">${project.tag}</span>
            <h2>${project.title}</h2>
          </div>
          <p>${project.description}</p>
          <div class="project-stack">${stackHTML}</div>
          <div class="project-links">${linksHTML}</div>
        `;

        projectGrid.appendChild(article);
        revealObserver.observe(article);
      });
    });
}

// ========================
// REVEAL SYSTEM (OPTIMIZED)
// ========================
const revealElements = document.querySelectorAll(".reveal");

// Use higher threshold for better performance on slower devices
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        // Unobserve to save memory
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    // Root margin helps trigger animation before element enters viewport
    rootMargin: "50px"
  }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ========================
// BACK TO TOP (FIXED)
// ========================
const backToTop = document.getElementById("backToTop");

if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ========================
// SETTINGS PANEL (FIXED)
// ========================
const settingsFab = document.getElementById("settingsFab");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

if (settingsFab && settingsPanel) {
  settingsFab.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
    document.body.classList.toggle("settings-open");
  });
}

if (closeSettings) {
  closeSettings.addEventListener("click", () => {
    settingsPanel.classList.remove("open");
    document.body.classList.remove("settings-open");
  });
}

// ========================
// SETTINGS SYSTEM (OPTIMIZED)
// ========================
const settingsConfig = {
  theme: { selector: "#themeSelect", classPrefix: "theme-" },
  density: { selector: "#densitySelect", classPrefix: "style-", activeValue: "solid" },
  font: { selector: "#fontScaleSelect", classPrefix: "font-", activeValue: "large" },
  animation: { selector: "#animationLevel", classPrefix: "motion-", values: { "0": "reduce-motion", "2": "motion-dynamic" } },
  radius: { selector: "#radiusLevel", classPrefix: "radius-", values: { "0": "radius-tight", "2": "radius-soft" } }
};

const settingElements = {};
Object.entries(settingsConfig).forEach(([key, config]) => {
  settingElements[key] = document.querySelector(config.selector);
});

function applySettings() {
  const settings = {
    theme: settingElements.theme?.value || "dark",
    density: settingElements.density?.value || "glass",
    font: settingElements.font?.value || "normal",
    animation: settingElements.animation?.value || "1",
    radius: settingElements.radius?.value || "1",
  };

  // Reset classes (optimized single pass)
  document.body.className = "";

  // Apply theme
  document.body.classList.add(`theme-${settings.theme}`);

  // Apply other settings based on non-default values
  if (settings.density === "solid") document.body.classList.add("style-solid");
  if (settings.font === "large") document.body.classList.add("font-large");
  if (settings.animation === "0") document.body.classList.add("reduce-motion");
  if (settings.animation === "2") document.body.classList.add("motion-dynamic");
  if (settings.radius === "0") document.body.classList.add("radius-tight");
  if (settings.radius === "2") document.body.classList.add("radius-soft");

  // Save to localStorage (single operation)
  localStorage.setItem("site-settings", JSON.stringify(settings));
}

// LOAD SETTINGS
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("site-settings"));
  if (!saved) return;

  Object.entries(saved).forEach(([key, value]) => {
    if (settingElements[key]) settingElements[key].value = value;
  });

  applySettings();
}

// Initialize
loadSettings();

// Event listeners
const applyBtn = document.getElementById("applySettings");
const resetBtn = document.getElementById("resetSettings");

if (applyBtn) applyBtn.addEventListener("click", applySettings);

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem("site-settings");
    location.reload();
  });
}

// Apply settings when dropdown/slider values change
Object.values(settingElements).forEach(element => {
  if (element) {
    element.addEventListener("change", applySettings);
    element.addEventListener("input", applySettings);
  }
});

// ========================
// CUSTOM DROPDOWN SYSTEM
// ========================
class CustomDropdown {
  constructor(selectElement) {
    this.select = selectElement;
    this.wrapper = this.select.parentElement;
    this.isOpen = false;
    this.init();
  }

  init() {
    // Create custom dropdown wrapper
    const customDropdown = document.createElement('div');
    customDropdown.className = 'custom-dropdown';
    
    const button = document.createElement('button');
    button.className = 'custom-dropdown-btn';
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    
    const text = document.createElement('span');
    text.className = 'dropdown-text';
    text.textContent = this.select.options[this.select.selectedIndex].textContent;
    
    const arrow = document.createElement('span');
    arrow.className = 'dropdown-arrow';
    arrow.innerHTML = '▼';
    
    button.appendChild(text);
    button.appendChild(arrow);
    
    const listbox = document.createElement('div');
    listbox.className = 'custom-dropdown-list';
    listbox.setAttribute('role', 'listbox');
    
    // Create options
    Array.from(this.select.options).forEach((option, index) => {
      const item = document.createElement('div');
      item.className = 'custom-dropdown-item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', option.value);
      if (option.selected) item.classList.add('selected');
      item.textContent = option.textContent;
      
      item.addEventListener('click', () => {
        this.select.value = option.value;
        this.setText(option.textContent);
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
        this.close();
      });
      
      listbox.appendChild(item);
    });
    
    customDropdown.appendChild(button);
    customDropdown.appendChild(listbox);
    
    this.select.style.display = 'none';
    this.wrapper.appendChild(customDropdown);
    
    this.button = button;
    this.listbox = listbox;
    this.textSpan = text;
    
    this.bindEvents();
  }

  bindEvents() {
    this.button.addEventListener('click', () => this.toggle());
    
    document.addEventListener('click', (e) => {
      if (!this.button.contains(e.target) && !this.listbox.contains(e.target)) {
        this.close();
      }
    });

    this.button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.button.setAttribute('aria-expanded', 'true');
    this.listbox.classList.add('open');
  }

  close() {
    this.isOpen = false;
    this.button.setAttribute('aria-expanded', 'false');
    this.listbox.classList.remove('open');
  }

  setText(text) {
    this.textSpan.textContent = text;
    this.listbox.querySelectorAll('.custom-dropdown-item').forEach(item => {
      item.classList.toggle('selected', item.getAttribute('data-value') === this.select.value);
    });
  }
}

// Initialize custom dropdowns
document.querySelectorAll('.settings-group select').forEach(select => {
  new CustomDropdown(select);
});

// ========================
// CUSTOM SLIDER SYSTEM
// ========================
class CustomSlider {
  constructor(inputElement) {
    this.input = inputElement;
    this.wrapper = this.input.parentElement;
    this.init();
  }

  init() {
    const container = document.createElement('div');
    container.className = 'custom-slider-container';
    
    const track = document.createElement('div');
    track.className = 'custom-slider-track';
    
    const fill = document.createElement('div');
    fill.className = 'custom-slider-fill';
    
    const thumb = document.createElement('div');
    thumb.className = 'custom-slider-thumb';
    thumb.setAttribute('role', 'slider');
    thumb.setAttribute('aria-valuemin', this.input.min || '0');
    thumb.setAttribute('aria-valuemax', this.input.max || '100');
    this.updateThumbPosition();
    
    const value = document.createElement('div');
    value.className = 'custom-slider-value';
    value.textContent = this.input.value;
    
    track.appendChild(fill);
    track.appendChild(thumb);
    container.appendChild(track);
    container.appendChild(value);
    
    this.input.style.display = 'none';
    this.wrapper.appendChild(container);
    
    this.track = track;
    this.fill = fill;
    this.thumb = thumb;
    this.valueDisplay = value;
    
    this.bindEvents();
  }

  bindEvents() {
    let isDragging = false;
    
    const updateValue = (e) => {
      const rect = this.track.getBoundingClientRect();
      let x = e.clientX - rect.left;
      if (e.touches) x = e.touches[0].clientX - rect.left;
      
      x = Math.max(0, Math.min(x, rect.width));
      const percentage = (x / rect.width) * 100;
      const min = this.input.min || 0;
      const max = this.input.max || 100;
      const value = Math.round((percentage / 100) * (max - min) + parseInt(min));
      
      this.input.value = value;
      this.valueDisplay.textContent = value;
      this.updateThumbPosition();
      this.input.dispatchEvent(new Event('input', { bubbles: true }));
      this.input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    
    const startDrag = () => {
      isDragging = true;
      this.thumb.classList.add('dragging');
    };
    
    const endDrag = () => {
      isDragging = false;
      this.thumb.classList.remove('dragging');
    };
    
    const handleMove = (e) => {
      if (isDragging) updateValue(e);
    };
    
    this.thumb.addEventListener('mousedown', startDrag);
    this.track.addEventListener('mousedown', updateValue);
    this.track.addEventListener('mousedown', startDrag);
    
    this.thumb.addEventListener('touchstart', startDrag);
    this.track.addEventListener('touchstart', updateValue);
    this.track.addEventListener('touchstart', startDrag);
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    this.input.addEventListener('input', () => this.updateThumbPosition());
  }

  updateThumbPosition() {
    const min = this.input.min || 0;
    const max = this.input.max || 100;
    const value = this.input.value;
    const percentage = ((value - min) / (max - min)) * 100;
    
    this.thumb.style.left = percentage + '%';
    this.fill.style.width = percentage + '%';
    this.thumb.setAttribute('aria-valuenow', value);
  }
}

// Initialize custom sliders
document.querySelectorAll('.settings-group input[type="range"]').forEach(range => {
  new CustomSlider(range);
});

// ========================
// MOBILE NAV FIX
// ========================
function handleResize() {
  if (window.innerWidth > 760) {
    navLinks?.classList.remove("open");
    navToggle?.classList.remove("active");
  }
}

window.addEventListener("resize", handleResize);

// ========================
// OPTIONAL: SMOOTH CARD TILT (OPTIMIZED - Event Delegation)
// ========================
const cardContainer = document.querySelector("main") || document.body;
let currentTiltCard = null;

cardContainer.addEventListener("mousemove", (e) => {
  const card = e.target.closest(".card, .dashboard-card, .stat-card, .cta-card");

  if (currentTiltCard && currentTiltCard !== card) {
    currentTiltCard.style.setProperty("--rotateX", "0deg");
    currentTiltCard.style.setProperty("--rotateY", "0deg");
  }
  currentTiltCard = card;

  if (!card) return;

  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const rotateX = ((y / rect.height) - 0.5) * 10;
  const rotateY = ((x / rect.width) - 0.5) * -10;
  const gx = (x / rect.width) * 100;
  const gy = (y / rect.height) * 100;

  card.style.setProperty("--rotateX", `${rotateX}deg`);
  card.style.setProperty("--rotateY", `${rotateY}deg`);
  card.style.setProperty("--mouse-x", `${gx}%`);
  card.style.setProperty("--mouse-y", `${gy}%`);
});

cardContainer.addEventListener("mouseleave", () => {
  if (currentTiltCard) {
    currentTiltCard.style.setProperty("--rotateX", "0deg");
    currentTiltCard.style.setProperty("--rotateY", "0deg");
    currentTiltCard = null;
  }
});

// ========================
// PREMIUM: SCROLL-TRIGGERED HEADER STATE (OPTIMIZED)
// ========================
const siteHeader = document.querySelector(".site-header");
let ticking = false;

function updateHeaderState() {
  const scrollY = window.scrollY;
  
  if (scrollY > 20 && !siteHeader?.classList.contains("scrolled")) {
    siteHeader?.classList.add("scrolled");
  } else if (scrollY <= 20 && siteHeader?.classList.contains("scrolled")) {
    siteHeader?.classList.remove("scrolled");
  }
  
  ticking = false;
}

// Use passive listener for better scroll performance
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateHeaderState);
    ticking = true;
  }
}, { passive: true });

// ========================
// PREMIUM: PAGE TRANSITIONS WITH FADE
// ========================
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  
  if (!link) return;
  
  // Skip preview links — handled by preview overlay
  if (link.dataset.preview) return;
  
  const href = link.getAttribute("href");
  const isExternalOrAnchor = !href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:");
  
  if (isExternalOrAnchor) return;
  
  e.preventDefault();
  
  // Fade out
  document.body.classList.add("page-transitioning");
  
  setTimeout(() => {
    window.location.href = href;
  }, 350);
});

// Fade in on page load
window.addEventListener("load", () => {
  document.body.classList.remove("page-transitioning");
}, { once: true });

// ========================
// PREMIUM: DEV MODE GRID (G KEY)
// ========================
document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) return;
  if (e.key === "g" || e.key === "G") {
    document.body.classList.toggle("dev-mode");
  }
});

// ========================
// PREMIUM: REDUCED MOTION DETECTION
// ========================
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function handleReducedMotionChange() {
  if (prefersReducedMotion.matches) {
    document.body.classList.add("reduce-motion");
  } else {
    document.body.classList.remove("reduce-motion");
  }
}

handleReducedMotionChange();
prefersReducedMotion.addEventListener("change", handleReducedMotionChange);

// ========================
// SITE PREVIEW OVERLAY
// ========================
const previewOverlay = document.getElementById("previewOverlay");
const previewFrame = document.getElementById("previewFrame");
const previewClose = document.getElementById("previewClose");
const previewTitle = document.getElementById("previewTitle");

if (previewOverlay && previewFrame) {
  // Open preview when clicking [data-preview] links
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-preview]");
    if (!link) return;

    e.preventDefault();
    const url = link.dataset.preview;
    previewFrame.src = url;
    previewTitle.textContent = link.closest(".project-card")?.querySelector("h2")?.textContent || "Live Preview";
    previewOverlay.classList.add("open");
    previewOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });

  // Close preview
  function closePreview() {
    previewOverlay.classList.remove("open");
    previewOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // Clear iframe after transition
    setTimeout(() => { previewFrame.src = "about:blank"; }, 300);
  }

  previewClose.addEventListener("click", closePreview);
  previewOverlay.addEventListener("click", (e) => {
    if (e.target === previewOverlay) closePreview();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && previewOverlay.classList.contains("open")) closePreview();
  });
}
