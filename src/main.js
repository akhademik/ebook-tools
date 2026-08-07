import { initPdfProcessor } from './js/pdf-processor.js';
import { initMdFixer } from './js/md-fixer.js';
import { initEpubPacker } from './js/epub-packer.js';

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
    el.addEventListener('click', (e) => {
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
  initPdfProcessor();
  initMdFixer();
  initEpubPacker();
  initRouter();
  initMobileMenu();
});
