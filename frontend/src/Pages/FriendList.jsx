import { useState, useEffect, Activity, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Footer from "../Components/Footer";
import Loading from "../Components/Loading";
import { GoTrash } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { MdClear } from "react-icons/md";
import Friends from "/src/assets/Friends.png";
import axios from "axios";
import ConfirmationBox from "../Components/ConfirmationBox";
import AlertBox from "../Components/AlertBox"
import { RiSearchLine } from "react-icons/ri";
import { TbSend } from "react-icons/tb";
import { TbSendOff } from "react-icons/tb";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import { MdPersonSearch } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setFriends, removeFriends } from "../Store/friendSlice";
import {
  clearUnread,
  addUnread,
  setActivePeerId,
  resetLastLine,
  clearActivePerrId,
} from "../Store/chatSlice";

import { updatePresence } from "../Store/presenceSlice";

import { encryptMessage, decryptMessage } from "../utils/crypto";
import { getWebSocketURL } from "../utils/ws";

function FriendList() {
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [isScrolled, setScrolled] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chats, setChats] = useState(false);
  const [chatList, setChatList] = useState(true);
  const [chatBio, setChatBio] = useState(null);
  const [message, setMessage] = useState("");
  const [peerId, setPeerId] = useState(null);
  const [socket, setSocket] = useState(null);
  const eomRef = useRef();
  const inputRef = useRef();
  const searchRef = useRef();
  const chatSearchRef = useRef()
  const [search, setSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);
  let navigate = useNavigate();
  let dispatch = useDispatch();
  const [mobileRemoveFriend,setMobileRemoveFriend] = useState(false)
  const [alert, setAlert] = useState(null)

  const friendList = useSelector((state) => state.friends);

  const unreadByUser = useSelector((state) => state.chat.unreadByUser);
  const activePeerId = useSelector((state) => state.chat.activePeerId);
  const chatLastLine = useSelector((state) => state.chat.lastLine);
  const presence = useSelector((state) => state.presence);

  const peerPresence = chatBio ? presence[chatBio.id] : null;

  useEffect(() => {
    if (friendList && friendList.length > 0) {
      setEmpty(false);
    } else if (friendList && friendList.length === 0) {
      setEmpty(true);
    }
  }, [friendList]);

  function formatDate(dateStr) {
    const messageDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-us", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  function formatLastSeen(dateStr) {
    if (!dateStr) return "offline";

    const date = new Date(dateStr);
    const now = new Date();

    const diffMS = now - date;
    const diffSec = Math.floor(diffMS / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 10) return "last seen just now";
    if (diffMin < 1) return "last seen moments ago";

    if (diffMin < 60)
      return `last seen ${diffMin} minutes${diffMin > 1 ? "s" : ""} ago`;

    if (diffHr < 24)
      return `last seen today at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    if (checkDate.getTime() === yesterday.getTime())
      return `last seen yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;

    if (date.getFullYear() === now.getFullYear())
      return `last seen at ${date.toLocaleDateString("en-us", {
        hour: "numeric",
        minute: "2-digit",
      })}`;

    return `last seen at ${date.toLocaleDateString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  function groupMessagesByDate(msgs) {
    if (!msgs) return {};
    return msgs.reduce((groups, message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  }

  const groupedMessages = groupMessagesByDate(chatHistory);

  function scrollToBottom() {
    eomRef.current?.scrollIntoView({ behaviour: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    async function friendsList() {
      setLoading(true);
      try {
        const res = await axios.get("friends/list/");

        dispatch(setFriends(res.data.results));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    friendsList();
  }, []);

  const filteredList = friendList?.filter((i) => {
    return search.trim().toLowerCase() === ""
      ? i
      : i.username.toLowerCase().includes(search.toLowerCase());
  });

  const chatFilteredList = friendList?.filter((i) => {
    return chatSearch.trim().toLowerCase() === ""
      ? i
      : i?.username.toLowerCase().includes(chatSearch.toLowerCase());
  });

  useEffect(() => {
    // dispatch(clearActivePerrId())

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleRemoveFriend(user) {
    setConfirmUser(user);
  }

  async function confrimRemove() {
    try {
      const res = await axios.delete(`friends/remove/${confirmUser.id}/`);


      setAlert("successfully removed!");
      dispatch(removeFriends(confirmUser.id));
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmUser(null);
    }
  }

  async function cancelRemove() {
    setConfirmUser(null);
    setMobileRemoveFriend(false)
  }

  async function handleOnline(userId) {
    try {
      const res = await axios.get(`chat/isOnline/${userId}/`);
      dispatch(updatePresence(res.data));
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (!peerId) return;

    const token = localStorage.getItem("connectify_token");
    const newSocket = new WebSocket(
      getWebSocketURL(`/ws/chat/?token=${token}&peer=${peerId}`)
    );

    newSocket.onopen = () => {
      console.log("Websocket Connected");
    };

    newSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const decrypted = {
        ...data, message:decryptMessage(data.message)
      }


      setChatHistory((prev) => [...prev, decrypted]);
      // setChatLastLine(data.message);
      if (!chats && activePeerId !== data.sender) {
        dispatch(addUnread(data.sender));
      }
    };

    newSocket.onerror = (e) => {
      console.error("WebsocketError: ", e);
    };

    newSocket.onclose = (e) => {
      dispatch(clearActivePerrId());
      console.log("Websocket Closed");
    };

    setSocket(newSocket);

    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [peerId]);

  function sendMessage(message) {
    if (!socket || !message.trim()) return;
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ message: encryptMessage(message) }));
      setMessage("");
    } else {
      console.log("socket is not ready", socket.readyState);
      setAlert("please wait");
    }
  }

  async function handleChatHistory(peerId) {
    setChatLoading(true);
    try {
      const res = await axios.get(`chat/history/${peerId}/`);
      
      const decrypted = res?.data.map((i)=>({
        ...i,message:decryptMessage(i.message)
      }))
      
      
      setChatHistory(decrypted)
    } catch (e) {
      console.error("Error", e);
    } finally {
      setChatLoading(false);
    }
  }

function alertFalse(){
  setAlert(null)
}

  if (loading) {
    return <Loading />;
  }

  if (empty) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-b from-pink-700 via-blue-700  to-blue-900">
        
        <div className="flex justify-center items-center grow mt-22 mb-14 ">
          <div className="bg-[#F5F5F5] flex flex-col gap-6 justify-center items-center p-5  md:mt-10 rounded-2xl mx-10 px-2">
            <img src={Friends} className="w-30 h-30 sm:w-50 sm:h-50 " alt="" />
            <h1 className="text-2xl font-semibold text-center">
              Looks like your friend list is feeling lonely
            </h1>
            <p className="text-sm text-center text-gray-600 px-4">
              Go make some connections!
            </p>
            <button
              onClick={() => navigate("/addFriends")}
              className="bg-orange-600 md:w-[30%] w-[50%] rounded-lg text-white p-2 hover:bg-orange-700"
            >
              Add friends
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="flex flex-col md:bg-linear-to-b from-pink-700 via-blue-700  to-blue-900 min-h-screen ">
      {/* <div className="hidden  md:flex items-center "> */}
      {
          alert && <AlertBox message={alert} onClose={alertFalse}/>
        }

      {empty ? (
        <></>
      ) : (
        <div className="overflow-auto [&::-webkit-scrollbar]:hidden scroll-smooth md:fixed md:top-30 md:right-0 bottom-30  md:max-w-[25%] w-full mt-20 md:mt-0 h-[calc(100vh-80px)] md:h-auto bg-[#F5F5F5] md:rounded-l-2xl">
          <Activity mode={chatList ? "visible" : "hidden"}>
            <div className="relative">
              <div className="sticky top-0 border-b bg-gray-300 border-gray-300  py-2 z-10 rounded-b-lg">
                <div className="flex justify-center items-center">
                  <RiSearchLine className="absolute left-4 text-xl" />
                  <input
                    type="text"
                    onChange={(e) => setChatSearch(e.target.value)}
                    ref={chatSearchRef}
                    placeholder="Search"
                    className="w-[80%] py-1  outline-none px-5 text-gray-500 focus:text-black"
                  />
                  <MdClear className="absolute right-4 text-xl" />
                </div>
              </div>
              <div className="sticky ">
                {chatFilteredList?.length !== 0 ? (
                  chatFilteredList?.map((user) => {
                    // const userPresence = presence[user.id];

                    return (
                      <div
                        onClick={() => {
                          handleChatHistory(user.id);
                          setChats(true);
                          setChatList(!chatList);
                          setChatBio(user);
                          setPeerId(user.id);
                          handleOnline(user.id);
                          dispatch(setActivePeerId(user.id));
                          dispatch(clearUnread(user.id));
                          // setInChat(true);
                        }}
                        key={user.id}
                        className="flex gap-3 p-3 even:bg-gray-200/50"
                      >
                        <img
                          src={user.profile_picture}
                          alt=""
                          className="rounded-full w-15 h-15 object-cover"
                        />
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                          <h1 className="text-gray-600 font-medium text-sm md:text-xs lg:text-sm truncate select-none">
                            {user.username}
                          </h1>
                          <div className="flex gap-2">
                            {unreadByUser[user.id] && (
                              <span className="bg-red-600 rounded-full text-xs text-white px-1 font-medium">
                                {unreadByUser[user.id]}
                              </span>
                            )}
                            <span
                              className={`text-xs  truncate ${
                                unreadByUser[user.id]
                                  ? "text-gray-800 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              {chatLastLine[user.id]?.message ||
                                "Click to Chat"}
                            </span>
                          </div>
                        </div>

                        <IoChatbubbleEllipsesOutline className="self-center text-xl md:text-lg lg:text-xl text-gray-800 " />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col justify-center items-center py-5">
                    <MdPersonSearch className="text-7xl text-gray-800" />
                    <span>No results found</span>
                    <button
                      onClick={() => {
                        setChatSearch("");
                        chatSearchRef.current.value = "";
                      }}
                      className="bg-orange-500 px-2 py-1 rounded my-1"
                    >
                      clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Activity>
          <Activity mode={chats ? "visible" : "hidden"}>
            <div className="relative h-full flex flex-col">
              <div className="flex  items-center gap-2 p-2 md:rounded-tl-2xl bg-gray-300">
                <button
                  onClick={() => {
                    setChats(!chats);
                    setChatList(!chatList);
                    dispatch(clearActivePerrId());
                    // setInChat(false);
                  }}
                  className="hover:bg-gray-500 hover:text-white rounded-full p-2 transition"
                >
                  <IoMdArrowRoundBack className="text-2xl" />
                </button>
                <img
                  src={chatBio?.profile_picture}
                  alt=""
                  className="w-10 h-10 rounded-full shrink-0"
                />
                <div className="h-10 flex flex-col flex-1 min-w-0">
                  <p className="font-medium text-gray-900 mt-1 truncate">
                    {chatBio?.username}
                  </p>
                  <span
                    className={`block text-xs italic truncate ${
                      peerPresence?.is_online
                        ? "text-green-600 font-bold"
                        : "text-gray-600"
                    }`}
                  >
                    {peerPresence?.is_online
                      ? "online"
                      : formatLastSeen(peerPresence?.last_seen)}
                  </span>
                </div>
                <div onClick={()=>setMobileRemoveFriend(!mobileRemoveFriend)} className="flex justify-end md:hidden">
                  <HiDotsVertical className="text-gray-800" />
                </div>
              </div>
              {mobileRemoveFriend &&

              <div onClick={()=>handleRemoveFriend(chatBio)} className="absolute md:hidden top-14 right-0 px-2 bg-gray-500 text-gray-100 hover:cursor-pointer">
                remove

              </div>
              }

              <div
                className={`flex-1 overflow-auto px-2  [&::-webkit-scrollbar]:hidden scroll-smooth justify-center  ${
                  chatLoading ? "h-full" : ""
                }`}
              >
                {chatLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-15 h-15 border-b-2 rounded-full animate-spin border-pink-700"></div>
                  </div>
                ) : (
                  Object.entries(groupedMessages)?.map(([date, messages]) => (
                    <div key={date}>
                      <div className="flex justify-center my-4">
                        <span className="text-xs font-thin text-gray-900 px-2 py-1 bg-gray-600/20 rounded-lg ">
                          {formatDate(messages[0].createdAt)}
                        </span>
                      </div>
                      {messages?.map((message) => {
                        const isReceived = message.sender === chatBio?.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex mb-5 ${
                              isReceived ? "justify-start" : "justify-end"
                            }`}
                          >
                            <div
                              className={`flex w-full  flex-col ${
                                isReceived ? "" : "items-end"
                              }`}
                            >
                              <p
                                className={`py-1 px-2  mx-1 rounded-b w-fit max-w-[75%] wrap-break-word ${
                                  isReceived
                                    ? "bg-gray-400/80 rounded-tr-lg"
                                    : "bg-green-400 rounded-tl-lg"
                                }`}
                              >
                                {message.message}
                              </p>
                              <span ref={eomRef}></span>

                              <span
                                className={`text-xs font-thin mx-2 ${
                                  !isReceived ? "text-end" : ""
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleString(
                                  "en-us",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
              <div className="bg-gray-300 sticky bottom-0 flex items-center justify-between px-3  w-full md:rounded-bl-2xl py-1 ">
                <input
                  onChange={(e) => setMessage(e.target.value)}
                  ref={inputRef}
                  type="text"
                  placeholder="Message"
                  className="w-full outline-0 text-gray-600 focus:text-black pr-3 py-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (message?.trim() !== "") {
                        sendMessage(message);
                        inputRef.current.value = "";
                      }
                    }
                  }}
                />
                <button
                  disabled={message?.trim() === ""}
                  onClick={() => {
                    sendMessage(message);
                    inputRef.current.value = "";
                  }}
                >
                  {message?.trim() !== "" ? (
                    <TbSend className="text-xl" />
                  ) : (
                    <TbSendOff className="text-xl" />
                  )}
                </button>
              </div>
            </div>
          </Activity>
        </div>
      )}
      {/* </div> */}
      {confirmUser && (
        <ConfirmationBox
          title={`Remove ${confirmUser.username} from friendlist?`}
          message={
            "This will remove them from your friend list and you won't see their updates."
          }
          onConfirm={confrimRemove}
          onClose={cancelRemove}
        />
      )}
      <div className=" flex flex-1 md:items-center justify-center w-full md:max-w-[75%] md:p-4 md:pt-50  md:pb-15">
        <div className="hidden md:block fixed  top-2 mt-28 w-full max-w-[50%] z-9 px-2 md:px-0">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 z-50" />
          <input
            type="text"
            placeholder="Search here"
            ref={searchRef}
            onChange={(e) => setSearch(e.target.value)}
            className={` w-full max-w-7xl bg-[#F5F5F5] rounded-xl md:rounded-2xl px-4 py-2 pl-12  outline-0 focus:ring-2 focus:ring-blue-900  ${
              isScrolled
                ? "backdrop-blur-md bg-[#F5F5F5]/50"
                : "backdrop-blur-none"
            }`}
          />
          <MdClear className="absolute top-1/2 -translate-y-1/2 right-2 text-xl text-gray-900/60 hover:scale-110 hover:text-gray-900 transition duration-300 mr-2" />
        </div>
        <div className="relative ">
          <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredList?.length !== 0
              ? filteredList?.map((user) => (
                  <div
                    key={user.id}
                    className="bg-[#F5F5F5] rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="flex justify-center p-4">
                      <img
                        src={user.profile_picture}
                        className="w-[150px] h-[150px] xl:w-[200px] xl:h-[200px] rounded-full border-4 border-white shadow-md object-cover"
                        alt={user.username}
                      />
                    </div>

                    <div className="p-4">
                      <h2 className="text-xs sm:text-lg font-semibold text-gray-800 mb-2 text-center truncate">
                        {user.username}
                      </h2>

                      <button
                        onClick={() => handleRemoveFriend(user)}
                        className="relative w-full bg-blue-600 text-xs sm:text-base text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        <GoTrash className="absolute left-4 top-1/2 -translate-y-1/2" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              : filteredList?.length === 0 &&
                friendList?.length !== 0 && (
                  <div className="bg-[#F5F5F5]  w-full h-full col-span-2 rounded-3xl rounded-tl-none">
                    <div className="flex flex-col justify-center items-center py-2">
                      <MdPersonSearch className="text-9xl text-gray-700" />
                      <span className="text-gray-900 font-medium">
                        No Results found
                      </span>
                      <button
                        onClick={() => {
                          setSearch("");
                          searchRef.current.value = "";
                        }}
                        className="bg-orange-500 py-1 px-2 rounded my-2"
                      >
                        clear
                      </button>
                    </div>
                  </div>
                )}
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

export default FriendList;
