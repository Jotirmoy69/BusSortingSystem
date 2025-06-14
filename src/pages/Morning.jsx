import React, { useState } from "react";
import { HiPencil } from "react-icons/hi2";
import { useAppContext } from "../context/context";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import AssignmentTable from "../components/AssignmentTable";
import { motion, AnimatePresence } from "framer-motion";

export default function Morning() {
  const [selected, setSelected] = useState({});
  const [tempSelect, setTempSelect] = useState([]);
  const [hoveredStand, setHoveredStand] = useState({ routeIdx: null, standIdx: null });
  const [hoveredSelectedStand, setHoveredSelectedStand] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    activeBuses,
    stands2,
    assignedBuses,
    setAssignedBuses,
    automationAssignments,
  } = useAppContext();

  const getAssignedStandNames = () => {
    const standsFromAssignedBuses = assignedBuses.flatMap(bus =>
      bus.stands.map(stand => stand.stand || stand.name)
    );
    const standsFromTempSelect = tempSelect.map(stand => stand.name);
    return [...new Set([...standsFromAssignedBuses, ...standsFromTempSelect])];
  };

  const getAvailableBuses = () => {
    const assignedBusIds = assignedBuses.map(bus => bus.id);
    return activeBuses.filter(bus => !assignedBusIds.includes(bus.number));
  };

  const handleStandSelect = (stand) => {
    if (!stand) return toast.error("Invalid stand data!");
    if (!isBusSelected) return toast.error("Please select a bus before adding stands!");
    if (getAssignedStandNames().includes(stand.name)) return toast.error("This stand is already assigned!");

    const totalStudents = (stand.boys || 0) + (stand.girls || 0);
    const remainingCapacity = selected.capacity -
      tempSelect.reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);

    if (totalStudents > remainingCapacity + 27)
      return toast.error("Cannot exceed bus capacity by more than 25 students!");

    setTempSelect(prev => [...prev, {
      name: stand.name,
      boys: stand.boys || 0,
      girls: stand.girls || 0
    }]);
  };

  const handleRemoveSelected = (standName) => {
    setTempSelect(prev => prev.filter(s => s.name !== standName));
  };

  const handleEditBus = (bus) => {
    const standsToReturn = bus.stands.map(stand => ({
      name: stand.stand || stand.name,
      boys: stand.boys || 0,
      girls: stand.girls || 0
    }));
    setAssignedBuses(prev => prev.filter(b => b.id !== bus.id));
    setSelected(bus);
    setTempSelect(standsToReturn);
  };

  const handleRemoveBus = (busId) => {
    setAssignedBuses(prev => prev.filter(bus => bus.id !== busId));
    if (selected.id === busId) {
      setSelected({});
      setTempSelect([]);
    }
    toast.success("Bus assignment removed");
  };

  const handleSave = () => {
    if (!isBusSelected) return toast.error("Please select a bus first!");
    if (tempSelect.length === 0) return toast.error("Please select at least one stand!");

    const boys = tempSelect.reduce((sum, s) => sum + (s.boys || 0), 0);
    const girls = tempSelect.reduce((sum, s) => sum + (s.girls || 0), 0);
    const total = boys + girls;

    const newAssignment = {
      id: selected.id || selected.number,
      capacity: selected.capacity,
      assigned: total,
      boys,
      girls,
      stands: tempSelect.map(stand => ({
        ...stand,
        total: (stand.boys || 0) + (stand.girls || 0),
      })),
      route: "Manual Assignment",
    };

    setAssignedBuses(prev => [...prev, newAssignment]);
    setSelected({});
    setTempSelect([]);
    toast.success(`Bus ${selected.number} assigned successfully!`);
  };

  const handleReassign = () => {
    if (automationAssignments?.length > 0) {
      setAssignedBuses([]);
      toast.success("All assignments cleared");
    } else {
      toast.info("No automation assignments found");
    }
    setSelected({});
    setTempSelect([]);
  };

  const isBusSelected = Object.keys(selected).length !== 0;
  const availableBuses = getAvailableBuses();
  const assignedStandNames = getAssignedStandNames();

  const availableStands = stands2?.map(route => ({
    ...route,
    stands: route.stands.filter(stand =>
      !assignedStandNames.includes(stand.name)
    )
  })) || [];

  return (
    <div className="bg-white min-h-screen font-bold text-black space-y-4 font-[clash] p-10">
      <div className="flex justify-between items-center pr-16">
        <h1 className="text-3xl">Manual Selection</h1>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className={`text-gray-900 font-bold cursor-pointer bg-gradient-to-r transition-all duration-150 from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 rounded-lg text-sm px-5 py-2.5 text-center ${saving ? "opacity-50 cursor-not-allowed" : ""}`}>
            {saving ? "Saving..." : "Save the bus"}
          </button>
          <button onClick={handleReassign}
            className="text-white font-bold cursor-pointer bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-600 hover:to-red-500 rounded-lg text-sm px-5 py-2">
            Reset
          </button>
        </div>
      </div>

      <div className="flex gap-5 h-64 justify-end">
        {!isBusSelected && availableBuses.length > 0 && (
          <motion.select
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            onChange={(e) => {
              const bus = activeBuses.find(b => b.number === e.target.value);
              setSelected(bus || {});
            }}
            className="bg-gray-200 px-6 rounded-2xl shadow-md text-2xl text-center h-16 w-1/2"
            value={selected.number || ""}
          >
            <option value="">Select a bus</option>
            {availableBuses.map(bus => (
              <option key={bus.number} value={bus.number}>
                {bus.number} ({bus.capacity} seats)
              </option>
            ))}
          </motion.select>
        )}

        {isBusSelected && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
            className="bg-lime-200 p-6 rounded-2xl shadow-md text-center w-1/2 mx-auto relative"
          >
            <div className="text-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold">
              Bus NO. {selected.number}
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex items-center px-6">
              <span className="flex-1 text-left text-sm lg:text-xl">
                Filled: {tempSelect.reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0)} / {selected.capacity}
              </span>
              {tempSelect.reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0) > selected.capacity && (
                <span className="absolute left-1/2 transform -translate-x-1/2 text-red-600 font-semibold text-sm lg:text-xl">
                  Overloaded
                </span>
              )}
              <span className="cursor-pointer text-gray-700 hover:text-gray-900" onClick={() => { setSelected({}); setTempSelect([]); }}>
                <HiPencil size={24} />
              </span>
            </div>
          </motion.div>
        )}

        <motion.div layout className="bg-sky-200 py-5 px-7 rounded-2xl shadow-md w-full">
          <div className="text-xl mb-2">Selected Stands</div>
          <div className="overflow-x-hidden flex flex-wrap gap-3 overflow-y-scroll h-44 no-scrollbar">
            {tempSelect.length === 0 ? (
              <div className="text-gray-500 w-full flex items-center justify-center h-full">
                No stands selected
              </div>
            ) : (
              tempSelect.map((stand, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-sky-100 w-64 flex max-h-12 justify-between items-center px-4 py-3 rounded-lg relative"
                  onMouseEnter={() => setHoveredSelectedStand(stand.name)}
                  onMouseLeave={() => setHoveredSelectedStand(null)}
                >
                  <div>{stand.name}</div>
                  <div>{(stand.boys || 0) + (stand.girls || 0)}</div>
                  {hoveredSelectedStand === stand.name && (
                    <button onClick={() => handleRemoveSelected(stand.name)} className="absolute bottom-3 bg-red-500 text-white right-2 px-3 rounded-md">
                      Deselect
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div layout className="bg-[#F4A1FF] p-6 rounded-2xl shadow-md w-full min-h-[44vh]">
        {availableStands.length === 0 ? (
          <div className="text-2xl text-center h-full flex items-center justify-center text-gray-500">
            {stands2?.length === 0 ? "No stands loaded" : "All stands have been assigned"}
          </div>
        ) : (
          availableStands.map((route, idx) => (
            <div key={idx} className="mb-6">
              <div className="text-2xl mb-4">{route.name}
                {route.stands.length === 0 && (
                  <span className="text-green-800 ml-3 text-base font-semibold">(all assigned)</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {route.stands.map((stand, sidx) => (
                  <motion.div
                    layout
                    key={sidx}
                    onMouseOver={() => setHoveredStand({ routeIdx: idx, standIdx: sidx })}
                    onMouseOut={() => setHoveredStand({ routeIdx: null, standIdx: null })}
                    className="bg-[#F8C1FF] relative min-w-64 flex justify-between items-center px-4 py-3 rounded-lg max-h-12"
                  >
                    <div>{stand.name}</div>
                    <div>{(stand.boys || 0) + (stand.girls || 0)}</div>
                    {hoveredStand.routeIdx === idx && hoveredStand.standIdx === sidx && (
                      <button onClick={() => handleStandSelect(stand)} className="absolute bottom-3 right-2 px-3 rounded-md bg-lime-200">
                        Select
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </motion.div>

      <AssignmentTable assignedBuses={assignedBuses} mode="manual" onEdit={handleEditBus} onRemove={handleRemoveBus} />

      <Link to="/" className="fixed top-5 right-5 z-50 bg-blue-500 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors">
        <FaArrowLeftLong />
      </Link>

      <ToastContainer />
    </div>
  );
}
