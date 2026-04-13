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

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open");
    });
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

        const learnMoreHTML = project.slug && project.docs
          ? `<a href="project.html?p=${encodeURIComponent(project.slug)}" class="button secondary small">Documentation</a>`
          : "";

        article.innerHTML = `
          <div class="project-top">
            <span class="project-tag">${project.tag}</span>
            <h2>${project.title}</h2>
          </div>
          <p>${project.description}</p>
          <div class="project-stack">${stackHTML}</div>
          <div class="project-links">${linksHTML}${learnMoreHTML}</div>
        `;

        projectGrid.appendChild(article);
        revealObserver.observe(article);
      });
    })
    .catch(() => {
      projectGrid.innerHTML = `<p style="color:var(--muted);text-align:center;grid-column:1/-1">Failed to load projects.</p>`;
    });
}

// ========================
// PROJECT DETAIL PAGE LOADER
// ========================
const projectHeroContent = document.getElementById("projectHeroContent");
const docsNav = document.getElementById("docsNav");
const docsMain = document.getElementById("docsMain");

if (projectHeroContent && docsNav && docsMain) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("p");

  if (slug) {
    fetch("projects.json")
      .then(res => res.json())
      .then(projects => {
        const project = projects.find(p => p.slug === slug);
        if (!project || !project.docs) {
          projectHeroContent.innerHTML = `<h1>Project Not Found</h1><p>This project doesn't exist or doesn't have documentation.</p>`;
          document.getElementById("docsLayout").style.display = "none";
          return;
        }

        // Update page title + meta
        document.title = `${project.title} Docs | Wisp`;

        // Reading progress bar
        const progressBar = document.createElement("div");
        progressBar.className = "doc-progress-bar";
        document.body.prepend(progressBar);
        window.addEventListener("scroll", () => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
          progressBar.style.transform = `scaleX(${pct})`;
        }, { passive: true });

        // Hero
        const stackHTML = project.stack.map(s => `<span>${s}</span>`).join("");
        const heroText = project.docs.hero || project.description;
        const heroLinksHTML = project.links.map(link => {
          const style = link.style === "secondary" ? "secondary" : "primary";
          return `<a href="${link.url}" class="button ${style} small" target="_blank" rel="noopener noreferrer">${link.label}</a>`;
        }).join("");

        projectHeroContent.innerHTML = `
          <span class="project-tag">${project.tag}</span>
          <h1>${project.title}</h1>
          <p class="project-hero-desc">${heroText}</p>
          <div class="project-stack">${stackHTML}</div>
          <div class="project-links hero-doc-links">${heroLinksHTML}</div>
        `;

        // README + Downloads
        const readmeLayout = document.getElementById("readmeLayout");
        const readmeEl = document.getElementById("readmeContent");
        const sidebarEl = document.getElementById("readmeSidebar");
        const hasReadme = !!project.docs.readme;
        const hasDownloads = project.docs.downloads?.length > 0;

        if ((hasReadme || hasDownloads) && readmeLayout) {
          readmeLayout.style.display = "";
          if (hasReadme && readmeEl) {
            readmeEl.innerHTML = `<div class="readme-body doc-content">${formatDocContent(project.docs.readme)}</div>`;
          }
          if (hasDownloads && sidebarEl) {
            const dlIcons = { ".zip": "📦", ".mcaddon": "🧩", ".mcpack": "🧩", source: "📄" };
            let dlHTML = `<div class="download-card"><h3>Downloads</h3>`;
            project.docs.downloads.forEach(dl => {
              const icon = dlIcons[dl.type] || "📥";
              dlHTML += `<a href="${dl.url}" class="download-btn" target="_blank" rel="noopener noreferrer"><span class="download-icon">${icon}</span><span class="download-info"><span class="download-label">${dl.label}</span><span class="download-meta">${dl.type}</span></span></a>`;
            });
            dlHTML += `</div>`;
            sidebarEl.innerHTML = dlHTML;
          } else if (sidebarEl) {
            sidebarEl.style.display = "none";
            readmeLayout.classList.add("readme-no-sidebar");
          }
        }

        // Build sidebar + content
        const sections = project.docs.sections || [];
        let navHTML = "";
        let contentHTML = "";

        // Group sections: { null: [...ungrouped], "Group Name": [...grouped] }
        const groups = [];
        const groupMap = {};

        sections.forEach((section, i) => {
          const id = section.id || section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const entry = { ...section, _id: id, _index: i };
          const g = section.group || null;
          if (!groupMap[g]) {
            groupMap[g] = [];
            groups.push(g);
          }
          groupMap[g].push(entry);
        });

        let firstSection = true;

        groups.forEach(g => {
          const items = groupMap[g];

          if (g) {
            // Collapsible group
            const gid = "grp-" + g.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            navHTML += `<div class="docs-nav-group" data-group="${gid}">`;
            navHTML += `<button class="docs-nav-group-toggle open" aria-expanded="true" data-target="${gid}">
              <svg class="docs-nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              ${g}
            </button>`;
            navHTML += `<div class="docs-nav-group-items open" id="${gid}"><div class="docs-nav-group-inner">`;
          }

          items.forEach(entry => {
            const activeClass = firstSection ? " active" : "";
            const badgeHTML = entry.badge ? ` <span class="docs-nav-badge">${entry.badge}</span>` : "";
            navHTML += `<a href="#${entry._id}" class="docs-nav-link${activeClass}" data-section="${entry._id}">${entry.title}${badgeHTML}</a>`;
            firstSection = false;

            const rendered = formatDocContent(entry.content);
            const sectionBadge = entry.badge ? `<span class="doc-section-badge">${entry.badge}</span>` : "";
            contentHTML += `
              <article class="doc-section reveal" id="${entry._id}">
                <div class="doc-section-header"><h2>${entry.title}</h2>${sectionBadge}</div>
                <div class="doc-content">${rendered}</div>
              </article>
            `;
          });

          if (g) {
            navHTML += `</div></div></div>`;
          }
        });

        // Add images section if present
        if (project.docs.images?.length) {
          navHTML += `<a href="#gallery" class="docs-nav-link" data-section="gallery">Gallery</a>`;
          let imgsHTML = project.docs.images.map(img => {
            const alt = img.alt || project.title;
            const cap = img.caption ? `<figcaption>${img.caption}</figcaption>` : "";
            return `<figure class="doc-image"><img src="${img.url}" alt="${alt}" loading="lazy">${cap}</figure>`;
          }).join("");
          contentHTML += `
            <article class="doc-section reveal" id="gallery">
              <h2>Gallery</h2>
              <div class="doc-images-grid">${imgsHTML}</div>
            </article>
          `;
        }

        docsNav.innerHTML = navHTML;
        docsMain.innerHTML = contentHTML;

        // Group toggle handlers
        docsNav.querySelectorAll(".docs-nav-group-toggle").forEach(btn => {
          btn.addEventListener("click", () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            const isOpen = btn.classList.toggle("open");
            target.classList.toggle("open", isOpen);
            btn.setAttribute("aria-expanded", isOpen);
          });
        });

        // Observe reveals
        docsMain.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

        // Sidebar scroll-spy
        const navLinks = docsNav.querySelectorAll(".docs-nav-link");
        const sectionEls = docsMain.querySelectorAll(".doc-section");

        const spyObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              navLinks.forEach(l => l.classList.remove("active"));
              const match = docsNav.querySelector(`[data-section="${entry.target.id}"]`);
              if (match) {
                match.classList.add("active");
                // Auto-expand parent group if collapsed
                const group = match.closest(".docs-nav-group");
                if (group) {
                  const btn = group.querySelector(".docs-nav-group-toggle");
                  const items = group.querySelector(".docs-nav-group-items");
                  if (btn && items && !btn.classList.contains("open")) {
                    btn.classList.add("open");
                    items.classList.add("open");
                    btn.setAttribute("aria-expanded", "true");
                  }
                }
              }
            }
          });
        }, { rootMargin: "-20% 0px -60% 0px" });

        sectionEls.forEach(el => spyObserver.observe(el));

        // Smooth scroll on nav click
        navLinks.forEach(link => {
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.section);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              history.replaceState(null, "", `#${link.dataset.section}`);
            }
          });
        });

        // Jump to hash on load
        if (window.location.hash) {
          const target = document.getElementById(window.location.hash.slice(1));
          if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
        }
      })
      .catch(() => {
        projectHeroContent.innerHTML = `<h1>Error</h1><p>Failed to load project data.</p>`;
        document.getElementById("docsLayout").style.display = "none";
      });
  }
}

