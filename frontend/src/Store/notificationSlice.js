import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    received: [],
    sent: [],
    unreadCount: 0,
  },
  reducers: {
    setReceived(state, action) {
      state.received = action.payload;
      state.unreadCount = action.payload.length;
    },
    setSent(state, action) {
      state.sent = action.payload;
    },
    addReceived(state, action) {
      state.received.unshift(action.payload);
      state.unreadCount += 1;
    },
    removeReceived(state, action) {
      state.received = state.received.filter(
        (req) => req.id !== action.payload
      );
      state.unreadCount = state.received.length
    },
    addSent(state, action) {
      state.sent.unshift(action.payload);
    },
    removeSent(state, action) {
      state.sent = state.sent.filter((r) => r.id !== action.payload);
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
  },
});

export let {
  setReceived,
  setSent,
  addReceived,
  removeReceived,
  addSent,
  removeSent,
  clearUnread,
} = notificationSlice.actions;

export default notificationSlice.reducer;
