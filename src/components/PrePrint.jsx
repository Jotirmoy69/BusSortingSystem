import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useAppContext } from "../context/context";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const PrePrint = ({ setprePrintShow }) => {
  const location = useLocation();

  const { ipcRenderer } = window.require("electron");

  const { assignedBuses, assignedBusesDay, assignedBusesCollege } =
    useAppContext();
  const handleClick = () => {
    console.log({
      assignedBuses: assignedBuses,
      mode: "automation",
    });

    ipcRenderer.send("open-new-window", assignedBuses);
  };
  const handleClickDay = () => {
    console.log(location.pathname);
    ipcRenderer.send("open-new-window", assignedBusesDay);
  };
  const handleClickCollege = () => {
    ipcRenderer.send("open-new-window", assignedBusesCollege);
  };
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 glass"
      onClick={() => setprePrintShow(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.4 
        }}
        onClick={(e) => e.stopPropagation()}
        className="premium-card max-w-xl w-full p-10 relative overflow-hidden"
      >
        <motion.button
          onClick={() => setprePrintShow(false)}
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-300"
        >
          <IoCloseOutline size={24} />
        </motion.button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🖨️</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Print Assignment Report</h2>
          <p className="text-slate-500 font-medium mt-2">Select the operational shift to generate a print-ready document</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🌅</span>
              <div className="text-left">
                <p className="font-bold text-slate-900">Morning Shift</p>
                <p className="text-xs text-slate-400 font-medium italic">Standard early bird transit</p>
              </div>
            </div>
            <motion.div 
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              →
            </motion.div>
          </motion.button>

          <motion.button
            onClick={handleClickDay}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">☀️</span>
              <div className="text-left">
                <p className="font-bold text-slate-900">Day Shift</p>
                <p className="text-xs text-slate-400 font-medium italic">Main school operations</p>
              </div>
            </div>
            <motion.div 
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              →
            </motion.div>
          </motion.button>

          <motion.button
            onClick={handleClickCollege}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🎓</span>
              <div className="text-left">
                <p className="font-bold text-slate-900">College Shift</p>
                <p className="text-xs text-slate-400 font-medium italic">Higher education transit</p>
              </div>
            </div>
            <motion.div 
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              →
            </motion.div>
          </motion.button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Optimized for A4 Document Printing</p>
      </div>
      </motion.div>
    </motion.div>
  );
};

export default PrePrint;
