import React, { useState, useEffect, useRef, Activity } from "react";
import axios from "axios";
import { AiTwotoneWarning } from "react-icons/ai";
import { BsCart4 } from "react-icons/bs";
import Footer from "../Components/Footer";
import Loading from "../Components/Loading";
import { useDispatch } from "react-redux";
import { addItem } from "../Store/cartSlice";
import { FaSearch } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import NotFound from "/src/assets/NotFound.png";
import { FaCaretDown } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import useFilter from "../hooks/useFilter";
import { PiDressFill } from "react-icons/pi";
import { GiClothes } from "react-icons/gi";
import { GiDoubleNecklace } from "react-icons/gi";
import { CgGlobeAlt } from "react-icons/cg";
import { MdOutlinePhonelinkSetup } from "react-icons/md";
import { TiHeartOutline, TiHeartFullOutline } from "react-icons/ti";
import { useSelector } from "react-redux";
import { addWishLists, removeWishLists } from "../Store/wishListsSlice";

function Products1() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isScrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [rating, setRating] = useState(0);
  const inputRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);

  async function fetchProducts() {
    try {
      const response = await axios.get("products/");
      console.log(response.data);

      setProducts(response.data);
    } catch (e) {
      console.log(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useFilter(products, activeCat, rating, search);
  const wish = useSelector((state) => {
    return state.wishLists;
  });

  function handleAddWishLists(item) {
    dispatch(addWishLists(item));
  }

  function handleRemoveWishLists(item) {
    dispatch(removeWishLists(item));
  }

  function handleRetry() {
    setError(false);
    setLoading(true);
    fetchProducts();
  }

  function handleClear() {
    inputRef.current.value = "";
    setSearch("");
  }
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  function addItemToCart(item) {
    dispatch(addItem(item));
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-b from-pink-700 via-blue-700  to-blue-900">
        <div className="bg-[#F5F5F5] flex flex-col gap-6 justify-center items-center w-[400px] h-[400px] rounded-2xl">
          <AiTwotoneWarning className="text-7xl" />
          <h1 className="text-2xl font-semibold">Something went wrong!</h1>
          <p className="text-sm text-center text-gray-600 px-4">
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
    <div className="bg-[#F5F5F5] md:bg-linear-to-b from-pink-700 via-blue-700 to-blue-900">
      <div className="min-h-screen">
        <div className="max-w-[15%]">

        <div className="hidden md:block fixed top-20 bottom-20 overflow-y-scroll [&::-webkit-scrollbar]:hidden left-0 max-w-[15%]  w-full bg-[#F5F5F5] rounded-r-lg">
          <div className="flex flex-col">
            <h1 className="text-xl text-center py-5 border-b mx-2 border-gray-500 font-medium">
              Product Categories
            </h1>
            <ul className="[&>li]:py-2 [&>li]: [&>li]:hover:bg-amber-400 [&>li]:transition [&>li]:duration-300 [&>li]:hover:scale-105 [&>li]:truncate [&>li]:px-4 [&>li:first-child]:mt-4 select-none space-y-2 [&>li]:flex [&>li]:items-center [&>li]:gap-1">
              <li
                onClick={() => setActiveCat("men's clothing")}
                className={`${
                  activeCat === "men's clothing"
                    ? "bg-amber-400 text-white font-semibold"
                    : ""
                }`}
              >
                <GiClothes className="text-blue-500 text-xl" />
                Men's
              </li>
              <li
                onClick={() => setActiveCat("women's clothing")}
                className={`${
                  activeCat === "women's clothing"
                    ? "bg-amber-400 text-white font-semibold"
                    : ""
                }`}
              >
                <PiDressFill className="text-pink-500 text-xl" />
                Women's
              </li>
              <li
                onClick={() => setActiveCat("jewelery")}
                className={`${
                  activeCat === "jewelery"
                    ? "bg-amber-400 text-white font-semibold"
                    : ""
                }`}
              >
                <GiDoubleNecklace className="text-xl text-amber-600" />
                Jwellories
              </li>
              <li
                onClick={() => setActiveCat("electronics")}
                className={`${
                  activeCat === "electronics"
                    ? "bg-amber-400 text-white font-semibold"
                    : ""
                }`}
              >
                <MdOutlinePhonelinkSetup className="text-xl text-gray-950" />
                Electronics
              </li>
              <li
                onClick={() => setActiveCat(null)}
                className={` ${
                  activeCat === null
                    ? "bg-amber-400 text-white font-semibold"
                    : ""
                }`}
              >
                <CgGlobeAlt className="text-xl text-sky-900" />
                All Products
              </li>
            </ul>
          </div>
          <div>
            <h1 className="text-xl text-center py-5 border-b mx-2 border-gray-500 font-medium">
              Ratings
            </h1>
            <ul className="space-y-2 mx-4 py-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <li
                  key={star}
                  onClick={() => setRating(star)}
                  className="flex items-center gap-1 cursor-pointer md:text-xs lg:text-base"
                >
                  <input type="checkbox" checked={rating === star} readOnly />
                  {star}
                  {Array(star)
                    .fill(0)
                    .map((_, i) => (
                      <FaStar key={i} className="text-amber-400" />
                    ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
        <div className="w-[75%] mt-22">
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Products1;
