import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../services/axiosInstance';
import { Chat, Message } from '../types/chat.types';

export const getChats = createAsyncThunk<Chat[], void>(
  'chat/getChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<Chat[]>('/messages/chats', {
        withCredentials: true
      });
      console.log('Chats response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in getChats:', error);
      return rejectWithValue(error.response?.data || 'Ошибка при получении чатов');
    }
  }
);

export const getChatMessages = createAsyncThunk<Message[], number>(
  'chat/getChatMessages',
  async (userId) => {
    const response = await axios.get<Message[]>(`/messages/${userId}`);
    return response.data;
  }
);

export const getMessages = createAsyncThunk<Message[], void>(
  'chat/getMessages',
  async () => {
    const response = await axios.get<Message[]>('/messages');
    return response.data;
  }
); 