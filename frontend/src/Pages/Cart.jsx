import React, { useEffect, useState } from "react";
import Loading from "../Components/Loading";
import { GoTrash } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { FaRegSmile } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import { removeItem, increaseQty, decreaseQty } from "../Store/cartSlice";
import { BsCartCheck } from "react-icons/bs";
import { MdShoppingCartCheckout } from "react-icons/md";
import { IoBagCheckOutline } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { IoMdTrash } from "react-icons/io";
import { TbShoppingCartExclamation } from "react-icons/tb";

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  let cartProducts = useSelector((state) => {
    return state.cart;
  });
  const total = cartProducts.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );
  useEffect(() => {
    try {
      if (cartProducts.length === 0) {
        setEmpty(true);
      }
    } catch (e) {
      console.log("Error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  

  function removeFromCart(item) {
    dispatch(removeItem(item));
  }
  if (loading) {
    return <Loading />;
  }

  function inc(item) {
    dispatch(increaseQty(item.id));
  }
  function dec(item) {
    dispatch(decreaseQty(item.id));
  }

  if (empty) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-b from-pink-700 via-blue-700  to-blue-900">
        <div className="flex justify-center items-center grow mt-22 mb-14">
          <div className="bg-[#F5F5F5] flex flex-col gap-6 justify-center items-center  md:mt-10 rounded-2xl mx-10 px-5 py-5">
            <TbShoppingCartExclamation className="text-6xl text-amber-600"/>
            <h1 className="md:text-2xl font-semibold break-all">
              Smiles are better with products!
            </h1>
            <p className="text-sm text-gray-600 px-4">Go grab a few 🛒</p>
            <button
              onClick={()=>navigate("/products")}
              className="text-xs md:text-sm bg-orange-600 rounded-lg text-white p-2 hover:bg-orange-700"
            >
              Add products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5] md:bg-linear-to-b from-pink-700 via-blue-700 to-blue-900">
      <div className="sticky flex top-24 mb-15 z-50 justify-center">
        <div className="flex justify-center gap-3 max-w-4xl w-full items-center border-b border-gray-300 py-2 mx-5 shadow rounded-xl transition-all duration-300 ease-in-out bg-[#F5F5F5]/90">
          <MdShoppingCartCheckout className="text-4xl text-amber-600" />

          <h1 className="text-3xl font-medium">My Cart</h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row flex-1">
        <div className="md:py-14 pt-14 md:mx-4">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-5 w-full">
              {cartProducts.length !== 0
                ? cartProducts.map((item) => (
                    <div key={item.id} className="bg-[#F5F5F5] md:rounded-lg md:p-4 flex md:block w-full border-b md:border-b-0 border-gray-300 ">
                      <div className="flex justify-center md:m-5 p-2 w-[25%]  md:w-fit">
                        <img
                          loading="lazy"
                          onClick={()=>navigate(`/products/${item.id}`)}
                          src={item.productImage}
                          className="w-30 h-30 md:w-[170px] md:h-[170px] object-contain"
                          alt="products"
                        />
                      </div>
                      <div className="w-[75%] md:w-fit mr-1">
                      <h1
                        title={item.productName}
                        className="line-clamp-2 font-semibold pt-2 md:border-t border-gray-400 text-xs md:text-base"
                      >
                        {item.productName}
                      </h1>
                      <div className="flex flex-col justify-center md:h-20 ">
                        <p
                          title={item.productDesc}
                          className="text-gray-500 line-clamp-2 text-xs md:text-sm"
                        >
                          {item.productDesc}
                        </p>
                      </div>
                      <div className="flex w-22 gap-2 items-center">
                        <h3
                          className={`text-xs md:text-sm px-3 py-1 rounded-2xl text-center ${
                            item.productRate > 3
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {item.productRate}
                        </h3>
                        <h1 className="text-xs text-blue-600 text-center">{`(${item.productCount})`}</h1>
                        </div>
                      
                      <div className="flex flex-row justify-between items-center pr-3">
                        <h2 className="text-xl font-medium md:my-4">{`$ ${(
                          item.productPrice * item.quantity
                        ).toFixed(2)}`}</h2>
                        <div className="w-20 md:w-fit grid grid-cols-3 border items-center rounded">
                          <div
                            onClick={() => dec(item)}
                            className="border-r border-gray-500 px-1"
                          >
                            <IoMdTrash className="text-gray-700" />
                          </div>
                          <h2 className="text-center select-none">
                            {item.quantity}
                          </h2>
                          <div
                            onClick={() => inc(item)}
                            className="border-l px-1"
                          >
                            <TiPlus className="text-gray-800" />
                          </div>
                        </div>
                      </div>
                      </div>
                      <div className="flex justify-center h-full md:h-fit items-end pb-3 pr-1">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="bg-amber-300 p-2 rounded-xl text-sm md:w-[250px] hover:bg-amber-400 transition md:after:content-['remove']"
                        >
                          <GoTrash className="md:absolute text-lg select-none" />{" "}
                          {""}
                        </button>
                      </div>
                    </div>
                  ))
                : setEmpty(true)}
            </div>
          </div>
        </div>
        <div className="md:sticky top-46 md:mx-4 md:w-[400px] h-fit bg-[#F5F5F5] md:rounded-xl p-3">
          <h1 className="text-center text-2xl font-medium tracking-wide border-b pb-2 border-gray-300">Checkout Summary</h1>
            <div className="flex flex-col py-5">
              <label className="uppercase text-base md:text-sm font-medium">
                Enter Promo Code
              </label>
              <div className="flex justify-between">
                <input
                  type="text"
                  className="text-gray-400 md:text-xs lg:text-sm border-2 border-gray-400 px-2 py-2 lg:py-3 w-full"
                  placeholder="Promo Code"
                />
                <button disabled className="uppercase px-2 bg-black text-white text-sm md:text-xs ">
                  submit
                </button>
              </div>
            </div>

          <div className="flex flex-col gap-2 text-gray-500 px-2 py-2 ">
            <code>
              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span>TBD</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-$0</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>TBD</span>
              </div>
            </code>
          </div>
          <div className="flex justify-between text-xl  lg:text-2xl font-medium mx-1 my-1 border-t border-gray-300">
            <span className="">Total</span>
            <span>{`$${total.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-center items-center gap-2 bg-amber-300 hover:bg-amber-400 transition duration-300 rounded-xl py-3 lg:text-2xl font-medium mt-5  select-none ">
            <IoBagCheckOutline className="" />
            <span>Checkout</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
