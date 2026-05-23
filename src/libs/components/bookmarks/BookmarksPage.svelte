<script lang="ts">
  import { bookmarkStore, type AnyBookmark } from "$libs/stores/bookmark.store.svelte";

  let currentTab = $state<"surah" | "ayah" | "hadithBook" | "hadith" | "sirah">("surah");

  let bookmarks = $derived(bookmarkStore.getBookmarksByType(currentTab));

  function formatDate(ms: number) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ms));
  }

  function handleRemove(id: string) {
    bookmarkStore.removeBookmark(id);
  }
</script>

<div class="flex flex-col gap-8">
  <div class="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
    <button
      type="button"
      onclick={() => currentTab = "surah"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {currentTab === 'surah' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Surah
    </button>
    <button
      type="button"
      onclick={() => currentTab = "ayah"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {currentTab === 'ayah' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Ayat
    </button>
    <button
      type="button"
      onclick={() => currentTab = "hadithBook"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {currentTab === 'hadithBook' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Kitab Hadis
    </button>
    <button
      type="button"
      onclick={() => currentTab = "hadith"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {currentTab === 'hadith' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Hadis
    </button>
    <button
      type="button"
      onclick={() => currentTab = "sirah"}
      class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors {currentTab === 'sirah' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
    >
      Sirah
    </button>
  </div>

  {#if bookmarks.length === 0}
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
      </div>
      <h3 class="text-xl font-bold mb-2">Belum ada penanda</h3>
      <p class="text-muted-foreground max-w-xs">Jelajahi konten dan klik ikon penanda untuk menyimpannya di sini.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each bookmarks as bookmark (bookmark.id)}
        <div class="flex flex-col gap-3 p-5 rounded-xl border border-border/40 bg-card relative group">
          <button 
            type="button"
            onclick={() => handleRemove(bookmark.id)}
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground focus:opacity-100"
            aria-label="Hapus penanda"
            title="Hapus penanda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>

          {#if bookmark.type === "surah"}
            <a href={`/quran/${bookmark.number}`} class="flex-1">
              <div class="text-xs text-muted-foreground mb-2">Disimpan {formatDate(bookmark.savedAt)}</div>
              <h3 class="font-bold text-lg mb-1">{bookmark.nameLatin}</h3>
              <p class="text-sm text-muted-foreground">{bookmark.totalAyah} Ayat</p>
              <div class="text-right text-xl font-arabic text-primary mt-2" dir="rtl">{bookmark.nameArabic}</div>
            </a>
          {:else if bookmark.type === "ayah"}
            <a href={`/quran/${bookmark.surahNumber}#ayah-${bookmark.ayahNumber}`} class="flex-1">
              <div class="text-xs text-muted-foreground mb-2">Disimpan {formatDate(bookmark.savedAt)}</div>
              <h3 class="font-bold text-lg mb-1">{bookmark.surahName} - Ayat {bookmark.ayahNumber}</h3>
              <p class="text-sm text-muted-foreground line-clamp-3 leading-relaxed mt-2 italic">"{bookmark.translationSnippet}"</p>
            </a>
          {:else if bookmark.type === "hadithBook"}
            <a href={`/hadith/${bookmark.slug}/1`} class="flex-1">
              <div class="text-xs text-muted-foreground mb-2">Disimpan {formatDate(bookmark.savedAt)}</div>
              <h3 class="font-bold text-lg mb-1">{bookmark.name}</h3>
              {#if bookmark.totalHadith}
                <p class="text-sm text-muted-foreground">{bookmark.totalHadith} Hadis</p>
              {/if}
            </a>
          {:else if bookmark.type === "hadith"}
            <a href={`/hadith/${bookmark.bookSlug}/hadith/${bookmark.number}`} class="flex-1">
              <div class="text-xs text-muted-foreground mb-2">Disimpan {formatDate(bookmark.savedAt)}</div>
              <h3 class="font-bold text-lg mb-1">{bookmark.bookName} - No. {bookmark.number}</h3>
              {#if bookmark.grade}
                <span class="inline-block mt-1 mb-2 px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">{bookmark.grade}</span>
              {/if}
              <p class="text-sm text-muted-foreground line-clamp-3 leading-relaxed mt-2 italic">"{bookmark.translationSnippet}"</p>
            </a>
          {:else if bookmark.type === "sirah"}
            <a href={`/sirah/${bookmark.slug}`} class="flex-1">
              <div class="text-xs text-muted-foreground mb-2">Disimpan {formatDate(bookmark.savedAt)}</div>
              <h3 class="font-bold text-lg mb-1">{bookmark.title}</h3>
              {#if bookmark.yearLabel}
                <p class="text-sm text-primary font-medium mt-1">{bookmark.yearLabel}</p>
              {/if}
            </a>
          {/if}
        </div>
      {/each}
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
