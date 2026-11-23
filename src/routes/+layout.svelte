<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { onMount, type Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();

	let mobileMenuOpen = $state(false);
	let isDark = $state(true);
	let isCollapsed = $state(false);
	let userHasToggled = $state(false);

	const currentPath = $derived($page.url.pathname);
	const isHome = $derived(currentPath === '/');
	const isPacker = $derived(currentPath.startsWith('/epub-packer'));
	const isEditor = $derived(currentPath.startsWith('/epub-editor'));
	const isPdf = $derived(currentPath.startsWith('/pdf'));
	const isEpubToTxt = $derived(currentPath.startsWith('/epub-to-txt'));
	const isTxtToPdf = $derived(currentPath.startsWith('/txt-to-pdf'));

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	function toggleSidebar() {
		isCollapsed = !isCollapsed;
		userHasToggled = true;
		localStorage.setItem('sidebar-collapsed', isCollapsed ? 'true' : 'false');
	}

	onMount(() => {
		// Theme initialization
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme === 'light') {
			isDark = false;
			document.documentElement.classList.remove('dark');
		} else if (savedTheme === 'dark') {
			isDark = true;
			document.documentElement.classList.add('dark');
		} else {
			isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (isDark) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}

		// Sidebar collapse preference
		const savedCollapse = localStorage.getItem('sidebar-collapsed');
		if (savedCollapse !== null) {
			isCollapsed = savedCollapse === 'true';
			userHasToggled = true;
		} else {
			// Auto collapse when entering a tool, expanded at home
			isCollapsed = !isHome;
		}
	});

	$effect(() => {
		// Automatic route-based collapse if user hasn't manually set preference
		if (!userHasToggled && typeof window !== 'undefined') {
			isCollapsed = !isHome;
		}
	});

	function closeMenu() {
		mobileMenuOpen = false;
	}

	function openMenu() {
		mobileMenuOpen = true;
	}
</script>