function formatDocContent(text) {
  if (!text) return "";

  // Split by code blocks first to protect them
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map(part => {
    if (part.startsWith("```")) {
      // Code block with copy button
      const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
      const lang = match?.[1] || "";
      const code = match?.[2] || part.slice(3, -3);
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const langLabel = lang ? `<span class="code-lang">${lang}</span>` : "";
      return `<div class="code-block-wrapper">${langLabel}<button class="code-copy-btn" aria-label="Copy code" onclick="navigator.clipboard.writeText(this.parentElement.querySelector('code').textContent);this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)">Copy</button><pre><code${lang ? ` class="lang-${lang}"` : ""}>${escaped}</code></pre></div>`;
    }

    // Process paragraph-level blocks
    return part
      .split("\n\n")
      .map(paragraph => {
        let p = paragraph.trim();
        if (!p) return "";

        // Horizontal rule
        if (/^-{3,}$/.test(p)) {
          return `<hr class="doc-divider">`;
        }

        // Image block: ![alt](url)
        const imgBlockMatch = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgBlockMatch) {
          const alt = imgBlockMatch[1].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const caption = alt ? `<figcaption>${alt}</figcaption>` : "";
          return `<figure class="doc-inline-image"><img src="${imgBlockMatch[2]}" alt="${alt}" loading="lazy">${caption}</figure>`;
        }

        // Callout blocks: > [!type] content
        const calloutMatch = p.match(/^>\s*\[!(info|warning|tip|note)\]\s*([\s\S]*)$/i);
        if (calloutMatch) {
          const type = calloutMatch[1].toLowerCase();
          let body = calloutMatch[2].replace(/\n>\s?/g, "\n").trim();
          body = inlineFormat(body);
          const icons = { info: "ℹ", warning: "⚠", tip: "💡", note: "📝" };
          const labels = { info: "Info", warning: "Warning", tip: "Tip", note: "Note" };
          return `<div class="doc-callout doc-callout-${type}"><span class="doc-callout-icon">${icons[type]}</span><div><strong class="doc-callout-title">${labels[type]}</strong><p>${body}</p></div></div>`;
        }

        // Blockquote: > text
        if (p.startsWith("> ")) {
          let body = p.replace(/^>\s?/gm, "").trim();
          body = inlineFormat(body);
          return `<blockquote class="doc-blockquote"><p>${body}</p></blockquote>`;
        }

        // Table: | col | col |
        if (p.includes("|") && /^\|.*\|$/m.test(p)) {
          const rows = p.split("\n").filter(r => r.trim().startsWith("|"));
          if (rows.length >= 2) {
            const parseRow = r => r.split("|").slice(1, -1).map(c => c.trim());
            const headers = parseRow(rows[0]);
            // Skip separator row (|---|---|)
            const startIdx = /^[\s|:-]+$/.test(rows[1]) ? 2 : 1;
            const bodyRows = rows.slice(startIdx);
            let table = `<div class="doc-table-wrapper"><table class="doc-table"><thead><tr>${headers.map(h => `<th>${inlineFormat(h)}</th>`).join("")}</tr></thead><tbody>`;
            bodyRows.forEach(r => {
              const cells = parseRow(r);
              table += `<tr>${cells.map(c => `<td>${inlineFormat(c)}</td>`).join("")}</tr>`;
            });
            table += `</tbody></table></div>`;
            return table;
          }
        }

        // Headings: # ## ### ####
        const headingMatch = p.match(/^(#{1,4})\s+(.+)/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const hText = inlineFormat(headingMatch[2]);
          const cls = ["", "doc-heading-lg", "doc-heading", "doc-subheading", "doc-subheading-sm"][level];
          return `<h${level} class="${cls}">${hText}</h${level}>`;
        }

        // Numbered list (check before bullet lists)
        if (/^1[\.\)]\s/.test(p)) {
          const items = p.split(/\n/).map(line => {
            return line.replace(/^\d+[\.\)]\s*/, "");
          });
          return `<ol>${items.map(item => `<li>${inlineFormat(item)}</li>`).join("")}</ol>`;
        }

        // Bullet lists
        if (/^- /.test(p) || /\n- /.test(p)) {
          const items = p.split(/\n/).filter(l => l.trim()).map(line => {
            return line.replace(/^- /, "");
          });
          return `<ul>${items.map(item => `<li>${inlineFormat(item)}</li>`).join("")}</ul>`;
        }

        // Regular paragraph
        p = inlineFormat(p);
        p = p.replace(/\n/g, "<br>");
        return `<p>${p}</p>`;
      })
      .join("");
  }).join("");
}

