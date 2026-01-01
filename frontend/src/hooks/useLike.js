import axios from "axios";
import { useEffect, useState } from "react";

export default function useLike(data, setData) {
  const [likedPost, setLikedPost] = useState({});

  useEffect(() => {
    const savedLikes = localStorage.getItem("likedPosts");
    const liked = savedLikes ? JSON.parse(savedLikes) : {};
    setLikedPost(liked);
  }, []);

  async function toggleLike(postId) {
    const action = likedPost[postId] ? "unlike" : "like";
    try {
      const res = await axios.post(
        `posts/${postId}/like/`,
        { action }
      );

      setData((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: res.data.likes } : p))
      );

      setLikedPost((prev) => {
        const updated = { ...prev, [postId]: !prev[postId] };
        localStorage.setItem("likedPosts", JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error("error", e);
    }
  }

  return { likedPost, toggleLike };
}
