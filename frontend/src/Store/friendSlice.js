import { createSlice } from "@reduxjs/toolkit";

let friendSlice = createSlice({
  name: "friends",
  initialState: [],
  reducers: {
    setFriends(state, action) {
      return action.payload;
    },

    addFriends(state, action) {
      state.unshift(action.payload);
    },
    removeFriends(state, action) {
      return state.filter((friend) => friend.id!== action.payload);
    },
  },
});

export default friendSlice.reducer;

export let {setFriends, addFriends, removeFriends } = friendSlice.actions;