function inlineFormat(text) {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Keyboard keys [[Ctrl]]
    .replace(/\[\[([^\]]+)\]\]/g, '<kbd class="doc-kbd">$1</kbd>')
    // Inline images ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="doc-inline-img" loading="lazy">')
    // Links [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" class="doc-link" target="_blank" rel="noopener noreferrer">$1</a>')
    // Strikethrough ~~text~~
    .replace(/~~(.*?)~~/g, "<del>$1</del>");
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
  settingsFab.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle("open");
    document.body.classList.toggle("settings-open");
  });

  // Close settings on tap outside (mobile-friendly)
  document.addEventListener("click", (e) => {
    if (settingsPanel.classList.contains("open") &&
        !settingsPanel.contains(e.target) &&
        !settingsFab.contains(e.target)) {
      settingsPanel.classList.remove("open");
      document.body.classList.remove("settings-open");
    }
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
    animation: settingElements.animation?.value || "50",
    radius: settingElements.radius?.value || "50",
  };

  // Reset theme/style classes while preserving state classes
  const preserveClasses = ["settings-open", "dev-mode", "page-transitioning"];
  const kept = preserveClasses.filter(c => document.body.classList.contains(c));
  document.body.className = "";
  kept.forEach(c => document.body.classList.add(c));

  // Apply theme
  document.body.classList.add(`theme-${settings.theme}`);

  // Apply other settings based on non-default values
  if (settings.density === "solid") document.body.classList.add("style-solid");
  if (settings.font === "large") document.body.classList.add("font-large");

  // Animation: 0=off, 50=normal, 100=dynamic (continuous)
  const anim = parseInt(settings.animation);
  if (anim === 0) {
    document.body.classList.add("reduce-motion");
  }
  const motionDistance = (anim / 100) * 38;
  const motionDuration = 0.2 + (anim / 100) * 0.75;
  document.body.style.setProperty("--motion-distance", motionDistance + "px");
  document.body.style.setProperty("--motion-duration", motionDuration + "s");

  // Radius: 0=sharp, 50=normal, 100=soft (continuous)
  const rad = parseInt(settings.radius);
  const radiusScale = 0.5 + (rad / 100) * 1.0;
  document.body.style.setProperty("--radius-scale", radiusScale.toFixed(2));

  // Save to localStorage (single operation)
  localStorage.setItem("site-settings", JSON.stringify(settings));
}

