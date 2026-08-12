<script>
  import "./layout.css";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let { children } = $props();

  let mobileMenuOpen = $state(false);
  let isDark = $state(true);

  function toggleTheme() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  onMount(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      isDark = false;
      document.documentElement.classList.remove("dark");
    } else if (savedTheme === "dark") {
      isDark = true;
      document.documentElement.classList.add("dark");
    } else {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  });

  function closeMenu() {
    mobileMenuOpen = false;
  }

  function openMenu() {
    mobileMenuOpen = true;
  }
</script>

<div
  class="flex h-screen w-screen bg-brand-bg md:flex-row flex-col overflow-hidden relative"
>
  <!-- Backdrop for mobile drawer -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    id="sidebar-backdrop"
    class="fixed inset-0 z-40 bg-black/70 md:hidden backdrop-blur-xs transition-opacity duration-200 {mobileMenuOpen
      ? ''
      : 'hidden'}"
    onclick={closeMenu}
  ></div>

  <!-- SIDEBAR -->
  <aside
    class="sidebar fixed md:static top-0 bottom-0 left-0 z-50 w-[270px] {mobileMenuOpen
      ? 'translate-x-0'
      : '-translate-x-full'} md:translate-x-0 bg-sidebar-bg border-r border-border-color flex flex-col p-6 shrink-0 transition-all duration-200"
  >
    <!-- Close button (mobile only) -->
    <button
      onclick={closeMenu}
      class="md:hidden absolute top-4 right-4 text-text-mute hover:text-text-color p-2 rounded-xl hover:bg-panel cursor-pointer transition-colors"
      type="button">✕</button
    >

    <div class="flex items-center gap-3.5 mb-8">
      <div
        class="w-10 h-10 rounded-xl bg-accent-soft border border-accent-color/30 flex items-center justify-center text-accent-color font-bold text-xl shadow-xs"
      >
        ⚒
      </div>
      <div>
        <h2
          class="font-mono text-lg font-bold m-0 text-text-color tracking-tight"
        >
          Ebook Forge
        </h2>
        <span class="text-xs font-mono text-text-mute tracking-wide"
          >Processing Desk</span
        >
      </div>
    </div>

    <nav class="flex flex-col gap-1.5 flex-1">
      <a
        href="/"
        onclick={closeMenu}
        class="tab-btn py-3 px-4 rounded-xl flex items-center gap-3 text-left transition-all duration-150 w-full border {$page
          .url.pathname === '/'
          ? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
          : 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
      >
        <span class="text-lg">📊</span>
        <span class="text-base font-medium">Tổng quan</span>
      </a>

      <div
        class="font-mono text-xs font-semibold uppercase text-text-mute tracking-widest mt-6 mb-2 px-4"
      >
        Công cụ
      </div>

      <a
        href="/pdf"
        onclick={closeMenu}
        class="tab-btn py-3 px-4 rounded-xl flex items-center gap-3 text-left transition-all duration-150 w-full border {$page
          .url.pathname === '/pdf'
          ? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
          : 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
      >
        <span class="text-lg">📄</span>
        <span class="text-base font-medium">PDF → JPG</span>
      </a>
      <a
        href="/md"
        onclick={closeMenu}
        class="tab-btn py-3 px-4 rounded-xl flex items-center gap-3 text-left transition-all duration-150 w-full border {$page
          .url.pathname === '/md'
          ? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
          : 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
      >
        <span class="text-lg">✍️</span>
        <span class="text-base font-medium">Markdown Fixer</span>
      </a>
      <a
        href="/epub"
        onclick={closeMenu}
        class="tab-btn py-3 px-4 rounded-xl flex items-center gap-3 text-left transition-all duration-150 w-full border {$page
          .url.pathname === '/epub'
          ? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
          : 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
      >
        <span class="text-lg">📦</span>
        <span class="text-base font-medium">Đóng gói EPUB</span>
      </a>
      <a
        href="/txt-to-pdf"
        onclick={closeMenu}
        class="tab-btn py-3 px-4 rounded-xl flex items-center gap-3 text-left transition-all duration-150 w-full border {$page
          .url.pathname === '/txt-to-pdf'
          ? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
          : 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
      >
        <span class="text-lg">💻</span>
        <span class="text-base font-medium">TXT → PDF CJK</span>
      </a>
    </nav>

    <!-- Theme Switcher & Footer -->
    <div class="mt-auto border-t border-border-color pt-4 flex flex-col gap-3">
      <button
        onclick={toggleTheme}
        class="flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl border border-border-color bg-panel hover:border-accent-color/40 text-text-color text-sm font-medium cursor-pointer transition-all duration-150"
      >
        <span class="flex items-center gap-2.5">
          <span class="text-base">{isDark ? "☀️" : "🌙"}</span>
          <span>{isDark ? "Giao diện Sáng" : "Giao diện Tối"}</span>
        </span>
        <span class="text-xs text-text-mute font-mono">Đổi</span>
      </button>

      <div
        class="flex items-center justify-between text-sm text-text-mute font-mono px-1"
      >
        <span>v1.2.0</span>
        <span class="text-emerald-500 font-medium">-2026-</span>
      </div>
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <main class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- MOBILE HEADER -->
    <header
      class="flex md:hidden h-[56px] bg-sidebar-bg border-b border-border-color px-5 items-center justify-between shrink-0"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center font-bold text-base"
        >
          ⚒
        </div>
        <h2 class="font-mono text-base font-bold text-text-color">
          Ebook Forge
        </h2>
      </div>
      <button
        onclick={openMenu}
        class="text-text-color p-2 hover:bg-panel rounded-lg cursor-pointer transition-colors"
        type="button"
        aria-label="Mở menu"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
    </header>

    <!-- ROUTER PANELS -->
    <div class="flex-1 overflow-y-auto p-6 md:p-10">
      {@render children()}
    </div>
  </main>
</div>
