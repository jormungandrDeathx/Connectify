import connectify from "../assets/connectify.png";
import Footer from "../Components/Footer";
import Chat from "../assets/chat.png";
import Friends from "../assets/friendship.png";
import Gmail from "../assets/gmail.png";
import Insta from "../assets/instagram.png";
import Youtube from "../assets/youtube.png";
import { LiaHeadsetSolid } from "react-icons/lia";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import AlertBox from "../Components/AlertBox";
import { HiOutlineMail } from "react-icons/hi";
import { MdPerson } from "react-icons/md";
import { LuMessageSquareText } from "react-icons/lu";


function ContatcUs() {
  let navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [alert, setAlert] = useState(null);
  let schema = Yup.object().shape({
    mail: Yup.string()
      .required("Email is required")
      .matches(/^[a-zA-z0-9].{5,}@gmail\.com$/, "Enter valid Gmail address"),
    name: Yup.string()
      .required("Name is required")
      .matches(/^[A-Za-z].{2,}$/, "Name is required"),
    message: Yup.string()
      .required("comment is required")
      .matches(/^[A-Za-z].{5,}$/, "Minimum 5 words required"),
  });

  let {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  async function handleComment(data) {
    setIsSubmit(true);
    try {
      const res = await axios.post("comment/", {
        email: data.mail,
        name: data.name,
        comment: data.message,
      });

      reset();
      setAlert(res.data.message);
    } catch (e) {
      setAlert(e.response.data.error);
    } finally {
      setIsSubmit(false);
    }
  }

  function alertFalse() {
    setAlert(null);
    navigate("/");
  }

  return (
    <motion.div>
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
      {alert && <AlertBox message={alert} onClose={alertFalse} />}
      <div className="bg-linear-to-b min-h-screen from-pink-700 via-blue-700 to-blue-900 pt-22">
        <div className="flex flex-1 justify-center items-center mb-4">
          <div className="flex items-center gap-4 [&>div:nth-child(odd)]:bg-gray-100 [&>div:nth-child(odd)]:rounded-full [&>div:nth-child(odd)]:p-1 [&>div:nth-child(odd)]:w-15">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 10,
                mass: 1,
              }}
              className=""
            >
              <img src={Chat} alt="" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 5,
                mass: 1,
                duration: 0.35,
                ease: "easeInOut",
              }}
              className="w-[150px] h-[150px] "
            >
              <img src={connectify} alt="Logo" className="object-contain" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 10,
                mass: 1,
              }}
            >
              <img src={Friends} alt="" />{" "}
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex gap-4 w-full justify-center items-center "
        >
          <h1 className="text-4xl md:text-6xl  text-gray-200 font-bold max-w-7xl  rounded-xl">
            Get in Touch
          </h1>
          <span className="bg-gray-200 rounded-2xl shadow shadow-black">
            <LiaHeadsetSolid className="text-6xl text-gray-900 " />
          </span>
        </motion.div>
        <div className=" py-10 flex md:flex-row justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut", delay: 0.15 }}
            className="flex gap-5 md:gap-0 flex-col md:flex-row max-w-5xl shadow-2xl"
          >
            <div className="flex gap-5 flex-col justify-center items-center bg-gray-10 p-4 md:rounded-l-xl bg-gray-100/90 md:w-[50%]">
              <h1 className="text-center text-2xl md:text-3xl border-b  border-gray-300 font-medium text-gray-900">
                Reach out us on
              </h1>
              <div class="flex gap-5 [&>div]:rounded-full [&>div]:p-2 [&>div]:bg-gray-300 [&>div>img]:w-[30px] [&>div>img]:h-[30px] [&>div]:shadow-md [&>div]:shadow-black">
                <div>
                  <img src={Gmail} alt="" />
                </div>
                <div>
                  <img src={Insta} alt="" />
                </div>
                <div>
                  <img src={Youtube} alt="" />
                </div>
              </div>
              <p className="text-sm md:text-xl p-2 text-justify text-gray-900">
                Have a question, idea, or issue with Connectify? The team is
                here to help and would love to hear from you. Whether you are
                exploring the platform for the first time or already an active
                user, your feedback matters.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleComment)} className="md:w-[50%]">
              <div className="flex flex-col gap-5 [&>div]:relative [&>div>span]:absolute [&>div>span]:top-full [&>div>span]:text-sm [&>div>span]:text-red-600 [&>div]:flex [&>div]:flex-col [&>div>input]:outline-0 [&>div>label]:text-lg [&>div>label]:text-gray-900 [&>div>label]:font-medium [&>div>label>svg]:inline-block [&>div>label>svg]:mr-1 [&>div>label>sup]:text-red-500 [&>div>input]:sm:w-[75%] [&>div>input]:rounded-md [&>div>input]:p-2 [&>div>input]:border-2 [&>div>input]:border-gray-500 [&>div]:px-4 bg-gray-100 py-5 md:rounded-r-xl">
                <h1 className="text-center text-2xl md:text-3xl text-gray-900 border-b pb-4 border-gray-300 font-medium">
                  Your Feedback Matters
                </h1>
                <div>
                  <label>
                    <HiOutlineMail/> Email<sup>*</sup>
                  </label>
                  <input autoComplete="off" {...register("mail")} type="text" />
                  {!!errors.mail?.message && (
                    <span className="">{errors.mail?.message}</span>
                  )}
                </div>
                <div>
                  <label><MdPerson/>
                    Name<sup>*</sup>
                  </label>
                  <input autoComplete="off" {...register("name")} type="text" />
                  {!!errors.name?.message && (
                    <span className="">{errors.name?.message}</span>
                  )}
                </div>
                <div>
                  <label><LuMessageSquareText/>
                    Message<sup>*</sup>
                  </label>

                  <textarea
                    maxLength={100}
                    {...register("message")}
                    className="resize-none w-full h-40 outline-0 p-2 border-2 border-gray-500 rounded-md"
                  ></textarea>
                  {!!errors.message?.message && (
                    <span>{errors.message?.message}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmit}
                  className={`bg-pink-700 self-center w-fit mx-2 py-1 px-5 rounded-md text-white font-medium active:scale-95 ${
                    isSubmit ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {isSubmit ? "Loading..." : "Submit"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}

export default ContatcUs;