// LOAD SETTINGS
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("site-settings"));
  if (!saved) return;

  // Migrate old 0/1/2 slider values to 0-100 scale
  if (saved.animation !== undefined && parseInt(saved.animation) <= 2) {
    saved.animation = String({ "0": 0, "1": 50, "2": 100 }[saved.animation] ?? 50);
  }
  if (saved.radius !== undefined && parseInt(saved.radius) <= 2) {
    saved.radius = String({ "0": 0, "1": 50, "2": 100 }[saved.radius] ?? 50);
  }

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
    this.labels = this.getLabels();
    this.init();
  }

  getLabels() {
    const id = this.input.id;
    if (id === "animationLevel") {
      return { 0: "Off", 15: "Minimal", 35: "Subtle", 50: "Normal", 70: "Lively", 85: "Bold", 100: "Dynamic" };
    }
    if (id === "radiusLevel") {
      return { 0: "Sharp", 20: "Tight", 40: "Moderate", 50: "Normal", 65: "Rounded", 85: "Soft", 100: "Pill" };
    }
    return null;
  }

  getLabel(value) {
    if (!this.labels) return value;
    const v = parseInt(value);
    const keys = Object.keys(this.labels).map(Number).sort((a, b) => a - b);
    let closest = keys[0];
    for (const k of keys) {
      if (Math.abs(k - v) < Math.abs(closest - v)) closest = k;
    }
    return this.labels[closest];
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
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-valuemin', this.input.min || '0');
    thumb.setAttribute('aria-valuemax', this.input.max || '100');
    
    const value = document.createElement('div');
    value.className = 'custom-slider-value';
    value.textContent = this.getLabel(this.input.value);
    
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
    
    this.updateThumbPosition();
    this.bindEvents();
  }

  bindEvents() {
    let isDragging = false;
    
    const updateValue = (e) => {
      const rect = this.track.getBoundingClientRect();
      let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      
      x = Math.max(0, Math.min(x, rect.width));
      const percentage = (x / rect.width) * 100;
      const min = parseInt(this.input.min) || 0;
      const max = parseInt(this.input.max) || 100;
      const value = Math.round((percentage / 100) * (max - min) + min);
      
      this.input.value = value;
      this.valueDisplay.textContent = this.getLabel(value);
      this.updateThumbPosition();
      this.input.dispatchEvent(new Event('input', { bubbles: true }));
      this.input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    
    const startDrag = (e) => {
      isDragging = true;
      this.thumb.classList.add('dragging');
      updateValue(e);
    };
    
    const endDrag = () => {
      isDragging = false;
      this.thumb.classList.remove('dragging');
    };
    
    const handleMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        updateValue(e);
      }
    };
    
    this.track.addEventListener('mousedown', startDrag);
    this.track.addEventListener('touchstart', startDrag, { passive: false });
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Keyboard support
    this.thumb.addEventListener('keydown', (e) => {
      const min = parseInt(this.input.min) || 0;
      const max = parseInt(this.input.max) || 100;
      let val = parseInt(this.input.value);
      const step = 5;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); val = Math.min(max, val + step); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); val = Math.max(min, val - step); }
      else return;
      this.input.value = val;
      this.valueDisplay.textContent = this.getLabel(val);
      this.updateThumbPosition();
      this.input.dispatchEvent(new Event('input', { bubbles: true }));
      this.input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    this.input.addEventListener('input', () => {
      this.updateThumbPosition();
      this.valueDisplay.textContent = this.getLabel(this.input.value);
    });
  }

  updateThumbPosition() {
    const min = parseInt(this.input.min) || 0;
    const max = parseInt(this.input.max) || 100;
    const value = this.input.value;
    const percentage = ((value - min) / (max - min)) * 100;
    
    this.thumb.style.left = percentage + '%';
    this.fill.style.width = percentage + '%';
    this.thumb.setAttribute('aria-valuenow', value);
    this.thumb.setAttribute('aria-valuetext', this.getLabel(value));
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
  if (interactiveBg) interactiveBg.resize();
}

