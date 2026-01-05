import { Activity, useEffect, useRef, useState } from "react";
import hamburger from "/src/assets/hamburger.png";
import { getWebSocketURL } from "../utils/ws";
import Home from "/src/Pages/Home";
import FriendList from "/src/Pages/FriendList";
import EditProfile from "/src/Pages/EditProfile";
import Post from "/src/Pages/Post";
import AddFriends from "/src/Pages/AddFriends";
import Products from "/src/Pages/Products";
import Cart from "/src/Pages/Cart";
import { useLogout } from "../hooks/useLogout";
import { MdOutlineLogout } from "react-icons/md";
import { TbArrowBarDown } from "react-icons/tb";
import { PiBellBold } from "react-icons/pi";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PiPlusCircleBold } from "react-icons/pi";
import {
  setReceived,
  setSent,
  addSent,
  removeReceived,
  removeSent,
  addReceived,
} from "../Store/notificationSlice";
import { setFriends, addFriends, removeFriends } from "../Store/friendSlice";
import { addUnread } from "../Store/chatSlice";
import NewPost from "../Pages/NewPost";
import axios from "axios";
import ViewProduct from "./ViewProduct";
import About from "../Pages/About";
import ContatcUs from "../Pages/ContatcUs";
import PageNotFound from "../Pages/PageNotFound";
import { setUnread, addLastLine } from "../Store/chatSlice";
import { updatePresence } from "../Store/presenceSlice";
import { presenceSocketRef } from "../utils/presenceSocket";
import ConfirmationBox from "./ConfirmationBox";
import AlertBox from "./AlertBox";
import { decryptMessage } from "../utils/crypto";

