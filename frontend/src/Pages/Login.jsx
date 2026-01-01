import { useEffect, useRef, useState } from "react";
import connectify from "/connectify.svg";
import { MdLock, MdPerson } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { motion } from "motion/react";
import connectifyPicture from "/src/assets/connectify.png";
import { IoMdArrowRoundBack } from "react-icons/io";
import { TbEye, TbEyeClosed } from "react-icons/tb";
import Footer from "../Components/Footer";
import OtpInput from "../Components/OtpInput";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AlertBox from "../Components/AlertBox";
import ConfirmationBox from "../Components/ConfirmationBox";

function Login({ isLogin, setIsLogin }) {
  let navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [forgetPassword, setForgetPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [verify, setVerify] = useState(true);
  const [gmail, setGmail] = useState("");
  const [createPassword, setCreatePassword] = useState(false);
  const [emailPart, setEmailPart] = useState(true);
  const [passUserName, setPassUserName] = useState("");
  const [timer, setTimer] = useState(0);
  const [isResend, setIsResend] = useState(false);
  const [resend, setResend] = useState(true);
  const [isSubmit, setIsSubmit] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const intervalRef = useRef(null);

  let emailSchema = Yup.object().shape({
    mail: Yup.string()
      .required("Gmail is required")
      .matches(/^[a-zA-Z0-9.]{5,}@gmail\.com$/, "please enter valid Gmail"),
  });
  let {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(emailSchema) });

  let passwordSchema = Yup.object().shape({
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*-?]).{5,}$/,
        "5+ chars with upper, lower, number & symbol"
      ),
    cpassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "password must match")
      .required("Please confirm your password"),
  });

  let {
    register: registerPass,
    handleSubmit: handlePasswordsubmit,
    trigger: triggerPass,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm({ resolver: yupResolver(passwordSchema) });

  let loginSchema = Yup.object().shape({
    uname: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  let {
    register: loginRegister,
    handleSubmit: loginSubmit,
    formState: { errors: loginErrors },
    trigger: loginTrigger,
    reset: loginReset,
  } = useForm({ resolver: yupResolver(loginSchema) });

  async function handleSubmition(data) {
    setLoading(true);
    try {
      const res = await axios.post("token/", {
        username: data.uname,
        password: data.password,
      });

      if (res.data.access) {
        localStorage.setItem("connectify_token", res.data.access);
        localStorage.setItem("connectify_refresh", res.data.refresh);
        localStorage.setItem("connectify_user", data.uname);

        setIsLogin(true);
        navigate("/home");
      }
    } catch (e) {
      setAlert("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  }

  function startTimer() {
    clearInterval(intervalRef.current);
    setIsResend(true);
    setTimer(60);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsResend(false);
          return;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleOtpSubmit(data) {
    setGmail(data.mail);
    const valid = await trigger("mail");

    if (!valid) return;

    setVerify(false);
    try {
      const res = await axios.post("auth/forgetPassword/", {
        email: data.mail,
      });
      setOtpSent(true);
      startTimer();
      setPassUserName(res.data?.username);
      setAlert(res.data?.message);
      setEmailPart(false);
    } catch (e) {
      console.error(e.response);
      if (e.response?.status === 404) {
        setConfirm(e.response?.data.error);
      } else {
        setAlert(e.response?.data.error);
      }

      setOtpSent(false);
    } finally {
      setVerify(true);
    }
  }

  async function resendOtp(e) {
    e.preventDefault();
    setResend(false);
    try {
      const res = await axios.post("auth/forgetPassword/", {
        email: gmail,
      });
      setOtpSent(true);
      startTimer();
      setPassUserName(res.data?.username);
      setAlert(res.data?.message);
    } catch (e) {
      console.error(e.response);
      if (e.response?.status === 404) {
        setConfirm(e.response?.data.error);
      } else {
        setAlert(e.response?.data.error);
      }
      setOtpSent(false);
    } finally {
      setResend(true);
    }
  }

  function confirmTrue() {
    setForgetPassword(false);
    setOtpSent(false);
    navigate("/signup");
  }

  function confirmFalse() {
    setOtpSent(false);
    return;
  }

  async function verifyOtp() {

    try {
      await axios.post("auth/verify-otp/", {
        email: gmail,
        otp: otp.join(""),
      });
      setOtpSent(false);
      setCreatePassword(true);
    } catch (e) {
      setAlert(e.response?.data.error);
      setCreatePassword(false);
    }
  }

  useEffect(() => {
    if (otp.join("").length === 6) {
      verifyOtp();
    }
  }, [otp]);

  async function handlePasswordRest(data) {
    setIsSubmit(false);
    try {
      const res = await axios.post("auth/passwordReset/", {
        email: gmail,
        password: data.password,
      });
      setAlert(res?.data.message);
      navigate("");
      setCreatePassword(false);
      setForgetPassword(false);
    } catch (e) {
      setAlert(e.response?.data.error);
    } finally {
      setIsSubmit(true);
    }
  }

  function alertFalse() {
    setAlert(null);
  }

  if (isLogin) {
    return <Navbar />;
  }
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-pink-700 via-blue-700  to-blue-900 [&::-webkit-scrollbar]:hidden scroll-smooth [scrollbar-width]:none relative">
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
      {
        confirm && <ConfirmationBox title={confirm} onConfirm={confirmTrue} onClose={confirmFalse}/>
      }
      <motion.div className="lg:hidden mt-22  flex flex-col justify-center items-center mb-4">
        <img
          src={connectify}
          className=" w-[130px] h-[130px] border-0"
          alt=""
        />
        <h1 className="text-2xl text-white font-semibold text-shadow-lg">
          Welcome to Connectify
        </h1>
        <p className="text-gray-200 font-light text-sm text-shadow-lg">
          — Where Social Meets Smart Shopping
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col lg:flex-row grow justify-center items-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="hidden lg:flex flex-col grow justify-center items-start px-4 max-w-[68%] select-none"
        >
          <div className="py-26 mt-5">
            <img
              src={connectifyPicture}
              className="w-[300px] h-[300px]"
              alt="Logo"
            />
            <h1 className="text-gray-100 text-5xl xl:text-6xl text-left font-semibold text-shadow-lg/30">
              Welcome to Connectify
              <p className="text-2xl xl:text-3xl text-gray-200">
                — Where Social Meets Smart Shopping
              </p>
            </h1>
            <div className="max-w-[95%] xl:max-w-[85%] mt-4">
              <p className="text-justify text-sm xl:text-lg text-gray-950">
                <span className="font-bold text-black">"Connectify"</span> is a{" "}
                <span className="font-bold text-shadow-[1px_1px_0_var(--color-black),-1px_-1px_0_var(--color-black),1px_-1px_0_var(--color-black),-1px_1px_0_var(--color-black)] text-pink-600">
                  next-generation
                </span>{" "}
                social commerce platform that bridges the gap between your
                social world and{" "}
                <span className="font-semibold underline text-black">
                  personalized shopping experiences
                </span>
                . We combine the power of social connections with intelligent
                product recommendations to transform how you discover, share,
                and purchase products online.
              </p>
            </div>
          </div>
        </motion.div>
        <div
          className={`w-full max-w-md bg-[#F5F5F5] shadow-2xl rounded-2xl mb-10 lg:mb-0 ${
            forgetPassword ? "" : "p-10 md:p-10"
          }`}
        >
          {!forgetPassword && (
            <>
              <h1 className="text-center text-3xl md:text-4xl font-semibold mb-8">
                Login
              </h1>

              <form
                onSubmit={loginSubmit(handleSubmition)}
                className="space-y-6"
              >
                <div className="relative">
                  <div className="relative">
                    <MdPerson className="absolute left-4 top-5 text-gray-500 text-2xl" />
                    <input
                      type="text"
                      autoComplete="off"
                      {...loginRegister("uname")}
                      placeholder="Username"
                      className="w-full border border-gray-400 bg-gray-100 text-gray-700 p-4 pl-12 rounded-md outline-none focus:ring-2 focus:ring-pink-600"
                    />
                  </div>
                  {!!loginErrors?.uname?.message && (
                    <span className="absolute text-sm text-red-600">
                      {loginErrors?.uname?.message}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="relative">
                    <MdLock className="absolute left-4 top-5 text-gray-500 text-2xl" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="off"
                      {...loginRegister("password")}
                      placeholder="Password"
                      className=" w-full outline-0 border border-gray-400 bg-gray-100 p-4 px-12 pr-8 text-gray-700 rounded-md focus:ring-2 focus:ring-pink-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-lg text-gray-500"
                  >
                    {showPassword ? <TbEye /> : <TbEyeClosed />}
                  </button>
                  {!!loginErrors?.password?.message && (
                    <span className="absolute text-sm text-red-600">
                      {loginErrors.password?.message}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-700 font-semibold p-3  hover:bg-pink-800 rounded-md text-white transition active:scale-95"
                >
                  {loading && (
                    <svg
                      className="absolute w-6 h-6 animate-spin"
                      viewBox="0 0 24 24"
                      fill="currentcolor"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
              <div className="w-full text-end pt-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setForgetPassword(true);
                    setEmailPart(true);
                  }}
                  className="text-gray-600 text-sm hover:underline cursor-pointer transition"
                >
                  forget password?
                </button>
              </div>
              <p className="text-gray-700 mt-6 text-center">
                Not a member?{" "}
                <Link
                  className="text-pink-700 ml-1 hover:underline"
                  to="/signup"
                >
                  Signup now
                </Link>
              </p>
            </>
          )}
          {forgetPassword && (
            <div>
              <div className="flex items-center border-b border-gray-300 py-3 px-2 lg:px-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setForgetPassword(false);
                    reset();
                    setVerify(true);
                    setOtp(["", "", "", "", "", ""]);
                    setOtpSent(false);
                    setIsResend(false);
                    setCreatePassword(false);
                  }}
                  className="rounded-full hover:bg-gray-800 text-gray-800 hover:text-white transition p-2"
                >
                  <IoMdArrowRoundBack className="text-2xl" />
                </button>
                <h1 className="text-2xl text-gray-900 font-bold w-full text-center ">
                  Password Recovery
                </h1>
              </div>
              <div
                className={`mx-3 py-5 px-3  ${
                  !!otpSent || !!createPassword
                    ? "border-b-2 border-dashed border-gray-300"
                    : ""
                }`}
              >
                <form onSubmit={handleSubmit(handleOtpSubmit)} className="">
                  <div className="relative flex flex-col">
                    <span>
                      <label className="text-xl text-gray-800 font-medium">
                        Email
                        <sup className="text-red-500 font-bold text-sm">*</sup>
                      </label>
                    </span>
                    <input
                      type="text"
                      {...register("mail")}
                      placeholder="Registered Email"
                      autoComplete="off"
                      disabled={!emailPart}
                      className="border text-gray-500 rounded p-2  outline-none focus:ring-2  focus:ring-pink-600 focus:text-gray-600"
                    />
                    {!!errors.mail?.message && (
                      <span className="absolute left-0 top-full text-sm text-red-600">
                        {errors.mail?.message}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!verify || !emailPart}
                    className={`self-start ${
                      !emailPart ? "bg-gray-500" : "bg-blue-700"
                    } text-gray-100 rounded-md px-4 py-1 mt-6 active:scale-95 transition `}
                  >
                    {verify ? "Verify" : "Loading.."}
                  </button>
                </form>
              </div>
              {otpSent && (
                <div className="flex flex-col items-center py-5 mx-3 ">
                  <h1 className="text-2xl font-medium text-gray-800">
                    Enter OTP
                  </h1>
                  <OtpInput otp={otp} setOtp={setOtp} />
                  <button
                    onClick={(e) => resendOtp(e)}
                    className={`rounded px-2 py-1 mt-6 text-white ${
                      isResend ? "bg-gray-400" : "bg-blue-600"
                    }`}
                  >
                    {isResend
                      ? ` Resend in ${Math.floor(timer / 60)}:${String(
                          timer % 60
                        ).padStart(2, "0")}`
                      : resend
                      ? "Resend"
                      : "Loading.."}
                  </button>
                </div>
              )}
              {createPassword && (
                <>
                  <div className="flex flex-col mx-3 gap-5 p-3 mt-2 mb-5">
                    <div className="flex flex-col">
                      <h2 className="text-xl text-gray-800 font-medium">
                        Username
                      </h2>
                      <input
                        type="text"
                        disabled
                        value={passUserName}
                        className="border-2 border-gray-500 text-gray-500  p-2  rounded-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <h1 className="text-xl text-gray-800 font-medium">
                        Create New Password
                      </h1>
                      <form
                        onSubmit={handlePasswordsubmit(handlePasswordRest)}
                        className="flex flex-col gap-5"
                      >
                        <div className="relative">
                          <div className="relative">
                            <MdLock className="absolute left-4 top-5 text-gray-500 text-2xl" />
                            <input
                              type="password"
                              placeholder="New Password"
                              {...registerPass("password")}
                              className={
                                "w-full border border-gray-400 bg-gray-100 text-gray-500 focus:text-gray-700 p-4 pl-12 rounded-md outline-none focus:ring-2 focus:" +
                                (!!passErrors.password?.message
                                  ? "ring-red-600"
                                  : "ring-pink-600")
                              }
                            />
                          </div>
                          {!!passErrors?.password?.message && (
                            <span className="absolute left-0 top-full text-sm text-red-600">
                              {passErrors.password?.message}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <div className="relative">
                            <MdLock className="absolute left-4 top-5 text-gray-500 text-2xl" />
                            <input
                              type="password"
                              {...registerPass("cpassword")}
                              placeholder="Confirm Password"
                              className={
                                "w-full border border-gray-400 bg-gray-100 text-gray-500 focus:text-gray-700 p-4 pl-12 rounded-md outline-none focus:ring-2 focus:" +
                                (!!passErrors.cpassword?.message
                                  ? "ring-red-600"
                                  : "ring-pink-600")
                              }
                            />
                          </div>
                          {!!passErrors.cpassword?.message && (
                            <span className="absolute left-0 top-full text-sm text-red-600">
                              {passErrors.cpassword?.message}
                            </span>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="bg-pink-700 text-white font-medium rounded-lg py-2 active:scale-90 transition"
                        >
                          {isSubmit ? "Submit" : "Loading..."}
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}

export default Login;
