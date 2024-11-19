import { createSlice } from '@reduxjs/toolkit';
import { getMessages } from '../chatThunks';
import { ChatState } from '../../types/chat.types';

const initialState: ChatState = {
  messages: [],
  status: 'idle',
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;