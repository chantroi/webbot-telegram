<script lang="ts">
  import type { Message } from "../types/types";

  let {
    messages,
    setContainer,
    showScrollButton,
    scrollToBottom,
    handleScroll,
  }: {
    messages: Message[];
    setContainer: (container: HTMLDivElement) => void;
    showScrollButton: boolean;
    scrollToBottom: () => void;
    handleScroll: () => void;
  } = $props();

  let messagesContainer: HTMLDivElement;

  $effect(() => {
    if (messagesContainer) {
      setContainer(messagesContainer);
    }
  });
</script>

<div
  class="flex-1 overflow-y-auto p-4 bg-gray-100 relative"
  bind:this={messagesContainer}
  onscroll={handleScroll}
>
  {#each messages as message}
    <div
      class="mb-4 {message.sent_by_me ? 'ml-auto' : ''}"
      style="max-width: 70%"
    >
      <div
        class="flex items-center mb-1 {message.sent_by_me ? 'justify-end' : ''}"
      >
        <span
          class="font-bold {message.sent_by_me
            ? 'text-blue-600'
            : 'text-green-600'}"
        >
          {message.from.first_name} {message.from.last_name || ""}
        </span>
        <span class="text-gray-500 text-sm ml-2">
          {new Date(message.date * 1000).toLocaleString()}
        </span>
      </div>
      <p
        class="p-3 rounded-lg shadow-sm break-words overflow-wrap-anywhere {message.sent_by_me
          ? 'bg-blue-100'
          : message.notification
            ? 'bg-yellow-50'
            : 'bg-white'}"
      >
        {message.text}
      </p>
    </div>
  {/each}

  {#if showScrollButton}
    <button
      class="fixed bottom-24 right-8 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
      onclick={scrollToBottom}
      aria-label="Scroll to bottom"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </button>
  {/if}
</div>
