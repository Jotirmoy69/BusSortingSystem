import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HiOutlineX, HiOutlineTrash, HiPencil } from "react-icons/hi";
import { FaArrowLeftLong, FaPlus } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";
import {
  getAvailableBuses,
  getBusId,
  normalizeStandName,
  calculateOccupancy,
  getStudentCount,
} from "../utils/busUtils";

const shiftOptions = [
  { value: "day", label: "Day Shift", overload: 10, routeLabel: "Day Shift Assignment" },
  { value: "morning", label: "Morning Shift", overload: 27, routeLabel: "Manual Assignment" },
  { value: "college", label: "College Shift", overload: 10, routeLabel: "College Assignment" },
];

const separationOptions = [
  { value: true, label: "Separate Boys/Girls" },
  { value: false, label: "Combine Boys/Girls" },
];

const Manual = () => {
  const navigate = useNavigate();

  const {
    activeBuses,
    stands,
    stands2,
    stands3,
    assignedBuses,
    assignedBusesDay,
    assignedBusesCollege,
    setAssignedBuses,
    setAssignedBusesDay,
    setAssignedBusesCollege,
    setActiveBuses,
    setStands,
    setStands2,
    setStands3,
  } = useAppContext();

  const [shift, setShift] = useState("day");
  const [separateGender, setSeparateGender] = useState(true);
  const [activeGender, setActiveGender] = useState("boys");
  const [selectedBus, setSelectedBus] = useState({});
  const [tempSelect, setTempSelect] = useState({ boys: [], girls: [] });
  const [overloadSize, setOverloadSize] = useState(10);
  const [saving, setSaving] = useState(false);
  const hasFetchedRef = useRef(false);

  const ipcRenderer = window.require ? window.require("electron").ipcRenderer : null;

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);

  // Load data if missing (direct navigation)
  useEffect(() => {
    if (!ipcRenderer || hasFetchedRef.current) return;
    
    const needsBuses = !activeBuses || activeBuses.length === 0;
    const needsRoutes =
      (!stands || stands.length === 0) ||
      (!stands2 || stands2.length === 0) ||
      (!stands3 || stands3.length === 0);
    if (!needsBuses && !needsRoutes) {
      hasFetchedRef.current = true;
      return;
    }

    hasFetchedRef.current = true;
    const fetchAll = async () => {
      try {
        if (needsBuses) {
          const res = await ipcRenderer.invoke("fetch-buses");
          const busData = res.data || [];
          const active = busData.filter((bus) => bus.isActive === true);
          setActiveBuses(active);
        }
        if (!stands || stands.length === 0) {
          const res = await ipcRenderer.invoke("fetch-routes");
          setStands(res.data || []);
        }
        if (!stands2 || stands2.length === 0) {
          const res = await ipcRenderer.invoke("fetch-routes-morning");
          setStands2(res.data || []);
        }
        if (!stands3 || stands3.length === 0) {
          const res = await ipcRenderer.invoke("fetch-routes-college");
          setStands3(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching manual data", err);
        toast.error("Failed to load buses or routes");
        hasFetchedRef.current = false;
      }
    };
    fetchAll();
  }, [ipcRenderer, activeBuses, stands, stands2, stands3]);

  // Track if gender mode change is manual (from toggle) or automatic (from shift change)
  const isManualGenderChangeRef = useRef(false);

  // Update overload defaults when shift changes
  useEffect(() => {
    const cfg = shiftOptions.find((s) => s.value === shift);
    setOverloadSize(cfg?.overload ?? 10);
    isManualGenderChangeRef.current = false; // Mark as automatic change
    if (shift === "day") {
      setSeparateGender(true);
    } else {
      setSeparateGender(false);
    }
    setTempSelect(shift === "day" ? { boys: [], girls: [] } : []);
    setSelectedBus({});
    setActiveGender("boys");
  }, [shift]);

  // Reset tempSelect structure when separation toggled
  useEffect(() => {
    setTempSelect(separateGender ? { boys: [], girls: [] } : []);
    setActiveGender("boys");
    setSelectedBus({});
  }, [separateGender]);

  const shiftConfig = useMemo(() => {
    if (shift === "day") {
      return {
        routes: stands || [],
        assigned: assignedBusesDay || [],
        setAssigned: setAssignedBusesDay,
        routeLabel: "Day Shift Assignment",
        shiftName: "day",
      };
    }
    if (shift === "morning") {
      return {
        routes: stands2 || [],
        assigned: assignedBuses || [],
        setAssigned: setAssignedBuses,
        routeLabel: "Manual Assignment",
        shiftName: "morning",
      };
    }
    return {
      routes: stands3 || [],
      assigned: assignedBusesCollege || [],
      setAssigned: setAssignedBusesCollege,
      routeLabel: "College Assignment",
      shiftName: "college",
    };
  }, [
    shift,
    stands,
    stands2,
    stands3,
    assignedBuses,
    assignedBusesDay,
    assignedBusesCollege,
    setAssignedBuses,
    setAssignedBusesDay,
    setAssignedBusesCollege,
  ]);

  // Auto-clear assignments when gender mode switches (only for manual toggles)
  const prevSeparateGenderRef = useRef(separateGender);
  useEffect(() => {
    if (prevSeparateGenderRef.current !== separateGender && prevSeparateGenderRef.current !== undefined) {
      // Only clear if it's a manual change (not from shift change)
      if (isManualGenderChangeRef.current) {
        const currentAssigned = shift === "day" 
          ? assignedBusesDay 
          : shift === "morning" 
          ? assignedBuses 
          : assignedBusesCollege;
        
        if ((currentAssigned || []).length > 0) {
          if (shift === "day") {
            setAssignedBusesDay([]);
          } else if (shift === "morning") {
            setAssignedBuses([]);
          } else {
            setAssignedBusesCollege([]);
          }
          toast.success("Assignments cleared due to gender mode change");
        }
      }
      prevSeparateGenderRef.current = separateGender;
      isManualGenderChangeRef.current = false; // Reset flag
    } else {
      prevSeparateGenderRef.current = separateGender;
    }
  }, [separateGender, shift, assignedBuses, assignedBusesDay, assignedBusesCollege, setAssignedBuses, setAssignedBusesDay, setAssignedBusesCollege]);

  const isBusSelected = Object.keys(selectedBus).length > 0;
  const editingBusId = getBusId(selectedBus);
  const availableBuses = getAvailableBuses(activeBuses, shiftConfig.assigned, editingBusId);

  const assignedStandNamesGendered = useMemo(() => {
    const assigned = { boys: new Set(), girls: new Set() };
    (shiftConfig.assigned || []).forEach((bus) => {
      if (getBusId(bus) === editingBusId) return;
      (bus.stands || []).forEach((stand) => {
        // Use originalName if available (for split stands), otherwise use name
        // This ensures we match the original stand name from routes
        const standName = stand.originalName ?? stand.name;
        const base = normalizeStandName(standName);
        
        // Also add the name itself if it's different from originalName (for split stands)
        const standNameDirect = normalizeStandName(stand.name);
        if (standNameDirect !== base && stand.originalName) {
          // If name is different and originalName exists, it's a split stand - mark both
          if (stand.gender === "girls") {
            assigned.girls.add(standNameDirect);
          } else if (stand.gender === "boys") {
            assigned.boys.add(standNameDirect);
          } else {
            // Combined mode split stand - mark for both
            assigned.boys.add(standNameDirect);
            assigned.girls.add(standNameDirect);
          }
        }
        
        // Check if stand has explicit gender property
        const standGender = stand.gender;
        if (standGender === "girls") {
          assigned.girls.add(base);
        } else if (standGender === "boys") {
          assigned.boys.add(base);
        } else {
          // No gender or gender is null/undefined means it was assigned in combined mode
          // Mark as assigned for both genders since the entire stand (boys + girls) is assigned
          assigned.boys.add(base);
          assigned.girls.add(base);
        }
      });
    });
    if (tempSelect?.boys) {
      (tempSelect.boys || []).forEach((s) => assigned.boys.add(normalizeStandName(s.name)));
    }
    if (tempSelect?.girls) {
      (tempSelect.girls || []).forEach((s) => assigned.girls.add(normalizeStandName(s.name)));
    }
    return {
      boys: Array.from(assigned.boys),
      girls: Array.from(assigned.girls),
    };
  }, [shiftConfig.assigned, tempSelect, editingBusId, shift]);

  const assignedStandNamesMixed = useMemo(() => {
    const set = new Set();
    (shiftConfig.assigned || []).forEach((bus) => {
      if (getBusId(bus) === editingBusId) return;
      (bus.stands || []).forEach((stand) => {
        set.add(normalizeStandName(stand.originalName ?? stand.name));
      });
    });
    if (Array.isArray(tempSelect)) {
      tempSelect.forEach((s) => set.add(normalizeStandName(s.name)));
    }
    return Array.from(set);
  }, [shiftConfig.assigned, tempSelect, editingBusId]);

  const handleStandSelect = (stand) => {
    if (!stand) return toast.error("Invalid stand data!");
    if (!isBusSelected) return toast.error("Please select a bus first!");

    const baseName = normalizeStandName(stand.name);
    if (separateGender) {
      const assignedNames = assignedStandNamesGendered[activeGender] || [];
      if (assignedNames.includes(baseName)) {
        return toast.error("This stand is already assigned for this gender!");
      }
      const alreadySelected = (tempSelect[activeGender] || []).some(
        (s) => normalizeStandName(s.name) === baseName
      );
      if (alreadySelected) return toast.error("This stand is already selected!");

      const studentsCount = getStudentCount(stand, activeGender);
      if (studentsCount <= 0) return toast.error(`No ${activeGender} available at this stand!`);

      const currentTotal = (tempSelect[activeGender] || []).reduce(
        (sum, s) => sum + Number(s.students || 0),
        0
      );
      const maxCapacity = Number(selectedBus.capacity || 0) + overloadSize;
      if (currentTotal + studentsCount > maxCapacity) {
        return toast.error(`Cannot exceed bus capacity by more than ${overloadSize} students!`);
      }

      setTempSelect((prev) => ({
        ...prev,
        [activeGender]: [...(prev[activeGender] || []), { name: baseName, students: studentsCount, gender: activeGender }],
      }));
    } else {
      if (assignedStandNamesMixed.includes(baseName)) {
        return toast.error("This stand is already assigned!");
      }
      const exists = (tempSelect || []).some((s) => normalizeStandName(s.name) === baseName);
      if (exists) return toast.error("This stand is already selected!");

      const totalStudents = Number(stand.boys || 0) + Number(stand.girls || 0);
      if (totalStudents <= 0) return toast.error("No students available at this stand!");

      const currentTotal = (tempSelect || []).reduce((sum, s) => sum + Number(s.students || 0), 0);
      const maxCapacity = Number(selectedBus.capacity || 0) + overloadSize;
      if (currentTotal + totalStudents > maxCapacity) {
        return toast.error(`Cannot exceed bus capacity by more than ${overloadSize} students!`);
      }
      setTempSelect((prev) => [...(prev || []), { name: baseName, students: totalStudents }]);
    }
  };

  const handleRemoveSelected = (standName, gender = null) => {
    const base = normalizeStandName(standName);
    if (separateGender) {
      setTempSelect((prev) => ({
        ...prev,
        [gender]: (prev[gender] || []).filter((s) => normalizeStandName(s.name) !== base),
      }));
    } else {
      setTempSelect((prev) => (prev || []).filter((s) => normalizeStandName(s.name) !== base));
    }
  };

  const handleEditBus = (bus) => {
    if (!bus) return;
    const busId = getBusId(bus);
    shiftConfig.setAssigned((prev) => (prev || []).filter((b) => getBusId(b) !== busId));
    setSelectedBus({ ...bus, number: bus.number || bus.id });

    if (separateGender) {
      const boys = (bus.stands || [])
        .filter((s) => s.gender !== "girls")
        .map((s) => ({
          name: normalizeStandName(s.originalName ?? s.name),
          students: Number(s.total ?? s.students ?? 0),
          gender: "boys",
        }));
      const girls = (bus.stands || [])
        .filter((s) => s.gender === "girls")
        .map((s) => ({
          name: normalizeStandName(s.originalName ?? s.name),
          students: Number(s.total ?? s.students ?? 0),
          gender: "girls",
        }));
      setTempSelect({ boys, girls });
      setActiveGender(girls.length > boys.length ? "girls" : "boys");
    } else {
      const combined = (bus.stands || []).map((s) => ({
        name: normalizeStandName(s.originalName ?? s.name),
        students: Number(s.total ?? s.students ?? 0),
      }));
      setTempSelect(combined);
    }
  };

  const handleRemoveBus = (busId) => {
    const id = String(busId);
    shiftConfig.setAssigned((prev) => (prev || []).filter((bus) => getBusId(bus) !== id));
    if (getBusId(selectedBus) === id) {
      setSelectedBus({});
      setTempSelect(separateGender ? { boys: [], girls: [] } : []);
    }
    toast.success("Bus assignment removed");
  };

  const handleSave = () => {
    setSaving(true);
    if (!isBusSelected) {
      toast.error("Please select a bus first!");
      setSaving(false);
      return;
    }

    if (separateGender) {
      const standsForGender = Array.isArray(tempSelect?.[activeGender])
        ? tempSelect[activeGender]
        : [];
      if (standsForGender.length === 0) {
        toast.error(`Please select at least one stand for ${activeGender}!`);
        setSaving(false);
        return;
      }
      const allStands = standsForGender.map((stand) => ({
        name: normalizeStandName(stand.name),
        total: Number(stand.students),
        gender: stand.gender || activeGender,
      }));
      const totalStudents = allStands.reduce((sum, s) => sum + (s.total || 0), 0);

      const newAssignment = {
        id: getBusId(selectedBus),
        number: selectedBus.number || selectedBus.id,
        capacity: Number(selectedBus.capacity),
        assigned: totalStudents,
        stands: allStands,
        route: shiftConfig.routeLabel,
        gender: activeGender,
        shift,
      };
      const currentBusId = getBusId(selectedBus);
      if (shift === "day") {
        setAssignedBusesDay((prev) => {
          const filtered = (prev || []).filter((b) => getBusId(b) !== currentBusId);
          return [...filtered, newAssignment];
        });
      } else if (shift === "morning") {
        setAssignedBuses((prev) => {
          const filtered = (prev || []).filter((b) => getBusId(b) !== currentBusId);
          return [...filtered, newAssignment];
        });
      } else {
        setAssignedBusesCollege((prev) => {
          const filtered = (prev || []).filter((b) => getBusId(b) !== currentBusId);
          return [...filtered, newAssignment];
        });
      }
      setTempSelect((prev) => ({ ...prev, [activeGender]: [] }));
    } else {
      const combinedTemp = Array.isArray(tempSelect) ? tempSelect : [];
      if (combinedTemp.length === 0) {
        toast.error("Please select at least one stand!");
        setSaving(false);
        return;
      }
      const totalStudents = combinedTemp.reduce(
        (sum, s) => sum + Number(s.students || 0),
        0
      );
      const newAssignment = {
        id: getBusId(selectedBus),
        number: selectedBus.number || selectedBus.id,
        capacity: Number(selectedBus.capacity),
        assigned: totalStudents,
        stands: combinedTemp.map((stand) => ({
          name: normalizeStandName(stand.name),
          total: Number(stand.students),
        })),
        route: shiftConfig.routeLabel,
        shift,
      };
      const currentBusId = getBusId(selectedBus);
      if (shift === "day") {
        setAssignedBusesDay((prev) => {
          const filtered = (prev || []).filter((b) => getBusId(b) !== currentBusId);
          return [...filtered, newAssignment];
        });
      } else if (shift === "morning") {
        setAssignedBuses((prev) => {
          const filtered = (prev || []).filter((b) => getBusId(b) !== currentBusId);
          return [...filtered, newAssignment];
        });
      } else {
        setAssignedBusesCollege((prev) => {
          const filtered = (prev || []).filter((b) => getBusId(b) !== currentBusId);
          return [...filtered, newAssignment];
        });
      }
      setTempSelect([]);
    }
    setSelectedBus({});
    toast.success(`Bus assigned successfully!`);
    setSaving(false);
  };

  const handleReassign = () => {
    if ((shiftConfig.assigned || []).length > 0) {
      shiftConfig.setAssigned([]);
      toast.success("All assignments cleared");
    } else {
      toast.info("No assignments found");
    }
    setSelectedBus({});
    setTempSelect(separateGender ? { boys: [], girls: [] } : []);
  };

  const filteredRoutes = useMemo(() => {
    return (shiftConfig.routes || []).map((route) => ({
      ...route,
      stands: (route.stands || []).filter((stand) => {
        if (separateGender) {
          const count = getStudentCount(stand, activeGender);
          const assigned = (assignedStandNamesGendered[activeGender] || []).includes(
            normalizeStandName(stand.name)
          );
          return count > 0 && !assigned;
        }
        const total = Number(stand.boys || 0) + Number(stand.girls || 0);
        const assigned = assignedStandNamesMixed.includes(normalizeStandName(stand.name));
        return total > 0 && !assigned;
      }),
    }));
  }, [
    shiftConfig.routes,
    separateGender,
    activeGender,
    assignedStandNamesGendered,
    assignedStandNamesMixed,
  ]);

  const genderTemp = {
    boys: Array.isArray(tempSelect?.boys) ? tempSelect.boys : [],
    girls: Array.isArray(tempSelect?.girls) ? tempSelect.girls : [],
  };
  const combinedTemp = Array.isArray(tempSelect) ? tempSelect : [];

  const selectedCount = separateGender
    ? genderTemp[activeGender].length
    : combinedTemp.length;
  const totalSelectedStudents = separateGender
    ? genderTemp[activeGender].reduce((sum, s) => sum + Number(s.students || 0), 0)
    : combinedTemp.reduce((sum, s) => sum + Number(s.students || 0), 0);
  const occupancyPercentage = isBusSelected
    ? Math.round(calculateOccupancy(totalSelectedStudents, Number(selectedBus.capacity || 0)))
    : 0;

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
              Manual <span className="text-indigo-600">Assignment</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-slate-200">
            {shiftOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setShift(opt.value)}
                className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  shift === opt.value
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 md:pb-12 px-3 sm:px-4 md:px-6 max-w-[1600px] mx-auto">
        {/* Configuration Toolbar */}
        <div className="premium-card p-3 sm:p-4 mb-4 sm:mb-6 md:mb-8 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
          {shift !== "morning" && (
            <>
              <div className="flex-1 min-w-[200px] sm:min-w-[240px]">
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 sm:mb-1.5 block">Gender Mode</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                  {separationOptions.map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => {
                        isManualGenderChangeRef.current = true;
                        setSeparateGender(opt.value);
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        separateGender === opt.value
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
            </>
          )}

          <div className="w-48">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Overload Limit</label>
            <div className="relative">
              <input
                type="number"
                className="premium-input py-2 pl-4 pr-10 text-sm font-bold"
                value={overloadSize}
                min={0}
                onChange={(e) => setOverloadSize(Number(e.target.value || 0))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Pax</span>
            </div>
          </div>

          <div className="flex-1"></div>

          {separateGender && (
            <div className="flex bg-indigo-50 p-1 rounded-xl border border-indigo-100">
              <button
                onClick={() => setActiveGender("boys")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  activeGender === "boys" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-indigo-400 hover:text-indigo-600"
                }`}
              >
                Boys
              </button>
              <button
                onClick={() => setActiveGender("girls")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  activeGender === "girls" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-indigo-400 hover:text-indigo-600"
                }`}
              >
                Girls
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          {/* Left Column: Available Stands */}
          <div className="xl:col-span-4 space-y-4 sm:space-y-6">
            <div className="premium-card overflow-hidden flex flex-col h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
              <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Available Stands</h3>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">Click to assign to selected bus</p>
                </div>
                <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {filteredRoutes.reduce((acc, r) => acc + r.stands.length, 0)} Total
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {filteredRoutes.map((route, idx) => (
                  <div key={route.name || idx} className="space-y-2">
                    <div className="flex items-center gap-3 px-2">
                      <div className="h-px flex-1 bg-slate-100"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{route.name}</span>
                      <div className="h-px flex-1 bg-slate-100"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {route.stands.map((stand, sIdx) => (
                        <motion.button
                          key={`${stand.name}-${sIdx}`}
                          onClick={() => handleStandSelect(stand)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: sIdx * 0.03, 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 25
                          }}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 group"
                        >
                          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{stand.name}</span>
                          <span className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-extrabold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                            {separateGender ? (activeGender === "boys" ? stand.boys : stand.girls) : (Number(stand.boys || 0) + Number(stand.girls || 0))}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {filteredRoutes.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <HiOutlineX className="text-slate-300" size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No stands available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column: Current Assignment */}
          <div className="xl:col-span-5 space-y-6">
            <div className="premium-card p-8 bg-indigo-600 text-white relative overflow-hidden shadow-indigo-200">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <FaPlus size={120} />
              </div>
              
              <div className="relative z-10">
                {/* <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold">Active Assignment</h3>
                    <p className="text-indigo-100 text-sm mt-1 font-medium italic">Assigning {activeGender} for {shift} shift</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                    <HiPencil size={24} />
                  </div>
                </div> */}

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <label className="text-sm font-black uppercase tracking-widest text-white">Select Bus Vehicle</label>
                    </div>
                    <div className="relative">
                      {!isBusSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl animate-pulse pointer-events-none"></div>
                      )}
                      <select
                        className={`w-full rounded-2xl p-5 pr-14 text-lg font-bold border-2 transition-all duration-300 cursor-pointer appearance-none shadow-xl relative z-10 ${
                          isBusSelected
                            ? "bg-white text-slate-900 border-white/50 focus:ring-4 focus:ring-white/30 hover:shadow-2xl hover:scale-[1.01]"
                            : "bg-white/95 text-slate-600 border-indigo-300/50 focus:ring-4 focus:ring-indigo-300/30 hover:border-indigo-400 hover:bg-white"
                        }`}
                        value={getBusId(selectedBus)}
                        onChange={(e) => {
                          const value = e.target.value;
                          const bus = (activeBuses || []).find(
                            (b) => String(b.number) === value || String(b.id) === value
                          );
                          if (!bus) return;
                          setSelectedBus({ ...bus, number: bus.number || bus.id });
                          setTempSelect(separateGender ? { boys: [], girls: [] } : []);
                        }}
                      >
                        <option value="" className="text-slate-500 bg-white font-medium">
                          {!isBusSelected ? "Click here to select a bus..." : "Choose a different bus..."}
                        </option>
                        {availableBuses.map((bus) => (
                          <option key={getBusId(bus)} value={bus.number || bus.id} className="text-slate-900 bg-white font-semibold">
                            Bus {bus.number || bus.id} — {bus.capacity} Seats Available
                          </option>
                        ))}
                      </select>
                      <div className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${isBusSelected ? "text-indigo-600" : "text-indigo-400"}`}>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {!isBusSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3"
                      >
                        {/* <p className="text-sm font-semibold text-white flex items-center gap-2">
                          <span className="text-lg">👆</span>
                          <span className="text-gray-300">Click the dropdown above to select a bus vehicle for assignment</span>
                        </p> */}
                      </motion.div>
                    )}
                  </div>

                  {isBusSelected && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-4 border-t border-white/10"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Occupancy Load</p>
                          <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                            totalSelectedStudents > Number(selectedBus.capacity || 0) ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                          }`}>
                            {occupancyPercentage}%
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-black text-white tabular-nums">
                              {selectedBus.capacity || 0}<span className="text-indigo-200">+{overloadSize}</span>
                            </p>
                            <p className="text-sm font-bold text-indigo-100 tabular-nums">
                              {totalSelectedStudents} assigned
                            </p>
                          </div>
                          
                          <div className="h-4 w-full bg-white/30 rounded-full overflow-hidden border-2 border-white/50 p-0.5 shadow-inner">
                            <motion.div
                              className={`h-full rounded-full ${
                                totalSelectedStudents > Number(selectedBus.capacity || 0)
                                  ? "bg-rose-400"
                                  : totalSelectedStudents > (Number(selectedBus.capacity || 0) * 0.8)
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              }`}
                              initial={{ width: "0%", opacity: 0 }}
                              animate={{ 
                                width: `${Math.min((totalSelectedStudents / (Number(selectedBus.capacity || 0) + overloadSize)) * 100, 100)}%`,
                                opacity: 1
                              }}
                              transition={{ 
                                width: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
                                opacity: { duration: 0.3 }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex-1 premium-button-primary bg-white text-indigo-600 hover:bg-indigo-50 shadow-none py-4 text-base"
                      onClick={handleSave}
                      disabled={saving || !isBusSelected}
                    >
                      Commit Assignment
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="px-6 py-4 rounded-2xl bg-indigo-700/50 text-indigo-100 font-bold hover:bg-indigo-700 transition-colors border border-white/5"
                      onClick={handleReassign}
                    >
                      Clear
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card flex flex-col h-[250px] sm:h-[280px] md:h-[320px]">
              <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Selected List</h3>
                <span className="text-xs font-bold text-indigo-600">{selectedCount} Items</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                <div className="flex flex-wrap gap-2">
                  {separateGender ? (
                    genderTemp[activeGender].map((stand, idx) => (
                      <motion.div
                        key={`${stand.name}-${idx}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center pl-3 pr-1 py-1.5 bg-slate-50 border border-slate-200 rounded-xl group"
                      >
                        <span className="text-sm font-bold text-slate-700 mr-2">{stand.name}</span>
                        <span className="text-xs font-medium text-slate-400 mr-2">({stand.students})</span>
                        <button
                          onClick={() => handleRemoveSelected(stand.name, activeGender)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <HiOutlineX size={14} />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    combinedTemp.map((stand, idx) => (
                      <motion.div
                        key={`${stand.name}-${idx}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center pl-3 pr-1 py-1.5 bg-slate-50 border border-slate-200 rounded-xl group"
                      >
                        <span className="text-sm font-bold text-slate-700 mr-2">{stand.name}</span>
                        <span className="text-xs font-medium text-slate-400 mr-2">({stand.students})</span>
                        <button
                          onClick={() => handleRemoveSelected(stand.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <HiOutlineX size={14} />
                        </button>
                      </motion.div>
                    ))
                  )}
                  {selectedCount === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-sm">
                      Select stands from the left panel
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Assigned Buses Summary */}
          <div className="xl:col-span-3 space-y-6">
            <div className="premium-card overflow-hidden flex flex-col h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Current Fleet</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Quick overview of assignments</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {(shiftConfig.assigned || []).map((bus) => (
                  <motion.div
                    key={getBusId(bus)}
                    layout
                    className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {bus.number || bus.id}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Bus Unit</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{bus.gender || 'Mixed'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditBus(bus)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <HiPencil size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveBus(getBusId(bus))}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{bus.assigned} / {bus.capacity}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 font-medium">{bus.stands.length} stands</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${bus.assigned > bus.capacity ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    </div>
                  </motion.div>
                ))}
                {(shiftConfig.assigned || []).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fleet is empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table Section */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-2xl font-black text-slate-900">Assignment Inventory</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          <AssignmentTable
            assignedBuses={shiftConfig.assigned}
            mode="manual"
          />
        </div>
      </main>
    </div>
  );
};

export default Manual;

