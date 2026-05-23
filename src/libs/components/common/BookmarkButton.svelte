<script lang="ts">
  import { bookmarkStore, type AnyBookmark } from "$libs/stores/bookmark.store.svelte";

  interface Props {
    item: AnyBookmark;
  }

  const { item }: Props = $props();

  let isBookmarked = $derived(bookmarkStore.isBookmarked(item.id));

  function handleToggle() {
    bookmarkStore.toggleBookmark(item);
  }
</script>

<button
  type="button"
  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  onclick={handleToggle}
  aria-label={isBookmarked ? "Hapus penanda" : "Tambahkan penanda"}
  title={isBookmarked ? "Hapus penanda" : "Tambahkan penanda"}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={isBookmarked ? "currentColor" : "none"}
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={`transition-colors ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
  >
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
</button>
