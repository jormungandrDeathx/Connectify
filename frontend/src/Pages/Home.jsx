import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaRegHeart } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { AiTwotoneWarning } from "react-icons/ai";
import { MdPerson, MdOutlineLogout, MdShoppingCart } from "react-icons/md";
import Footer from "../Components/Footer";
import { BiArrowToTop } from "react-icons/bi";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import Loading from "../Components/Loading";
import { BsCart4 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../Store/cartSlice";
import { useNavigate } from "react-router-dom";
import { TbMail } from "react-icons/tb";
import { FaAngellist } from "react-icons/fa6";
import { TiHeartFullOutline, TiHeartOutline } from "react-icons/ti";
import { addWishLists, removeWishLists } from "../Store/wishListsSlice";
import { useLogout } from "../hooks/useLogout";

import useLike from "../hooks/useLike";
import ConfirmationBox from "../Components/ConfirmationBox";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logout = useLogout();
  const wish = useSelector((state) => {
    return state.wishLists;
  });

  const [data, setData] = useState([]);
  const [TimeAgo, setTimeAgo] = useState([]);
  const [toggle, setToggle] = useState(true);
  const [products, setProducts] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bio, setBio] = useState(null);
  const { likedPost, toggleLike } = useLike(data, setData);
  const [wishes, setWishes] = useState("");
  const [logoutCase, setLogoutCase] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [postLoading, setPostsLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  async function fetchProfile() {
    try {
      const response = await axios.get("profile/");


      setBio(response.data);
    } catch (e) {}
  }

  function handleAddWishLists(item) {
    dispatch(addWishLists(item));
  }

  function handleRemoveWishLists(item) {
    dispatch(removeWishLists(item));
  }

  async function fetchProducts() {
    try {
      const res = await axios.get("products/");

      setProducts(res.data.results);
    } catch (e) {
      setError(true);
    } finally {
      setPostsLoading(false);
    }
  }

  const loadMore = useCallback(() => {
    if (postLoading) return;
    if (!hasMore) return;
    setPage((prev) => prev + 1);
  }, [postLoading, hasMore]);

  const lastElementRef = useInfiniteScroll(loadMore, postLoading, hasMore);

  useEffect(() => {
    if (page === 1) return;
    if (postLoading) return;
    fetchPosts(page);
  }, [page]);

  function randomWish() {
    const r = Math.floor(Math.random() * 10);
    const wishArray = [
      "Your picks go here",
      "Future favorites start",
      "Discover. Save. Shine.",
      "Build your vibe",
      "No gems saved yet",
      "Your list awaits you",
      "Start curating now",
      "Make this space yours",
      "Your style starts here",
      "Nothing chosen yet",
    ];

    setWishes(wishArray[r]);
  }

  async function fetchPosts(pageNumber = 1) {
    if (!hasMore && pageNumber > 1) return;
    setPostsLoading(true);
    try {
      const res = await axios.get(`posts/?page=${pageNumber}`);

      setData((prev) =>
        pageNumber === 1 ? res.data.results : [...prev, ...res.data.results]
      );
      setHasMore(Boolean(res.data.next));
    } catch (e) {
      if (e && data.length === 0) setError(true);
    } finally {
      setPostsLoading(false);
    }
  }
 

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    Promise.all([fetchPosts(1), fetchProducts(), fetchProfile()]).finally(() =>
      setLoading(false)
    );
    randomWish();
    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const converted = data.map((post) => {
      const createdAt = new Date(post.createdAt);
      const now = new Date();
      const diff = now - createdAt;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const months = Math.floor(days / 30.44);

      if (months >= 1) return `${months} month${months > 1 ? "s" : ""} ago`;
      if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;

      const h = Math.floor(diff / (1000 * 60 * 60));
      if (h >= 1) return `${h} hour${h > 1 ? "s" : ""} ago`;

      const m = Math.floor(diff / (1000 * 60));
      return m > 0 ? `${m} min${m > 1 ? "s" : ""} ago` : "just now";
    });

    setTimeAgo(converted);
  }, [data]);

  useEffect(() => {
    if (!products.length) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [products.length]);

  function handleLogoutFalse() {
    setLogoutCase(false);
  }

  function addItemToCart(item) {
    dispatch(addItem(item));
  }

  function handleTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-b from-pink-700 via-blue-700 to-blue-900">
        <div className="bg-[#F5F5F5] p-10 rounded-2xl flex flex-col gap-5 items-center">
          <AiTwotoneWarning className="text-7xl" />
          <h1 className="text-xl font-semibold">Something went wrong!</h1>
          <p className="text-gray-600 text-center">Try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] lg:bg-linear-to-b from-pink-700 via-blue-700 to-blue-900">
      {logoutCase && (
        <ConfirmationBox
          title={"Are you sure?"}
          onConfirm={logout}
          onClose={handleLogoutFalse}
        />
      )}
      <div
        className="hidden lg:block fixed left-0 top-28 bottom-30 w-full lg:max-w-[260px] xl:max-w-[300px] ml-5
                      bg-[#F5F5F5]  rounded-2xl border border-gray-300 shadow-lg 
                      z-40 overflow-auto max-h-[80vh]"
      >
        <div className="flex flex-col w-full p-5">
          <div className="flex justify-center">
            <img
              src={bio?.profile_picture}
              className="w-[140px] h-[140px] rounded-full border shadow-xl object-cover"
            />
          </div>

          <h1 className="text-center text-xl mt-3 font-semibold">
            {bio?.first_name}
          </h1>

          <div className="mt-6">
            <div className="flex flex-col justify-between border-b pb-3">
              <div className="flex items-center gap-1">
                <TbMail />

                <span className="font-medium">Email</span>
              </div>
              <span className="text-gray-500 truncate">
                {bio?.email || "example@mail.com"}
              </span>
            </div>

            <div className="flex justify-between border-b py-3">
              <span>Dark mode</span>
              <button onClick={() => setToggle(!toggle)}>
                {toggle ? (
                  <FaToggleOff className="text-2xl" />
                ) : (
                  <FaToggleOn className="text-2xl" />
                )}
              </button>
            </div>

            <div
              onClick={() => navigate("/editProfile")}
              className="flex items-center gap-3 py-3 hover:bg-gray-200 transition-all duration-300 ease-in-out cursor-pointer rounded"
            >
              <MdPerson className="text-3xl" /> Profile Details
            </div>

            <div
              onClick={() => setLogoutCase(true)}
              className="flex items-center gap-3 py-3 hover:bg-gray-200 transition-all duration-300 ease-in-out cursor-pointer rounded"
            >
              <MdOutlineLogout className="text-3xl" /> Logout
            </div>
          </div>
        </div>
      </div>

      <div
        className="lg:fixed right-0 top-28 bottom-30 w-full lg:max-w-[260px] xl:max-w-[300px] mr-5
                      bg-[#F5F5F5] lg:rounded-2xl border border-gray-300 shadow-lg 
                      z-40 overflow-auto max-h-[80vh] p-5 [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
        <div className="hidden relative lg:flex h-[300px] overflow-hidden">
          {products.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 flex flex-col items-center text-center transition-all duration-700 ${
                index === current
                  ? "opacity-100 translate-x-0"
                  : index < current
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
              }`}
            >
              <div className="absolute top-2 right-2 [&_svg]:text-2xl [&_svg]:sm:text-3xl [&_svg]:active:scale-125 [&_svg]:transition ">
                {wish.find((i) => item?.id === i.id) ? (
                  <TiHeartFullOutline
                    onClick={() => handleRemoveWishLists(item?.id)}
                    className="text-red-600"
                  />
                ) : (
                  <TiHeartOutline
                    onClick={() => handleAddWishLists(item)}
                    className="text-gray-800"
                  />
                )}
              </div>

              <img
                onClick={() => navigate(`/products/${item.id}`)}
                src={item.productImage}
                className="w-24 h-24 rounded-xl"
              />

              <h3 className="mt-3 font-semibold">{item.productName}</h3>

              <p className="text-gray-600 text-sm line-clamp-2 px-2">
                {item.productDesc}
              </p>

              <p className="font-bold mt-2">${item.productPrice}</p>

              <button
                onClick={() => addItemToCart(item)}
                className="mt-3 bg-amber-300 px-4 py-2 rounded-xl hover:bg-amber-400 flex items-center gap-2"
              >
                <BsCart4 /> Add to cart
              </button>
            </div>
          ))}
        </div>
        <div className="">
          <div className=" flex gap-1 items-center justify-center mt-20 lg:mt-0 py-2">
            <span className="text-center text-2xl font-medium bg-[#F5F5F5] ">
              Wishlists
            </span>
            <FaAngellist className="text-2xl text-pink-700" />
          </div>
          <div
            className={`[&::-webkit-scrollbar]:hidden scroll-smooth flex   overflow-x-scroll ${
              wish.length !== 0 ? "border-y" : ""
            } border-gray-300 bg-[#F5F5F5]`}
          >
            {wish.length !== 0 ? (
              wish.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex flex-col w-40 min-w-40 shrink-0 pb-2 px-2 ${
                    i % 2 === 0 ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="flex justify-end py-2">
                    {wish.find((i) => item.id === i.id) ? (
                      <TiHeartFullOutline
                        onClick={() => handleRemoveWishLists(item.id)}
                        className="text-2xl text-red-600 active:scale-125 transition"
                      />
                    ) : (
                      <TiHeartOutline
                        onClick={() => handleAddWishLists(item)}
                        className="text-2xl active:scale-125 transition"
                      />
                    )}
                  </div>
                  <div className="h-25 sm:h-30 md:h-40 flex px-1">
                    <img
                      loading="lazy"
                      src={item.productImage}
                      onClick={() => navigate(`/products/${item.id}`)}
                      className="w-full object-contain"
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-xs ">
                    <span className="line-clamp-2 text-sm font-medium text-gray-900">
                      {item.productName}
                    </span>
                    <span className="line-clamp-2 text-gray-500">
                      {item.productDesc}
                    </span>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{`$${item.productPrice}`}</span>
                      <button
                        onClick={() => dispatch(addItem(item))}
                        className="bg-amber-300 px-4 py-1 rounded"
                      >
                        <BsCart4 />{" "}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center gap-2 pb-1 border-b border-gray-300">
                <span className="text-gray-900">{wishes}</span>
                <MdShoppingCart className="text-xl" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-center w-full lg:px-5 border-t border-gray-300">
        <div
          className="lg:mt-28 w-full max-w-[850px] lg:mx-[280px] xl:mx-[330px] 
                        bg-[#F5F5F5] lg:rounded-2xl md:shadow-2xl p-5 z-60"
        >
          {data.map((post, i) => (
            <div key={post.id} className="mb-8 border-b pb-5 border-gray-300">
              <div className="my-4 flex items-center gap-3">
                <img
                  src={post.userImage || bio?.profile_picture}
                  className="w-12 h-12 rounded-full"
                />
                <h2 className="font-semibold">{post.userName}</h2>
              </div>

              <img
                loading="lazy"
                onDoubleClick={() => toggleLike(post.id)}
                src={post.postImage || post.userPostImage}
                className="w-full rounded-xl"
              />

              <p className="mt-2">{post.message}</p>
              <span className="text-sm text-gray-500">{TimeAgo[i]}</span>

              <div className="flex items-center mt-3">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="active:scale-120 md:active:scale-150 transition-all duration-150 ease-in-out"
                >
                  {likedPost[post.id] ? (
                    <FaHeart className="text-xl mr-1 text-red-600" />
                  ) : (
                    <FaRegHeart className="text-xl mr-1" />
                  )}
                </button>
                <code className="text-xs md:text-base">
                  {post.likes > 1000
                    ? `${post.likes.toString().slice(0, 2)}k`
                    : post.likes === 0
                    ? "likes"
                    : post.likes}
                </code>
              </div>
            </div>
          ))}
        </div>
        {hasMore && data.length > 0 && (
          <div
            ref={lastElementRef}
            className="flex justify-center items-center h-20, mt-6"
          >
            {postLoading && (
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-pink-700"></div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-10">
        <button
          onClick={handleTop}
          className="p-3 bg-pink-700 rounded-full hover:bg-pink-800 animate-bounce shadow-xl/100 active:scale-85 transition"
        >
          <BiArrowToTop className="text-3xl text-white" />
        </button>
      </div>

      <Footer />
    </div>
  );
}
export default Home;
