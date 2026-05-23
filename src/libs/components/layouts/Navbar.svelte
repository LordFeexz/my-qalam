<script lang="ts">
	import { Button } from "$libs/components/ui/button";
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetTrigger,
		SheetClose,
	} from "$libs/components/ui/sheet";
	import { Separator } from "$libs/components/ui/separator";
	import ThemeToggle from "$libs/components/common/ThemeToggle.svelte";

	interface NavLink {
		label: string;
		href: string;
	}

	const navLinks: NavLink[] = [
		{ label: "Quran", href: "/quran" },
		{ label: "Hadith", href: "/hadith" },
		{ label: "Sirah", href: "/sirah" },
	];

	const mobileOnlyLinks: NavLink[] = [
		{ label: "Pencarian", href: "/search" },
		{ label: "AI", href: "/ai" },
		{ label: "Bookmarks", href: "/bookmarks" },
	];

	let mobileOpen = $state(false);
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
>
	<nav
		class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6"
		aria-label="Main navigation"
	>
		<!-- Logo -->
		<a
			href="/"
			class="flex items-center gap-2 transition-opacity hover:opacity-80"
			aria-label="My Qalam home"
		>
			<span class="text-lg font-semibold tracking-tight">My Qalam</span>
		</a>

		<!-- Desktop Nav Links -->
		<div class="hidden items-center gap-1 md:flex" role="menubar">
			{#each navLinks as link}
				<a
				data-astro-prefetch
					href={link.href}
					class="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					role="menuitem"
				>
					{link.label}
				</a>
			{/each}
		</div>

		<!-- Desktop Actions -->
		<div class="hidden items-center gap-1 md:flex">
			<!-- Search -->
			<Button
				variant="ghost"
				size="icon-sm"
				href="/search"
				aria-label="Search"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<span id="search-drawer" class="sr-only">Search</span>
			</Button>

			<!-- AI -->
			<Button variant="ghost" size="icon-sm" href="/ai" aria-label="AI assistant">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 0 1 1h1a4 4 0 0 1 0 8h-1a1 1 0 0 0-1 1v1a4 4 0 0 1-8 0v-1a1 1 0 0 0-1-1H6a4 4 0 0 1 0-8h1a1 1 0 0 0 1-1V6a4 4 0 0 1 4-4z"
					/>
					<circle cx="12" cy="12" r="2" />
				</svg>
				<span id="ai-drawer" class="sr-only">AI assistant</span>
			</Button>

			<!-- Bookmarks -->
			<Button
				variant="ghost"
				size="icon-sm"
				href="/bookmarks"
				aria-label="Bookmarks"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
				</svg>
				<span id="bookmark-drawer" class="sr-only">Bookmarks</span>
			</Button>

			<!-- Theme Toggle -->
			<ThemeToggle />
		</div>

		<!-- Mobile Menu -->
		<div class="flex items-center gap-1 md:hidden">
			<!-- Mobile Theme Toggle -->
			<ThemeToggle />

			<!-- Hamburger -->
			<Sheet bind:open={mobileOpen}>
				<SheetTrigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon-sm"
							aria-label="Open navigation menu"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="4" x2="20" y1="12" y2="12" />
								<line x1="4" x2="20" y1="6" y2="6" />
								<line x1="4" x2="20" y1="18" y2="18" />
							</svg>
							<span id="mobile-menu" class="sr-only">Open navigation menu</span>
						</Button>
					{/snippet}
				</SheetTrigger>
				<SheetContent side="right" class="w-72 sm:w-80">
					<SheetHeader class="text-left">
						<SheetTitle>My Qalam</SheetTitle>
					</SheetHeader>
					<nav class="mt-6 flex flex-col gap-1" aria-label="Mobile navigation">
						{#each navLinks as link}
							<SheetClose>
								{#snippet child({ props })}
									<a
										{...props}
										href={link.href}
										data-astro-prefetch
										class="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
									>
										{link.label}
									</a>
								{/snippet}
							</SheetClose>
						{/each}
						<Separator class="my-2" />
						{#each mobileOnlyLinks as link}
							<SheetClose>
								{#snippet child({ props })}
									<a
										{...props}
										data-astro-prefetch
										href={link.href}
										class="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
									>
										{link.label}
									</a>
								{/snippet}
							</SheetClose>
						{/each}
					</nav>
				</SheetContent>
			</Sheet>
		</div>
	</nav>
</header>
