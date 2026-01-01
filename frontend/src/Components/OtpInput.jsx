import React, { useEffect, useRef } from "react";

function OtpInput({ otp, setOtp}) {
  const inputRef = useRef([]);

  useEffect(() => {
    inputRef.current[0]?.focus();
  }, []);

  function handleChange(e, index) {
    let value = e.target.value;
    if (value !== "" && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRef.current[index + 1].focus();
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) {
          const newOtp = [...otp];
          newOtp[index - 1] = "";
          setOtp(newOtp);
          inputRef.current[index - 1].focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  }
  return (
    <div className="flex justify-center gap-3 mt-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(e) => (inputRef.current[index] = e)}
          placeholder="0"
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-8 h-8 sm:w-12 sm:h-12 text-center text-gray-600 focus:text-black font-sans text-lg font-bold border-2 border-gray-500 rounded-md bg-gray-100 focus:ring-2 focus:ring-pink-600 outline-none caret-blue-700"
        />
      ))}
    </div>
  );
}

export default OtpInput;
