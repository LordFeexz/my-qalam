<script lang="ts">
  import type { SearchResult } from "$libs/db/queries/search.queries";
  import { Input } from "$libs/components/ui/input";
  import { Button } from "$libs/components/ui/button";
  let query = $state("");
  let filter = $state<"all" | "quran" | "hadith" | "sirah">("all");
  let results = $state<SearchResult[]>([]);
  let isLoading = $state(false);
  let hasSearched = $state(false);
  let abortController: AbortController | null = null;
  
  let recentSearches = $state<string[]>([]);
  const RECENT_SEARCHES_KEY = "my-qalam-recent-searches";

  $effect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          recentSearches = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }
    }
  });

  let recentSearchTimeout: ReturnType<typeof setTimeout>;

  function saveRecentSearch(term: string) {
    if (!term.trim()) return;
    const termLower = term.trim().toLowerCase();
    
    clearTimeout(recentSearchTimeout);
    recentSearchTimeout = setTimeout(() => {
      recentSearches = [termLower, ...recentSearches.filter((t) => t !== termLower)].slice(0, 10);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    }, 700);
  }

  function clearRecentSearches() {
    recentSearches = [];
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }

  function handleRecentSearchClick(term: string) {
    query = term;
    performSearch();
  }

  async function performSearch() {
    if (!query.trim()) {
      results = [];
      hasSearched = false;
      return;
    }

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    isLoading = true;
    hasSearched = true;

    try {
      const res = await fetch(`/api/search.json?q=${encodeURIComponent(query.trim())}&filter=${filter}`, {
        signal: abortController.signal,
      });
      if (res.ok) {
        const data = await res.json();
        results = data.results;
        saveRecentSearch(query);
      } else {
        console.error("Search failed");
        results = [];
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Search error:", e);
        results = [];
      }
    } finally {
      isLoading = false;
    }
  }

  // Debounce search input
  let timeoutId: ReturnType<typeof setTimeout>;
  function handleInput() {
    clearTimeout(timeoutId);
    if (!query.trim()) {
      results = [];
      hasSearched = false;
      return;
    }
    timeoutId = setTimeout(() => {
      performSearch();
    }, 300);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      clearTimeout(timeoutId);
      performSearch();
    } else if (e.key === "Escape") {
      query = "";
      results = [];
      hasSearched = false;
    }
  }

  function clearSearch() {
    query = "";
    results = [];
    hasSearched = false;
  }

  $effect(() => {
    // Re-trigger search if filter changes and we have a query
    if (filter && query.trim()) {
        performSearch();
    }
  });

  const quranResults = $derived(results.filter((r) => r.entity === "quran") as import("$libs/db/queries/search.queries").QuranSearchResult[]);
  const hadithResults = $derived(results.filter((r) => r.entity === "hadith") as import("$libs/db/queries/search.queries").HadithSearchResult[]);
  const sirahResults = $derived(results.filter((r) => r.entity === "sirah") as import("$libs/db/queries/search.queries").SirahSearchResult[]);
</script>

