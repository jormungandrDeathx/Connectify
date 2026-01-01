import { useEffect } from "react";
import { motion, useAnimation } from "motion/react";

function ConfirmationBox({
  title,
  message = "",
  onConfirm,
  onClose,
  duration = 3000,
}) {

    let controls = useAnimation()
  useEffect(() => {

controls.start({
    width: "0%",
    transition: {duration: duration/1000, ease: "linear"}
})

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [title, message, onConfirm, onClose]);
  return (
    <div className=" min-w-[300px] fixed top-20 left-[50%] -translate-x-[50%]  z-9999 ">
      <div className="flex flex-col gap-2 md:min-w-[400px] bg-gray-200 px-4 py-2 rounded-b-md border-2 border-gray-400/70 shadow-xl">
        <h1 className="text-sm md:text-base font-medium">{title}</h1>
        <span className="text-gray-800 text-xs">{message}</span>
        <div className="flex justify-end gap-2 text-xs md:text-sm text-gray-200 [&_button]:px-2 [&_button]:py-1 [&_button]:rounded">
          <button onClick={onConfirm} className="bg-green-600">
            Confirm
          </button>
          <button onClick={onClose} className="bg-red-600">
            Cancel
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-400/70 overflow-hidden rounded-b-md">
        <motion.div
        initial={{width: "100%"}}
        animate={controls}
        className="h-full bg-linear-to-r from-pink-700 via-blue-700 to-blue-900">

        </motion.div>

        </div>
      </div>
    </div>
  );
}

export default ConfirmationBox;
