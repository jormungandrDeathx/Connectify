import connectify from "/connectify.svg";
import { MdPerson, MdLock, MdMapsHomeWork } from "react-icons/md";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import connectifyPicture from "/src/assets/connectify.png";
import Footer from "../Components/Footer";
import { IoMdArrowRoundBack } from "react-icons/io";
import { SiGmail } from "react-icons/si";
import OtpInput from "../Components/OtpInput";
import { useEffect, useRef, useState } from "react";
import { TbEye, TbEyeOff } from "react-icons/tb";
import AlertBox from "../Components/AlertBox";
import { IoPerson } from "react-icons/io5";
import { MdLocalPhone } from "react-icons/md";
import { IoMdPin } from "react-icons/io";
import { TbMapPin2 } from "react-icons/tb";
import { FaGlobeAsia } from "react-icons/fa";
import { PiHashBold } from "react-icons/pi";

function Signup() {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmit, setIsSubmit] = useState(false);

  const [timer, setTimer] = useState(0);
  const [isResend, setIsResend] = useState(false);
  const [gmail, setGmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [password, setPassword] = useState(null);
  const [proceed, setProceed] = useState(true);
  const [resend, setResend] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showcPassword, setShowcPassword] = useState(false);
  const [userDeatails, setUserDetails] = useState(false);
  const [pincode, setPincode] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [alert, setAlert] = useState(null);
  const [accountCreationAlert, setAccountCreationAlert] = useState(null)

  const intervalRef = useRef(null);

  let navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    if (userDeatails) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userDeatails]);
  let schema = Yup.object().shape({
    mail: Yup.string()
      .required("Gmail is required")
      .matches(/^[a-zA-Z0-9.]{5,}@gmail\.com$/, "please enter valid Gmail"),
    uname: Yup.string()
      .required("Username is required")
      .matches(/^[A-Z][A-Za-z0-9]{2,10}$/, "Invalid Username"),
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
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  let userSchema = Yup.object().shape({
    fname: Yup.string()
      .required("First Name required")
      .matches(/^[A-Za-z]{4,}$/, "alteast 5 characters"),
    lname: Yup.string()
      .required("Last Name required")
      .required(/^[A-Za-z]{2,10}$/),
    pincode: Yup.string()
      .required("Pincode required")
      .matches(/^[1-9][0-9]{5}$/, "Invalid pincode")
      .test("valid-pincode", "Invalid pincode", async (value) => {
        if (!value || value.length !== 6) return false;

        try {
          const res = await axios.get(
            `https://api.postalpincode.in/pincode/${value}`
          );

          return (
            res.data?.[0]?.Status === "Success" &&
            Array.isArray(res.data[0]?.PostOffice) &&
            res.data[0].PostOffice.length > 0
          );
        } catch {
          return false;
        }
      }),
    phone_n: Yup.string()
      .required("Contact Number Required")
      .matches(/^[0-9]{10}$/, "Invalid contact number"),
    street_n: Yup.string()
      .required("Street Number required")
      .matches(/^[0-9]{1,}$/, "Invalid number"),
    street: Yup.string()
      .required("Street Name required")
      .matches(/^[A-Za-z ]{5,20}$/, "Maximum 20 characters"),
  });

  let {
    register: userRegister,
    handleSubmit: userHandleSubmit,
    formState: { errors: userDetailsErrors, isValidating: userIsValidating },
    trigger: userTrigger,
    reset: userReset,
  } = useForm({ resolver: yupResolver(userSchema), mode: "onBlur" });

  function startTimer() {
    clearInterval(intervalRef.current);
    setIsResend(true);
    setTimer(60);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsResend(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function postApi() {
    if (pincode.length !== 6) return;
    try {
      const res = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      if (res.data[0].Status === "Success") {
        setDistrict(res.data[0].PostOffice[0].District);
        setState(res.data[0].PostOffice[0].State);
        setCountry(res.data[0].PostOffice[0].Country);
      } else {
        setDistrict("");
        setState("");
        setCountry("");
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (pincode.length === 6) {
      postApi();
    }
  }, [pincode]);

  async function handleOtpSubmition(data) {
    setProceed(false);
    setOtp(["", "", "", "", "", ""]);

    const valid = await trigger();
    if (!valid) {
      setProceed(true);
      return;
    }

    setGmail(data.mail);
    setUserName(data.uname);
    setPassword(data.password);
    setTimeout(() => {
      sendOtp(data);
    }, 0);
  }

  async function sendOtp(data) {
    setResend(false);
    try {
      await axios.post("auth/send-otp/", {
        email: data.mail || gmail,
        username: data.uname,
      });
      setOtpSent(true);
      startTimer();

      setAlert("OTP sent to your Gmail");
    } catch (e) {
      console.error(e.response?.data);

      setAlert(e.response?.data?.error);
      setProceed(true);
    } finally {
      setResend(true);
    }
  }

  async function handleUserCreation(data) {
    setIsSubmit(true);
    try {
      const res = await axios.post("signup/", {
        username: userName,
        password: password,
        email: gmail,
        first_name: data.fname,
        last_name: data.lname,
        phone_number: data.phone_n,
        pincode: data.pincode,
        street_number: data.street_n,
        street_name: data.street,
        city: district,
        state: state,
        country: country,
      });

      setAccountCreationAlert("Account Created Successfully.");
    } catch (e) {
      console.error("Error while creating: ", e.response?.data);
      reset();

      setOtpSent(false);
      setProceed(true);
      if (e.response?.data?.error) {
        setAlert(e.response?.data.error[0]);
      } else if (e.response?.data?.username) {
        setAlert(e.response?.data.username[0]);
      } else {
        setAlert("We are facing some issues right now!, try again later.");
      }
    } finally {
      setIsSubmit(false);
    }
  }

  async function verifyOtp() {
    try {
      const res =await axios.post("auth/verify-otp/", {
        email: gmail,
        otp: otp.join(""),
      });
      setAlert(null)
      setAlert(res.data.message)
      setOtpSent(false);
      setUserDetails(true);
    } catch (e) {
      setAlert(e.response?.data.error);
    }
  }

  useEffect(() => {
    if (otp.join("").length === 6) {
      verifyOtp();
    }
  }, [otp]);

  function handleBack() {
    clearInterval(intervalRef.current);
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setTimer(0);
    setIsResend(false);
    setResend(true);
    setProceed(true);
    reset();
  }

  function alertFalse() {
    setAlert(null);
  }

  function accountCreationAlertFalse(){
    navigate("/")
  }

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
      {alert && <AlertBox message={alert} onClose={alertFalse} />}
      {accountCreationAlert && <AlertBox message={accountCreationAlert} onClose={accountCreationAlertFalse}/>}

      <motion.div className="lg:hidden mt-22 flex flex-col justify-center items-center">
        <img
          src={connectify}
          alt="Connectify Logo"
          className="w-[130px] h-[130px]"
        />
        <h1 className="text-4xl text-white font-semibold text-shadow-lg">
          Connectify
        </h1>
        <p className="text-gray-100 text-sm font-light text-shadow-lg">
          — Your Social Network, Your Shopping Guide
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col lg:flex-row flex-1 justify-center items-center mt-4 px-4 "
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
            <h1 className="text-gray-100 text-5xl xl:text-7xl text-left font-semibold text-shadow-lg/30">
              Connectify
              <p className="text-2xl xl:text-3xl text-gray-200">
                — Your Social Network, Your Shopping Guide
              </p>
            </h1>
            <div className="max-w-[95%] xl:max-w-[85%] mt-4">
              <p className="text-justify text-sm xl:text-lg text-gray-950">
                Discover{" "}
                <span className="font-bold text-shadow-[1px_1px_0_var(--color-black),-1px_-1px_0_var(--color-black),1px_-1px_0_var(--color-black),-1px_1px_0_var(--color-black)] text-pink-600">
                  products
                </span>{" "}
                perfectly tailored to your lifestyle through the power of{" "}
                <span className="font-semibold underline text-black">
                  social connections
                </span>
                . Join millions who shop smarter with Connectify. Discover
                products perfectly tailored to your lifestyle through the power
                of social connections.{" "}
              </p>
            </div>
          </div>
        </motion.div>
        <div
          className={`w-full max-w-md bg-[#F5F5F5] shadow-2xl rounded-2xl  ${
            otpSent ? "" : "px-5 sm:px-10 pt-5 pb-10 mb-10 lg:mb-0"
          } ${userDeatails ? "lg:mt-15" : ""}`}
        >
          {!otpSent && !userDeatails && (
            <div className="">
              <h1 className="text-center text-3xl md:text-4xl font-semibold py-5">
                Sign up
              </h1>

              <form
                onSubmit={handleSubmit(handleOtpSubmition)}
                className="space-y-6"
              >
                <div className="relative">
                  <div className="relative">
                    <SiGmail className="absolute left-4 top-5 text-gray-500 text-xl" />
                    <input
                      type="text"
                      {...register("mail")}
                      autoComplete="off"
                      placeholder="Email"
                      className={
                        "w-full border border-gray-400 bg-gray-100 text-gray-500 focus:text-gray-700 p-4 pl-12 rounded-md outline-none focus:ring-2 focus:" +
                        (!!errors.mail?.message
                          ? "ring-red-600"
                          : "ring-pink-600")
                      }
                    />
                  </div>
                  {!!errors.mail?.message && (
                    <span className="absolute left-0 top-full text-sm text-red-600">
                      {errors.mail?.message}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="relative">
                    <MdPerson className="absolute left-4 top-5 text-gray-500 text-2xl" />
                    <input
                      type="text"
                      {...register("uname")}
                      autoComplete="off"
                      placeholder="Username"
                      className={
                        "w-full border border-gray-400 bg-gray-100 text-gray-500 focus:text-gray-700 p-4 pl-12 rounded-md outline-none focus:ring-2 focus:" +
                        (!!errors.uname?.message
                          ? "ring-red-600"
                          : "ring-pink-600")
                      }
                    />
                  </div>
                  {!!errors.uname?.message && (
                    <span className="absolute left-0 top-full text-sm text-red-600">
                      {errors.uname.message}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="relative">
                    <MdLock className="absolute left-4 top-5 text-gray-500 text-2xl" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="off"
                      placeholder="Password"
                      {...register("password")}
                      className={
                        "w-full border border-gray-400 bg-gray-100 text-gray-500 focus:text-gray-700 p-4 pl-12 pr-8 rounded-md outline-none focus:ring-2 focus:" +
                        (!!errors.password?.message
                          ? "ring-red-600"
                          : "ring-pink-600")
                      }
                    />
                    <button
                      tabIndex="-1"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-2 text-lg text-gray-500"
                    >
                      {showPassword ? <TbEye /> : <TbEyeOff />}
                    </button>
                  </div>
                  {!!errors.password?.message && (
                    <span className="absolute left-0 top-full text-sm text-red-600">
                      {errors.password?.message}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="relative">
                    <MdLock className="absolute left-4 top-5 text-gray-500 text-2xl" />
                    <input
                      type={showcPassword ? "text" : "password"}
                      autoComplete="off"
                      {...register("cpassword")}
                      placeholder="Confirm Password"
                      className={
                        "w-full border border-gray-400 bg-gray-100 text-gray-500 focus:text-gray-700 p-4 pl-12 pr-8 rounded-md outline-none focus:ring-2 focus:" +
                        (!!errors.cpassword?.message
                          ? "ring-red-600"
                          : "ring-pink-600")
                      }
                    />
                    <button
                      tabIndex="-1"
                      type="button"
                      onClick={() => setShowcPassword(!showcPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-2 text-lg text-gray-500"
                    >
                      {showcPassword ? (
                        <TbEye className="" />
                      ) : (
                        <TbEyeOff className="" />
                      )}
                    </button>
                  </div>
                  {!!errors.cpassword?.message && (
                    <span className="absolute left-0 top-full text-sm text-red-600">
                      {errors.cpassword?.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!proceed}
                  className="w-full bg-pink-700 text-white font-semibold p-3 rounded-md hover:bg-pink-800 transition active:scale-95 outline-blue-900"
                >
                  {proceed ? "proceed" : "Loading..."}
                </button>
              </form>
              <p className="text-center text-gray-700 mt-6">
                Already have an account?
                <Link to="/" className="text-pink-700 ml-1 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          )}
          {otpSent && (
            <div className="rounded-2xl">
              <button
                onClick={handleBack}
                className="rounded-full hover:bg-gray-900 ml-1 mt-1 p-2 transition text-2xl text-gray-800 hover:text-[#F5F5F5]"
              >
                <IoMdArrowRoundBack />
              </button>

              <div className="flex flex-col items-center px-10 pb-10">
                <h1 className="text-2xl sm:text-3xl font-semibold">
                  Verify your Gmail
                </h1>
                <span className="text-sm text-gray-600 mb-4">
                  Enter your OTP code here
                </span>
                <OtpInput otp={otp} setOtp={setOtp} />
                <div className="flex gap-2 my-2 text-gray-100 mt-5  p-1">
                  <button
                    onClick={() => sendOtp(gmail)}
                    disabled={isResend}
                    className={`px-2 py-1 rounded ${
                      isResend
                        ? "bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700 transition"
                    } `}
                  >
                    {isResend
                      ? `resend in ${Math.floor(timer / 60)}:${String(
                          timer % 60
                        ).padStart(2, "0")}`
                      : resend
                      ? "resend"
                      : "Loading.."}
                  </button>
                </div>
              </div>
            </div>
          )}
          {userDeatails && (
            <>
              <form onSubmit={userHandleSubmit(handleUserCreation)}>
                <div className="relative flex flex-col gap-5  [&>div>label]:text-lg [&_label]:font-medium [&>div>input]:border-2 [&>div>input]:border-gray-400 [&>div>input]:p-2 [&>div>input]:rounded-lg [&>div>input]:text-gray-500 [&>div>input]:focus:text-black [&>div>input]:focus:ring-2 [&>div>input]:focus:ring-pink-600 [&>div>input]:outline-0">
                  <h1 className="absolute -top-1 sm:-top-2 px-1 left-[50%] -translate-x-[50%] text-gray-800 sm:text-xl md:text-2xl lg:text-lg xl:text-2xl font-bold  bg-[#F5F5F5]">
                    Join the Family
                  </h1>
                  <div className="grid grid-cols-2 gap-2 border-t border-gray-400  mt-2 pt-10 [&>div>label]:text-lg [&>div>label>svg]:inline-block [&>div>label>svg]:mr-1 [&>div>label]:font-medium [&>div>input]:border-2 [&>div>input]:border-gray-400 [&>div>input]:p-2 [&>div>input]:rounded-md [&>div>input]:focus:ring-2 [&>div>input]:outline-0 [&>div>input]:focus:ring-pink-600">
                    <div className="relative flex flex-col gap-2 justify-center">
                      <label><IoPerson/>
                        First Name <sup className="text-red-600">*</sup>
                      </label>
                      <input type="text" {...userRegister("fname")} />
                      {userDetailsErrors.fname?.message && (
                        <span className="absolute top-full text-sm text-red-500">
                          {userDetailsErrors.fname?.message}
                        </span>
                      )}
                    </div>
                    <div className="relative flex flex-col gap-2 justify-center">
                      <label><IoPerson/>
                        Last Name <sup className="text-red-600">*</sup>
                      </label>
                      <input type="text" {...userRegister("lname")} />
                      {userDetailsErrors.lname?.message && (
                        <span className="absolute top-full text-sm text-red-500">
                          {userDetailsErrors.lname?.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative flex flex-col gap-2 justify-center mt-4 sm:mt-0">
                    <label><MdLocalPhone className="inline-block mr-1 text-xl"/>
                      Contact Number <sup className="text-red-600">*</sup>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      {...userRegister("phone_n")}
                    />
                    {userDetailsErrors.phone_n?.message && (
                      <span className="absolute top-full text-sm text-red-500">
                        {userDetailsErrors.phone_n?.message}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 [&>div]:relative [&>div]:flex [&>div]:flex-col [&>div]:gap-2 [&>div]:justify-center [&>div>label]:text-lg [&>div>label]:font-medium [&>div>input]:border-2 [&>div>input]:border-gray-400 [&>div>input]:p-2 [&>div>input]:rounded-md [&>div>input]:focus:ring-2 [&>div>input]:focus:ring-pink-600 [&>div>input]:outline-0">
                    <div className="relative flex flex-col gap-2 justify-center">
                      <label><IoMdPin className="inline-block mr-1"/>
                        Pincode <sup className="text-red-600">*</sup>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        {...userRegister("pincode")}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                      {userDetailsErrors.pincode?.message && (
                        <span className="absolute top-full text-sm text-red-500">
                          {userDetailsErrors.pincode?.message}
                        </span>
                      )}
                    </div>
                    <div className="relative flex flex-col gap-2 justify-center">
                      <label><PiHashBold className="inline-block mr-1"/>
                        St No.<sup className="text-red-600">*</sup>
                      </label>
                      <input type="text" {...userRegister("street_n")} />
                      {userDetailsErrors.street_n?.message && (
                        <span className="absolute top-full text-sm text-red-500">
                          {userDetailsErrors.street_n?.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative flex flex-col gap-2 justify-center">
                    <label><MdMapsHomeWork className="inline-block mr-1"/>
                      Street Name <sup className="text-red-600">*</sup>
                    </label>
                    <input type="text" {...userRegister("street")} />
                    {userDetailsErrors.phone_n?.message && (
                      <span className="absolute top-full text-sm text-red-500">
                        {userDetailsErrors.street?.message}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 [&>div>input]:border-2 [&>div>input]:border-gray-400 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 [&>div>input]:max-w-full [&>div>input]:p-2 [&>div>input]:rounded-md [&>div>label]:text-lg [&>div>label]:text-gray-700 [&>div>label]:font-medium [&>div>label>sup]:text-gray-600 [&>div>input]:cursor-not-allowed [&>div>input]:outline-0 [&>div>input]:text-gray-500">
                    <div>
                      <label><TbMapPin2 className="inline-block mr-1"/>
                        District<sup>*</sup>
                      </label>
                      <input type="text" value={district} readOnly />
                    </div>
                    <div>
                      <label><IoMdPin className="inline-block mr-1"/>
                        State<sup>*</sup>
                      </label>
                      <input type="text" value={state} readOnly />
                    </div>
                    <div>
                      <label><FaGlobeAsia className="inline-block text-base mr-1"/>
                        Country<sup>*</sup>
                      </label>
                      <input type="text" value={country} readOnly />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className=" w-full bg-pink-700 p-2 sm:px-6 mt-8 rounded text-white font-bold tracking-wide hover:bg-pink-800 active:scale-95 transition"
                >
                  {userIsValidating
                    ? "validatig..."
                    : isSubmit
                    ? "Loading..."
                    : "Submit"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>

      <Footer />
    </motion.div>
  );
}

export default Signup;
