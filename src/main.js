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
  document.querySelectorAll('.tab-btn, .action-card-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const tab = el.dataset.tab;
      if (tab) {
        window.location.hash = `#/${tab}`;
      }
    });
  });

  // Initial trigger
  handleRoute();
}

// Initialize all features once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initPdfProcessor();
  initMdFixer();
  initEpubPacker();
  initRouter();
});
