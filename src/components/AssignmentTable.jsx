import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { HiPencil, HiOutlineTrash } from "react-icons/hi";

const AssignmentTable = ({
  assignedBuses = [],
  mode = "manual",
  onEdit = () => {},
  onRemove = () => {},
}) => {
  const location = useLocation();
  const isNew = location.pathname === "/new";
  const showActions = ["/morning", "/day", "/college"].includes(
    location.pathname
  );
  const showStats = !isNew;
 
  const scrollRef = useRef(null);
  const [countdown, setCountdown] = useState(null);  
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
 
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("tableFontSize") || "text-base";
  });
 
  const [standFontSize, setStandFontSize] = useState(() => {
    return localStorage.getItem("standFontSize") || "text-sm";
  });

  useEffect(() => {
    localStorage.setItem("tableFontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("standFontSize", standFontSize);
  }, [standFontSize]);

  const getBusIdentifier = (bus) =>
    bus.id || bus.number || `bus-${Math.random().toString(36).substr(2, 5)}`;
  const getStandName = (stand) => stand.stand || stand.name || "Unknown";
  const getTotalStudents = (stand) =>
    stand.total || (stand.boys || 0) + (stand.girls || 0);

  const showGender = mode === "day-shift";
 
  const getShiftType = () => {
    if (location.pathname === "/morning") return "morning";
    if (location.pathname === "/day") return "day";
    if (location.pathname === "/college") return "college";
    if (mode === "day-shift") return "day";
    if (mode === "college") return "college";
    return "morning";  
  };

  const shiftType = getShiftType();

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        when: "beforeChildren", 
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      },
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.98,
      transition: { 
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };
  const progressBarVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: { 
      width: "100%", 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.3 },
      },
    },
  };
  const standItemVariants = {
    hidden: { opacity: 0, x: -8, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400,
        damping: 25,
      },
    },
    hover: { 
      scale: 1.05, 
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
  };

  const columnCount =
    1 + (showStats ? 3 : 0) + (showGender ? 1 : 0) + 1 + (showActions ? 1 : 0);
 
  const isAtBottom = (el) =>
    el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
 
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const overflow = el.scrollHeight > el.clientHeight + 1;
      setIsOverflowing(overflow);
      setAtBottom(isAtBottom(el));
      if (!isNew || !overflow) {
        setCountdown(null);  
      }
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);
    el.addEventListener("scroll", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      el.removeEventListener("scroll", update);
    };
  }, [assignedBuses, isNew]);
 
  useEffect(() => {
    const el = scrollRef.current;
    if (!isNew || !isOverflowing || !el) {
      return;
    }
 
    if (countdown === null) {
      setCountdown(10);
      return;
    }
 
    if (countdown > 0) {
      const t = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : c));
      }, 1000);
      return () => clearTimeout(t);
    }
 
    const action = isAtBottom(el) ? "top" : "down";
    if (action === "down") {
      const nextTop = Math.min(
        el.scrollTop + el.clientHeight,
        el.scrollHeight - el.clientHeight
      );
      el.scrollTo({ top: nextTop, behavior: "smooth" });
    } else { 
      el.scrollTo({ top: 0, behavior: "smooth" });
    }
 
    const reset = setTimeout(() => {
      if (isNew && isOverflowing) setCountdown(10);
    }, 700);

    return () => clearTimeout(reset);
  }, [countdown, isNew, isOverflowing]);

  const handleChange = (event) => {
    setIsChecked(!isChecked);
    console.log(isChecked);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {isChecked && (
          <div className="flex items-center gap-6 p-1.5 bg-slate-100 rounded-2xl">
            <div className="flex items-center gap-3 px-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bus ID Font:</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer"
              >
                <option value="text-sm">Small</option>
                <option value="text-base">Medium</option>
                <option value="text-lg">Large</option>
                <option value="text-3xl">Extra Large</option>
              </select>
            </div>

            <div className="w-px h-4 bg-slate-300"></div>

            <div className="flex items-center gap-3 px-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stands Font:</label>
              <select
                value={standFontSize}
                onChange={(e) => setStandFontSize(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer"
              >
                <option value="text-xs">Extra Small</option>
                <option value="text-sm">Small</option>
                <option value="text-base">Medium</option>
                <option value="text-lg">Large</option>
                <option value="text-3xl">Extra Large</option>
              </select>
            </div>
          </div>
        )}
      </div>
 
      <div
        ref={scrollRef}
        className={`relative overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-200/60 bg-white shadow-sm scroll-camo no-scrollbar ${
          isNew ? (isChecked ? "h-[70vh] sm:h-[75vh] md:h-[85vh]" : "h-[75vh] sm:h-[80vh] md:h-[90vh]") : ""
        }`}
      >
        <motion.table
          className={`w-full border-collapse ${
            isNew ? "text-lg md:text-xl" : "text-sm"
          }`}
          initial="hidden"
          animate="visible"
          variants={tableVariants}
        >
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/60">
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Bus Information</th>
              {showStats && (
                <>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Capacity</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Assigned</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Utilization</th>
                </>
              )} 
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Stands Coverage</th>
              {showActions && (
                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {assignedBuses.length === 0 ? (
              <motion.tr variants={rowVariants}>
                <td
                  colSpan={columnCount}
                  className="px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 text-center text-xs sm:text-sm text-slate-400 italic font-medium"
                >
                  No bus assignments found for this shift
                </td>
              </motion.tr>
            ) : (
              <AnimatePresence>
                {assignedBuses.map((bus) => {
                  const utilization = bus.capacity
                    ? Math.round((bus.assigned / bus.capacity) * 100)
                    : 0;
                  const isOverloaded = bus.assigned > bus.capacity;

                  return (
                    <motion.tr
                      key={getBusIdentifier(bus)}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="hover:bg-slate-50/50 transition-colors duration-200 group"
                    > 
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                        <div className="flex flex-col">
                          <span className={`font-bold text-slate-900 ${fontSize}`}>
                            {bus.number || bus.id || "N/A"}
                          </span>
                          {bus.gender && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mt-0.5">
                              {bus.gender}
                            </span>
                          )}
                        </div>
                      </td>

                      {showStats && (
                        <>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-slate-600 font-semibold text-sm sm:text-base">
                          {bus.capacity || 0}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 font-bold text-slate-900 text-sm sm:text-base">
                          {bus.assigned || 0}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 min-w-[120px] sm:min-w-[140px] md:min-w-[160px]">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                  className={`h-full rounded-full ${
                                  isOverloaded
                                      ? "bg-rose-500"
                                    : utilization < 80
                                      ? "bg-amber-400"
                                      : "bg-emerald-500"
                                }`}
                                initial="hidden"
                                animate="visible"
                                variants={progressBarVariants}
                                style={{
                                  width: `${Math.min(utilization, 100)}%`,
                                  originX: 0,
                                }}
                              />
                            </div>
                              <span className={`text-xs font-bold tabular-nums min-w-[40px] ${
                                isOverloaded ? "text-rose-600" : "text-slate-500"
                              }`}>
                                {utilization}%
                              </span>
                            </div>
                          </td>
                        </>
                      )}
 
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                        {bus.stands && bus.stands.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {bus.stands.map((stand, index) => (
                              <motion.span
                                key={index}
                                variants={standItemVariants}
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium ${standFontSize} group-hover:border-slate-300 transition-colors shadow-sm`}
                              >
                                {getStandName(stand)}
                              </motion.span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No stands assigned</span>
                        )}
                      </td>

                      {showActions && (
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onEdit(bus)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <HiPencil size={18} />
                            </button>
                            <button
                              onClick={() => onRemove(bus.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <HiOutlineTrash size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </motion.table>
      </div>

      {isNew && countdown !== null && isOverflowing && (
        <div className="fixed bottom-12 right-12 glass border border-slate-200 px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {atBottom ? "Resetting" : "Scrolling"} in {countdown}s
          </span>
        </div>
      )}

      {location.pathname === "/new" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <span>Developed By Jotirmoy</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>Designed By Raiyan</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <div className="flex items-center gap-1">
            <span>Copyright</span>
            <button 
              onClick={handleChange} 
              className={`transition-all duration-300 ${isChecked ? "text-indigo-600" : ""}`}
            >
              ©
            </button>
            <span>2025</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentTable;
