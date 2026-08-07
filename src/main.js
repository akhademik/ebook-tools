import './style.css';
import { initPdfProcessor } from './js/pdf-processor.js';
import { initMdFixer } from './js/md-fixer.js';
import { initEpubPacker } from './js/epub-packer.js';

// =======================================================
// Theme Switcher (Dark / Light Mode)
// =======================================================
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeLabel = document.getElementById('theme-toggle-label');

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      // When in dark mode, button option allows switching to light mode
      if (themeIcon) themeIcon.textContent = '☀️';
      if (themeLabel) themeLabel.textContent = 'Giao diện Sáng';
    } else {
      document.documentElement.classList.remove('dark');
      // When in light mode, button option allows switching to dark mode
      if (themeIcon) themeIcon.textContent = '🌙';
      if (themeLabel) themeLabel.textContent = 'Giao diện Tối';
    }
    localStorage.setItem('theme', theme);
  }

  // Apply default theme immediately
  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    });
  }
}

// =======================================================
// SPA Router & Navigation Wiring
// =======================================================
function initRouter() {
  const routes = ['dashboard', 'pdf', 'md', 'epub'];
  
  function handleRoute() {
    let hash = window.location.hash.replace('#/', '').trim();
    if (!routes.includes(hash)) {
      hash = 'dashboard';
      window.location.hash = '#/dashboard';
    }

    // Toggle panels
    document.querySelectorAll('.panel').forEach(panel => {
      if (panel.id === `panel-${hash}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Toggle nav active state
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === hash) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Set up event listeners
  window.addEventListener('hashchange', handleRoute);
  
  // Set up click handlers on cards & nav buttons
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', () => {
      if (el.classList.contains('disabled') || el.hasAttribute('disabled')) {
        return;
      }
      const tab = el.dataset.tab;
      if (tab) {
        window.location.hash = `#/${tab}`;
      }
    });
  });

  // Initial trigger
  handleRoute();
}

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const backdrop = document.getElementById('sidebar-backdrop');
  const sidebar = document.querySelector('.sidebar');

  function openMenu() {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  }

  function closeMenu() {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }

  if (toggleBtn && closeBtn && backdrop && sidebar) {
    toggleBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);
    
    // Close menu when navigation option is clicked on mobile
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          closeMenu();
        }
      });
    });
  }
}

// Initialize all features once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPdfProcessor();
  initMdFixer();
  initEpubPacker();
  initRouter();
  initMobileMenu();
});
