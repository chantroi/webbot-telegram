<script lang="ts">
  import type { BotInfo } from "../types/types";
  import { Menu, Settings2 } from "lucide-svelte";

  let {
    botInfo,
    toggleSettings,
    toggleSidebar,

  }: {
    botInfo: BotInfo | null;
    toggleSettings: () => void;
    toggleSidebar: () => void;
  } = $props();
</script>

<div class="flex justify-between items-center p-4 bg-white border-b">
  <div class="flex items-center gap-2">
    <button
      class="md:hidden p-2 hover:bg-gray-100 rounded-lg"
      onclick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu class="h-6 w-6" />
    </button>
    <h1 class="text-lg font-medium">{botInfo?.first_name}</h1>
  </div>

  <div class="flex items-center gap-4">
    <a
      href="https://t.me/contentdownload_group"
      target="_blank"
      rel="noopener noreferrer"
      class="text-blue-500 hover:text-blue-600"
      title="Join Telegram Group"
    >
      <img src="https://web.telegram.org/favicon.ico" class="h-6 w-6" alt="Telegram" />
    </a>
    <button
      class="p-2 hover:bg-gray-100 rounded-lg"
      onclick={toggleSettings}
      title="Settings"
    >
      <Settings2 class="h-6 w-6" />
    </button>
  </div>
</div>
