import React, { useState } from "react";
import { HiPencil, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { useAppContext } from "../context/context";
import { FaArrowLeftLong, FaPlus } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import AssignmentTable from "../components/AssignmentTable";
import { motion, AnimatePresence } from "framer-motion";

export default function DayShift() {
  const [selected, setSelected] = useState({});
  const [tempSelect, setTempSelect] = useState({ boys: [], girls: [] });
  const [activeTab, setActiveTab] = useState("boys");
  const [saving, setSaving] = useState(false);
  const [overloadSize, setOverloadSize] = useState(25);

  const {
    activeBuses,
    stands,
    assignedBusesDay,
    setAssignedBusesDay,
    automationAssignmentsDay,
    setAutomationAssignmentsDay,
  } = useAppContext();

  // Function to get assigned stand names (excluding the bus being edited)
  const getAssignedStandNames = () => {
    const editingBusId = selected.id || selected.number;
    
    const allAssignments = [
      ...assignedBusesDay, 
    ];
    
    const boysAssigned = new Set();
    const girlsAssigned = new Set();
    
    // Collect all assigned stands from all buses except the current one being edited
    allAssignments.forEach(bus => {
      if (bus.id === editingBusId) return;
      
      if (bus.stands) {
        bus.stands.forEach(stand => {
          // Extract original stand name by removing any "(...)" suffix
          const originalName = (stand.name || '').replace(/\s*\(.*?\)$/, '');

          
          if (stand.gender === "boys" || !stand.gender) {
            boysAssigned.add(originalName);
          } else if (stand.gender === "girls") {
            girlsAssigned.add(originalName);
          }
        });
      }
    });
    
    // Add temp selected stands
    tempSelect.boys.forEach(stand => boysAssigned.add(stand.name));
    tempSelect.girls.forEach(stand => girlsAssigned.add(stand.name));
    
    return {
      boys: Array.from(boysAssigned),
      girls: Array.from(girlsAssigned),
    };
  };  

  // Function to get available buses
  const getAvailableBuses = () => {
    const editingBusId = selected.id || selected.number;
    
    // Get all assigned bus IDs from both manual and automation assignments
    const assignedBusIds = [
      ...assignedBusesDay.map(bus => bus.id),
      ...automationAssignmentsDay.map(bus => bus.id)
    ].filter(id => id !== editingBusId);
    
    return activeBuses.filter(
      bus => !assignedBusIds.includes(bus.number)
    );
  };

  // Handle stand selection
  const handleStandSelect = (stand) => {
    if (!stand) return toast.error("Invalid stand data!");
    if (!isBusSelected)
      return toast.error("Please select a bus before adding stands!");
    
    const assignedNames = getAssignedStandNames();
    if (assignedNames[activeTab].includes(stand.name))
      return toast.error(`This stand is already assigned for ${activeTab}!`);
    
    // Check if already selected in temp
    if (tempSelect[activeTab].some(s => s.name === stand.name))
      return toast.error("This stand is already selected!");

    const studentsCount =
      activeTab === "boys" ? stand.boys || 0 : stand.girls || 0;
    if (studentsCount <= 0)
      return toast.error(`No ${activeTab} available at this stand!`);

    const currentTabStands = tempSelect[activeTab];
    const newTotal =
      currentTabStands.reduce((sum, s) => sum + s.students, 0) + studentsCount;
    const otherTabTotal = tempSelect[
      activeTab === "boys" ? "girls" : "boys"
    ].reduce((sum, s) => sum + s.students, 0);
    const combinedTotal = newTotal + otherTabTotal;

    if (combinedTotal > selected.capacity + overloadSize)
      return toast.error(
        `Cannot exceed bus capacity by more than ${overloadSize} students!`
      );

    setTempSelect((prev) => ({
      ...prev,
      [activeTab]: [
        ...prev[activeTab],
        {
          name: stand.name,
          students: studentsCount,
          gender: activeTab,
        },
      ],
    }));
  };

  // Handle removing a selected stand
  const handleRemoveSelected = (standName, gender) => {
    setTempSelect((prev) => ({
      ...prev,
      [gender]: prev[gender].filter((s) => s.name !== standName),
    }));
  };

  // Handle editing a bus
  const handleEditBus = (bus) => {
    const boysStands = bus.stands
      .filter((stand) => stand.gender === "boys" || !stand.gender)
      .map((stand) => ({
        name: stand.name || stand.stand,
        students: stand.total,
        gender: "boys",
      }));

    const girlsStands = bus.stands
      .filter((stand) => stand.gender === "girls")
      .map((stand) => ({
        name: stand.name || stand.stand,
        students: stand.total,
        gender: "girls",
      }));

    // Remove bus from assignments
    setAssignedBusesDay((prev) => prev.filter((b) => b.id !== bus.id));

    // Set selected bus and tempSelect for editing
    setSelected({
      ...bus,
      number: bus.number || bus.id,
    });
    setTempSelect({
      boys: boysStands,
      girls: girlsStands,
    });

    // Automatically switch to the tab with most stands
    if (girlsStands.length > boysStands.length) {
      setActiveTab("girls");
    } else {
      setActiveTab("boys");
    }
  };

  // Handle removing a bus
  const handleRemoveBus = (busId) => {
    setAssignedBusesDay((prev) => prev.filter((bus) => bus.id !== busId));
    if (selected.id === busId) {
      setSelected({});
      setTempSelect({ boys: [], girls: [] });
    }
    toast.success("Bus assignment removed");
  };

  // Handle saving assignments
  const handleSave = () => {
    setSaving(true);
    if (!isBusSelected) {
      toast.error("Please select a bus first!");
      setSaving(false);
      return;
    }

    const totalStands = tempSelect.boys.length + tempSelect.girls.length;
    if (totalStands === 0) {
      toast.error("Please select at least one stand!");
      setSaving(false);
      return;
    }

    const allStands = [
      ...tempSelect.boys.map((stand) => ({
        name: stand.name,
        total: stand.students,
        gender: "boys",
      })),
      ...tempSelect.girls.map((stand) => ({
        name: stand.name,
        total: stand.students,
        gender: "girls",
      })),
    ];

    const totalStudents = allStands.reduce((sum, s) => sum + s.total, 0);

    const newAssignment = {
      id: selected.id || selected.number,
      number: selected.number || selected.id,
      capacity: selected.capacity,
      assigned: totalStudents,
      stands: allStands,
      route: "Day Shift Assignment",
      shift: "day",
    };

    setAssignedBusesDay((prev) => [...prev, newAssignment]);
    setSelected({});
    setTempSelect({ boys: [], girls: [] });
    toast.success(
      `Bus ${selected.number} assigned successfully for day shift!`
    );
    setSaving(false);
  };

  // Handle reassigning all buses
  const handleReassign = () => {
    if (assignedBusesDay.length > 0 || automationAssignmentsDay.length > 0) {
      setAssignedBusesDay([]);
      setAutomationAssignmentsDay([]);
      toast.success("All day shift assignments cleared");
    } else {
      toast.info("No day shift assignments found");
    }
    setSelected({});
    setTempSelect({ boys: [], girls: [] });
  };

  // Check if bus is selected
  const isBusSelected = Object.keys(selected).length !== 0;
  
  // Get available buses
  const availableBuses = getAvailableBuses();
  
  // Get assigned stand names
  const assignedStandNames = getAssignedStandNames();

  // Prepare available stands data
  const availableStands = stands?.map((route) => ({
    ...route,
    stands: route.stands.map((stand) => ({
      ...stand,
      boys: stand.boys || 0,
      girls: stand.girls || 0,
    }))
  })) || [];

  // Calculate total selected students
  const totalSelectedStudents = [
    ...tempSelect.boys,
    ...tempSelect.girls,
  ].reduce((sum, s) => sum + s.students, 0);
  
  // Calculate occupancy percentage
  const occupancyPercentage = isBusSelected
    ? Math.min(100, (totalSelectedStudents / selected.capacity) * 100)
    : 0;

  // Calculate if all stands are assigned
  const hasAvailableStands = availableStands.some(route => 
    route.stands.some(stand => {
      const studentCount = activeTab === 'boys' ? stand.boys : stand.girls;
      const isAssigned = assignedStandNames[activeTab].includes(stand.name);
      return studentCount > 0 && !isAssigned;
    })
  );
  
  const allStandsAssigned = !hasAvailableStands;

  return (
    <div className="min-h-screen bg-gray-50 pt-14 font-sans p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Day Shift Bus Assignment
            </h1>
            <p className="text-gray-500 text-sm">
              Assign stands to buses for day shift
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Overload Size Input - Moved here */}
            {isBusSelected && (

            // <div className="flex flex-wrap w- gap-3">         
            <div className="bg-gray-100 px-4 py-3 items-center rounded-lg flex gap-4 w- max-w-md">
              <label className="text-sm font-medium w-40 text-gray-700">
                Overload Allowed:{" "}
                <span className="font-bold">{overloadSize}</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={overloadSize}
                onChange={(e) => setOverloadSize(Number(e.target.value))}
                className="w-32 accent-purple-500"
              />
            </div>

            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2
                ${saving 
                  ? "bg-purple-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg"
                }`}
              disabled={saving || allStandsAssigned}
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
                    disabled={allStandsAssigned}
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
                          #{selected.number}
                        </span>
                        <span>{selected.capacity} Seats</span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {tempSelect.boys.length + tempSelect.girls.length} stand
                        {tempSelect.boys.length + tempSelect.girls.length !== 1
                          ? "s"
                          : ""}{" "}
                        selected
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelected({});
                        setTempSelect({ boys: [], girls: [] });
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
                        {totalSelectedStudents}/{selected.capacity} students
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
                        Warning: Over capacity by{" "}
                        {totalSelectedStudents - selected.capacity} students
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
                {tempSelect.boys.length + tempSelect.girls.length} selected
              </span>
            </div>

            {/* Gender Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "boys"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("boys")}
              >
                Boys ({tempSelect.boys.length})
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "girls"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("girls")}
              >
                Girls ({tempSelect.girls.length})
              </button>
            </div>

            <div className="h-48 z-99 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                {tempSelect[activeTab].length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-gray-400"
                  >
                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                      <FaPlus className="text-xl" />
                    </div>
                    <p className="text-gray-500">
                      No {activeTab} stands selected
                    </p>
                    <p className="text-sm mt-1 text-gray-400">
                      Select stands from the list below
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tempSelect[activeTab].map((stand, idx) => (
                      <motion.div
                        key={`${activeTab}-${idx}`}
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
                            {stand.students} {activeTab}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            handleRemoveSelected(stand.name, activeTab)
                          }
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {availableStands.reduce(
                  (acc, route) => acc + route.stands.length,
                  0
                )} stands
              </span>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Showing: {activeTab}
              </span>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {allStandsAssigned ? "All assigned" : "Available"}
              </span>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {allStandsAssigned ? (
              <div className="py-10 text-center text-gray-500">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaPlus className="text-2xl text-gray-400" />
                </div>
                <p className="text-lg font-medium">
                  All stands have been assigned
                </p>
                <p className="text-sm mt-1 text-gray-400">
                  Reset assignments to free up stands
                </p>
              </div>
            ) : availableStands.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaPlus className="text-2xl text-gray-400" />
                </div>
                <p className="text-lg font-medium">
                  No stands available for assignment
                </p>
              </div>
            ) : (
              availableStands.map((route, idx) => {
                // Filter stands that are available for current gender and not assigned
                const filteredStands = route.stands.filter(stand => {
                  const studentCount = activeTab === "boys" ? stand.boys : stand.girls;
                  const isAssigned = assignedStandNames[activeTab].includes(stand.name);
                  return studentCount > 0 && !isAssigned;
                });

                if (filteredStands.length === 0) {
                  return (
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
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                          No available {activeTab} stands
                        </span>
                      </div>
                    </motion.div>
                  );
                }

                return (
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
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {filteredStands.length} available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredStands.map((stand, sidx) => (
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
                              {stand[activeTab]} {activeTab}
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
                );
              })
            )}
          </div>
        </div>

        {/* Assignment Table */}
        <AssignmentTable
          assignedBuses={assignedBusesDay}
          mode="day-shift"
          onEdit={handleEditBus}
          onRemove={handleRemoveBus}
          showGender={true}
          automationAssigned={automationAssignmentsDay.length > 0}
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

        <ToastContainer autoClose={3000} />
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