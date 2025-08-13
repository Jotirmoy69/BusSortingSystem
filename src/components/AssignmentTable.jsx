import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

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

  // ✅ 90vh scroll container + auto-scroll state
  const scrollRef = useRef(null);
  const [countdown, setCountdown] = useState(null); // number | null
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  // ✅ Font size for bus number
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("tableFontSize") || "text-base";
  });

  // ✅ Font size for stand names
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

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, type: "spring", stiffness: 100 },
    },
    exit: { opacity: 0, y: -20 },
  };
  const progressBarVariants = {
    hidden: { width: 0 },
    visible: { width: "100%", transition: { duration: 0.8, ease: "easeOut" } },
  };
  const standItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 200 },
    },
    hover: { scale: 1.05, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  };

  const columnCount =
    1 + (showStats ? 3 : 0) + (showGender ? 1 : 0) + 1 + (showActions ? 1 : 0);

  // ===== Auto-scroll helpers/effects (only on /new) =====
  const isAtBottom = (el) =>
    el.scrollTop + el.clientHeight >= el.scrollHeight - 2;

  // Track overflow + bottom status
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const overflow = el.scrollHeight > el.clientHeight + 1;
      setIsOverflowing(overflow);
      setAtBottom(isAtBottom(el));
      if (!isNew || !overflow) {
        setCountdown(null); // stop if not needed or not on /new
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

  // Countdown + action (down one page; at bottom -> back to top)
  useEffect(() => {
    const el = scrollRef.current;
    if (!isNew || !isOverflowing || !el) {
      return;
    }

    // Start countdown if idle
    if (countdown === null) {
      setCountdown(10);
      return;
    }

    // Tick countdown
    if (countdown > 0) {
      const t = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : c));
      }, 1000);
      return () => clearTimeout(t);
    }

    // countdown === 0 => perform action
    const action = isAtBottom(el) ? "top" : "down";
    if (action === "down") {
      const nextTop = Math.min(
        el.scrollTop + el.clientHeight,
        el.scrollHeight - el.clientHeight
      );
      el.scrollTo({ top: nextTop, behavior: "smooth" });
    } else {
      // back to top
      el.scrollTo({ top: 0, behavior: "smooth" });
    }

    // After smooth scroll finishes, re-arm countdown
    const reset = setTimeout(() => {
      if (isNew && isOverflowing) setCountdown(10);
    }, 700);

    return () => clearTimeout(reset);
  }, [countdown, isNew, isOverflowing]);

  return (
    <div className="mt-2">
      {/* ✅ Font size selectors */}
      <div className="mb-3 flex items-center transition-all duration-300 gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium">Bus Font Size:</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="text-sm">Small</option>
            <option value="text-base">Medium</option>
            <option value="text-lg">Large</option>
            <option value="text-3xl">Extra Large</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Stand Font Size:</label>
          <select
            value={standFontSize}
            onChange={(e) => setStandFontSize(e.target.value)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="text-xs">Extra Small</option>
            <option value="text-sm">Small</option>
            <option value="text-base">Medium</option>
            <option value="text-lg">Large</option>
            <option value="text-3xl">Extra Large</option>
          </select>
        </div>
      </div>

      {/* ✅ 90vh scroll area on /new; auto-scroll countdown overlays here */}
      <div
        ref={scrollRef}
        className={`relative overflow-x-auto overflow-y-auto scroll-camo no-scrollbar  ${
          isNew ? "h-[91vh]" : ""
        }`}
      >
        <motion.table
          className={`w-full shadow-lg rounded-md overflow-hidden ${
            isNew ? "text-lg md:text-xl" : ""
          }`}
          initial="hidden"
          animate="visible"
          variants={tableVariants}
        >
          <thead className="bg-[#8B5DFF] text-white">
            <tr>
              <th className="border border-gray-500 p-2">Bus ID</th>
              {showStats && (
                <>
                  <th className="border border-gray-500 p-2">Capacity</th>
                  <th className="border border-gray-500 p-2">Assigned</th>
                  <th className="border border-gray-500 p-2">Utilization</th>
                </>
              )}
              {showGender && (
                <th className="border border-gray-500 p-2">Gender</th>
              )}
              <th className="border border-gray-500 p-2">Stands</th>
              {showActions && (
                <th className="border border-gray-500 p-2">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="bg-[#F5F5FF]">
            {assignedBuses.length === 0 ? (
              <motion.tr variants={rowVariants}>
                <td
                  colSpan={columnCount}
                  className="text-center p-4 text-gray-500"
                >
                  No buses assigned yet
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
                      className="hover:bg-gray-50"
                      whileHover={{
                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* ✅ Bus font size applied */}
                      <td
                        className={`border border-gray-300 p-3 font-medium text-center  capitalize  ${fontSize}`}
                      >
                        <div className="flex flex-col text-center h-full w-full items-center justify-center">
                          <span>{bus.number || bus.id || "N/A"}</span>
                          <span>({bus.gender || "N/A"})</span>
                        </div>
                      </td>

                      {showStats && (
                        <>
                          <td className="border border-gray-300 p-3">
                            {bus.capacity || 0}
                          </td>
                          <td className="border border-gray-300 p-3">
                            {bus.assigned || 0}
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <motion.div
                                className={`h-2.5 rounded-full ${
                                  isOverloaded
                                    ? "bg-red-600"
                                    : utilization < 80
                                    ? "bg-yellow-500"
                                    : "bg-green-600"
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
                            <motion.span
                              className={`text-sm ${
                                isOverloaded
                                  ? "text-red-600"
                                  : utilization < 80
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              {utilization}% {isOverloaded && " (Overloaded)"}
                            </motion.span>
                          </td>
                        </>
                      )}

                      {showGender && (
                        <td className="border border-gray-300 p-3">
                          <div className="flex flex-wrap gap-1">
                            {bus.stands &&
                              bus.stands.map((stand, index) => (
                                <span
                                  key={index}
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    stand.gender === "boys"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-pink-100 text-pink-800"
                                  }`}
                                >
                                  {stand.gender || "mixed"}
                                </span>
                              ))}
                          </div>
                        </td>
                      )}

                      {/* ✅ Stand font size applied */}
                      <td
                        className={`border border-gray-300 p-3 cursor-pointer`}
                      >
                        {bus.stands && bus.stands.length > 0 ? (
                          <motion.ul
                            className="flex flex-wrap gap-2"
                            initial="hidden"
                            animate="visible"
                            transition={{ staggerChildren: 0.05 }}
                          >
                            {bus.stands.map((stand, index) => (
                              <motion.li
                                key={index}
                                variants={standItemVariants}
                                className={
                                  location.pathname === "/new"
                                    ? `${standFontSize}`
                                    : `bg-purple-100 cursor-pointer px-3 py-1 rounded-full flex items-center whitespace-nowrap border border-purple-200 ${standFontSize}`
                                }
                              >
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                                { getStandName(stand) + (index === bus.stands.length - 1 ? "." : ",") }

                              </motion.li>
                            ))}
                          </motion.ul>
                        ) : (
                          "No stands"
                        )}
                      </td>

                      {showActions && (
                        <td className="border border-gray-300 p-3">
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => onEdit(bus)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                              title="Edit this assignment"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={() => onRemove(bus.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                              title="Remove this assignment"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Remove
                            </motion.button>
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

        {/* ✅ Countdown bubble */}
      </div>
      {isNew && countdown !== null && isOverflowing && (
        <div className="absolute bottom-5 right-5 bg-black/70 text-white text-sm px-3 py-2 rounded-full shadow-lg">
          {atBottom ? "Back to top in" : "Auto-scroll in"} {countdown}s
        </div>
      )}

      {location.pathname === "/new" && (
        <span className="fixed bottom-1 left-2 text-gray-500">
          Developed By Jotirmoy || Designed By Raiyan || Copyright © 2025
        </span>
      )}
    </div>
  );
};

export default AssignmentTable;
