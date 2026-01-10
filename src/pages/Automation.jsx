import React, { useState, useEffect } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="w-full font-[gilroy] min-h-screen px-10 lg:px-40 py-10 md:py-20 bg-white">
      <nav className="flex flex-col md:flex-row items-center  justify-between gap-4"> 
          <div className="bg-gray-100 px-4 items-center rounded-lg flex   gap-2 w- max-w-md">
            <label className="text-sm font-medium w-40 text-gray-700">
              {button === 5 ? "Morning" : button === 2 ? "Day" : "College"} Overload:{" "}
              <span className="font-bold">
                {button === 5 ? morningOverload : button === 2 ? dayOverload : collegeOverload}
              </span>
            </label>
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
              className="w-32 h-10 accent-purple-500"
            />
          </div>
        <div className="flex flex-wrap justify-end   w-full h-10 gap-2">

          <button
            onClick={() => setButton(3)}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer duration-200 text-white  ${
              button === 3 ? "bg-green-500" : "bg-gray-500"
            } hover:bg-green-600`}
          >
            College Shift
          </button>

          <button
            onClick={() => setButton(2)}
            className={`px-4 py-2 rounded-md cursor-pointer transition-all duration-200 text-white  ${
              button === 2 ? "bg-sky-500" : "bg-gray-500"
            } hover:bg-sky-600`}
          >
            Day Shift
          </button>

          <button
            onClick={() => setButton(5)}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer duration-200 text-white  ${
              button === 5 ? "bg-purple-500 -500" : "bg-gray-500"
            } hover:bg-purple-600 -600`}
          >
            Morning Shift
          </button>

          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-[#CCFF01] hover:bg-[#9eff01] cursor-pointer transition-all duration-200 rounded-md text-[#191917] font-semibold"
          >
            Assign
          </button>
        </div>

        <Link
          to="/"
          className="fixed top-5 right-5 z-50 bg-purple-500 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:bg-purple-400 transition-colors"
          title="Go Back"
        >
          <FaArrowLeftLong />
        </Link>
      </nav>

      <div className="mt-10">
        <div className="mb-6 p-4 bg-white rounded-md shadow-md">
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-100 rounded-md shadow-sm">
              <p className="text-sm text-gray-600">Total Buses</p>
              <p className="text-lg font-semibold">{summary.totalBuses}</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-md shadow-sm">
              <p className="text-sm text-gray-600">Buses with empty seats</p>
              <p className="text-lg font-semibold">
                {summary.underfilledBuses.length > 0
                  ? summary.underfilledBuses
                      .map(
                        (bus) =>
                          `${bus.id || bus.number} (${
                            Number(bus.capacity) - Number(bus.assigned)
                          })`
                      )
                      .join(", ")
                  : "None"}
              </p>
            </div>
            <div className="p-4 bg-pink-100 rounded-md shadow-sm">
              <p className="text-sm text-gray-600">Overloaded Buses</p>
              <p className="text-lg font-semibold">
                {summary.overloadedBuses.length > 0
                  ? summary.overloadedBuses
                      .map(
                        (bus) =>
                          `${bus.id || bus.number} (+${
                            Number(bus.assigned) - Number(bus.capacity)
                          })`
                      )
                      .join(", ")
                  : "None"}
              </p>
            </div>
          </div>
        </div>

        <AssignmentTable
          assignedBuses={currentAssignments}
          mode="automation"
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
};

export default Automation;