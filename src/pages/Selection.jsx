import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { motion } from "framer-motion";

const Selection = () => {
  return (
    <div className="font-[clash] flex px-20 py-0 flex-col">
      <h1 className="text-start fixed top-10 text-4xl">Selection</h1>

      <div className="w-full h-screen gap-10 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            to="/morning"
            className="h-60 w-96 flex items-center rounded-2xl justify-center font-semibold text-2xl hover:shadow-2xl transition-all duration-150 hover:translate-y-1 bg-gradient-to-r from-teal-200 to-teal-500"
          >
            Morning Shift
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="h-60 w-96 flex items-center rounded-2xl justify-center font-semibold text-2xl hover:shadow-2xl transition-all duration-150 hover:translate-y-1 bg-gradient-to-r from-indigo-400 to-cyan-400">
            Day Shift
          </div>
        </motion.div>
      </div>

      <Link
        to="/"
        className="fixed top-5 right-5 z-50 bg-blue-500 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
        title="পেছনে যান"
      >
        <FaArrowLeftLong />
      </Link>
    </div>
  );
};

export default Selection;
