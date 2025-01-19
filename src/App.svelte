<script lang="ts">
  import { Bot } from "grammy";
  import type {
    Message,
    Messages,
    Chat,
    BotInfo,
    BotData,
  } from "./types/types";

  import {
    getTokenPrompt,
    getBotData,
    showNotification,
  } from "./utils/botUtils";

  import Header from "./components/Header.svelte";
  import Settings from "./components/Settings.svelte";
  import ChatList from "./components/ChatList.svelte";
  import MessageList from "./components/MessageList.svelte";
  import MessageInput from "./components/MessageInput.svelte";

  let token = $state(localStorage.getItem("token") || getTokenPrompt());
  let showSettings = $state(false);
  let showScrollButton = $state(false);
  let botInfo = $state<BotInfo | null>(null);
  let showSidebar = $state(window.innerWidth > 768);

  const bot = new Bot(token);

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
  let currentChat = $state(botData.currentChat);
  let messagesContainer: HTMLDivElement | null = $state();

  $effect(() => {
    fetchBotInfo();

    bot.command("start", (ctx) =>
      ctx.reply(`Welcome! This bot is powered by 
      https://bottelegram.web.app

    Channel: @contentdownload

    Group: @contentdownload_group`)
    );

    bot.on("message", async (ctx) => {
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

  const sendMessage = (messageText: string) => {
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

  const toggleSidebar = () => {
    showSidebar = !showSidebar;
  };

  const toggleSettings = () => {
    showSettings = !showSettings;
  };
</script>

<div class="flex flex-col h-screen max-h-screen max-w-screen overflow-hidden">
  <Header {botInfo} {toggleSettings} {toggleSidebar} />

  {#if showSettings}
    <Settings {botInfo} {token} {clearData} />
  {/if}

  <div class="flex flex-1 overflow-hidden">
    <ChatList
      {chats}
      {currentChat}
      {selectChat}
      {showSidebar}
      toggleSidebar={() => (showSidebar = !showSidebar)}
    />

    <div
      class="flex-1 flex flex-col min-h-0 max-w-full md:max-w-[calc(100vw-16rem)]"
    >
      <MessageList
        messages={messages[currentChat] || []}
        setContainer={(container: HTMLDivElement) => {
          messagesContainer = container;
        }}
        {showScrollButton}
        {scrollToBottom}
        {handleScroll}
      />
      <MessageInput {sendMessage} />
    </div>
  </div>
</div>
