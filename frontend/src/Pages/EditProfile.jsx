import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../Components/Footer";
import { PiNotePencilBold } from "react-icons/pi";
import { FaRegSave } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import OtpInput from "../Components/OtpInput";
import { useLogout } from "../hooks/useLogout";
import AlertBox from "../Components/AlertBox";
import ConfirmationBox from "../Components/ConfirmationBox";

function EditProfile() {
  const navigate = useNavigate();

  const [status, setStatus] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [picChangeLoading, setPicChangeLoading] = useState(false);
  const [picRemoveLoading, setPicRemoveLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isResend, setIsResend] = useState(false);
  const [resend, setResend] = useState(true);
  const [isSubmit, setIsSubmit] = useState(true);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState(null);
  const [changePasswordMessage, setChangePasswordMessage] = useState(null);
  const [deleteAccountMessage,setDeleteAccountMessage] = useState(null)
  const [logoutCase, setLogoutCase] = useState(false);
  const [deleteCase, setDeleteCase] = useState(false);
  const [changePassword, setChangePassword] = useState({
    old_password: "",
    new_password: "",
  });
  const [isPasswordOtpSent, setIsPasswordOtpSent] = useState(false);
  const [passwordVerifyOtp, setPasswordVerifyOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const intervalRef = useRef(null);
  const inputRef = useRef();
  const logout = useLogout();

  let schema = Yup.object().shape({
    old_password: Yup.string().required("old password is required"),
    new_password: Yup.string()
      .required("new password is required")
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*-?]).{5,}$/,
        "5+ chars with upper, lower, number & symbol"
      ),
    cpassword: Yup.string()
      .oneOf([Yup.ref("new_password"), null], "password must match")
      .required("Please confirm your password"),
  });

  let {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  function handleLogout() {
    setLogoutCase(true);
  }

  function performLogout() {
    logout();
  }

  function logoutCaseFalse() {
    setLogoutCase(false);
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleOtp() {
    setDeleteCase(false);

    setOtpLoading(true);
    setResend(false);
    try {
      const res = await axios.post("auth/deleteOtp/");
      setMessage(res.data?.message);
      setIsOtpSent(true);
      startTimer();
    } catch (e) {
      console.message(e);
      setMessage(e.response?.data?.message || "Failed to send OTP");
      if (e.response?.status === 408) setIsOtpSent(false);
    } finally {
      setOtpLoading(false);
      setResend(true);
    }
  }

  function deleteCaseFalse() {
    setDeleteCase(false);
  }

  async function verifyOtp() {
    setVerifyLoading(true);
    try {
      const res = await axios.post("auth/deleteVerifyOtp/", {
        otp: otp.join(""),
      });
      setOtp(["", "", "", "", "", ""]);
      if (res.status === 200) handleDelete();
    } catch (e) {
      console.message(e.response);
      setMessage(e.response?.data.message);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await axios.delete("delete-account/");
      setDeleteAccountMessage(res.data.message);
    } catch (e) {
      console.log("Error while deleting account: ", e);
      setDeleteAccountMessage("Failed to delete. Try again");
    }
  }

  function deleteAccountOnclose() {
    localStorage.removeItem("connectify_token");
    localStorage.removeItem("connectify_user");
    localStorage.removeItem("cart");
    localStorage.removeItem("friends");
    window.location.href = "/signup";
  }

  async function fetchProfile() {
    try {
      const response = await axios.get("profile/");
      setProfile(response?.data);
      setProfilePic(response.data.profile_picture);
    } catch (e) {
      console.message("Error while fetching profile", e);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg"];
  const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

  function validateFile(file) {
    if (!file) {
      setMessage("No File selected");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage(
        `File Size must be less than 2MB. Your file is ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage("Only PNG and JPG/JPEG files are allowed");
      return false;
    }

    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setMessage("File must have .png/.jpg/.jpeg extension");
      return false;
    }
    return true;
  }

  function handleImagechange(e) {
    const file = e.target.files[0];

    if (validateFile(file)) {
      setSelectedFile(file);
      setProfilePic(URL.createObjectURL(file));
    } else {
      setProfilePic(profile.profile_picture);
    }
  }

  function onClose() {
    setSelectedFile(null);
    setMessage(null);
    setProfilePic(profile?.profile_picture);
    setMessage(null);
  }

  async function handleUploadImage(e) {
    if (!selectedFile) {
      setMessage("Please select an Image first!");
      return;
    }
    setPicChangeLoading(true);

    const formdata = new FormData();
    formdata.append("profile_picture", selectedFile);

    try {
      await axios.patch("updateProfile/", formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Profile picture changed successfully");
      fetchProfile();
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (e) {
      console.message("Error while Uploading", e);
      setMessage("upload Failed");
    } finally {
      setPicChangeLoading(false);
    }
  }

  async function handleRemoveImage() {
    if (!selectedFile) {
      setMessage("Please set profile Image!");
      return;
    }

    if (!window.confirm("Remove your profile picture?")) return;

    setPicRemoveLoading(true);
    const formData = new FormData();
    formData.append("profile_picture", "");
    try {
      await axios.patch("updateProfile/", formData);
      fetchProfile();
      setSelectedFile(null);
      setMessage("Profile picture removed successfully!");
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (e) {
      console.message("Error removing profile picture:", e.response?.data);
      setMessage("Failed to remove image");
    } finally {
      setPicRemoveLoading(false);
    }
  }

  async function changePasswordOtp(data) {
    const valid = await trigger();
    if (valid) setLoading(true);
    try {
      const res = await axios.post("auth/changePasswordOtp/", {
        old_password: data.old_password,
      });
      setChangePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });
      setMessage(res.data.message);
      setIsPasswordOtpSent(true);
      startTimer();
    } catch (e) {
      setMessage(
        e.response?.data?.old_password ||
          e.response.data.error ||
          "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  }

  async function changePasswordResendOtp() {
    setResend(false);
    try {
      const res = await axios.post("auth/changePasswordOtp/", {
        old_password: changePassword.old_password,
        new_password: changePassword.new_password,
      });
      setMessage(res.data.message);
      startTimer();
    } catch (e) {
      setMessage(
        e.response?.data?.old_password ||
          e.response.data.error ||
          "Failed to change password"
      );
    } finally {
      setResend(true);
    }
  }

  async function changePasswordVerify() {
    setLoading(true);
    try {
      const res = await axios.post("auth/verify-otp/", {
        email: profile.email,
        otp: passwordVerifyOtp.join(""),
      });
      changePasswordSuccess();
    } catch (e) {
      setMessage(e.response.data.error);
    } finally {
      setLoading(false);
    }
  }

  async function changePasswordSuccess() {
    setLoading(true);
    try {
      const response = await axios.patch("auth/changePassword/", {
        old_password: changePassword.old_password,
        new_password: changePassword.new_password,
      });

      setChangePasswordMessage(response.data?.message);
    } catch (e) {
      setMessage(e.response?.data?.old_password || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  function changePasswordOnclose() {
    localStorage.removeItem("connectify_user");
    localStorage.removeItem("connectify_token");
    localStorage.removeItem("connectify_refresh");
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-pink-700 via-blue-700 to-blue-900">
      {message && <AlertBox message={message} onClose={onClose} />}
      {changePasswordMessage && (
        <AlertBox
          message={changePasswordMessage}
          onClose={changePasswordOnclose}
        />
      )}
      {logoutCase && (
        <ConfirmationBox
          title={"Are you sure?"}
          onConfirm={performLogout}
          onClose={logoutCaseFalse}
        />
      )}
      {
        deleteAccountMessage && (
          <AlertBox message={deleteAccountMessage} onClose={deleteAccountOnclose}/>
        )
      }
      {deleteCase && (
        <ConfirmationBox
          title={"Do you want to continue?"}
          message="This will permanently delete your account and all your data. "
          onConfirm={handleOtp}
          onClose={deleteCaseFalse}
        />
      )}
      <div className="flex flex-1 justify-center items-start md:my-20 md:pt-3 md:px-5">
        <div className="flex flex-col max-w-6xl w-full bg-[#F5F5F5] md:rounded-xl px-5 md:px-8 lg:px-10 py-10">
          <h1 className="text-2xl border-b border-gray-300 font-semibold pb-2">
            My Profile
          </h1>
          <div className="flex flex-col md:flex-row items-center mt-4 relative">
            <img
              src={profilePic}
              className="w-[70px] h-[70px] border-2 m-2 rounded-full p-1"
              alt="Userimg"
            />
            <div className="relative flex flex-wrap px-4 md:px-10 pt-2 gap-4 md:gap-6 mb-2 [&>button]:relative [&>button]:pl-6 [&>button>svg]:absolute [&>button>svg]:left-1 [&>button>svg]:top-1/2 [&>button>svg]:-translate-y-1/2 [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:rounded [&>button]:text-sm [&>button]:md:text-base [&>button:nth-child(2)]:bg-black [&>button:nth-child(2)]:text-white [&>button]:hover:bg-gray-300 [&>button]:transition [&>button]:disabled:opacity-50 [&>button]:disabled:cursor-not-allowed">
              <input
                type="file"
                accept="image/*"
                ref={inputRef}
                className="hidden"
                onChange={handleImagechange}
              />

              <button
                onClick={() => inputRef.current.click()}
                className="hover:shadow-lg"
              >
                <PiNotePencilBold />
                Change
              </button>
              <button disabled={picChangeLoading} onClick={handleUploadImage}>
                <FaRegSave />
                {picChangeLoading ? "Loading.." : "Save"}
              </button>
              <button
                disabled={picRemoveLoading}
                onClick={handleRemoveImage}
                className="hover:bg-gray-300"
              >
                <FaTrash />
                {picRemoveLoading ? "Loading" : "Remove"}
              </button>
            </div>
            <div className="w-fit absolute top-full md:left-32 mt-2">
              <p className="text-center md:text-left text-xs md:text-sm text-gray-500 w-fit">
                We support PNG's and JPEGs under 2MB
              </p>
            </div>
          </div>

          <h1 className="mt-10 md:mt-12 text-2xl border-b border-gray-300 font-semibold pb-2">
            Account Security
          </h1>
          {!isPasswordOtpSent ? (
            <form
              onSubmit={handleSubmit(changePasswordOtp)}
              className="mt-6"
              encType="multipart/form-data"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={profile?.username || ""}
                    className="rounded outline-0 ring-2 p-2 w-full ring-gray-400 text-gray-700 bg-gray-100"
                    disabled
                  />
                </div>
                <div className="relative">
                  <label className="block font-medium mb-1">
                    Old Password{" "}
                    <span className="text-red-600">{!status ? "" : "*"}</span>
                  </label>
                  <input
                    type="password"
                    {...register("old_password")}
                    autoComplete="off"
                    className={
                      "rounded outline-0 ring-2 text-gray-700 p-2 w-full " +
                      (status
                        ? "ring-pink-700 text-black bg-white"
                        : "ring-gray-400 text-gray-700 bg-gray-100")
                    }
                    disabled={!status}
                  />
                  {!!errors.old_password && (
                    <span className="text-red-600 text-xs absolute left-0 top-full mt-1">
                      {errors.old_password.message}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <label className="block font-medium mb-1">
                    New Password{" "}
                    <span className="text-red-600">{!status ? "" : "*"}</span>
                  </label>
                  <input
                    type="password"
                    {...register("new_password")}
                    autoComplete="off"
                    className={
                      "rounded outline-0 ring-2 text-gray-700 p-2 w-full " +
                      (status
                        ? "ring-pink-700 text-black bg-white"
                        : "ring-gray-400 text-gray-700 bg-gray-100")
                    }
                    disabled={!status}
                  />
                  {!!errors.new_password && (
                    <span className="text-red-600 text-xs absolute left-0 top-full mt-1">
                      {errors.new_password.message}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <label className="block font-medium mb-1">
                    Confirm Password{" "}
                    <span className="text-red-600">{!status ? "" : "*"}</span>
                  </label>
                  <input
                    type="password"
                    {...register("cpassword")}
                    autoComplete="off"
                    className={
                      "rounded outline-0 ring-2 text-gray-700 p-2 w-full " +
                      (status
                        ? "ring-pink-700 text-black bg-white"
                        : "ring-gray-400 text-gray-700 bg-gray-100")
                    }
                    disabled={!status}
                  />
                  {!!errors.cpassword && (
                    <span className="text-red-600 text-xs absolute left-0 top-full mt-1">
                      {errors.cpassword.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-6">
                {status ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative pl-8 active:scale-95 transition border-2 p-2 w-32 rounded bg-green-500 text-white border-black hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaRegSave className="absolute left-2 top-1/2 -translate-y-1/2" />
                    {loading ? "Loading..." : "Proceed"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStatus(true)}
                    className="relative pl-8 active:scale-95 transition border-2 p-2 w-32 rounded bg-green-500 text-white border-black hover:bg-green-600"
                  >
                    <PiNotePencilBold className="absolute left-2 top-1/2 -translate-y-1/2" />
                    Edit
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-5 py-4">
              <OtpInput otp={passwordVerifyOtp} setOtp={setPasswordVerifyOtp} />
              <div className="flex justify-center md:justify-end gap-2">
                <button
                  onClick={changePasswordResendOtp}
                  disabled={isResend}
                  className={`text-gray-100 rounded-md px-4 py-2 ${
                    isResend
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 transition"
                  }`}
                >
                  {isResend
                    ? `Resend in ${Math.floor(timer / 60)}:${String(
                        timer % 60
                      ).padStart(2, "0")}`
                    : resend
                    ? "Resend"
                    : "Loading..."}
                </button>
                <button
                  type="button"
                  onClick={changePasswordVerify}
                  className="rounded-md px-4 py-2 bg-gray-200 font-medium hover:bg-gray-300 active:scale-95 transition"
                >
                  {loading ? "Loading.." : "Submit"}
                </button>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-semibold border-b mt-10 border-gray-300 pb-2">
            Active Session
          </h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-4">
            <div>
              <h2 className="text-lg font-medium">Log Out</h2>
              <p className="text-gray-400 text-sm">
                You will be no longer logged in on selected device
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="block rounded-md px-4 py-2 bg-gray-200 font-medium hover:bg-gray-300 active:scale-95 transition"
            >
              Log Out
            </button>
          </div>

          <h1 className="text-2xl font-semibold border-b border-gray-300 pb-2">
            Account Termination
          </h1>
          <div
            className={`flex ${
              isOtpSent
                ? "flex-col gap-5 sm:gap-0 sm:flex-row"
                : "flex-col sm:flex-row"
            } justify-between items-start sm:items-center gap-4 my-4`}
          >
            {!isOtpSent ? (
              <>
                <div>
                  <h2 className="text-lg text-red-700 font-medium">
                    Delete my account
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Permanently remove your profile and all associated data.
                  </p>
                </div>
                <button
                  onClick={() => setDeleteCase(true)}
                  disabled={otpLoading || isPasswordOtpSent}
                  className="block rounded-md px-4 py-2 bg-red-700 text-white font-medium hover:bg-red-600 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Loading..." : "Delete"}
                </button>
              </>
            ) : (
              <>
                <OtpInput otp={otp} setOtp={setOtp} />
                <div className="flex flex-col md:flex-row gap-2 items-center">
                  <button
                    onClick={() => setDeleteCase(true)}
                    disabled={isResend}
                    className={`text-gray-100 rounded-md px-4 py-2 ${
                      isResend
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 transition"
                    }`}
                  >
                    {isResend
                      ? `Resend in ${Math.floor(timer / 60)}:${String(
                          timer % 60
                        ).padStart(2, "0")}`
                      : resend
                      ? "Resend"
                      : "Loading..."}
                  </button>
                  <button
                    onClick={verifyOtp}
                    disabled={verifyLoading}
                    className="block rounded-md px-4 py-2 bg-gray-200 font-medium hover:bg-gray-300 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyLoading ? "Loading..." : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default EditProfile;
