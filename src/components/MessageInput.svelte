<script lang="ts">
  let {
    sendMessage,
  }: {
    sendMessage: (messageText: string) => void;
  } = $props();

  let messageText: string = $state("");

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(messageText);
      messageText = "";
    }
  };
</script>

<div class="p-4 bg-white border-t">
  <div class="flex gap-2">
    <input
      class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
      type="text"
      placeholder="Type a message..."
      bind:value={messageText}
      onkeypress={handleKeyPress}
    />
    <button
      class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
      onclick={() => {
        sendMessage(messageText);
        messageText = "";
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
        />
      </svg>
      Send
    </button>
  </div>
</div>
