import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Selection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);
  gsap.registerPlugin(useGSAP);

  useGSAP(() => {
    gsap.from(".selection-headers", {
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      x: 100,
      ease: "power3.out",
    });
  }, []);

  return (
    <div className=" flex font-[gilroy] px-20 py-0 flex-col overflow-hidden">
      <h1 className="text-start fixed top-10 text-4xl font-bold">Select</h1>
      <p className="text-start fixed top-20 font-bold">
        The shift you want to assign
      </p>
      <div className="flex flex-row items-center">
        <div className="w-1/3 h-screen gap-10 flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to="/morning"
              className="h-32 w-96 flex items-center rounded-2xl justify-center font-bold text-2xl   transition-all duration-150 hover:translate-x-3 hover:bg-purple-50 hover:text-purple-900 hover:border-2 hover:border-purple-900 bg-purple-600 text-white"
            >
              Morning Shift
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to="/day"
              className="h-32 w-96 flex items-center rounded-2xl justify-center font-semibold text-2xl   transition-all duration-150 hover:translate-x-3 hover:bg-purple-50 hover:text-purple-900 hover:border-2 hover:border-purple-900 bg-purple-600 text-white"
            >
              Day Shift
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to="/college"
              className="h-32 w-96 flex items-center rounded-2xl justify-center font-semibold text-2xl   transition-all duration-150 hover:translate-x-3 hover:bg-purple-50 hover:text-purple-900 hover:border-2 hover:border-purple-900 bg-purple-600 text-white"
            >
              College Shift
            </Link>
          </motion.div>
        </div>
        <div className="w-2/3 h-[70vh]  flex justify-center items-ceter pl-20 border-l-2 border-gray-200  flex-col ">
          <h1 className="font-bold text-8xl selection-headers text-start">
            Innovation on
          </h1>
          <h1 className="font-bold text-8xl selection-headers text-start">
            wheels for every
          </h1>
          <h1 className="font-bold text-8xl selection-headers text-start">
            student’s journey.
          </h1>
        </div>
      </div>

      <Link to="/" className="fixed top-6 right-6 z-50">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <FaArrowLeftLong className="text-xl" />
        </motion.div>
      </Link>
    </div>
  );
};

export default Selection;
