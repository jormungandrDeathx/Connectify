import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "./Footer";
import { useSelector, useDispatch } from "react-redux";
import { TiHeartOutline, TiHeartFullOutline } from "react-icons/ti";
import { addWishLists, removeWishLists } from "../Store/wishListsSlice";
import { FaCartShopping } from "react-icons/fa6";
import { FaCommentDots } from "react-icons/fa6";
import { addItem } from "../Store/cartSlice";
import Loading from "./Loading";

function ViewProduct() {
  const [item, setitem] = useState(null);
  const [feedbacks, setFeedbacks] = useState(null);
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false)
  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    axios
      .get(`products/${id}`)
      .then((res) => {
        setitem(res.data);
      })
      .catch(console.error)
      .finally(()=>setLoading(false))
      

    axios
      .get("products/")
      .then((res) => setProducts(res.data.results))
      .catch(console.error);

    axios
      .get("feedback/")
      .then((res) => {
        setFeedbacks(res.data.results);
      })
      .catch(console.error);

    window.scrollTo(0,0)
  }, [id]);

  const relatedProducts = products?.filter(
    (i) => item?.productCat.trim() === i.productCat.trim() && i.id !==item.id
  );

  const feedback = feedbacks?.filter(
    (i) => i?.product.trim() === item?.productName.trim()
  );

  const wish = useSelector((state) => {
    return state.wishLists;
  });

  function handleAddWishLists(item) {
    dispatch(addWishLists(item));
  }

  function handleRemoveWishLists(item) {
    dispatch(removeWishLists(item));
  }

  if (loading){
    return <Loading/>
  }

  return (
    <div className="mt-20">
      <div className="min-h-screen bg-[#F5F5F5] ">
        <div className="py-2">
          <div className="flex flex-col md:flex-row md:items-center md:mt-2 gap-2 border-b border-gray-300 pb-5 mx-2">
            <div className="relative flex justify-center rounded-2xl md:mx-2 bg-gray-200 md:w-[50%] py-2">
              <img
                src={item?.productImage}
                alt=""
                className="object-contain w-[300px] h-[300px] lg:w-[400px] lg:h-[400px]"
              />
              <div className="absolute top-4 right-4 [&_svg]:text-2xl [&_svg]:sm:text-3xl [&_svg]:active:scale-125 [&_svg]:transition ">
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
            </div>
            <div className="space-x-1 md:w-[50%] md:mr-2 p-2">
              <h1 className="text-2xl md:text-4xl sm font-medium text-gray-900 break-all">
                {item?.productName}
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm px-3 py-1 rounded-2xl text-center ${
                    item?.productRate > 3 ? "bg-green-500" : "bg-yellow-500"
                  }`}
                >
                  {item?.productRate}
                </span>
                <span className="text-sm text-blue-600">{`(${item?.productCount})`}</span>
              </div>
              <h1 className="self-start my-1 text-2xl font-medium mt-2">
                <sup className="text-sm font-normal">$</sup>
                {item?.productPrice}
              </h1>
              <div className="flex flex-col gap-2 mt-4">
                <div>
                  <label className="font-bold">Description:</label>
                  <p className="text-sm">{item?.productDesc}</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(addItem(item))}
                className="bg-amber-300 py-2 mt-2 rounded-xl text-sm px-6 hover:bg-amber-400 transition"
              >
                Add to cart
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 p-2">
            <div className="md:col-span-2 bg-gray-50 overflow-hidden">
              <div className="relative max-w-2xl mx-auto [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-3xl sm:[&>svg]:text-4xl">
                <FaCartShopping className="left-2 text-amber-600" />

                <h1 className="text-center text-2xl sm:text-4xl font-medium text-gray-900 tracking-wide px-10 sm:px-1 py-3 line-clamp-1 truncate">
                  Product Ratings and Reviews
                </h1>
                <FaCommentDots className="right-2 text-blue-600" />
              </div>
            </div>
            {feedback?.map((review) => (
              <div
                key={review.id}
                className="flex bg-gray-200/15 rounded-lg gap-2 p-1"
              >
                <div className="flex items-center justify-center w-[15%]">
                  <img
                    src={review.profile_picture}
                    alt=""
                    className="w-12 h-12 md:w-15 md:h-15 lg:w-20 lg:h-20 rounded-full"
                  />
                </div>
                <div className="flex flex-col w-[75%] justify-center">
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-800">
                      {review.userName}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-2xl text-center ${
                        review?.rating > 3 ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    >
                      {review.rating}
                    </span>
                  </div>
                  <p className="text-sm">{review.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 max-w-6xl">
            {relatedProducts?.map((products) => (
              <div className="flex flex-col gap-2 justify-between">
                <div>
                  <img
                    src={products.productImage}
                    alt=""
                    onClick={()=>navigate(`/products/${products.id}`)}
                    className="w-[100px] h-[100px] object-contain"
                  />
                </div>
                <div className="flex flex-col  [&>span]:break-all">
                  <span>{products.productName}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-3 py-1 rounded-2xl text-center ${
                        products.productRate > 3
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {products.productRate}
                    </span>
                    <span className="text-blue-600">{`(${products.productCount})`}</span>
                  </div>
                  <span className="text-xl">
                    <sup className="text-xs font-light">$</sup>{" "}
                    {products.productPrice}
                  </span>
                </div>
                <button
                  onClick={() => dispatch(addItem(products))}
                  className="self-start bg-amber-300 py-2 mt-2 rounded-xl text-sm px-6 hover:bg-amber-400 transition"
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ViewProduct;
