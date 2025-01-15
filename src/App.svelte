<script lang="ts">
  import type { AsyncKeyValueFileSystem } from "browserfs/dist/node/generic/key_value_filesystem";
  import { Bot } from "grammy";

  interface Message {
    from: {
      first_name: string;
    };
    date: number;
    text: string;
    sent_by_me?: boolean;
    notification?: boolean; // Add notification flag
  }

  interface Messages {
    [key: string]: Message[];
  }

  interface Chat {
    id: string;
    name: string;
    unread?: number;
    hasNotification?: boolean; // Add notification flag for chat
  }

  interface BotData {
    messages: Messages;
    chats: Chat[];
    currentChat: string;
  }

  interface BotInfo {
    id: number;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
  }
  const getTokenPrompt = () => {
    const token = prompt("Enter your bot token:");
    localStorage.setItem("token", token);
    return token;
  };

  let token = $state(localStorage.getItem("token") || getTokenPrompt());
  let showSettings = $state(false);
  let showScrollButton = $state(false);
  let botInfo = $state<BotInfo | null>(null);

  const bot = new Bot(token);

  const getBotData = (token: string): BotData => {
    const data = localStorage.getItem(`bot_${token}`);
    return data
      ? JSON.parse(data)
      : { messages: {}, chats: [], currentChat: "" };
  };

  const saveBotData = () => {
    const data: BotData = {
      messages,
      chats,
      currentChat,
    };
    localStorage.setItem(`bot_${token}`, JSON.stringify(data));
  };

  const fetchBotInfo = async () => {
    try {
      botInfo = await bot.api.getMe();
      document.title = botInfo?.first_name + " - Bottelegram" || "Bottelegram";
    } catch (error) {
      console.error("Error fetching bot info:", error);
    }
  };

  const botData = getBotData(token);
  let messages = $state(botData.messages);
  let chats = $state<Chat[]>(botData.chats);
  let context = $state();
  let messageText = $state("");
  let currentChat = $state(botData.currentChat);
  let messagesContainer: HTMLDivElement;

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  $effect(() => {
    fetchBotInfo();

    bot.command("start", (ctx) =>
      ctx.reply(`Welcome! This bot is powered by 
      https://bottelegram.web.app

    Channel: @contentdownload

    Group: @contentdownload_group`)
    );

    bot.on("message", async (ctx) => {
      context = ctx;
      localStorage.setItem("context", JSON.stringify(ctx));
      let message = {
        ...ctx.message,
        notification: true, // Mark message as notification
      };
      const chatId = ctx.chat.id.toString();
      const chatName = ctx.chat.title || ctx.chat.first_name || chatId;

      if (!messages[chatId]) {
        messages[chatId] = [];
      }
      messages[chatId] = [...messages[chatId], message];
      saveBotData();

      const existingChat = chats.find((chat) => chat.id === chatId);
      if (!existingChat) {
        chats = [
          ...chats,
          {
            id: chatId,
            name: chatName,
            unread: chatId !== currentChat ? 1 : 0,
            hasNotification: chatId !== currentChat, // Add notification flag
          },
        ];
      } else if (chatId !== currentChat) {
        chats = chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, unread: (chat.unread || 0) + 1, hasNotification: true }
            : chat
        );
      }
      saveBotData();

      if (!currentChat) {
        currentChat = chatId;
        saveBotData();
      }

      if (chatId !== currentChat) {
        showNotification(chatName, message.text || "");
      }
    });

    bot.start();

    return () => {
      bot.stop();
    };
  });

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const myMessage = {
      from: { first_name: "You" },
      date: Math.floor(Date.now() / 1000),
      text: messageText,
      sent_by_me: true,
      notification: false,
    };

    if (!messages[currentChat]) {
      messages[currentChat] = [];
    }
    messages[currentChat] = [...messages[currentChat], myMessage];
    saveBotData();

    bot.api.sendMessage(currentChat, messageText);
    messageText = "";
    scrollToBottom();
  };

  const updateToken = () => {
    localStorage.setItem("token", token);
    window.location.reload();
  };

  const clearData = () => {
    localStorage.removeItem(`bot_${token}`);
    messages = {};
    chats = [];
    currentChat = "";
  };

  const selectChat = (chatId: string) => {
    currentChat = chatId;
    chats = chats.map((chat) =>
      chat.id === chatId ? { ...chat, unread: 0, hasNotification: false } : chat
    );
    saveBotData();
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleScroll = () => {
    if (!messagesContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    showScrollButton = scrollHeight - scrollTop - clientHeight > 100;
  };

  const scrollToBottom = () => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  let showSidebar = $state(window.innerWidth > 768);

  const toggleSidebar = () => {
    showSidebar = !showSidebar;
  };
</script>

<div class="flex flex-col h-screen max-h-screen max-w-screen overflow-hidden">
  <div class="flex justify-between items-center p-4 bg-white border-b">
    <div class="flex items-center gap-2">
      <button
        class="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        onclick={toggleSidebar}
        aria-label="Toggle sidebar"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <h1 class="text-lg font-medium">{botInfo?.first_name}</h1>
    </div>
    <button
      class="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
      onclick={() => (showSettings = !showSettings)}
    >
      Settings
    </button>
  </div>

  {#if showSettings}
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
          bind:value={token}
        />
        <button
          class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onclick={() => updateToken()}
        >
          Update Token
        </button>
        <button
          class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          onclick={() => clearData()}
        >
          Clear Data
        </button>
      </div>
    </div>
  {/if}

  <div class="flex flex-1 overflow-hidden">
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
              showSidebar = false;
            }
          }}
        >
          <div class="flex justify-between items-center">
            <span class="font-medium truncate">{chat.name}</span>
            {#if chat.unread}
              <span
                class="bg-green-500 text-white text-xs px-2 py-1 rounded-full"
              >
                {chat.unread}
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div
      class="flex-1 flex flex-col min-h-0 max-w-full md:max-w-[calc(100vw-16rem)]"
    >
      <div
        class="flex-1 overflow-y-auto p-4 bg-gray-100 relative"
        bind:this={messagesContainer}
        onscroll={handleScroll}
      >
        {#each messages[currentChat] || [] as message}
          <div
            class="mb-4 {message.sent_by_me ? 'ml-auto' : ''}"
            style="max-width: 70%"
          >
            <div
              class="flex items-center mb-1 {message.sent_by_me
                ? 'justify-end'
                : ''}"
            >
              <span
                class="font-bold {message.sent_by_me
                  ? 'text-blue-600'
                  : 'text-green-600'}">{message.from.first_name}</span
              >
              <span class="text-gray-500 text-sm ml-2">
                {new Date(message.date * 1000).toLocaleTimeString()}
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
            class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            onclick={() => sendMessage()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
