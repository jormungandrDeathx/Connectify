import { configureStore } from "@reduxjs/toolkit";
import cartSliceReducer from "./cartSlice";
import friendSliceReducer from "./friendSlice";
import wishListsReducer from "./wishListsSlice";
import notificationSliceReducer from "./notificationSlice";
import chatSliceReducer from "./chatSlice";
import presenceSliceReducer from "./presenceSlice";

export const store = configureStore({
  reducer: {
    cart: cartSliceReducer,
    wishLists: wishListsReducer,
    notifications: notificationSliceReducer,
    friends: friendSliceReducer,
    chat: chatSliceReducer,
    presence: presenceSliceReducer,
  },
});
