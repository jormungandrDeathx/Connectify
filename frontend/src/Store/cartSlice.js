import { createSlice } from "@reduxjs/toolkit";

if (!localStorage.getItem("cart"))
  localStorage.setItem("cart", JSON.stringify([]));

let dataFromWeb = JSON.parse(localStorage.getItem("cart"));
const cartSlice = createSlice({
  name: "cart",
  initialState: dataFromWeb,
  reducers: {
    addItem(state, action) {
      const item = action.payload;
      const existing = state.find((i) => i.id === item.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.push({
          ...item,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(state));
    },
    removeItem(state, action) {
      const filtered = state.filter((item) => item.id !== action.payload);
      localStorage.setItem("cart", JSON.stringify(filtered));
      return filtered;
    },
    increaseQty(state, action) {
      const item = state.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
      localStorage.setItem("cart", JSON.stringify(state));
    },
    decreaseQty(state, action) {
      const item = state.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      localStorage.setItem("cart", JSON.stringify(state));
    },
  },
});

export default cartSlice.reducer;

export let { addItem, removeItem, increaseQty, decreaseQty } =
  cartSlice.actions;
