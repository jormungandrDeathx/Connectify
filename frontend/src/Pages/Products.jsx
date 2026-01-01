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
import { useNavigate } from "react-router-dom";

function Products() {
  let navigate = useNavigate();
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

      setProducts(response.data.results);
    } catch (e) {
      console.error(e);
      
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleNavigation(itemId){
    navigate(`/products/${itemId}`)
  }

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
    <div
      className={`flex flex-col min-h-screen  items-center md:items-end bg-[#F5F5F5] sm:bg-linear-to-b sm:from-pink-700 sm:via-blue-700 sm:to-blue-900 ${
        filteredProducts.length === 0 ? "items-start" : ""
      }`}
    >
      <div className="pt-45 px-4 md:px-0 pb-15 w-full max-w-7xl ">
        <div className="hidden md:block fixed top-20 bottom-30 overflow-y-scroll [&::-webkit-scrollbar]:hidden left-0 max-w-[15%] w-full bg-[#F5F5F5] rounded-r-lg">
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
        <div className="flex justify-center items-center relative">
          <div
            className={`fixed top-0 md:right-10 mt-25 w-full md:max-w-xl lg:max-w-3xl xl:max-w-6xl h-10 z-9 transition-all duration-150 ease-in-out rounded-xl md:rounded-2xl flex items-center gap-2 pr-1 md:px-2 ${
              isScrolled
                ? "backdrop-blur-md bg-[#F5F5F5]/40 shadow-lg"
                : "backdrop-blur-none bg-gray-200"
            }`}
          >
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex md:hidden justify-between items-center bg-amber-400 rounded-l-xl h-full py-4 shadow-[inset_-8px_0px_10px_rgba(0,0,0,0.25)] pr-1 "
            >
              <h1 className="text-xs py-1 pl-1.5 w-full line-clamp-1">
                {activeCat === null ? "All Products" : activeCat}
              </h1>
              <FaCaretDown className="text-xl" />
            </div>

            <div className="flex items-center flex-1 ">
              <FaSearch className="" />
              <input
                ref={inputRef}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="text-sm text-gray-500 focus:text-black px-2 h-fit outline-0 w-full py-4"
                type="text"
              />
            </div>

            <MdClear
              onClick={handleClear}
              title="clear"
              className={`${
                search ? "visible" : "invisible"
              } text-xl text-gray-900 hover:scale-125 transition`}
            />
            <Activity mode={menuOpen ? "visible" : "hidden"}>
              <div className="w-fit md:hidden absolute top-10 left-1 z-50 mx-auto">
                <div className=" bg-[#F5F5F5]/90 rounded-br-lg">
                  <ul className="[&>li]:py-2 [&>li]: [&>li]:hover:bg-amber-400 [&>li]:transition [&>li]:duration-300 [&>li]:hover:scale-105 overflow-hidden text-center  [&>li:first-child]:mt-4 select-none space-y-2">
                    <li
                      onClick={() => {
                        setActiveCat("men's clothing");
                        setMenuOpen(!menuOpen);
                      }}
                      className={`${
                        activeCat === "men's clothing"
                          ? "bg-amber-400 text-white font-semibold"
                          : ""
                      }`}
                    >
                      Mens'Clothing
                    </li>
                    <li
                      onClick={() => {
                        setActiveCat("women's clothing");
                        setMenuOpen(!menuOpen);
                      }}
                      className={`${
                        activeCat === "women's clothing"
                          ? "bg-amber-400 text-white font-semibold"
                          : ""
                      }`}
                    >
                      Womens'Clothing
                    </li>
                    <li
                      onClick={() => {
                        setActiveCat("jewelery");
                        setMenuOpen(!menuOpen);
                      }}
                      className={`${
                        activeCat === "jewelery"
                          ? "bg-amber-400 text-white font-semibold"
                          : ""
                      }`}
                    >
                      Jwellories
                    </li>
                    <li
                      onClick={() => {
                        setActiveCat("electronics");
                        setMenuOpen(!menuOpen);
                      }}
                      className={`${
                        activeCat === "electronics"
                          ? "bg-amber-400 text-white font-semibold"
                          : ""
                      }`}
                    >
                      Electronics
                    </li>
                    <li
                      onClick={() => {
                        setActiveCat(null);
                        setMenuOpen(!menuOpen);
                      }}
                      className={`rounded-br-lg ${
                        activeCat === null
                          ? "bg-amber-400 text-white font-semibold"
                          : ""
                      }`}
                    >
                      All Products
                    </li>
                  </ul>
                </div>
              </div>
            </Activity>
          </div>
        </div>
      </div>
      <div
        className={`sm:mb-5 ${
          filteredProducts.length
            ? "sm:-mt-15 -mt-20 sm:w-[82%] sm:mx-5"
            : "-mt-12 w-full flex-1"
        }`}
      >
        {/* {!productView && ( */}
        <div
          className={` ${
            filteredProducts.length === 0
              ? "flex flex-col justify-center items-center  flex-1  w-full"
              : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  sm:gap-5"
          } `}
        >
          {filteredProducts.length === 0 ? (
            <div className="bg-[#F5F5F5] flex flex-col items-center gap-5 h-fit w-[80%] md:w-[50%] py-10 rounded-xl">
              <img
                src={NotFound}
                className="w-20 h-20 md:w-40 md:h-40"
                alt=""
              />
              <h1 className="uppercase text-2xl font-medium text-center mx-3">
                no results found!
              </h1>
              <button
                onClick={handleClear}
                className="bg-orange-500 py-1 px-2 text-white font-medium rounded"
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredProducts
              .filter((product) => {
                return search.toLowerCase() === ""
                  ? product
                  : product.productName.toLowerCase().includes(search);
              })
              .map((item, i) => (
                <div
                  key={item.id}
                  className={`relative bg-[#F5F5F5] sm:rounded-lg p-2 pb-4 sm:p-4`}
                >
                  <div className="absolute top-0 right-2 sm:top-4 sm:right-4">
                {wish.find((i) => item?.id === i.id) ? (
                  <TiHeartFullOutline
                    onClick={() => handleRemoveWishLists(item?.id)}
                    className="text-2xl text-red-600 active:scale-125 transition"
                  />
                ) : (
                  <TiHeartOutline
                    onClick={() => handleAddWishLists(item)}
                    className="text-2xl active:scale-125 transition"
                  />
                )}
              </div>

                  <div className="flex justify-center sm:m-5 pb-3 sm:pb-0">
                    <img
                      loading="lazy"
                      onClick={() => handleNavigation(item.id)}
                      src={item.productImage}
                      className="w-[140px] h-[150px] sm:w-[200px] sm:h-[200px] select-none"
                      alt="products"
                    />
                  </div>
                  <h1
                    title={item.productName}
                    className="line-clamp-2 font-semibold pt-2 border-t border-gray-400"
                  >
                    {item.productName}
                  </h1>
                  <div className="flex flex-col justify-center h-20 ">
                    <p
                      title={item.productDesc}
                      className="text-gray-500 line-clamp-2 text-sm"
                    >
                      {item.productDesc}
                    </p>
                  </div>
                  <div className="flex w-22 gap-2 items-center">
                    <h3
                      className={`text-sm px-3 py-1 rounded-2xl text-center ${
                        item.productRate > 3 ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    >
                      {item.productRate}
                    </h3>
                    <h1 className="text-xs text-blue-600 text-center">{`(${item.productCount})`}</h1>
                  </div>

                  <h2 className="text-xl font-medium my-4">{`$ ${item.productPrice}`}</h2>
                  <div className="flex justify-center select-none">
                    <button
                      onClick={() => addItemToCart(item)}
                      className="bg-amber-300 p-2 rounded-xl text-sm w-[250px] hover:bg-amber-400 transition"
                    >
                      <BsCart4 className="absolute text-lg" /> Add to cart
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
        {/* )} */}
      </div>
      <div className="w-full">
        <Footer/>
      </div>
    </div>
  );
}

export default Products;
