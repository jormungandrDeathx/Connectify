import axios from "axios";
import { Activity, useEffect, useMemo, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import Footer from "../Components/Footer";
import { BiArrowToTop } from "react-icons/bi";
// import Person from "/src/assets/Person.png";
import { useNavigate } from "react-router-dom";
import { PiPlusCircleBold } from "react-icons/pi";
import { FaCameraRetro } from "react-icons/fa";
import useLike from "../hooks/useLike";
import { HiDotsVertical } from "react-icons/hi";
import { TbMail } from "react-icons/tb";
import ReviewCard from "../Components/ReviewCard";
import { FaRegThumbsUp } from "react-icons/fa";
import { HiMiniUserGroup } from "react-icons/hi2";
import { FaRegImages } from "react-icons/fa6";
import { useSelector } from "react-redux";
import Loading from "../Components/Loading";
import ConfirmationBox from "../Components/ConfirmationBox";
import AlertBox from "../Components/AlertBox";
// import Person from "../assets/Person.png"

function Post() {
  const navigate = useNavigate();
  const friendsCount = useSelector((state) => state.friends.length);

  const [feedbackData, setFeedbackData] = useState([]);
  const [data, setData] = useState([]);
  // const [userData, setUserData] = useState({ name: "", profile_pic: "" });
  const [TimeAgo, setTimeAgo] = useState([]);
  // const [usersData, setUsersData] = useState([]);
  const [bio, setBio] = useState(null);
  const [matchedReview, setMatchedReview] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { likedPost, toggleLike } = useLike(data, setData);
  const [deletePost, setDeletePost] = useState(null);
  const [totalLikes, setTotalLikes] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [alert, setAlert] = useState(null);
  const [deletePostLoading, setDeletePostLoading] = useState(false);
  // const [friendsCount, setFriendsCount] = useState(0);

  async function fetchData() {
    try {
      const [productsResponse, feedbackResponse, postResponse, userResponse] =
        await Promise.all([
          axios.get("products/"),
          axios.get("feedback/"),
          axios.get("posts/"),
          axios.get("profile/"),
        ]);
      // setUsersData(userDataResponse.data);
      setProductsData(productsResponse.data.results);

      setFeedbackData(feedbackResponse.data.results);

      setData(postResponse.data.results);
      setBio(userResponse.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // useEffect(() => {
  //   const userDetail = usersData.find((i) => userData.name === i.username);
  //   setBio(userDetail);
  // }, [usersData]);

  async function handleDeletePost() {
    setConfirm(null);
    setDeletePostLoading(true);
    // if (!window.confirm("Are you sure?")) return;
    await axios
      .delete(`deletePost/${confirm}/`)
      .finally(()=>setDeletePostLoading(false));
    setData((prev) => prev.filter((post) => post.id !== confirm));
    setAlert("Post Deleted!");
  }

  function combinedFeedback() {
    if (!feedbackData.length || !productsData.length) return;

    const combined = feedbackData.map((feedback) => {
      const matched = productsData.find(
        (product) =>
          product.productName.trim().toLowerCase() ===
          feedback.product.trim().toLowerCase()
      );

      if (matched)
        return {
          ...feedback,
          productImage: matched.productImage,
        };
      return null;
    });
    setMatchedReview(combined.filter(Boolean));
  }

  useEffect(() => {
    combinedFeedback();
  }, [feedbackData, productsData]);

  useEffect(() => {
    if (data && data.length > 0) {
      const res = data.map((post) => {
        const createdAt = new Date(post.createdAt);
        const now = new Date();
        const timeDiff = now - createdAt;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30.44);
        if (months >= 1) {
          return `${months} month${months > 1 ? "s" : ""} ago`;
        } else if (days >= 1) {
          return `${days} day${days > 1 ? "s" : ""} ago`;
        } else {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
          const mins = Math.floor(timeDiff / (1000 * 60));
          return mins > 0
            ? `${mins} min${mins > 1 ? "s" : ""} ago`
            : "just now";
        }
      });
      setTimeAgo(res);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const totalLikes = filtered.map((i) => i.likes);
    setTotalLikes(totalLikes.reduce((prev, curr) => prev + curr, 0));
  }, [data]);

  const filtered = useMemo(() => {
    if (!bio?.username || data.length === 0) {
      return [];
    }
    return data.filter((post) => post.userName === bio?.username);
  }, [data, bio?.username]);

  function confirmFalse() {
    setConfirm(null);
  }

  function alertFalse() {
    setAlert(null);
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5] md:bg-linear-to-b from-pink-700 via-blue-700 to-blue-900 md:w-full">
      {confirm && (
        <ConfirmationBox
          title={
            "This will permanently delete the post. Do you want to continue?"
          }
          onConfirm={handleDeletePost}
          onClose={confirmFalse}
        />
      )}
      {alert && <AlertBox message={alert} onClose={alertFalse} />}
      <div className="lg:fixed mt-22 lg:mt-0 top-22 bg-[#F5F5F5] w-full  lg:max-w-[25%] lg:mx-1 left-0 lg:rounded-2xl lg:border-2 border-gray-400">
        <div className="flex flex-col">
          <div className="flex justify-center lg:m-5">
            <img
              loading="lazy"
              src={bio?.profile_picture}
              alt="profileImg"
              className="w-[100px] h-[100px] lg:w-[150px] lg:h-[150px] border-2 border-gray-300 rounded-full object-contain select-none"
            />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-black text-xl  m-2 font-semibold">
              {bio?.first_name}
            </h1>
            <div className="flex items-center gap-1">
              <TbMail />
              <h3 className="text-gray-500">{bio?.email}</h3>
            </div>
          </div>

          <div className="flex justify-center mx-4 border-b border-gray-300 py-6">
            <div className="grid grid-cols-3 gap-5 [&>div]:border-3 [&>div]:rounded-xl [&>div]:flex [&>div]:flex-col [&>div]:justify-center [&>div]:items-center [&>div>svg]:mb-2 [&>div]:py-2 [&>div]:px-6 [&>div>svg]:text-3xl [&>div>span:nth-child(2)]:text-xs [&>div>span:nth-child(3)]:font-medium [&>div>svg]:text-blue-700 select-none">
              <div className="border-pink-700">
                <FaRegThumbsUp />
                <span>Likes</span>
                <span>{totalLikes}</span>
              </div>
              <div className="border-blue-500">
                <HiMiniUserGroup />
                <span>Friends</span>
                <span>{friendsCount}</span>
              </div>
              <div className="border-blue-700">
                <FaRegImages />
                <span>Posts</span>
                <span>{filtered?.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-5 flex-1 mb-10 mt-10 lg:mt-30">
        <div className="w-full lg:w-[48%] lg:rounded-2xl bg-[#F5F5F5] shadow-2xl">
          {filtered.length !== 0 ? (
            filtered.map((post, i) => (
              <div
                className="relative flex flex-col mx-5 pb-4 border-b border-gray-300"
                key={post.id}
              >
                <div className="flex justify-between items-center gap-4 my-3">
                  <div className=" flex items-center gap-2.5">
                    <img
                      className="w-12 h-12  rounded-full select-none"
                      src={post.userImage}
                      alt={post.userName}
                    />
                    <h1 className="font-medium text-gray-800">
                      {post.userName}
                    </h1>
                  </div>
                  <div
                    onClick={() =>
                      setDeletePost(deletePost === post.id ? null : post.id)
                    }
                    className="relative rounded-full hover:bg-gray-300 p-2 transition"
                  >
                    <HiDotsVertical />
                    <Activity
                      mode={deletePost === post.id ? "visible" : "hidden"}
                    >
                      <div className="absolute px-2 py-1 bg-gray-500/70 right-0 rounded-bl">
                        <button
                          onClick={() => setConfirm(post.id)}
                          className="text-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    </Activity>
                  </div>
                </div>
                <div className="rounded-2xl rounded-b-none select-none">
                  <img
                    onDoubleClick={() => toggleLike(post.id)}
                    loading="lazy"
                    src={post.postImage || post.userPostImage}
                    alt="Post"
                    className="w-full rounded-xl"
                  />
                </div>

                <p className="pl-2 wrap-break-word">{post.message}</p>

                <span className="text-sm  text-gray-500 pl-2 select-none">
                  {TimeAgo[i]}
                </span>
                <div className="px-2 flex gap-1">
                  <button onClick={() => toggleLike(post.id)}>
                    {likedPost[post.id] ? (
                      <FaHeart className="text-xl mr-1 text-red-600" />
                    ) : (
                      <FaRegHeart className="text-xl mr-1" />
                    )}
                  </button>
                  <code>
                    {post.likes > 1000
                      ? `${post.likes.toString().Slice(0, 2)}k`
                      : post.likes === 0
                      ? "likes"
                      : post.likes}
                  </code>
                </div>
                {deletePost===post.id && deletePostLoading && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-[50%] -translate-x-[50%] w-10 h-10 rounded-full border-b-5 border-pink-600 animate-spin "></div>
                )}
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center min-h-screen ">
              <div className="bg-[#F5F5F5] flex flex-col gap-6 justify-center items-center   rounded-2xl">
                <div className="border-4 p-7 rounded-full border-gray-700 hover:scale-110 transition duration-300 ease-in-out">
                  <FaCameraRetro className="text-8xl " />
                </div>
                <h1 className="text-2xl font-semibold text-center">
                  You haven’t shared anything yet!
                </h1>
                <p className="text-sm text-center text-gray-600 px-4">
                  Start by sharing your thoughts, photos, or experiences with
                  your friends.
                </p>
                <button
                  onClick={() => navigate("/newPost")}
                  className="relative flex items-center bg-amber-300 rounded-lg font-medium p-2 pl-10 hover:bg-amber-400 transition duration-300"
                >
                  <PiPlusCircleBold className="absolute text-2xl left-0 mx-2 text-black" />
                  Create your first post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {filtered.length > 5 ? (
        <div className="flex justify-center items-center pt-2 animate-bounce">
          <button
            onClick={handleTop}
            title="move to Top"
            className="border rounded-full p-2 bg-pink-700 hover:bg-pink-600"
          >
            <BiArrowToTop className="text-3xl text-white" />
          </button>
        </div>
      ) : (
        <></>
      )}

      <div className="bg-[#F5F5F5] mb-10 w-full lg:fixed lg:top-22  lg:max-w-[25%] lg:mx-1  lg:right-0 lg:rounded-2xl md:border-2 border-gray-400 md:shadow-[inset_20px_0px_25px_-10px_rgba(0,0,0,0.3),inset_-20px_0px_25px_-10px_rgba(0,0,0,0.3)] space-y-2">
        <h1 className="text-center py-5 text-2xl font-semibold text-gray-800 border-b-2 border-gray-300">
          Product Ratings & Reviews
        </h1>

        <div className="flex gap-2 py-1 overflow-x-hidden [&div]:shadow-black/10">
          {matchedReview.map((review, index) => (
            <ReviewCard review={review} key={index} />
          ))}
        </div>
        <div className="flex gap-2 py-1 overflow-x-hidden [&>div]:animate-infinite-scroll-r [&>div]:shadow-black/18">
          {matchedReview
            .slice()
            .reverse()
            .map((review, index) => (
              <ReviewCard review={review} key={index} />
            ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Post;
