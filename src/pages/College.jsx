import React, { useState } from "react";
import { HiPencil, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { useAppContext } from "../context/context";
import { FaArrowLeftLong, FaPlus } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import AssignmentTable from "../components/AssignmentTable";
import { motion, AnimatePresence } from "framer-motion";

export default function College() {
  const [activeGender, setActiveGender] = useState("boys"); // "boys" | "girls"
  const [selected, setSelected] = useState({});
  const [tempSelect, setTempSelect] = useState([]);
  const [saving, setSaving] = useState(false);
  const [overloadSize, setOverloadSize] = useState(25);

  const {
    activeBuses,
    stands3,
    assignedBusesCollege,
    setAssignedBusesCollege,
  } = useAppContext();

  // Normalize names: "Stop A (boys part)" -> "Stop A"
  const normalizeStandName = (name) =>
    String(name || "").trim().replace(/\s*KATEX_INLINE_OPEN.*?KATEX_INLINE_CLOSE\s*$/, "");

  // Build assigned name sets per gender (from saved + in-progress)
  const getAssignedStandNames = () => {
    const editingBusId = String(selected.id ?? selected.number ?? "");
    const boysAssigned = new Set();
    const girlsAssigned = new Set();

    (assignedBusesCollege || []).forEach((bus) => {
      const busId = String(bus.id ?? bus.number ?? "");
      if (busId === editingBusId) return; // skip bus being edited

      (bus.stands || []).forEach((stand) => {
        const base = normalizeStandName(stand.originalName ?? stand.name);
        if (stand.gender === "girls") girlsAssigned.add(base);
        else boysAssigned.add(base);
      });
    });

    (tempSelect || []).forEach((stand) => {
      if (!stand?.name) return;
      const base = normalizeStandName(stand.name);
      if (stand.gender === "girls") girlsAssigned.add(base);
      else boysAssigned.add(base);
    });

    return {
      boys: Array.from(boysAssigned),
      girls: Array.from(girlsAssigned),
    };
  };

  // Available buses = active - already assigned (keep current if selected)
  const getAvailableBuses = () => {
    const editingBusId = String(selected.id ?? selected.number ?? "");
    const assignedIds = (assignedBusesCollege || []).map((b) =>
      String(b.id ?? b.number)
    );
    const assignedFiltered = assignedIds.filter((id) => id !== editingBusId);
    return (activeBuses || []).filter((bus) => {
      const id = String(bus.number ?? bus.id);
      return !assignedFiltered.includes(id);
    });
  };

  const handleStandSelect = (stand) => {
    if (!stand) return toast.error("Invalid stand data!");
    if (!isBusSelected)
      return toast.error(
        `Please select a bus before adding stands for ${activeGender}!`
      );

    const assignedNames = getAssignedStandNames();
    const baseName = normalizeStandName(stand.name);

    const isAlreadyAssigned = (assignedNames[activeGender] || []).includes(
      baseName
    );
    if (isAlreadyAssigned)
      return toast.error(
        "This stand is already assigned/selected for this gender!"
      );

    const alreadyInTemp = tempSelect.some(
      (s) =>
        normalizeStandName(s.name) === baseName &&
        (s.gender || "boys") === activeGender
    );
    if (alreadyInTemp) return toast.error("This stand is already selected!");

    const studentsCount =
      activeGender === "boys" ? Number(stand.boys || 0) : Number(stand.girls || 0);
    if (studentsCount <= 0)
      return toast.error("No students available at this stand for this gender!");

    const currentTotal = tempSelect
      .filter((s) => (s.gender || "boys") === activeGender)
      .reduce((sum, s) => sum + Number(s.students || 0), 0);

    const newTotal = currentTotal + studentsCount;
    if (newTotal > (Number(selected.capacity) || 0) + overloadSize)
      return toast.error(
        `Cannot exceed bus capacity by more than ${overloadSize} students!`
      );

    setTempSelect((prev) => [
      ...prev,
      {
        name: baseName,
        students: studentsCount,
        gender: activeGender,
      },
    ]);
  };

  const handleRemoveSelected = (standName) => {
    const baseName = normalizeStandName(standName);
    setTempSelect((prev) =>
      prev.filter(
        (s) =>
          !(
            normalizeStandName(s.name) === baseName &&
            (s.gender || "boys") === activeGender
          )
      )
    );
  };

  const handleEditBus = (bus) => {
    if (!bus || !bus.stands) return;

    const stands = (bus.stands || []).map((stand) => ({
      name: normalizeStandName(stand.originalName ?? stand.name),
      students: Number(stand.total ?? stand.students ?? 0),
      gender: stand.gender ?? null,
    }));

    setAssignedBusesCollege((prev) =>
      (prev || []).filter(
        (b) => String(b.id ?? b.number) !== String(bus.id ?? bus.number)
      )
    );
    setSelected({
      ...bus,
      number: bus.number || bus.id,
    });
    setTempSelect(stands);
  };

  const handleRemoveBus = (busId) => {
    const id = String(busId);
    setAssignedBusesCollege((prev) =>
      (prev || []).filter(
        (bus) => String(bus.id ?? bus.number) !== id
      )
    );
    if (String(selected.id ?? selected.number) === id) {
      setSelected({});
      setTempSelect([]);
    }
    toast.success("Bus assignment removed");
  };

  const handleSave = () => {
    setSaving(true);
    if (!isBusSelected) {
      toast.error(`Please select a bus first!`);
      setSaving(false);
      return;
    }

    const standsToSave = (tempSelect || []).filter(
      (s) => (s.gender || "boys") === activeGender
    );

    if (standsToSave.length === 0) {
      toast.error(`Please select at least one stand for ${activeGender}!`);
      setSaving(false);
      return;
    }

    const allStands = standsToSave.map((stand) => ({
      name: normalizeStandName(stand.name),
      total: Number(stand.students),
      gender: stand.gender || "boys",
    }));

    const totalStudents = allStands.reduce((sum, s) => sum + (s.total || 0), 0);

    const newAssignment = {
      id: selected.id || selected.number,
      number: selected.number || selected.id,
      capacity: Number(selected.capacity),
      assigned: totalStudents,
      stands: allStands,
      route: "College Assignment",
    };

    setAssignedBusesCollege((prev) => [...(prev || []), newAssignment]);

    setTempSelect((prev) =>
      prev.filter((s) => (s.gender || "boys") !== activeGender)
    );
    setSelected({});
    toast.success(
      `Bus ${selected.number} assigned successfully for ${activeGender}!`
    );
    setSaving(false);
  };

  const handleReassign = () => {
    if ((assignedBusesCollege || []).length > 0) {
      setAssignedBusesCollege([]);
      toast.success("All college assignments cleared");
    } else {
      toast.info("No college assignments found");
    }
    setSelected({});
    setTempSelect([]);
  };

  const isBusSelected = Object.keys(selected).length !== 0;
  const availableBuses = getAvailableBuses();
  const assignedStandNames = getAssignedStandNames();

  // Build available stands list per gender
  const availableStands =
    (stands3 || []).map((route) => ({
      ...route,
      stands: (route.stands || []).map((stand) => ({
        ...stand,
        students:
          activeGender === "boys" ? Number(stand.boys || 0) : Number(stand.girls || 0),
      })),
    })) || [];

  const selectedForGender = (tempSelect || []).filter(
    (s) => (s.gender || "boys") === activeGender
  );

  const totalSelectedStudents = selectedForGender.reduce(
    (sum, s) => sum + Number(s.students || 0),
    0
  );

  const occupancyPercentage =
    isBusSelected && selected.capacity
      ? Math.min(100, (totalSelectedStudents / Number(selected.capacity)) * 100)
      : 0;

  // Are there any stands with students left unassigned for this gender?
  const hasAvailableStands = (stands3 || []).some((route) =>
    (route.stands || []).some((stand) => {
      const studentCount =
        activeGender === "boys" ? Number(stand.boys || 0) : Number(stand.girls || 0);
      const isAssigned = (assignedStandNames[activeGender] || []).includes(
        normalizeStandName(stand.name)
      );
      return studentCount > 0 && !isAssigned;
    })
  );

  const availableStandCount = (stands3 || []).reduce((acc, route) => {
    const count = (route.stands || []).filter((stand) => {
      const studentCount =
        activeGender === "boys" ? Number(stand.boys || 0) : Number(stand.girls || 0);
      const isAssigned = (assignedStandNames[activeGender] || []).includes(
        normalizeStandName(stand.name)
      );
      return studentCount > 0 && !isAssigned;
    }).length;
    return acc + count;
  }, 0);

  const allStandsAssigned = !hasAvailableStands;
  const noAvailableBuses = availableBuses.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-14 font-sans p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">College Bus Assignment</h1>
            <p className="text-gray-500 text-sm">Assign stands to buses for college transport</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Overload size only shows when a bus is selected */}
            {isBusSelected && (
              <div className="bg-gray-100 px-4 py-3 items-center rounded-lg flex gap-4 w- max-w-md">
                <label className="text-sm font-medium w-40 text-gray-700">
                  Overload Allowed: <span className="font-bold">{overloadSize}</span>
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

            {/* Gender Toggle — now permanent (always visible) */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
              <button
                onClick={() => setActiveGender("boys")}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeGender === "boys"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Boys
              </button>
              <button
                onClick={() => setActiveGender("girls")}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeGender === "girls"
                    ? "bg-pink-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Girls
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2
                ${saving ? "bg-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg"}`}
              // Enabled when a bus is selected and at least one stand is chosen for current gender
              disabled={saving || !isBusSelected || selectedForGender.length === 0}
            >
              {saving ? "Saving..." : "Save Assignment"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReassign}
              className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 shadow hover:shadow-md"
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
              <h2 className="text-lg font-semibold text-gray-800">Bus Selection</h2>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">{availableBuses.length} available</span>
            </div>

            <AnimatePresence mode="wait">
              {!isBusSelected ? (
                <motion.div key="bus-select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    onChange={(e) => {
                      const bus = (activeBuses || []).find((b) => String(b.number) === e.target.value || String(b.id) === e.target.value);
                      setSelected(bus || {});
                    }}
                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    disabled={noAvailableBuses}
                  >
                    <option value="">Select a bus</option>
                    {availableBuses.map((bus) => (
                      <option key={bus.number ?? bus.id} value={bus.number ?? bus.id}>
                        Bus #{bus.number} • {bus.capacity} seats
                      </option>
                    ))}
                  </motion.select>

                  {noAvailableBuses && <p className="text-red-500 text-sm mt-2">No buses available for assignment</p>}
                </motion.div>
              ) : (
                <motion.div key="bus-selected" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-purple-600 text-white p-1 px-2.5 rounded-lg">{selected.number}</span>
                        <span>{selected.capacity} Seats</span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedForGender.length} stand{selectedForGender.length !== 1 ? "s" : ""} selected
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
                      <span className={`${totalSelectedStudents > selected.capacity ? "text-red-600" : "text-gray-600"}`}>
                        {totalSelectedStudents}/{selected.capacity} students
                      </span>
                    </div>

                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${totalSelectedStudents > selected.capacity ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-indigo-600"}`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${occupancyPercentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>

                    {totalSelectedStudents > selected.capacity && (
                      <p className="text-red-600 text-xs font-medium mt-2">Warning: Over capacity by {totalSelectedStudents - selected.capacity} students</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Stands Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Selected Stands</h2>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">{selectedForGender.length} selected</span>
            </div>

            <div className="h-48 z-99 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                {selectedForGender.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                      <FaPlus className="text-xl" />
                    </div>
                    <p className="text-gray-500">No stands selected</p>
                    <p className="text-sm mt-1 text-gray-400">Select stands from the list below</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedForGender.map((stand, idx) => (
                      <motion.div key={`stand-${idx}`} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileHover={{ y: -3 }} className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative group">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-800">{stand.name}</h4>
                          <span className="text-sm font-semibold bg-purple-600 text-white px-2 py-0.5 rounded">{stand.students} students</span>
                        </div>

                        <button onClick={() => handleRemoveSelected(stand.name)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 z-10">
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
            <h2 className="text-lg font-semibold text-gray-800">Available Stands</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {availableStandCount} stands
              </span>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">{allStandsAssigned ? "All assigned" : "Available"}</span>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {allStandsAssigned ? (
              <div className="py-10 text-center text-gray-500">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaPlus className="text-2xl text-gray-400" />
                </div>
                <p className="text-lg font-medium">All stands have been assigned</p>
                <p className="text-sm mt-1 text-gray-400">Reset assignments to free up stands</p>
              </div>
            ) : availableStands.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaPlus className="text-2xl text-gray-400" />
                </div>
                <p className="text-lg font-medium">No stands available for assignment</p>
              </div>
            ) : (
              availableStands.map((route, idx) => {
                const filteredStands = (route.stands || []).filter((stand) => {
                  const studentCount = Number(
                    activeGender === "boys" ? (stand.boys || 0) : (stand.girls || 0)
                  );
                  const isAssigned =
                    (assignedStandNames[activeGender] || []).includes(
                      normalizeStandName(stand.name)
                    );
                  return studentCount > 0 && !isAssigned;
                });

                if (filteredStands.length === 0) {
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="mb-8 last:mb-0">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-md font-semibold text-gray-800">{route.name}</h3>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded-full">No available stands</span>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="mb-8 last:mb-0">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-md font-semibold text-gray-800">{route.name}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">{filteredStands.length} available</span>
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
                            <h4 className="font-medium text-gray-800">{stand.name}</h4>
                            <span className="text-sm font-semibold bg-purple-600 text-white px-2 py-0.5 rounded">{stand.students} students</span>
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
          assignedBuses={assignedBusesCollege || []}
          mode="college"
          onEdit={handleEditBus}
          onRemove={handleRemoveBus}
          showGender={false}
        />

        {/* Navigation Button */}
        <Link to="/" className="fixed top-6 right-6 z-50">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
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