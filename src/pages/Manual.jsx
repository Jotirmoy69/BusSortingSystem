import React, { useEffect, useMemo, useState } from "react";
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
    if (!ipcRenderer) return;
    const needsBuses = !activeBuses || activeBuses.length === 0;
    const needsRoutes =
      (!stands || stands.length === 0) ||
      (!stands2 || stands2.length === 0) ||
      (!stands3 || stands3.length === 0);
    if (!needsBuses && !needsRoutes) return;

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
      }
    };
    fetchAll();
  }, [ipcRenderer, activeBuses, stands, stands2, stands3, setActiveBuses, setStands, setStands2, setStands3]);

  // Update overload defaults when shift changes
  useEffect(() => {
    const cfg = shiftOptions.find((s) => s.value === shift);
    setOverloadSize(cfg?.overload ?? 10);
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

  const isBusSelected = Object.keys(selectedBus).length > 0;
  const editingBusId = getBusId(selectedBus);
  const availableBuses = getAvailableBuses(activeBuses, shiftConfig.assigned, editingBusId);

  const assignedStandNamesGendered = useMemo(() => {
    const assigned = { boys: new Set(), girls: new Set() };
    (shiftConfig.assigned || []).forEach((bus) => {
      if (getBusId(bus) === editingBusId) return;
      (bus.stands || []).forEach((stand) => {
        const base = normalizeStandName(stand.originalName ?? stand.name);
        if (stand.gender === "girls") assigned.girls.add(base);
        else assigned.boys.add(base);
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
  }, [shiftConfig.assigned, tempSelect, editingBusId]);

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
      shiftConfig.setAssigned((prev) => [...(prev || []), newAssignment]);
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
      shiftConfig.setAssigned((prev) => [...(prev || []), newAssignment]);
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
    ? calculateOccupancy(totalSelectedStudents, Number(selectedBus.capacity || 0))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-14 font-sans p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manual Assignment</h1>
            <p className="text-gray-500 text-sm">Choose shift and whether to separate by gender.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600"
          >
            <FaArrowLeftLong /> Back
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Shift</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
            >
              {shiftOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Gender separation</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={separateGender ? "true" : "false"}
              onChange={(e) => setSeparateGender(e.target.value === "true")}
            >
              {separationOptions.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Overload allowed</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              value={overloadSize}
              min={0}
              onChange={(e) => setOverloadSize(Number(e.target.value || 0))}
            />
          </div>
        </div>

        {separateGender && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setActiveGender("boys")}
              className={`px-4 py-2 rounded-lg border ${
                activeGender === "boys" ? "bg-purple-600 text-white border-purple-600" : "bg-white"
              }`}
            >
              Boys
            </button>
            <button
              onClick={() => setActiveGender("girls")}
              className={`px-4 py-2 rounded-lg border ${
                activeGender === "girls" ? "bg-purple-600 text-white border-purple-600" : "bg-white"
              }`}
            >
              Girls
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Bus Selection</h3>
                <p className="text-sm text-gray-500">Pick a bus to assign stands</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold">
                  {selectedBus.capacity ? `${selectedBus.capacity} seats` : "No bus selected"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  className="w-full border rounded-lg px-3 py-2"
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
                  <option value="">Select a bus</option>
                  {availableBuses.map((bus) => (
                    <option key={getBusId(bus)} value={bus.number || bus.id}>
                      {bus.number || bus.id} ({bus.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  Selected stands: <span className="font-semibold">{selectedCount}</span>
                </div>
                <div>
                  Occupancy:{" "}
                  <span className="font-semibold">
                    {totalSelectedStudents}/{selectedBus.capacity || 0}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    totalSelectedStudents > Number(selectedBus.capacity || 0)
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-purple-500 to-indigo-600"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${occupancyPercentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                onClick={handleSave}
                disabled={saving}
              >
                <FaPlus /> Save Assignment
              </button>
              <button
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={handleReassign}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Selected Stands</h3>
                <p className="text-sm text-gray-500">Review and remove selected stands</p>
              </div>
            </div>

            <div className="space-y-3">
              {separateGender ? (
                ["boys", "girls"].map((gender) => (
                  <div key={gender}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 capitalize">{gender}</h4>
                      <span className="text-xs text-gray-500">
                        {genderTemp[gender].length} selected
                      </span>
                    </div>
                    <div className="space-y-2">
                      {genderTemp[gender].length === 0 && (
                        <p className="text-xs text-gray-500">No stands selected for {gender}</p>
                      )}
                      {genderTemp[gender].map((stand, idx) => (
                        <div
                          key={`${stand.name}-${idx}`}
                          className="flex items-center justify-between border rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">{stand.name}</p>
                            <p className="text-xs text-gray-500">
                              {stand.students} {gender} students
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSelected(stand.name, gender)}
                            className="p-2 rounded-full hover:bg-red-50 text-red-500"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {combinedTemp.length === 0 && (
                    <p className="text-xs text-gray-500">No stands selected</p>
                  )}
                  {combinedTemp.map((stand, idx) => (
                    <div
                      key={`${stand.name}-${idx}`}
                      className="flex items-center justify-between border rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{stand.name}</p>
                        <p className="text-xs text-gray-500">{stand.students} students</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSelected(stand.name)}
                        className="p-2 rounded-full hover:bg-red-50 text-red-500"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Available Stands</h3>
                <p className="text-sm text-gray-500">Click to add to selection</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {filteredRoutes.map((route, idx) => (
                <div key={route.name || idx} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800">{route.name}</h4>
                    <span className="text-xs text-gray-500">
                      {(route.stands || []).length} stands
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(route.stands || []).map((stand, sIdx) => (
                      <button
                        key={`${stand.name}-${sIdx}`}
                        onClick={() => handleStandSelect(stand)}
                        className="w-full text-left border rounded-lg px-3 py-2 hover:border-purple-500 hover:bg-purple-50 transition"
                      >
                        <p className="text-sm font-semibold text-gray-800">{stand.name}</p>
                        {separateGender ? (
                          <p className="text-xs text-gray-500">
                            {activeGender === "boys" ? stand.boys : stand.girls} students
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            {Number(stand.boys || 0) + Number(stand.girls || 0)} students
                          </p>
                        )}
                      </button>
                    ))}
                    {(route.stands || []).length === 0 && (
                      <p className="text-xs text-gray-500">No stands available</p>
                    )}
                  </div>
                </div>
              ))}
              {filteredRoutes.length === 0 && (
                <p className="text-sm text-gray-500">No routes available for this shift.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Assigned Buses</h3>
                <p className="text-sm text-gray-500">Click edit/remove to modify assignments</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {(shiftConfig.assigned || []).length === 0 && (
                <p className="text-sm text-gray-500">No assignments yet</p>
              )}
              <AnimatePresence>
                {(shiftConfig.assigned || []).map((bus) => (
                  <motion.div
                    key={getBusId(bus)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Bus {bus.number || bus.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bus.assigned}/{bus.capacity} students
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditBus(bus)}
                          className="p-2 rounded-full hover:bg-purple-50 text-purple-600"
                        >
                          <HiPencil />
                        </button>
                        <button
                          onClick={() => handleRemoveBus(getBusId(bus))}
                          className="p-2 rounded-full hover:bg-red-50 text-red-500"
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <AssignmentTable
            assignedBuses={shiftConfig.assigned}
            mode="manual"
          />
        </div>
      </div>
    </div>
  );
};

export default Manual;

