export interface Message {
  id: number;
  content: string;
  sender_id: number;
  createdAt: string;
  isFromCurrentUser?: boolean;
  sender?: {
    id: number;
    name: string;
    surname: string;
    avatar: string | null;
  };
}

export interface Chat {
  id: number;
  user_id: number;
  name: string;
  surname: string;
  avatar: string | null;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ChatState {
  messages: Message[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
} 