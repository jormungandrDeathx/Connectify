import { resetUnread } from "../Store/chatSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { presenceSocketRef } from "../utils/presenceSocket";
import { clearPresence } from "../Store/presenceSlice";

export function useLogout() {
  
  let dispatch = useDispatch();
  let navigate = useNavigate();
  
  return function logout(){
    // if (!window.confirm("Are you sure")) return;
  try {
    if (
      presenceSocketRef.current &&
      presenceSocketRef.current.readyState === WebSocket.OPEN
    ) {
      presenceSocketRef.current.send(JSON.stringify({ type: "logout" }));
    }
  } catch (e) {
    console.warn("Logout WS failed");
  }

  dispatch(resetUnread());
  dispatch(clearPresence())
  localStorage.removeItem("connectify_token");
  localStorage.removeItem("connectify_refresh");
  localStorage.removeItem("connectify_user");
  navigate("/");
  window.location.reload();
  }
}
