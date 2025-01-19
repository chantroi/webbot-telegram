<script lang="ts">
  import type { Chat } from "../types/types";

  let {
    chats,
    currentChat,
    selectChat,
    showSidebar,
    toggleSidebar,
  }: {
    chats: Chat[];
    currentChat: string;
    selectChat: (id: string) => void;
    showSidebar: boolean;
    toggleSidebar: () => void;
  } = $props();
</script>

<div
  class="{showSidebar
    ? 'block'
    : 'hidden'} md:block w-64 bg-gray-50 border-r overflow-y-auto absolute md:relative z-10"
>
  {#each chats as chat}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="p-3 cursor-pointer hover:bg-gray-100 {currentChat === chat.id
        ? 'bg-gray-200'
        : ''} {chat.hasNotification ? 'bg-yellow-50' : ''}"
      onclick={() => {
        selectChat(chat.id);
        if (window.innerWidth < 768) {
          toggleSidebar();
        }
      }}
    >
      <div class="flex justify-between items-center">
        <span class="font-medium truncate">{chat.name}</span>
        {#if chat.unread}
          <span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            {chat.unread}
          </span>
        {/if}
      </div>
    </div>
  {/each}
</div>