<div class="flex flex-col gap-6">
  <div class="relative">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    </div>
    <Input
      type="text"
      bind:value={query}
      oninput={handleInput}
      onkeydown={handleKeyDown}
      placeholder="Cari Surah, Hadis, atau Sirah..."
      class="pl-10 pr-10 py-6 text-lg rounded-2xl shadow-sm border-border/60 bg-card"
    />
    {#if query}
      <button
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
        onclick={clearSearch}
        aria-label="Bersihkan pencarian"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    {/if}
  </div>

  <div class="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
    <button
      type="button"
      onclick={() => filter = "all"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Semua
    </button>
    <button
      type="button"
      onclick={() => filter = "quran"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {filter === 'quran' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Al-Quran
    </button>
    <button
      type="button"
      onclick={() => filter = "hadith"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {filter === 'hadith' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Hadis
    </button>
    <button
      type="button"
      onclick={() => filter = "sirah"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {filter === 'sirah' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Sirah
    </button>
  </div>

  {#if !hasSearched && !isLoading}
    {#if recentSearches.length > 0}
      <div class="mt-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-muted-foreground">Pencarian Terakhir</h3>
          <button type="button" class="text-xs text-muted-foreground hover:text-foreground transition-colors" onclick={clearRecentSearches}>Hapus Semua</button>
        </div>
        <div class="flex flex-wrap gap-2">
          {#each recentSearches as term}
            <button
              type="button"
              onclick={() => handleRecentSearchClick(term)}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {term}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <div class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <p class="max-w-xs">Mulai ketik untuk mencari surah, terjemahan ayat, hadis, atau sirah Nabi.</p>
      </div>
    {/if}
  {/if}

  {#if isLoading}
    <div class="flex flex-col gap-8 mt-2">
      {#if filter === "all" || filter === "quran"}
        <div class="flex flex-col gap-4">
          <div class="h-6 bg-muted rounded w-32 animate-pulse mb-1"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each Array(filter === "all" ? 2 : 4) as _}
              <div class="p-5 rounded-xl border border-border/40 bg-card animate-pulse">
                <div class="flex justify-between items-start mb-3">
                  <div class="h-4 bg-muted rounded w-1/2"></div>
                  <div class="h-4 bg-muted rounded w-16"></div>
                </div>
                <div class="h-6 bg-muted rounded w-1/3 ml-auto mb-4"></div>
                <div class="space-y-2">
                  <div class="h-3 bg-muted rounded w-full"></div>
                  <div class="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if filter === "all" || filter === "hadith"}
        <div class="flex flex-col gap-4">
          <div class="h-6 bg-muted rounded w-24 animate-pulse mb-1"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each Array(filter === "all" ? 2 : 4) as _}
              <div class="p-5 rounded-xl border border-border/40 bg-card animate-pulse">
                <div class="flex justify-between items-start mb-3">
                  <div class="h-4 bg-muted rounded w-1/2"></div>
                  <div class="h-4 bg-muted rounded w-12"></div>
                </div>
                <div class="h-4 bg-muted rounded w-20 mb-4"></div>
                <div class="space-y-2">
                  <div class="h-3 bg-muted rounded w-full"></div>
                  <div class="h-3 bg-muted rounded w-5/6"></div>
                  <div class="h-3 bg-muted rounded w-4/6"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if filter === "all" || filter === "sirah"}
        <div class="flex flex-col gap-4">
          <div class="h-6 bg-muted rounded w-24 animate-pulse mb-1"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each Array(filter === "all" ? 2 : 4) as _}
              <div class="p-5 rounded-xl border border-border/40 bg-card animate-pulse">
                <div class="flex justify-between items-start mb-3">
                  <div class="h-5 bg-muted rounded w-3/4"></div>
                  <div class="h-4 bg-muted rounded w-12"></div>
                </div>
                <div class="h-4 bg-muted rounded w-24 mb-4"></div>
                <div class="space-y-2">
                  <div class="h-3 bg-muted rounded w-full"></div>
                  <div class="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else if hasSearched && results.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
      </div>
      <h3 class="text-lg font-medium text-foreground mb-1">Hasil tidak ditemukan</h3>
      <p class="max-w-sm">Maaf, kami tidak dapat menemukan hasil untuk "{query}". Coba gunakan kata kunci lain.</p>
    </div>
  {:else if hasSearched && results.length > 0}
    <div class="flex flex-col gap-8 mt-2">
      {#if filter === "all" || filter === "quran"}
        {#if quranResults.length > 0}
          <div class="flex flex-col gap-4">
            {#if filter === "all"}
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Al-Quran
              </h2>
            {/if}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each quranResults as result}
                <a href={`/quran/${result.surahNumber}#ayah-${result.ayahNumber}`} class="flex flex-col gap-3 p-5 rounded-xl border border-border/40 bg-card hover:bg-accent/50 transition-colors group">
                  <div class="flex justify-between items-start">
                    <h3 class="font-bold text-foreground group-hover:text-primary transition-colors">{result.surahName} - Ayat {result.ayahNumber}</h3>
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Al-Quran</span>
                  </div>
                  <div class="text-right text-xl font-arabic text-primary mt-2" dir="rtl">{result.arabicText}</div>
                  <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">"{result.translationId}"</p>
                </a>
              {/each}
            </div>
          </div>
        {/if}
      {/if}

      {#if filter === "all" || filter === "hadith"}
        {#if hadithResults.length > 0}
          <div class="flex flex-col gap-4">
            {#if filter === "all"}
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                Hadis
              </h2>
            {/if}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each hadithResults as result}
                <a href={`/hadith/${result.bookSlug}/hadith/${result.number}`} class="flex flex-col gap-3 p-5 rounded-xl border border-border/40 bg-card hover:bg-accent/50 transition-colors group">
                  <div class="flex justify-between items-start">
                    <h3 class="font-bold text-foreground group-hover:text-primary transition-colors">{result.bookName} - No. {result.number}</h3>
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground">Hadis</span>
                  </div>
                  {#if result.grade}
                    <span class="inline-block mt-1 w-fit px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">{result.grade}</span>
                  {/if}
                  <p class="text-sm text-muted-foreground line-clamp-3 leading-relaxed mt-2 italic">"{result.translationId}"</p>
                </a>
              {/each}
            </div>
          </div>
        {/if}
      {/if}

      {#if filter === "all" || filter === "sirah"}
        {#if sirahResults.length > 0}
          <div class="flex flex-col gap-4">
            {#if filter === "all"}
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Sirah
              </h2>
            {/if}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each sirahResults as result}
                <a href={`/sirah/${result.slug}`} class="flex flex-col gap-3 p-5 rounded-xl border border-border/40 bg-card hover:bg-accent/50 transition-colors group">
                  <div class="flex justify-between items-start">
                    <h3 class="font-bold text-foreground group-hover:text-primary transition-colors">{result.title}</h3>
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">Sirah</span>
                  </div>
                  {#if result.yearLabel}
                    <p class="text-sm text-primary font-medium mt-1">{result.yearLabel}</p>
                  {/if}
                  {#if result.description}
                    <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-2">{result.description}</p>
                  {/if}
                </a>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
