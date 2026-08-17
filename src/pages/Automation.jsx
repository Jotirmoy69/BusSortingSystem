import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";
import { computeAssignmentSummary } from "../utils/assignmentUtils";
import {
  runSort,
  getExcludedBusIds,
  formatUnassignedSummary,
  SHIFT_TYPES,
} from "../utils/sortEngine";
import { getBusId } from "../utils/busUtils";

const SHIFT_CONFIG = {
  5: {
    type: SHIFT_TYPES.MORNING,
    label: "Morning",
    routesKey: "stands2",
    assignmentsKey: "assignedBuses",
    setterKey: "setAssignedBuses",
    overloadKey: "morningOverload",
    overloadDefault: 27,
  },
  2: {
    type: SHIFT_TYPES.DAY,
    label: "Day",
    routesKey: "stands",
    assignmentsKey: "assignedBusesDay",
    setterKey: "setAssignedBusesDay",
    overloadKey: "dayOverload",
    overloadDefault: 10,
  },
  3: {
    type: SHIFT_TYPES.COLLEGE,
    label: "College",
    routesKey: "stands3",
    assignmentsKey: "assignedBusesCollege",
    setterKey: "setAssignedBusesCollege",
    overloadKey: "collegeOverload",
    overloadDefault: 10,
  },
};

