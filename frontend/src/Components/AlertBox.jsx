import { useEffect } from "react";
import { motion, useAnimation } from "motion/react";

function AlertBox({ message, onClose, duration = 3000 }) {
  const controls = useAnimation();

  useEffect(() => {
    if (!message) return;

    controls.start({
      width: "0%",
      transition: { duration: duration / 1000, ease: "linear" },
    });

    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);
  return (
    <div className="fixed top-20 left-[50%] -translate-x-[50%] z-9999">
      <div className="relative bg-gray-200 px-4 py-2 flex flex-col gap-2 min-w-[300px] rounded-b-md [&_span]:text-gray-800 [&_span]:text-sm [&_span]:md:text-base [&_span]:md:font-medium border-2 border-gray-400/70 shadow-xl">
        <span>{message}</span>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-600 px-2 py-1 text-xs md:text-sm text-gray-100"
          >
            Close
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-400/70 overflow-hidden rounded-b-md">
          <motion.div
            initial={{ width: "100%" }}
            animate={controls}
            className="h-full bg-linear-to-r from-pink-700 via-blue-700 to-blue-900"
          ></motion.div>
        </div>
      </div>
    </div>
  );
}

export default AlertBox;