window.addEventListener("resize", handleResize);

// ========================
// INTERACTIVE BACKGROUND
// ========================
const interactiveBg = (() => {
  const canvas = document.createElement("canvas");
  canvas.id = "interactiveBg";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
    zIndex: "0", pointerEvents: "none"
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let w, h, particles = [], mouse = { x: -9999, y: -9999 }, animId;
  const COUNT = window.innerWidth <= 760 ? Math.min(25, Math.floor(window.innerWidth / 30)) : Math.min(60, Math.floor(window.innerWidth / 22));
  const INTERACT_RADIUS = 140;
  const LINE_DIST = 120;

  function getAccentColor() {
    const accent = getComputedStyle(document.body).getPropertyValue("--accent").trim();
    // Parse hex to rgb
    if (accent.startsWith("#")) {
      const hex = accent.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return { r, g, b };
    }
    return { r: 240, g: 196, b: 107 };
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.3 + 0.1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const color = getAccentColor();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Drift
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // Mouse interaction — push away gently
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < INTERACT_RADIUS && dist > 0) {
        const force = (1 - dist / INTERACT_RADIUS) * 1.5;
        p.vx += (dx / dist) * force * 0.15;
        p.vy += (dy / dist) * force * 0.15;
      }

      // Dampen velocity
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Brightness boost near cursor
      const alpha = dist < INTERACT_RADIUS
        ? p.baseAlpha + (1 - dist / INTERACT_RADIUS) * 0.5
        : p.baseAlpha;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.fill();

      // Draw lines between nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const ldx = p.x - p2.x;
        const ldy = p.y - p2.y;
        const ldist = Math.sqrt(ldx * ldx + ldy * ldy);
        if (ldist < LINE_DIST) {
          const lineAlpha = (1 - ldist / LINE_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${lineAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  // Mouse tracking
  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support
  document.addEventListener("touchmove", (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Respect reduced motion
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function checkMotion() {
    if (motionQuery.matches || document.body.classList.contains("reduce-motion")) {
      cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, w, h);
    } else {
      draw();
    }
  }

  // Init
  resize();
  createParticles();
  draw();

  return { resize: () => { resize(); createParticles(); } };
})();
// ========================
// OPTIONAL: SMOOTH CARD TILT (OPTIMIZED - Event Delegation)
// Only on devices with hover (not touch)
// ========================
const canHover = window.matchMedia("(hover: hover)").matches;
const cardContainer = document.querySelector("main") || document.body;
let currentTiltCard = null;

if (canHover) {
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
}

// ========================
// CURSOR GLOW — global light following the mouse (desktop only)
// ========================
if (canHover) {
  (() => {
    const glow = document.createElement("div");
    glow.classList.add("cursor-glow");
    document.body.appendChild(glow);

    let cx = -200, cy = -200, tx = -200, ty = -200, visible = false, rafId;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      cx = lerp(cx, tx, 0.15);
      cy = lerp(cy, ty, 0.15);
      glow.style.transform = `translate(${cx}px, ${cy}px)`;
      rafId = requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        glow.style.opacity = "1";
      }
    });

    document.addEventListener("mouseleave", () => {
      visible = false;
      glow.style.opacity = "0";
    });

    tick();
  })();
}

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
  
  if (link.dataset.preview) return;
  
  const href = link.getAttribute("href");
  const isExternalOrAnchor = !href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:");
  
  if (isExternalOrAnchor) return;
  
  e.preventDefault();
  
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