const Automation = () => {
  const navigate = useNavigate();
  const [button, setButton] = useState(5);
  const [morningOverload, setMorningOverload] = useState(27);
  const [dayOverload, setDayOverload] = useState(10);
  const [collegeOverload, setCollegeOverload] = useState(10);
  const [reserveAcrossShifts, setReserveAcrossShifts] = useState(true);
  const [lastResult, setLastResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

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

  const overloadValues = { morningOverload, dayOverload, collegeOverload };
  const overloadSetters = {
    morningOverload: setMorningOverload,
    dayOverload: setDayOverload,
    collegeOverload: setCollegeOverload,
  };

  const routesMap = useMemo(
    () => ({ stands2, stands, stands3 }),
    [stands2, stands, stands3]
  );

  const assignmentsMap = useMemo(
    () => ({ assignedBuses, assignedBusesDay, assignedBusesCollege }),
    [assignedBuses, assignedBusesDay, assignedBusesCollege]
  );

  const settersMap = useMemo(
    () => ({ setAssignedBuses, setAssignedBusesDay, setAssignedBusesCollege }),
    [setAssignedBuses, setAssignedBusesDay, setAssignedBusesCollege]
  );

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);

  const getShiftConfig = () => SHIFT_CONFIG[button];

  const getCurrentOverload = () => {
    const config = getShiftConfig();
    return overloadValues[config.overloadKey] ?? config.overloadDefault;
  };

  const getCurrentRoutes = () => {
    const config = getShiftConfig();
    return routesMap[config.routesKey] || [];
  };

  const getCurrentAssignments = () => {
    const config = getShiftConfig();
    return assignmentsMap[config.assignmentsKey] || [];
  };

  const getOtherShiftAssignments = () => {
    const config = getShiftConfig();
    return Object.entries(assignmentsMap)
      .filter(([key]) => key !== config.assignmentsKey)
      .map(([, value]) => value);
  };

  const handleAssign = async () => {
    if (isRunning) return;

    const config = getShiftConfig();
    const routes = getCurrentRoutes();
    const overload = getCurrentOverload();

    if (!activeBuses || activeBuses.length === 0) {
      toast.error("No active buses loaded. Check Settings or reload the app.");
      return;
    }

    if (!routes || routes.length === 0) {
      toast.error(`No ${config.label} shift route data loaded. Import stands in Settings.`);
      return;
    }

    setIsRunning(true);

    try {
      const excludeBusIds = reserveAcrossShifts
        ? getExcludedBusIds(getOtherShiftAssignments())
        : [];

      const result = runSort({
        buses: activeBuses,
        routes,
        shiftType: config.type,
        overload,
        excludeBusIds,
      });

      setLastResult(result);

      if (result.error && result.assignments.length === 0) {
        toast.error(result.error);
        return;
      }

      const setter = settersMap[config.setterKey];
      if (setter) {
        setter(result.assignments);
      }

      if (result.success) {
        toast.success(
          `${config.label} shift assigned: ${result.stats.totalBuses} buses, ${result.stats.totalAssigned} students (${result.stats.utilizationRate}% fleet utilization)`
        );
      } else {
        const detail = formatUnassignedSummary(result.unassigned, 3);
        toast.warning(result.error, {
          description: detail || undefined,
          duration: 8000,
        });
      }
    } catch (err) {
      console.error("Assignment failed:", err);
      toast.error(`Assignment failed: ${err.message || "Unknown error"}`);
      setLastResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRemove = (busOrId) => {
    const busId = String(typeof busOrId === "object" ? getBusId(busOrId) : busOrId);
    const config = getShiftConfig();
    const setter = settersMap[config.setterKey];

    if (setter) {
      setter((prev) => (prev || []).filter((b) => getBusId(b) !== busId));
      toast.success("Assignment removed");
    }
  };

  const currentAssignments = getCurrentAssignments();
  const currentOverload = getCurrentOverload();
  const summary = computeAssignmentSummary(currentAssignments, currentOverload);
  const config = getShiftConfig();

  return (
    <div className="min-h-screen bg-slate-50 font-[gilroy] text-slate-900 selection:bg-indigo-100">
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
              { id: 3, label: "College" },
            ].map((shift) => (
              <button
                key={shift.id}
                onClick={() => {
                  setButton(shift.id);
                  setLastResult(null);
                }}
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
            disabled={isRunning}
            whileHover={isRunning ? {} : { scale: 1.05, y: -1 }}
            whileTap={isRunning ? {} : { scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`premium-button-primary py-1.5 sm:py-2 px-4 sm:px-6 md:px-8 shadow-indigo-100 text-xs sm:text-sm ${
              isRunning ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isRunning ? "Assigning..." : "Run Assigner"}
          </motion.button>
        </div>
      </nav>

      <main className="pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 md:pb-12 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
        <div className="premium-card p-3 sm:p-4 mb-4 sm:mb-6 md:mb-8 flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8">
          <div className="flex-1 flex items-center gap-6">
            <div className="space-y-1 min-w-[140px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Overload Limit</p>
              <p className="text-xl font-black text-indigo-600 tabular-nums">
                {currentOverload}
                <span className="text-xs font-bold text-slate-400 ml-1 uppercase">Pax</span>
              </p>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={currentOverload}
              onChange={(e) => {
                const value = Number(e.target.value);
                const setter = overloadSetters[config.overloadKey];
                if (setter) setter(value);
              }}
              className="flex-1 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reserveAcrossShifts}
              onChange={(e) => setReserveAcrossShifts(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-600">
              Reserve buses across shifts
            </span>
          </label>

          <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>

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

        {lastResult && lastResult.unassigned.length > 0 && (
          <div className="premium-card p-4 mb-6 border-l-4 border-l-amber-400 bg-amber-50/50">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
              Unassigned Stands ({lastResult.unassigned.length})
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {lastResult.unassigned.map((item, idx) => (
                <p key={idx} className="text-sm text-amber-900">
                  <span className="font-semibold">{item.route}</span>
                  {" / "}
                  {item.stand}
                  {item.gender ? ` (${item.gender})` : ""}
                  {" - "}
                  {item.students} students
                  <span className="text-amber-600 text-xs ml-1">({item.reason})</span>
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="premium-card p-6 border-l-4 border-l-indigo-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Buses</p>
            <p className="text-3xl font-black text-slate-900">{summary.totalBuses}</p>
          </div>

          <div className="premium-card p-6 border-l-4 border-l-emerald-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Utilization</p>
            <p className="text-3xl font-black text-slate-900">{summary.utilizationRate}%</p>
          </div>

          <div className={`premium-card p-6 border-l-4 ${summary.underfilledBuses.length > 0 ? "border-l-amber-400" : "border-l-slate-200"}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Underfilled Units</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {summary.underfilledBuses.length > 0 ? (
                summary.underfilledBuses.map((b) => (
                  <span
                    key={b.id}
                    className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-100"
                  >
                    #{b.id || b.number} (-{Number(b.capacity) - Number(b.assigned)})
                  </span>
                ))
              ) : (
                <span className="text-sm font-medium text-slate-400 italic">None found</span>
              )}
            </div>
          </div>

          <div className={`premium-card p-6 border-l-4 ${summary.overloadedBuses.length > 0 ? "border-l-rose-500" : "border-l-slate-200"}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Critical Overloads</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {summary.overloadedBuses.length > 0 ? (
                summary.overloadedBuses.map((b) => (
                  <span
                    key={b.id}
                    className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-100"
                  >
                    #{b.id || b.number} (+{Number(b.assigned) - Number(b.capacity) - currentOverload})
                  </span>
                ))
              ) : summary.withinOverloadBuses?.length > 0 ? (
                <span className="text-sm font-medium text-slate-500">
                  {summary.withinOverloadBuses.length} within allowed overload
                </span>
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
