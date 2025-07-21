import React, { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/context";
import "react-toastify/dist/ReactToastify.css";
import AssignmentTable from "../components/AssignmentTable";

const Automation = () => {
  const [button, setButton] = useState(5);
  const {
    activeBuses,
    stands2,
    stands,
    assignedBuses,
    setAssignedBuses,
    setAutomationAssignments,
    setAutomationAssigned,
  } = useAppContext();

  const assignMorningShiftBuses = ({ buses, routes }) => {
    // Sort routes by total students descending
    routes.sort((a, b) => {
      const totalA = a.stands.reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      const totalB = b.stands.reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      return totalB - totalA;
    });
  
    // Sort buses descending by capacity (biggest first)
    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);
  
    let assignments = [];
    let unassignedStands = [];
  
    for (const route of routes) {
      // Prepare stands, but split any stand that exceeds the biggest bus effective capacity
      const maxBusCapacity = Math.max(...sortedBuses.map(b => b.capacity));
      const overloadLimitForBus = busCapacity => busCapacity > 50 ? 30 : 25;
      const maxEffectiveCapacity = Math.max(...sortedBuses.map(b => b.capacity + overloadLimitForBus(b.capacity)));
  
      let standsToAssign = [];
      for (const stand of route.stands) {
        const totalStudents = (stand.boys || 0) + (stand.girls || 0);
        if (totalStudents > maxEffectiveCapacity) {
          // Split stand into smaller chunks of maxEffectiveCapacity size
          let remaining = totalStudents;
          let boys = stand.boys || 0;
          let girls = stand.girls || 0;
          while (remaining > 0) {
            const chunkSize = Math.min(remaining, maxEffectiveCapacity);
            const boyChunk = Math.min(boys, chunkSize);
            const girlChunk = chunkSize - boyChunk;
            boys -= boyChunk;
            girls -= girlChunk;
            standsToAssign.push({
              route: route.name,
              stand: stand.name + ' (part)',
              boys: boyChunk,
              girls: girlChunk,
              total: chunkSize,
            });
            remaining -= chunkSize;
          }
        } else {
          standsToAssign.push({
            route: route.name,
            stand: stand.name,
            boys: stand.boys || 0,
            girls: stand.girls || 0,
            total: totalStudents,
          });
        }
      }
  
      // Assign stands trying to fit to buses with the most free capacity on that route first
      for (const stand of standsToAssign) {
        let assigned = false;
  
        // Try assign to existing bus with most free capacity
        let routeBuses = assignments.filter(b => b.route === route.name);
        routeBuses = routeBuses.sort((a, b) => {
          const overloadA = overloadLimitForBus(a.capacity);
          const overloadB = overloadLimitForBus(b.capacity);
          return (b.capacity + overloadB - b.assigned) - (a.capacity + overloadA - a.assigned);
        });
  
        for (const bus of routeBuses) {
          const overload = overloadLimitForBus(bus.capacity);
          const effectiveCapacity = bus.capacity + overload;
          if (bus.assigned + stand.total <= effectiveCapacity) {
            bus.stands.push(stand);
            bus.boys += stand.boys;
            bus.girls += stand.girls;
            bus.assigned += stand.total;
            assigned = true;
            break;
          }
        }
  
        if (assigned) continue;
  
        // Assign to new bus if available
        const suitableBus = sortedBuses.find(bus => {
          const busId = bus.number || bus._id || bus.id || "unknown";
          const isUsed = assignments.some(a => a.id === busId);
          const overload = overloadLimitForBus(bus.capacity);
          const effectiveCapacity = bus.capacity + overload;
          return !isUsed && effectiveCapacity >= stand.total;
        });
  
        if (suitableBus) {
          assignments.push({
            id: suitableBus.number || suitableBus._id || suitableBus.id || "unknown",
            capacity: suitableBus.capacity,
            assigned: stand.total,
            boys: stand.boys,
            girls: stand.girls,
            stands: [stand],
            route: route.name,
          });
          assigned = true;
        }
  
        if (!assigned) {
          unassignedStands.push(stand);
        }
      }
    }
  
    if (unassignedStands.length > 0) {
      toast.error("Not enough buses to assign all students while maintaining route separation.");
    }
  
    // Optional: Merge underfilled buses here
  
    return assignments;
  };
  
  

  const assignBuses = ({ buses, routes }) => {
    if (button === 5) {
      return assignMorningShiftBuses({ buses, routes });
    } else if ([2, 3, 4].includes(button)) {
      return [];
    }
    return [];
  };

  const handleAssign = () => {
    const activeRoutes = button === 5 ? stands2 : stands;

    if (!activeRoutes || activeRoutes.length === 0) {
      toast.error("Stand data not loaded or invalid!");
      return;
    }

    const totalStudents = activeRoutes.reduce(
      (acc, route) => {
        route.stands.forEach((stand) => {
          acc.boys += stand.boys || 0;
          acc.girls += stand.girls || 0;
        });
        return acc;
      },
      { boys: 0, girls: 0 }
    );

    const totalCapacity = activeBuses.reduce(
      (acc, bus) => acc + Number(bus.capacity),
      0
    );

    if(button === 1){
      const totalStudents = totalStudents.boys + totalStudents.girls - (activeBuses.length*25)
      if (totalCapacity < totalStudents) {
        toast.error(
          `Not enough bus seats! Total students: ${
            totalStudents.boys + totalStudents.girls
          }, total seats: ${totalCapacity}`
        );
        return;
      }
    }

    try {
      const assigned = assignBuses({
        buses: activeBuses,
        routes: activeRoutes,
      });

      setAssignedBuses(assigned);
      setAutomationAssignments(assigned);
      setAutomationAssigned(true);
      toast.success("Bus assignment done!");
    } catch (err) {
      toast.error("Assignment failed: " + err.message);
    }
  };

  const getSummaryData = () => {
    const totalAssigned = assignedBuses.reduce(
      (sum, bus) => sum + Number(bus.assigned || 0),
      0
    );
    const totalCapacity = assignedBuses.reduce(
      (sum, bus) => sum + Number(bus.capacity || 0),
      0
    );

    return {
      totalBuses: assignedBuses.length,
      totalAssigned,
      totalCapacity,
      fullBuses: assignedBuses.filter(
        (bus) => Number(bus.assigned) === Number(bus.capacity)
      ),
      underfilledBuses: assignedBuses.filter(
        (bus) => Number(bus.assigned) < Number(bus.capacity)
      ),
      overloadedBuses: assignedBuses.filter(
        (bus) => Number(bus.assigned) > Number(bus.capacity)
      ),
    };
  };

  const summary = getSummaryData();

  return (
    <div className="w-full font-[Noto Serif Bengali] min-h-screen px-4 md:px-20 lg:px-40 py-10 md:py-20 bg-white">
      <ToastContainer />
      <nav className="flex flex-col md:flex-row items-center justify-between gap-4">
        <img src="./src/assets/bcpsc.png" className="w-20 h-20" alt="logo" />
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setButton(2)}
            className={`px-4 py-2 rounded-md transition-all duration-200 text-white font-semibold ${
              button === 2 ? "bg-red-500" : "bg-gray-500"
            } hover:bg-red-600`}
          >
            Small Bus First
          </button>
          <button
            onClick={() => setButton(3)}
            className={`px-4 py-2 rounded-md transition-all duration-200 text-white font-semibold ${
              button === 3 ? "bg-[#01B091]  -500" : "bg-gray-500"
            } hover:bg-[#01B091]  -600`}
          >
            Large Bus First
          </button>
          <button
            onClick={() => setButton(4)}
            className={`px-4 py-2 rounded-md transition-all duration-200 text-white font-semibold ${
              button === 4 ? "bg-yellow-500" : "bg-gray-500"
            } hover:bg-yellow-600`}
          >
            85%+ Occupancy
          </button>
          <button
            onClick={() => setButton(5)}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer duration-200 text-white font-semibold ${
              button === 5 ? "bg-purple-500 -500" : "bg-gray-500"
            } hover:bg-purple-600 -600`}
          >
            প্রভাতি শাখা
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-[#CCFF01]    -400 hover:bg-[#9eff01] cursor-pointer     -500 transition-all duration-200 rounded-md text-[#191917] font-semibold"
          >
            Assign
          </button>
        </div>
        <Link
          to="/"
          className="fixed top-5 right-5 z-50 bg-purple-500 -500 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:bg-purple-400 -600 transition-colors"
          title="Go Back"
        >
          <FaArrowLeftLong />
        </Link>
      </nav>

      <div className="mt-10">
        <div className="mb-6 p-4 bg-white rounded-md shadow-md">
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-400 -100 rounded-md shadow-sm">
              <p className="text-sm text-gray-600">Total Buses</p>
              <p className="text-lg font-semibold">{summary.totalBuses}</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-md shadow-sm">
              <p className="text-sm text-gray-600">Buses with Empty Seats</p>
              <p className="text-lg font-semibold">
                {summary.underfilledBuses.length > 0
                  ? summary.underfilledBuses
                      .map(
                        (bus) =>
                          `${bus.id || bus.number} (${Number(bus.capacity) - Number(bus.assigned)})`
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
                          `${bus.id || bus.number} (+${Number(bus.assigned) - Number(bus.capacity)})`
                      )
                      .join(", ")
                  : "None"}
              </p>
            </div>
          </div>
        </div>

        <AssignmentTable assignedBuses={assignedBuses} mode="automation" />
      </div>
    </div>
  );
};

export default Automation;