function Navbar() {
  const navTitles = [
    "Home",
    "Friends",
    "EditProfile",
    "Posts",
    "People",
    "Products",
    "Cart",
  ];
  const navPaths = [
    "home",
    "friendList",
    "editProfile",
    "post",
    "addFriends",
    "products",
    "cart",
  ];
  const componentMap = {
    home: Home,
    friendList: FriendList,
    editProfile: EditProfile,
    post: Post,
    addFriends: AddFriends,
    products: Products,
    cart: Cart,
  };

  // const [user, setUser] = useState({ name: null, profile: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [bio, setBio] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoutCase, setLogoutcase] = useState(false)
  // const [userData, setUserData] = useState([]);
  // const [receivedFriends, setReceivedFriends] = useState(null);
  const [isReceivedFriends, setIsReceivedFreinds] = useState(false);
const [alert, setAlert] = useState(null)

  let dispatch = useDispatch();
  let frCount = useSelector((state) => state.notifications.unreadCount);
  let receivedFriends = useSelector((state) => state.notifications.received);

  let cartProducts = useSelector((state) => {
    return state.cart;
  });
  let totalUnread = useSelector((state) => state.chat.totalUnread);
  let activePeerId = useSelector((state) => state.chat.activePeerId);
  let unreadByUser = useSelector((state) => state.chat.unreadByUser);
  let friendList = useSelector((state) => state.friends);


  const unreadNotifications = friendList?.filter((i) => i.id in unreadByUser);

  const navigate = useNavigate();
  let heartBeatRef = useRef();
  const logout = useLogout();
  // const token = localStorage.getItem("connectify_token");

  async function fetchProfile() {
    try {
      const response = await axios.get("profile/");
      setBio(response.data);
    } catch (e) {
      console.error("Error while fetching profile", e);
    }
  }

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await axios.get("chat/unread/");

        dispatch(setUnread(res.data));
      } catch (e) {
        console.error(e.response);
      }
    }
    fetchUnread();
  }, []);

  useEffect(() => {
    async function initialLoad() {
      const token = localStorage.getItem("connectify_token")
      try {
        const [received, sent, friends] = await Promise.all([
          axios.get("friends/received/",),
          axios.get("friends/sent/",),
          axios.get("friends/list/",),
        ]);

        dispatch(setReceived(received.data.results));
        

        dispatch(setSent(sent.data.results));

        dispatch(setFriends(friends.data.results));
      } catch (e) {
        console.error(e);
      }
    }
    initialLoad();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("connectify_token");

    if (!token) return;

    const socket = new WebSocket(
      getWebSocketURL(`/ws/friendRequestNotification/?token=${token}`)
    );

    socket.onopen = () => {
      console.log("FR WS CONNECTED");
    };

    socket.onclose = () => {
      console.log("FR WS DISCONNECTED");
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case "friendRequest":
          dispatch(addReceived(data.data));
          break;

        case "sentRequest":
          dispatch(addSent(data.data));
          break;

        case "friendRequestUpdate":
          if (data.action === "accepted") {
            dispatch(addFriends(data.friend));
            dispatch(removeReceived(data.request_id));
            dispatch(removeSent(data.request_id));
          }

          if (data.action === "declined") {
            dispatch(removeReceived(data.request_id));
            dispatch(removeSent(data.request_id));
          }

          if (data.action === "removed") {
            dispatch(removeFriends(data.friend_id));
          }

          break;

        default:
          console.warn("Unkown WS Event", data);
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("connectify_token");
    if (!token) return;

    const ws = new WebSocket(
      getWebSocketURL(`/ws/chat/global/?token=${token}`)
    );

    ws.onopen = () => {
      console.log("Global WS CONNECTED");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      dispatch(addLastLine({...data, message:decryptMessage(data.message)}));

      if (activePeerId !== data.sender) {
        dispatch(addUnread(data.sender));
      }
    };

    ws.onerror = (e) => {
      console.error("GLOBAL WS ERROR: ", e);
    };

    ws.onclose = () => {
      console.log("GLOBAL WS CLOSED");
    };

    return () => ws.close();
  }, [activePeerId]);

  useEffect(() => {
    const token = localStorage.getItem("connectify_token");
    if (!token) return;

    const ws = new WebSocket(getWebSocketURL(`/ws/presence/?token=${token}`));

    presenceSocketRef.current = ws;

    ws.onopen = () => {
      console.log("PWS CONNECTED");

      heartBeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {

          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 20000);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "online_users") {
        data.data.forEach((user) => {
          dispatch(updatePresence(user));
        });
      }

      if (data.type === "presence_update") {
        dispatch(updatePresence(data.data));
      }
    };

    ws.onerror = (e) => {
      console.error("PWS ERROR: ", e);
    };

    ws.onclose = () => {
      console.log("PWS CLOSED");
    };

    return () => {
      clearInterval(heartBeatRef.current);
      ws.close();
    };
  }, []);

  useEffect(() => {
    setIsReceivedFreinds(false);
  }, [receivedFriends.length > 0]);

  async function handleAcceptfriendrequest(requestId) {
    try {
      const res = await axios.post(`friends/accept/${requestId}/`);
      setAlert(res.data.results.message);
      // fetchReceivedRequests();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeclineFriendrequest(requestId) {
    try {
      const res = await axios.post(`friends/decline/${requestId}/`);
      setAlert(res.data.results.message);
      // fetchReceivedRequests();
    } catch (e) {
      console.error(e);
    }
  }

 

  useEffect(() => {
    fetchProfile();
    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  function handleNewPost() {
    navigate("/newPost");
  }

  function handleLogoutFalse() {
    setLogoutcase(false)
    setProfileMenu(false)
  }

  function alertFalse(){
    setAlert(null)
  }

  return (
    <div>
      <header className="flex justify-between p-5 bg-gray-700 text-white rounded-none  mx-auto items-center w-full shadow-2xl fixed top-0 left-0 right-0 z-90 select-none">
        <Activity mode={isReceivedFriends ? "visible" : "hidden"}>
          <div className="flex flex-col absolute w-80 top-20 left-0 rounded-br bg-[#F5F5F5]/90">
            {receivedFriends?.map((friend, index) => (
              <div
                key={index}
                className="flex gap-2.5 justify-between px-1 items-center py-2 border-b mx-1 border-gray-600 rounded-b"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    className="rounded-full w-10 h-10 object-cover "
                    src={friend.from_profile}
                    alt={friend.from_username}
                  />
                  <h1 className="text-gray-800 font-medium truncate">
                    {friend.from_username}
                  </h1>
                </div>
                <div className="flex gap-1 [&>button]:px-1 [&>button]:py-1 [&>button]:rounded [&>button]:text-xs [&>button]:font-medium [&>button]:hover:scale-110 [&>button]:transition">
                  <button
                    onClick={() => handleAcceptfriendrequest(friend.id)}
                    className="bg-green-600 "
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineFriendrequest(friend.id)}
                    className="bg-red-600 "
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Activity>
        <Activity mode={notificationOpen ? "visible" : "hidden"}>
          <div className={`flex flex-col gap-2  absolute  top-20 left-0 rounded-br bg-[#F5F5F5] w-80 p-2`}>
            {unreadNotifications?.length>0?unreadNotifications?.map((user) => (
              <div className="flex text-sm text-gray-800 items-center gap-2">
               <img src={user.profile_picture} alt=""
               className="w-10 h-10 rounded-full"/> <p className="truncate overflow-ellipsis">
                  <span>{unreadByUser[user.id]}{' '}</span>
                  unread message{unreadByUser[user.id]>1?"s ":" "}from{" "}

                  <span className="font-medium">{user.username}</span>
                </p>
              </div>
            )):(
              <span className="text-gray-400">Nothing new right now</span>
            )}
          </div>
        </Activity>
        <div className="relative flex items-center space-x-2.5">
          <div className="relative">
            <TbArrowBarDown
              title="Log out"
              className="absolute -left-3 top-3 text-gray-200 text-xl hover:text-gray-200 "
              onClick={() => {
                setNotificationOpen(false)
                setProfileMenu(!profileMenu);
                setIsReceivedFreinds(false);
              }}
            />
            <div className="">
              <img
                onClick={() => navigate("/post")}
                src={bio?.profile_picture}
                className="w-10 h-10 border border-gray-500 rounded-full p-0.5 ml-4 select-none"
                alt={bio?.first_name}
              />
            </div>
            <Activity mode={profileMenu ? "visible" : "hidden"}>
              <div className="absolute -left-5 mt-5 w-32 bg-white text-gray-700 shadow-lg overflow-hidden z-9999 rounded-b-md">
                <button
                  className="block w-full font-medium text-center px-4 py-2 hover:bg-gray-200 transition"
                  onClick={()=>setLogoutcase(true)}
                >
                  <MdOutlineLogout className="absolute left-4 text-gray-500 text-2xl" />
                  Logout
                </button>
              </div>
            </Activity>
          </div>
          <h1 className="text-lg font-bold px-1">{bio?.first_name}</h1>
          <div className="flex gap-3 items-center px-1 md:px-3">
            <div
              onClick={() =>{ setNotificationOpen(!notificationOpen)
                setIsReceivedFreinds(false)
              setProfileMenu(false)}
              }
              className="relative"
            >
              <PiBellBold
                title="notifications"
                className="text-gray-200 text-xl hover:text-white transition duration-300"
              />
              {totalUnread !== 0 && (
                <span className="absolute -left-1 -top-1.5 bg-red-500 text-xs px-1 font-medium rounded-full shadow ">
                  {totalUnread}
                </span>
              )}
            </div>
            <div
              onClick={() => {
                setNotificationOpen(false)
                setIsReceivedFreinds(!isReceivedFriends);
                setProfileMenu(false);
              }}
              className="relative"
            >
              <MdOutlinePersonAddAlt
                title="friend requests"
                className="text-2xl text-gray-200 hover:text-white transition duration-300"
              />
              <span className="absolute -left-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs">
                {frCount === 0 ? "" : frCount}
              </span>
            </div>
            <PiPlusCircleBold
              onClick={handleNewPost}
              title="new post"
              className="text-gray-200 text-xl hover:text-white transition duration-300"
            />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(!menuOpen);
          }}
          className="invert md:hidden"
        >
          <img src={hamburger} alt="Menu" />
        </button>
        <nav className="hidden  md:flex md:gap-x-3 lg:gap-x-6 text-center">
          {navPaths.map((path, index) => {
            return (
              <NavLink
                key={index}
                to={path}
                className={({ isActive }) =>
                  "relative w-fit rounded-2xl py-1.5 transition text-center px-1 lg:px-3 " +
                  (isActive
                    ? "text-white bg-blue-500"
                    : "text-gray-300 hover:text-white")
                }
              >
                {navTitles[index]}
                {path === "cart"
                  ? cartProducts.length > 0 && (
                      <span
                        key={index}
                        className="absolute -top-2 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex justify-center items-center"
                      >
                        {cartProducts.length}
                      </span>
                    )
                  : null}
              </NavLink>
            );
          })}
        </nav>

        <Activity mode={menuOpen ? "visible" : "hidden"}>
          <div className="absolute top-full right-0 w-[40%] bg-gray-400 text-white flex flex-col items-center z-9999 shadow-lg shadow-black rounded-b md:hidden">
            {navPaths.map((path, index) => {
              return (
                <Link
                  key={index}
                  to={path}
                  className="w-full py-3 text-center hover:bg-gray-800 transition border-b border-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  {navTitles[index]}
                  {path==="cart"?cartProducts?.length>0 && <span className="w-fit bg-red-500 text-xs rounded-full px-1.5 ml-1">{`${cartProducts.length}`}</span>:null}
                </Link>
              );
            })}
          </div>
        </Activity>
      </header>
      <Routes>
        {navPaths.map((path, index) => {
          const Component = componentMap[path];
          return (
            <Route key={index} path={`/${path}`} element={<Component />} />
          );
        })}
        <Route path="/newPost" element={<NewPost />} />
        <Route path="/products/:id" element={<ViewProduct />} />
        <Route path="/aboutUs" element={<About />} />
        <Route path="/contact" element={<ContatcUs />} />
        <Route path="*" element={<PageNotFound />}></Route>
      </Routes>
      {
        logoutCase && <ConfirmationBox title={"Are you sure?"} onConfirm={logout} onClose={handleLogoutFalse}/>
      }
      {
        alert && <AlertBox message={alert} onClose={alertFalse}/>
      }
    </div>
  );
}

export default Navbar;
