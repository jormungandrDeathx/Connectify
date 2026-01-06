import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { AiTwotoneWarning } from "react-icons/ai";
import Person from "/src/assets/Avatar.png";
import NotFound from "/src/assets/NotFound.png";
import Footer from "../Components/Footer";
import { MdOutlineAccessTime } from "react-icons/md";
import { MdClear } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { useSelector } from "react-redux";
import AlertBox from "../Components/AlertBox";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

function AddFriends() {
  // let dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isScrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef();
  const [username, setUsername] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  // const observerRef = useRef(null);

  const sentRequests = useSelector((state) => state.notifications.sent);

  const friends = useSelector((state) => state.friends);

  async function fetchProfile() {
    try {
      const profileRes = await axios.get("profile");
      setUsername(profileRes.data.username);
    } catch (e) {
      console.error("Error fetching profile:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers(pageNumber = 1, searchTerm = "") {
    if (!hasMore && pageNumber > 1) return;
    setUsersLoading(true);
    try {
      const userRes = await axios.get(
        `users/?page=${pageNumber}&search=${searchTerm}`
      );

      setUsers((prev) =>
        pageNumber === 1
          ? userRes.data.results
          : [...prev, ...userRes.data.results]
      );
      setHasMore(Boolean(userRes.data.next));
    } catch (e) {
      console.error("Error fetching users:", e);
      if (e.response?.status !== 404) {
        setError(true);
      }
      setError(true);
    } finally {
      setUsersLoading(false);
    }
  }

  async function sendRequest(userId) {
    try {
      const res = await axios.post(`friends/send/${userId}/`);

      setAlert("Friend Request sent!");
    } catch (e) {
      console.error("Error:", e.response);
      setAlert(e.response?.data?.error);
    }
  }

  function handleRetry() {
    setError(false);
    setHasMore(true)
    setPage(1)
    // setUsersLoading(true);
    setUsers([])
    fetchUsers(1, "");
  }

  useEffect(() => {
    fetchUsers(1, "");
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const loadMore = useCallback(()=>{
    setPage((prev)=>prev+1)
  },[])


  const lastElementRef = useInfiniteScroll(loadMore, usersLoading, hasMore)

  useEffect(() => {
    if (page > 1) {
      fetchUsers(page, search);
    }
  }, [page]);


  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      setUsers([]);

      fetchUsers(1, search);
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-b from-pink-700 via-blue-700  to-blue-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  function handleClear() {
    inputRef.current.value = "";
    setSearch("");
  }

  function handleAlertFalse() {
    setAlert(null);
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-b from-pink-700 via-blue-700  to-blue-900">
        <div className="bg-[#F5F5F5] flex flex-col gap-6 justify-center items-center w-[full] md:w-[400px] mx-5 md:mx-0 md:h-[400px] rounded-2xl py-8 md:py-0">
          <AiTwotoneWarning className="text-7xl" />
          <h1 className="text-xl md:text-2xl font-semibold">
            Something went wrong!
          </h1>
          <p className="text-xs text-center text-gray-600 px-4">
            We're having difficulties connecting to our service. Try agian after
            some time
          </p>
          <button
            onClick={handleRetry}
            className="bg-orange-600 w-[30%] rounded-lg text-white p-2 hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col bg-linear-to-b from-pink-700 via-blue-700  to-blue-900 min-h-screen ">
      {alert && <AlertBox message={alert} onClose={handleAlertFalse} />}
      <div className="flex justify-center items-center">
        <div className="fixed top-2 mt-28 w-[90%] z-9 transition-all duration-150 ease-in-out rounded-xl md:rounded-2xl max-w-7xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 z-50" />
          <input
            type="text"
            placeholder="Search here"
            ref={inputRef}
            onChange={(e) => setSearch(e.target.value.trimStart())}
            className={`bg-[#F5F5F5] w-full px-4 py-2 pl-12  outline-0 focus:ring-2 rounded-2xl focus:ring-blue-900 focus:shadow-2xl ${
              isScrolled
                ? "backdrop-blur-md bg-[#F5F5F5]/50"
                : "backdrop-blur-none"
            }`}
          />
          <MdClear
            onClick={handleClear}
            title="clear"
            className="absolute top-1/2 -translate-y-1/2 right-2 text-xl text-gray-900/60 hover:scale-110 hover:text-gray-900 transition duration-300"
          />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-4 pt-50 pb-15">
        <div className="w-full max-w-7xl">
          {users.length === 0 && !usersLoading && search ? (
            <div className="flex justify-center">
              <div className="bg-[#F5F5F5] max-w-4xl w-full  py-20 flex flex-col justify-center items-center rounded-2xl gap-5">
                <img src={NotFound} className="w-40 h-40" alt="" />
                <h1 className="uppercase text-2xl font-medium">
                  no results found
                </h1>
                <button
                  onClick={handleClear}
                  className="bg-orange-500 py-1 px-2 text-white font-medium rounded"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {users.map(
                (user) =>
                  username !== user.username && (
                    <div
                      key={user.id}
                      className="bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                    >
                      <div className="flex justify-center items-center p-4 bg-gray-50 ">
                        <img
                          src={user.profile_picture}
                          className="w-full h-full max-w-[200px] max-h-[200px] rounded-full border-4 border-white shadow-md object-cover"
                          alt={user.first_name}
                          onError={(e) => {
                            e.target.src = Person;
                          }}
                        />
                      </div>

                      <div className="p-4">
                        <h2
                          // style={{ "--value": `"${user.last_name}"` }}
                          className="text-xs sm:text-lg font-semibold text-gray-800 mb-2 text-center truncate"
                        >
                          {user.username}
                        </h2>
                        {sentRequests.some(
                          (req) => req.to_user == user.user_id
                        ) ? (
                          <button
                            disabled
                            className="relative w-full bg-gray-800 text-xs sm:text-base text-white py-1 sm:py-2 sm:px-4 rounded-lg font-medium hover:cursor-not-allowed"
                          >
                            <MdOutlineAccessTime className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 " />
                            Pending
                          </button>
                        ) : friends.some(
                            (friend) => friend?.id == user.user_id
                          ) ? (
                          <button
                            disabled
                            className="relative w-full bg-pink-800 text-xs sm:text-base text-gray-200 py-1 sm:py-2 sm:px-4 rounded-lg font-medium hover:cursor-not-allowed"
                          >
                            <FaUserFriends className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 " />
                            Friends
                          </button>
                        ) : (
                          <button
                            onClick={() => sendRequest(user.user_id)}
                            className="relative w-full bg-blue-600 text-xs sm:text-base text-white py-1 sm:py-2 sm:px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium active:scale-95"
                          >
                            <AiOutlineUserAdd className="absolute left-4 top-1/2 -translate-y-1/2 " />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
          {hasMore && (
            <div
              ref={lastElementRef}
              className="flex justify-center items-center h-20 mt-6"
            >
              {usersLoading && (
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-white"></div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AddFriends;
