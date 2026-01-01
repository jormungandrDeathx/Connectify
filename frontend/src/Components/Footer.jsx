import React from "react";
import connectifyPicture from "/src/assets/connectify.png";
import { PiCopyrightLight } from "react-icons/pi";
import { AiFillInstagram } from "react-icons/ai";
import { SiFacebook } from "react-icons/si";
import { GrTwitter } from "react-icons/gr";
import { TbBrandYoutubeFilled } from "react-icons/tb";
import { Link } from "react-router-dom";

function Footer() {
  const isLogin = localStorage.getItem("connectify_user");

  return (
    <div className="">
      <div className="bg-gray-900 w-full  flex justify-between flex-col  items-center py-5 text-gray-300">
        <div className="px-2">
          <ul className="flex items-center gap-6 [&>li]:text-xl [&>li]:hover:scale-125 [&>li]:transition [&>li]:duration-300 [&>li]:ease-in-out">
            <li className="">
              <AiFillInstagram className="text-[25px]"/>
            </li>
            <li>
              <SiFacebook />
            </li>
            <li>
              <GrTwitter />
            </li>
            <li>
              <TbBrandYoutubeFilled />
            </li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 pt-2 ">
          <div className="flex items-center [&>h1]:text-xs [&>h1]:sm:text-base">
            <img src={connectifyPicture} alt="" className="w-10 h-10" />
            <PiCopyrightLight className="text-xs" />
            <h1>{new Date().getFullYear()} Copyright. All rights reserved </h1>
          </div>
          {/* {login || signup ? ( */}
          <div className="text-xs sm:text-sm sm:py-2 font-light w-fit">
            <ul className="flex gap-4 justify-center [&>a]:hover:text-white [&>a]:hover:scale-110 [&>a]:transition">
              <Link to={isLogin ? "/home" : "/"}>Home</Link>
              <Link to="/aboutUs">About</Link>
              <Link>Terms and Condtions</Link>
              <Link to="/contact">Contact Us</Link>
            </ul>
          </div>
          {/* // ) : null} */}
        </div>
      </div>
    </div>
  );
}

export default Footer;
