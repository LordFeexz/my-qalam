<script lang="ts">
	import { Button } from "$libs/components/ui/button";
	import { onMount, tick } from "svelte";

	let isDark = $state(false);

	onMount(() => {
		// Initialize state
		isDark = document.documentElement.classList.contains("dark");
		
		// Keep in sync with HTML class changes
		const observer = new MutationObserver(() => {
			isDark = document.documentElement.classList.contains("dark");
		});
		
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"]
		});
		
		return () => observer.disconnect();
	});

	async function handleToggle(e: MouseEvent) {
		const willBeDark = !isDark;
		
		if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			document.documentElement.classList.toggle("dark", willBeDark);
			return;
		}

		const x = e.clientX;
		const y = e.clientY;
		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y)
		);

		const transition = document.startViewTransition(async () => {
			document.documentElement.classList.toggle("dark", willBeDark);
			await tick();
		});

		transition.ready.then(() => {
			const clipPath = [
				`circle(0px at ${x}px ${y}px)`,
				`circle(${endRadius}px at ${x}px ${y}px)`
			];
			document.documentElement.animate(
				{
					clipPath: willBeDark ? clipPath.reverse() : clipPath
				},
				{
					duration: 400,
					easing: "ease-in-out",
					pseudoElement: willBeDark
						? "::view-transition-old(root)"
						: "::view-transition-new(root)"
				}
			);
		});
	}
</script>

<Button
	variant="ghost"
	size="icon-sm"
	onclick={handleToggle}
	aria-label="Toggle theme"
>
	{#if isDark}
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
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		</svg>
	{:else}
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
	{/if}
	<span id="toggle-theme-drawer" class="sr-only">Toggle theme</span>
</Button>

<style>
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation: none;
		mix-blend-mode: normal;
	}
	:global(::view-transition-old(root)) {
		z-index: 1;
	}
	:global(::view-transition-new(root)) {
		z-index: 2147483646;
	}
	:global(.dark::view-transition-old(root)) {
		z-index: 2147483646;
	}
	:global(.dark::view-transition-new(root)) {
		z-index: 1;
	}
</style>
