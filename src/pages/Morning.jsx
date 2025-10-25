import React, { useState, useEffect } from "react";
import { HiPencil, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { useAppContext } from "../context/context";
import { FaArrowLeftLong, FaPlus } from "react-icons/fa6";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import AssignmentTable from "../components/AssignmentTable";
import { motion, AnimatePresence } from "framer-motion";

export default function Morning() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        navigate("/"); // same as <Link to="/" />
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);
  const [selected, setSelected] = useState({});
  const [tempSelect, setTempSelect] = useState([]);
  const [saving, setSaving] = useState(false);
  const [manualOverload, setManualOverload] = useState(27); // Default overload value
  

  const {
    activeBuses,
    stands2,
    assignedBuses,
    setAssignedBuses,
    automationAssignments,
  } = useAppContext();

  const getAssignedStandNames = () => {
    const standsFromAssignedBuses = assignedBuses.flatMap((bus) =>
      bus.stands.map((stand) => stand.stand || stand.name)
    );
    const standsFromTempSelect = tempSelect.map((stand) => stand.name);
    return [...new Set([...standsFromAssignedBuses, ...standsFromTempSelect])];
  };

  const getAvailableBuses = () => {
    const assignedBusIds = assignedBuses.map((bus) => bus.id);
    return activeBuses.filter((bus) => !assignedBusIds.includes(bus.number));
  };

  const handleStandSelect = (stand) => {
    if (!stand) return toast.error("Invalid stand data!");
    if (!isBusSelected)
      return toast.error("Please select a bus before adding stands!");
    if (getAssignedStandNames().includes(stand.name))
      return toast.error("This stand is already assigned!");

    const totalStudents = (stand.boys || 0) + (stand.girls || 0);
    const newTotal =
      tempSelect.reduce((sum, s) => sum + s.students, 0) + totalStudents;

    // Use manualOverload value for capacity check
    if (newTotal > selected.capacity + manualOverload)
      return toast.error(
        `Cannot exceed bus capacity by more than ${manualOverload} students!`
      );

    setTempSelect((prev) => [
      ...prev,
      {
        name: stand.name,
        students: totalStudents,
      },
    ]);
  };

  const handleRemoveSelected = (standName) => {
    setTempSelect((prev) => prev.filter((s) => s.name !== standName));
  };

  const handleEditBus = (bus) => {
    const standsToReturn = bus.stands.map((stand) => ({
      name: stand.name || stand.stand,
      students: stand.total,
    }));
    setAssignedBuses((prev) => prev.filter((b) => b.id !== bus.id));
    setSelected({
      ...bus,
      number: bus.number || bus.id,
    });
    setTempSelect(standsToReturn);
  };

  const handleRemoveBus = (busId) => {
    setAssignedBuses((prev) => prev.filter((bus) => bus.id !== busId));
    if (selected.id === busId) {
      setSelected({});
      setTempSelect([]);
    }
    toast.success("Bus assignment removed");
  };

  const handleSave = () => {
    if (!isBusSelected) return toast.error("Please select a bus first!");
    if (tempSelect.length === 0)
      return toast.error("Please select at least one stand!");

    const totalStudents = tempSelect.reduce((sum, s) => sum + s.students, 0);

    const newAssignment = {
      id: selected.id || selected.number,
      capacity: selected.capacity,
      assigned: totalStudents,
      stands: tempSelect.map((stand) => ({
        name: stand.name,
        total: stand.students,
      })),
      route: "Manual Assignment",
    };

    setAssignedBuses((prev) => [...prev, newAssignment]);
    setSelected({});
    setTempSelect([]);
    toast.success(`Bus ${selected.number} assigned successfully!`);
  };

  const handleReassign = () => {
    if (assignedBuses?.length > 0) {
      setAssignedBuses([]);
      toast.success("All assignments cleared");
    } else {
      toast.info("No assignments found");
    }
    setSelected({});
    setTempSelect([]);
  };

  const isBusSelected = Object.keys(selected).length !== 0;
  const availableBuses = getAvailableBuses();
  const assignedStandNames = getAssignedStandNames();

  const availableStands =
    stands2?.map((route) => ({
      ...route,
      stands: route.stands.filter(
        (stand) => !assignedStandNames.includes(stand.name)
      ),
    })) || [];

  // Calculate occupancy percentage using manualOverload
  const totalSelectedStudents = tempSelect.reduce(
    (sum, s) => sum + s.students,
    0
  );
  const maxCapacity = isBusSelected ? selected.capacity + manualOverload : 0;
  const occupancyPercentage = isBusSelected
    ? Math.min(100, (totalSelectedStudents / maxCapacity) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-14 font-sans p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Manual Bus Assignment
            </h1>
            <p className="text-gray-500 text-sm">
              Assign stands to buses manually
            </p>
          </div>

          <div className="flex flex-wrap w- gap-3">
            {/* Overload Input */}
            <div className="bg-gray-100 px-4 py-3 items-center rounded-lg flex gap-4 w- max-w-md">
              <label className="text-sm font-medium w-40 text-gray-700">
                Overload Allowed:{" "}
                <span className="font-bold">{manualOverload}</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={manualOverload}
                onChange={(e) => setManualOverload(Number(e.target.value))}
                className="w-32 accent-purple-500"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2
                ${
                  saving
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg"
                }`}
            >
              {saving ? "Saving..." : "Save Assignment"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReassign}
              className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2
                bg-white text-red-600 border border-red-200 hover:bg-red-50 shadow hover:shadow-md"
            >
              <HiOutlineTrash className="text-lg" />
              <span>Reset All</span>
            </motion.button>
          </div>
        </div>

        {/* Bus Selection Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bus Selection Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Bus Selection
              </h2>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {availableBuses.length} available
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!isBusSelected ? (
                <motion.div
                  key="bus-select"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    onChange={(e) => {
                      const bus = activeBuses.find(
                        (b) => b.number === e.target.value
                      );
                      setSelected(bus || {});
                    }}
                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Select a bus</option>
                    {availableBuses.map((bus) => (
                      <option key={bus.number} value={bus.number}>
                        Bus #{bus.number} • {bus.capacity} seats
                      </option>
                    ))}
                  </motion.select>
                </motion.div>
              ) : (
                <motion.div
                  key="bus-selected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-purple-600 text-white p-1 px-2.5 rounded-lg">
                          {selected.number}
                        </span>
                        <span>{selected.capacity} Seats</span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {tempSelect.length} stand
                        {tempSelect.length !== 1 ? "s" : ""} selected
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelected({});
                        setTempSelect([]);
                      }}
                      className="p-2 rounded-full hover:bg-purple-100 text-gray-500 hover:text-purple-700"
                    >
                      <HiPencil className="text-lg" />
                    </button>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mt-5">
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-gray-600">Occupancy</span>
                      <span
                        className={`${
                          totalSelectedStudents > selected.capacity
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {totalSelectedStudents}/{selected.capacity} +{" "}
                        {manualOverload} (max:{" "}
                        {selected.capacity + manualOverload})
                      </span>
                    </div>

                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          totalSelectedStudents > selected.capacity
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-purple-500 to-indigo-600"
                        }`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${occupancyPercentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>

                    {totalSelectedStudents > selected.capacity && (
                      <p className="text-red-600 text-xs font-medium mt-2">
                        Overloaded by{" "}
                        {totalSelectedStudents - selected.capacity} students
                        (allowed: +{manualOverload})
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Stands Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Selected Stands
              </h2>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {tempSelect.length} selected
              </span>
            </div>

            <div className="h-48 z-99 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {tempSelect.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-gray-400"
                  >
                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                      <FaPlus className="text-xl" />
                    </div>
                    <p className="text-gray-500">No stands selected</p>
                    <p className="text-sm mt-1 text-gray-400">
                      Select stands from the list below
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tempSelect.map((stand, idx) => (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ y: -3 }}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative group"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-800">
                            {stand.name}
                          </h4>
                          <span className="text-sm font-semibold bg-purple-600 text-white px-2 py-0.5 rounded">
                            {stand.students} students
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveSelected(stand.name)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 z-10"
                        >
                          <HiOutlineX className="text-red-500 text-lg" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Available Stands Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Available Stands
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
              {availableStands.reduce(
                (acc, route) => acc + route.stands.length,
                0
              )}{" "}
              available
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {availableStands.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaPlus className="text-2xl text-gray-400" />
                </div>
                <p className="text-lg font-medium">
                  All stands have been assigned
                </p>
                <p className="text-sm mt-1">
                  Reset assignments to free up stands
                </p>
              </div>
            ) : (
              availableStands.map((route, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="mb-8 last:mb-0"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-md font-semibold text-gray-800">
                      {route.name}
                    </h3>
                    {route.stands.length === 0 && (
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        All assigned
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {route.stands.map((stand, sidx) => (
                      <motion.div
                        key={sidx}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative overflow-hidden group cursor-pointer"
                        onClick={() => handleStandSelect(stand)}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-800">
                            {stand.name}
                          </h4>
                          <span className="text-sm font-semibold bg-purple-600 text-white px-2 py-0.5 rounded">
                            {(stand.boys || 0) + (stand.girls || 0)} students
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Select Stand</span>
                          <FaPlus className="ml-2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Assignment Table */}
        <AssignmentTable
          assignedBuses={assignedBuses}
          mode="manual"
          onEdit={handleEditBus}
          onRemove={handleRemoveBus}
        />

        {/* Navigation Button */}
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7c7d1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a5a5b3;
        }
      `}</style>
    </div>
  );
}