<div class="flex h-dvh w-screen bg-brand-bg md:flex-row flex-col overflow-hidden relative">
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
		class="sidebar fixed md:static top-0 bottom-0 left-0 z-50 {mobileMenuOpen
			? 'translate-x-0 w-67.5'
			: '-translate-x-full w-67.5'} md:translate-x-0 {isCollapsed
			? 'md:w-18 md:p-3'
			: 'md:w-58 md:p-4'} bg-sidebar-bg border-r border-border-color flex flex-col p-4 shrink-0 transition-[width,transform] duration-200 ease-in-out"
	>
		<!-- Close button (mobile only) -->
		<button
			onclick={closeMenu}
			class="md:hidden absolute top-4 right-4 text-text-mute hover:text-text-color p-2 rounded-xl hover:bg-panel cursor-pointer transition-colors"
			type="button"
			aria-label="Đóng menu"
		>
			<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M18 6 6 18M6 6l12 12" />
			</svg>
		</button>

		<!-- Header & Logo -->
		<div
			class="flex {isCollapsed
				? 'md:flex-col md:gap-3 md:items-center'
				: 'items-center justify-between'} mb-6"
		>
			<a
				href="/"
				onclick={closeMenu}
				class="flex items-center gap-3 min-w-0 group {isCollapsed ? 'md:justify-center' : ''}"
				title="Ebook Forge"
				aria-label="Trang chủ Ebook Forge"
			>
				<div
					class="w-10 h-10 rounded-xl bg-accent-soft border border-accent-color/30 flex items-center justify-center text-accent-color shrink-0 shadow-xs"
				>
					<svg
						class="w-5 h-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
						<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
					</svg>
				</div>
				<div class="flex flex-col min-w-0 {isCollapsed ? 'md:hidden' : 'block'}">
					<span class="font-sans text-base font-bold text-text-color truncate leading-tight">
						Ebook Forge
					</span>
					<span class="text-[11px] font-mono text-text-mute truncate">Desk</span>
				</div>
			</a>

			<!-- Toggle Collapse Desktop Button -->
			<button
				type="button"
				onclick={toggleSidebar}
				class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-text-mute hover:text-text-color hover:bg-panel transition-colors cursor-pointer shrink-0"
				aria-expanded={!isCollapsed}
				aria-label={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
				title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
			>
				<svg
					class="w-4 h-4 transition-transform duration-200 {isCollapsed ? 'rotate-180' : ''}"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>
		</div>

		<!-- NAV ITEMS -->
		<nav class="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden">
			<!-- 1. Tổng quan -->
			<a
				href="/"
				onclick={closeMenu}
				aria-current={isHome ? 'page' : undefined}
				title="Tổng quan"
				aria-label="Tổng quan"
				class="tab-btn rounded-xl flex items-center transition-all duration-150 border {isCollapsed
					? 'h-11 w-11 justify-center p-0 mx-auto'
					: 'h-11 px-3.5 gap-3 w-full'} {isHome
					? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
					: 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
			>
				<svg
					class="w-5 h-5 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="3" y="3" width="7" height="7" />
					<rect x="14" y="3" width="7" height="7" />
					<rect x="14" y="14" width="7" height="7" />
					<rect x="3" y="14" width="7" height="7" />
				</svg>
				<span class="text-sm font-medium truncate font-sans {isCollapsed ? 'md:hidden' : 'inline'}">
					Tổng quan
				</span>
			</a>

			<!-- 2. Nhóm: Tạo và tinh chỉnh -->
			{#if isCollapsed}
				<div
					class="h-px bg-border-color my-1.5 w-6 mx-auto hidden md:block"
					aria-hidden="true"
				></div>
			{:else}
				<div
					class="text-[11px] font-semibold uppercase text-text-mute tracking-wider mt-3 mb-1 px-3"
				>
					Tạo và tinh chỉnh
				</div>
			{/if}

			<!-- Đóng gói EPUB -->
			<a
				href="/epub-packer"
				onclick={closeMenu}
				aria-current={isPacker ? 'page' : undefined}
				title="Đóng gói EPUB"
				aria-label="Đóng gói EPUB"
				class="tab-btn rounded-xl flex items-center transition-all duration-150 border {isCollapsed
					? 'h-11 w-11 justify-center p-0 mx-auto'
					: 'h-11 px-3.5 gap-3 w-full'} {isPacker
					? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
					: 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
			>
				<svg
					class="w-5 h-5 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m7.5 4.27 9 5.15" />
					<path
						d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
					/>
					<path d="m3.3 7 8.7 5 8.7-5" />
					<path d="M12 22V12" />
				</svg>
				<span class="text-sm font-medium truncate font-sans {isCollapsed ? 'md:hidden' : 'inline'}">
					Đóng gói EPUB
				</span>
			</a>

			<!-- EPUB Editor -->
			<a
				href="/epub-editor"
				onclick={closeMenu}
				aria-current={isEditor ? 'page' : undefined}
				title="EPUB Editor"
				aria-label="EPUB Editor"
				class="tab-btn rounded-xl flex items-center transition-all duration-150 border {isCollapsed
					? 'h-11 w-11 justify-center p-0 mx-auto'
					: 'h-11 px-3.5 gap-3 w-full'} {isEditor
					? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
					: 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
			>
				<svg
					class="w-5 h-5 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
					/>
					<path d="m15 5 4 4" />
				</svg>
				<span class="text-sm font-medium truncate font-sans {isCollapsed ? 'md:hidden' : 'inline'}">
					EPUB Editor
				</span>
			</a>

			<!-- 3. Nhóm: Tiền xử lý -->
			{#if isCollapsed}
				<div
					class="h-px bg-border-color my-1.5 w-6 mx-auto hidden md:block"
					aria-hidden="true"
				></div>
			{:else}
				<div
					class="text-[11px] font-semibold uppercase text-text-mute tracking-wider mt-3 mb-1 px-3"
				>
					Tiền xử lý
				</div>
			{/if}

			<!-- PDF → JPG -->
			<a
				href="/pdf"
				onclick={closeMenu}
				aria-current={isPdf ? 'page' : undefined}
				title="PDF → JPG"
				aria-label="PDF → JPG"
				class="tab-btn rounded-xl flex items-center transition-all duration-150 border {isCollapsed
					? 'h-11 w-11 justify-center p-0 mx-auto'
					: 'h-11 px-3.5 gap-3 w-full'} {isPdf
					? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
					: 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
			>
				<svg
					class="w-5 h-5 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
					<circle cx="9" cy="9" r="2" />
					<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
				</svg>
				<span class="text-sm font-medium truncate font-sans {isCollapsed ? 'md:hidden' : 'inline'}">
					PDF → JPG
				</span>
			</a>

			<!-- EPUB → TXT -->
			<a
				href="/epub-to-txt"
				onclick={closeMenu}
				aria-current={isEpubToTxt ? 'page' : undefined}
				title="EPUB → TXT"
				aria-label="EPUB → TXT"
				class="tab-btn rounded-xl flex items-center transition-all duration-150 border {isCollapsed
					? 'h-11 w-11 justify-center p-0 mx-auto'
					: 'h-11 px-3.5 gap-3 w-full'} {isEpubToTxt
					? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
					: 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
			>
				<svg
					class="w-5 h-5 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
					<path d="M6 6h10" />
					<path d="M6 10h10" />
					<path d="M6 14h6" />
				</svg>
				<span class="text-sm font-medium truncate font-sans {isCollapsed ? 'md:hidden' : 'inline'}">
					EPUB → TXT
				</span>
			</a>

			<!-- 4. Nhóm: Mở rộng -->
			{#if isCollapsed}
				<div
					class="h-px bg-border-color my-1.5 w-6 mx-auto hidden md:block"
					aria-hidden="true"
				></div>
			{:else}
				<div
					class="text-[11px] font-semibold uppercase text-text-mute tracking-wider mt-3 mb-1 px-3"
				>
					Mở rộng
				</div>
			{/if}

			<!-- TXT → PDF CJK -->
			<a
				href="/txt-to-pdf"
				onclick={closeMenu}
				aria-current={isTxtToPdf ? 'page' : undefined}
				title="TXT → PDF CJK"
				aria-label="TXT → PDF CJK"
				class="tab-btn rounded-xl flex items-center transition-all duration-150 border {isCollapsed
					? 'h-11 w-11 justify-center p-0 mx-auto'
					: 'h-11 px-3.5 gap-3 w-full'} {isTxtToPdf
					? 'bg-accent-soft text-accent-color font-semibold border-accent-color/30 shadow-xs'
					: 'text-text-mute font-medium border-transparent hover:text-text-color hover:bg-panel'}"
			>
				<svg
					class="w-5 h-5 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect width="20" height="14" x="2" y="3" rx="2" />
					<line x1="8" x2="16" y1="21" y2="21" />
					<line x1="12" x2="12" y1="17" y2="21" />
				</svg>
				<span class="text-sm font-medium truncate font-sans {isCollapsed ? 'md:hidden' : 'inline'}">
					TXT → PDF CJK
				</span>
			</a>
		</nav>

		<!-- Theme Switcher & Footer -->
		<div class="mt-auto border-t border-border-color pt-3 flex flex-col gap-2">
			<button
				onclick={toggleTheme}
				aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
				title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
				class="flex items-center rounded-xl border border-field-border bg-panel-2 hover:border-accent-color text-text-color cursor-pointer transition-all duration-150 {isCollapsed
					? 'h-11 w-11 justify-center p-0 mx-auto'
					: 'h-11 px-3 justify-between w-full'}"
			>
				<span class="flex items-center gap-2.5">
					{#if isDark}
						<svg
							class="w-5 h-5 text-amber-color shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2" />
							<path d="M12 20v2" />
							<path d="m4.93 4.93 1.41 1.41" />
							<path d="m17.66 17.66 1.41 1.41" />
							<path d="M2 12h2" />
							<path d="M20 12h2" />
							<path d="m6.34 17.66-1.41 1.41" />
							<path d="m19.07 4.93-1.41 1.41" />
						</svg>
					{:else}
						<svg
							class="w-5 h-5 text-text-color shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
						</svg>
					{/if}
					<span
						class="text-xs font-semibold font-sans truncate {isCollapsed ? 'md:hidden' : 'inline'}"
					>
						{isDark ? 'Giao diện Sáng' : 'Giao diện Tối'}
					</span>
				</span>
				<span class="text-[11px] text-text-mute font-mono {isCollapsed ? 'md:hidden' : 'inline'}">
					Đổi
				</span>
			</button>
		</div>
	</aside>

	<!-- MAIN CONTENT -->
	<main class="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
		<!-- MOBILE HEADER -->
		<header
			class="flex md:hidden h-14 bg-sidebar-bg border-b border-border-color px-5 items-center justify-between shrink-0"
		>
			<div class="flex items-center gap-2.5">
				<div
					class="w-8 h-8 rounded-lg bg-accent-soft text-accent-color flex items-center justify-center font-bold text-base"
				>
					<svg
						class="w-4 h-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
						<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
					</svg>
				</div>
				<h2 class="font-sans text-base font-bold text-text-color">Ebook Forge</h2>
			</div>
			<button
				onclick={openMenu}
				class="text-text-color p-2 hover:bg-panel rounded-lg cursor-pointer transition-colors"
				type="button"
				aria-label="Mở menu"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		<div class="flex-1 overflow-y-auto p-6 md:p-10 pb-24 md:pb-10">
			{@render children?.()}
		</div>
	</main>
</div>
