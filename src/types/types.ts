export interface Message {
  from: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  date: number;
  text: string;
  sent_by_me?: boolean;
  notification?: boolean;
}

export interface Messages {
  [key: string]: Message[];
}

export interface Chat {
  id: string;
  name: string;
  unread?: number;
  hasNotification?: boolean;
}

export interface BotData {
  messages: Messages;
  chats: Chat[];
  currentChat: string;
}

export interface BotInfo {
  id: number;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
} 