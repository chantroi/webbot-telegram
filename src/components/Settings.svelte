<script lang="ts">
  import type { BotInfo } from "../types/types";

  let {
    botInfo,
    token,
    clearData,
  }: {
    botInfo: BotInfo | null;
    token: string;
    clearData: () => void;
  } = $props();

  let newToken = $state(token);

  const updateToken = () => {
    localStorage.setItem("token", newToken);
    window.location.reload();
  };
</script>

<div class="p-4 bg-white border-b">
  <div class="mb-4">
    {#if botInfo}
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h2 class="text-lg font-semibold mb-2">Bot Information</h2>
        <p><strong>ID:</strong> {botInfo.id}</p>
        <p><strong>Name:</strong> {botInfo.first_name}</p>
        <p><strong>Username:</strong> @{botInfo.username}</p>
        <p>
          <strong>Can Join Groups:</strong>
          {botInfo.can_join_groups ? "Yes" : "No"}
        </p>
        <p>
          <strong>Can Read Group Messages:</strong>
          {botInfo.can_read_all_group_messages ? "Yes" : "No"}
        </p>
      </div>
    {/if}
  </div>
  <div class="flex gap-2">
    <input
      class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
      type="text"
      placeholder="Enter new bot token..."
      bind:value={newToken}
    />
    <button
      class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      onclick={updateToken}
    >
      Update Token
    </button>
    <button
      class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
      onclick={clearData}
    >
      Clear Data
    </button>
  </div>
</div>
