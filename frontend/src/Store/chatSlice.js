import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

let dataFromWeb = JSON.parse(localStorage.getItem("lastLine")) || {};

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    activePeerId: null,
    unreadByUser: {},
    lastLine: dataFromWeb,
    totalUnread: 0,
  },
  reducers: {
    setActivePeerId(state, action) {
      state.activePeerId = action.payload;
    },
    clearActivePerrId(state) {
      state.activePeerId = null;
    },
    setUnread(state, action) {
      state.unreadByUser = action.payload.by_user;

      state.totalUnread = action.payload.total_unread;
    },
    addUnread(state, action) {
      const userId = action.payload;
      state.unreadByUser[userId] = (state.unreadByUser[userId] || 0) + 1;
      state.totalUnread += 1;
    },

    addLastLine(state, action) {
      const { sender, message } = action.payload;
      state.lastLine[sender] = {
        message,
      };
      localStorage.setItem("lastLine", JSON.stringify(state.lastLine));
    },
    resetLastLine(state) {
      state.lastLine = {};
    },
    clearUnread(state, action) {
      const userId = action.payload;
      state.totalUnread -= state.unreadByUser[userId] || 0;
      delete state.unreadByUser[userId];
    },
    resetUnread(state) {
      state.unreadByUser = {};
      state.totalUnread = 0;
    },
  },
});

export const {
  setActivePeerId,
  clearActivePerrId,
  setUnread,
  addUnread,
  addLastLine,
  resetLastLine,
  clearUnread,
  resetUnread,
} = chatSlice.actions;

export default chatSlice.reducer;
