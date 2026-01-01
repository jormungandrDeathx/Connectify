import connectify from "/connectify.svg";
import Footer from "../Components/Footer";
import { motion } from "motion/react";
import { BsChatDots } from "react-icons/bs";
import { CgWebsite } from "react-icons/cg";
import { GoHeart } from "react-icons/go";
import Cart from "../assets/cart.png";
import Chat from "../assets/chat.png";
import Friends from "../assets/friendship.png";

function About() {
  return (
    <motion.div className="flex flex-col bg-linear-to-b  from-pink-700 via-blue-700 to-blue-900">
      <header className="flex justify-between p-5 bg-gray-700 text-white  shadow-2xl fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-2.5">
          <img
            src={connectify}
            className=" w-[30px] h-[30px] border-0"
            alt=""
          />
          <h1 className="text-lg font-bold ">Connectify</h1>
        </div>
      </header>
      <div className="flex flex-col min-h-screen justify-center gap-5 py-22">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center"
        >
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center [&>div:nth-child(odd)]:bg-gray-100 [&>div:nth-child(odd)]:rounded-full [&>div:nth-child(odd)]:p-1 [&>div:nth-child(odd)]:w-15 [&>div:nth-child(odd)]:h-15 [&>div:nth-child(odd)]:md:w-22 [&>div:nth-child(odd)]:md:h-22 ">
              <div className="">
                <img src={Chat} alt="" className=""/>
              </div>
              <div className="w-[150px] h-[150px] md:w-[300px] md:h-[300px]">
                <img src={connectify} alt="Logo" className="object-contain" />
              </div>
              <div>
                <img src={Friends} alt="" />{" "}
              </div>
            </div>
          </div>
          <div className="flex items-center">

          <div className="flex flex-col bg-gray-100 justify-center max-w-4xl  mx-2 p-4 rounded-xl">
            <div className="flex">
                
              <img src={Cart} className="w-20 h-20" alt="" />
            <p className="text-pink-600 text-center text-3xl md:text-5xl font-medium rounded">
              Where Social Meets{" "}
              <span className="text-blue-600 ">Smart Shopping</span>
            </p>
            </div>
            <p className="break-all text-justify mt-4 mx-2">
              Connectify is a social shopping platform that brings people and
              products together in one engaging experience. It helps you
              discover new items, share them with friends, and make better
              purchase decisions together.
            </p>
          </div>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex justify-center mt-10"
        >
          <div
            className="bg-[#F5F5F5] sm:max-w-6xl grid sm:grid-cols-3 justify-center gap-5 rounded-2xl [&>div]:bg-gray-200 [&>div]:rounded-lg [&>div]:p-2 
 mx-2 p-4 [&>div>span]:font-medium [&>div>span]:block [&>div>span]:mb-2 [&>div>span]:md:text-2xl [&>div>span]:text-center [&>div>p]:text-sm [&>div>p]:md:text-lg [&>div>p]:font-light [&>div>p]:break-all"
          >
            <div>
              <span>
                <BsChatDots className="w-full text-5xl text-center text-blue-600 my-2" />
              </span>
              <span>How You Shop Together</span>
              <p>
                Connectify makes shopping feel more like a conversation than a
                checkout process. You can connect with your friends inside the
                platform, talk to them in real time, and discuss what you like
                before making a purchase.
              </p>
            </div>
            <div>
              <span>
                <CgWebsite className="w-full text-5xl text-center text-amber-600 my-2" />
              </span>
              <span>Designed for Everyone</span>
              <p>
                The platform focuses on simple, friendly design so anyone can
                use it comfortably, whether they are experienced online shoppers
                or just starting out. Clear layouts, familiar interactions, and
                helpful guidance make it easy to explore, chat, and shop without
                feeling overwhelmed.
              </p>
            </div>
            <div>
              <span>
                <GoHeart className="w-full text-5xl text-center text-red-600 mt-2 mb-1" />
              </span>
              <span>Our Purpose</span>
              <p>
                Connectify’s goal is to turn online shopping into a shared
                experience instead of something you do alone. By combining
                social interaction with curated product suggestions, it helps
                you feel more confident, informed, and connected every time you
                shop.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* <div className="absolute bottom-0 w-full"> */}
      <Footer />
      {/* </div> */}
    </motion.div>
  );
}

export default About;
