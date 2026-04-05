import React, { useState, useEffect } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";
import {
  splitStandByGender,
  splitStandIfNeeded,
  findExistingBusForStand,
  findSuitableBus,
  assignStandToBus,
  createNewBusAssignment,
} from "../utils/assignmentUtils";
import { getBusId } from "../utils/busUtils";

const Automation = () => {
  const navigate = useNavigate();
  const [button, setButton] = useState(5);
  const [morningOverload, setMorningOverload] = useState(27);
  const [dayOverload, setDayOverload] = useState(10);
  const [collegeOverload, setCollegeOverload] = useState(10);

  const {
    activeBuses,
    stands3,
    stands2,
    stands,
    assignedBuses,
    setAssignedBuses,
    assignedBusesDay,
    assignedBusesCollege,
    setAssignedBusesCollege,
    setAssignedBusesDay,
  } = useAppContext();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);

  const assignStandsByGender = (standsToAssign, assignments, route, sortedBuses, overload, gender) => {
    const unassignedStands = [];
    const genderStands = standsToAssign.filter((s) => s.gender === gender);

    for (const stand of genderStands) {
      const existingBus = findExistingBusForStand(assignments, route.name, gender, stand.total, overload);
      
      if (existingBus) {
        assignStandToBus(existingBus, stand);
        continue;
      }

      const suitableBus = findSuitableBus(sortedBuses, assignments, stand.total, overload);
      if (suitableBus) {
        const newAssignment = createNewBusAssignment(suitableBus, stand, route.name, gender);
        if (newAssignment) {
          assignments.push(newAssignment);
        } else {
          unassignedStands.push(stand);
        }
      } else {
        unassignedStands.push(stand);
      }
    }

    return unassignedStands;
  };

  const assignCollegeShiftBuses = ({ buses, routes }) => {
    setAssignedBusesCollege([]);
    const sortedRoutes = [...routes].sort((a, b) => {
      const totalA = (a.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      const totalB = (b.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      return totalB - totalA;
    });
    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);
    const maxBusCapacity = sortedBuses.length > 0 ? Math.max(...sortedBuses.map((b) => b.capacity)) : 0;
    const maxCapacity = maxBusCapacity + collegeOverload;

    const assignments = [];
    let allUnassignedStands = [];

    for (const route of sortedRoutes) {
      const standsToAssign = [];
      for (const stand of route.stands || []) {
        const splitStands = splitStandByGender(stand, maxCapacity, route.name);
        standsToAssign.push(...splitStands);
          }

      const boysUnassigned = assignStandsByGender(standsToAssign, assignments, route, sortedBuses, collegeOverload, "boys");
      const girlsUnassigned = assignStandsByGender(standsToAssign, assignments, route, sortedBuses, collegeOverload, "girls");
      allUnassignedStands.push(...boysUnassigned, ...girlsUnassigned);
    }

    if (allUnassignedStands.length > 0) {
      toast.error("Not enough buses to assign all students while maintaining gender separation.");
    }
    return assignments;
  };

  const assignDayShiftBuses = ({ buses, routes }) => {
    const sortedRoutes = [...routes].sort((a, b) => {
      const totalA = (a.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      const totalB = (b.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      return totalB - totalA;
    });
    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);
    const maxBusCapacity = sortedBuses.length > 0 ? Math.max(...sortedBuses.map((b) => b.capacity)) : 0;
    const maxCapacity = maxBusCapacity + dayOverload;

    const assignments = [];
    let allUnassignedStands = [];

    for (const route of sortedRoutes) {
      const standsToAssign = [];
      for (const stand of route.stands || []) {
        const splitStands = splitStandByGender(stand, maxCapacity, route.name);
        standsToAssign.push(...splitStands);
          }

      const boysUnassigned = assignStandsByGender(standsToAssign, assignments, route, sortedBuses, dayOverload, "boys");
      const girlsUnassigned = assignStandsByGender(standsToAssign, assignments, route, sortedBuses, dayOverload, "girls");
      allUnassignedStands.push(...boysUnassigned, ...girlsUnassigned);
    }

    if (allUnassignedStands.length > 0) {
      toast.error("Not enough buses to assign all students while maintaining gender separation.");
    }
    return assignments;
  };

  const assignMorningShiftBuses = ({ buses, routes }) => {
    const sortedRoutes = [...routes].sort((a, b) => {
      const totalA = (a.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      const totalB = (b.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      return totalB - totalA;
    });
    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);
    const maxBusCapacity = sortedBuses.length > 0 ? Math.max(...sortedBuses.map((b) => b.capacity)) : 0;
    const maxCapacity = maxBusCapacity + morningOverload;

    const assignments = [];
    const unassignedStands = [];

    for (const route of sortedRoutes) {
      const standsToAssign = [];
      for (const stand of route.stands || []) {
        const splitStands = splitStandIfNeeded(stand, maxCapacity, route.name);
        standsToAssign.push(...splitStands);
      }

      for (const stand of standsToAssign) {
        const existingBus = findExistingBusForStand(assignments, route.name, null, stand.total, morningOverload);
        
        if (existingBus) {
          assignStandToBus(existingBus, stand);
          continue;
        }

        const suitableBus = findSuitableBus(sortedBuses, assignments, stand.total, morningOverload);
        if (suitableBus) {
          const newAssignment = createNewBusAssignment(suitableBus, stand, route.name);
          if (newAssignment) {
            assignments.push(newAssignment);
          } else {
            unassignedStands.push(stand);
          }
        } else {
          unassignedStands.push(stand);
        }
      }
    }

    if (unassignedStands.length > 0) {
      toast.error("Not enough buses to assign all students while maintaining route separation.");
    }
    return assignments;
  };

  const assignBuses = ({ buses, routes }) => {
    const shiftMap = {
      5: assignMorningShiftBuses,
      2: assignDayShiftBuses,
      3: assignCollegeShiftBuses,
    };
    const assignFunction = shiftMap[button];
    return assignFunction ? assignFunction({ buses, routes }) : [];
  };

  const handleAssign = () => {
    if (activeBuses.length === 0) {
      toast.error("Bus data not loaded or invalid!");
      return;
    }

    const routesMap = {
      5: stands2,
      2: stands,
      3: stands3,
    };
    const activeRoutes = routesMap[button];

    if (!activeRoutes || activeRoutes.length === 0) {
      toast.error("Stand data not loaded or invalid!");
      return;
    }

    try {
      const assigned = assignBuses({ buses: activeBuses, routes: activeRoutes });
      const setMap = {
        5: setAssignedBuses,
        2: setAssignedBusesDay,
        3: setAssignedBusesCollege,
      };
      const setFunction = setMap[button];
      if (setFunction) {
        setFunction(assigned);
      toast.success("Bus assignment done!");
      }
    } catch (err) {
      toast.error("Assignment failed: " + err.message);
    }
  };

  const handleRemove = (busOrId) => {
    const busId = String(typeof busOrId === "object" ? getBusId(busOrId) : busOrId);
    const removeMap = {
      5: setAssignedBuses,
      2: setAssignedBusesDay,
      3: setAssignedBusesCollege,
    };
    const removeFunction = removeMap[button];
    if (removeFunction) {
      removeFunction((prev) => (prev || []).filter((b) => getBusId(b) !== busId));
    toast.success("Assignment removed");
    }
  };

  const getCurrentAssignments = () => {
    const assignmentMap = {
      5: assignedBuses,
      2: assignedBusesDay,
      3: assignedBusesCollege,
    };
    return assignmentMap[button] || [];
  };

  const currentAssignments = getCurrentAssignments();
  const summary = {
    totalBuses: currentAssignments.length,
    totalAssigned: currentAssignments.reduce((s, b) => s + Number(b.assigned || 0), 0),
    totalCapacity: currentAssignments.reduce((s, b) => s + Number(b.capacity || 0), 0),
    underfilledBuses: currentAssignments.filter((b) => Number(b.assigned) < Number(b.capacity)),
    overloadedBuses: currentAssignments.filter((b) => Number(b.assigned) > Number(b.capacity)),
    };

  return (
    <div className="min-h-screen bg-slate-50 font-[gilroy] text-slate-900 selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors text-slate-500"
          >
            <FaArrowLeftLong size={18} className="sm:w-5 sm:h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Auto <span className="text-indigo-600">Assigner</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-slate-200">
            {[
              { id: 5, label: "Morning" },
              { id: 2, label: "Day" },
              { id: 3, label: "College" }
            ].map((shift) => (
              <button
                key={shift.id}
                onClick={() => setButton(shift.id)}
                className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  button === shift.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {shift.label}
              </button>
            ))}
          </div>
          
          <motion.button
            onClick={handleAssign}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="premium-button-primary py-1.5 sm:py-2 px-4 sm:px-6 md:px-8 shadow-indigo-100 text-xs sm:text-sm"
          >
            Run Assigner
          </motion.button>
        </div>
      </nav>

      <main className="pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 md:pb-12 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
        {/* Controls Bar */}
        <div className="premium-card p-3 sm:p-4 mb-4 sm:mb-6 md:mb-8 flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8">
          <div className="flex-1 flex items-center gap-6">
            <div className="space-y-1 min-w-[140px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Overload Limit</p>
              <p className="text-xl font-black text-indigo-600 tabular-nums">
                {button === 5 ? morningOverload : button === 2 ? dayOverload : collegeOverload}
                <span className="text-xs font-bold text-slate-400 ml-1 uppercase">Pax</span>
              </p>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={button === 5 ? morningOverload : button === 2 ? dayOverload : collegeOverload}
              onChange={(e) => {
                const value = Number(e.target.value);
                const overloadMap = {
                  5: setMorningOverload,
                  2: setDayOverload,
                  3: setCollegeOverload,
                };
                const setOverload = overloadMap[button];
                if (setOverload) setOverload(value);
              }}
              className="flex-1 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="w-px h-10 bg-slate-100"></div>

          <div className="flex gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Fleet Capacity</p>
              <p className="text-xl font-black text-slate-900 text-right tabular-nums">{summary.totalCapacity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total Assigned</p>
              <p className="text-xl font-black text-slate-900 text-right tabular-nums">{summary.totalAssigned}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="premium-card p-6 border-l-4 border-l-indigo-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Buses</p>
            <p className="text-3xl font-black text-slate-900">{summary.totalBuses}</p>
          </div>
          
          <div className={`premium-card p-6 border-l-4 ${summary.underfilledBuses.length > 0 ? 'border-l-amber-400' : 'border-l-slate-200'}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Underfilled Units</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {summary.underfilledBuses.length > 0 ? (
                summary.underfilledBuses.map(b => (
                  <span key={b.id} className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-100">
                    #{b.id || b.number} (-{Number(b.capacity) - Number(b.assigned)})
                  </span>
                ))
              ) : (
                <span className="text-sm font-medium text-slate-400 italic">None found</span>
              )}
            </div>
            </div>

          <div className={`premium-card p-6 border-l-4 ${summary.overloadedBuses.length > 0 ? 'border-l-rose-500' : 'border-l-slate-200'}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Critical Overloads</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {summary.overloadedBuses.length > 0 ? (
                summary.overloadedBuses.map(b => (
                  <span key={b.id} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-100">
                    #{b.id || b.number} (+{Number(b.assigned) - Number(b.capacity)})
                  </span>
                ))
              ) : (
                <span className="text-sm font-medium text-slate-400 italic">None found</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Assignment Map</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <AssignmentTable
            assignedBuses={currentAssignments}
          mode="automation"
          onRemove={handleRemove}
        />
      </div>
      </main>
    </div>
  );
};

export default Automation;