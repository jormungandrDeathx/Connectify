import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./Store/store.js";
import "./api/axiosSetup.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);

window.addEventListener("load",()=>{
  const loader = document.getElementById("preLoader")
  if(loader){
    loader.style.display = "none"
  }
})
