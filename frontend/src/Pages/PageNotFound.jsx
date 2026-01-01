import React from "react";
import connectify from "/connectify.svg";
import { motion } from "motion/react";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";
// import Scribble from "../assets/scribble.png";
function PageNotFound() {
  const isLogin = localStorage.getItem("connectify_user")
  return (
    <motion.div className="flex flex-col min-h-screen bg-linear-to-b from-pink-700 via-blue-700 to-blue-900">
      <header className="flex justify-between p-5 bg-gray-700 text-white fixed top-0 left-0 right-0 shadow-2xl z-50">
        <div className="flex items-center space-x-2.5">
          <img
            src={connectify}
            alt="Connectify Logo"
            className="w-[30px] h-[30px] border-0 rounded-full"
          />
          <h1 className="text-lg font-bold">Connectify </h1>
        </div>
      </header>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col flex-1 justify-center items-center mt-22 mx-5"
      >
        <div className="bg-[#F5F5F5]/90 max-w-4xl w-full p-5 flex flex-col items-center justify-center rounded-2xl">
          <code className="text-9xl md:text-[250px] px-5 md:px-10 text-gray-900 font-extrabold italic">
            4<span className="text-amber-500">0</span>4
          </code>
          <span className="md:tracking-wide  md:text-4xl text-gray-700 mt-5">
            Uh oh. The page does not exist
          </span>
          <span className="text-xs md:text-base text-gray-900">
            Head to our{" "}
            <Link to={isLogin?"/home":"/"} className="text-pink-700 hover:underline transition">
              Homepage
            </Link>{" "}
            that does exist.
          </span>
        </div>
      </motion.div>
      <Footer />
    </motion.div>
  );
}

export default PageNotFound;
