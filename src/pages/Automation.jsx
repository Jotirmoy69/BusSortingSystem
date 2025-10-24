import React, { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";

const Automation = () => {
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

  const getBusIdAndNumber = (bus) => {
    const base = bus?.number ?? bus?._id ?? bus?.id ?? bus?.busNumber ?? "unknown";
    return { id: String(base), number: String(bus?.number ?? base) };
  };

  const assignCollegeShiftBuses = ({ buses, routes }) => {
    setAssignedBusesCollege([]);
    routes.sort((a, b) => {
      const total = (r) =>
        (r.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      return total(b) - total(a);
    });
    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);

    let assignments = [];
    let unassignedStands = [];

    for (const route of routes) {
      const maxBusCapacity = Math.max(...sortedBuses.map((b) => b.capacity));
      const maxEff = maxBusCapacity + collegeOverload;

      const standsToAssign = [];
      for (const stand of route.stands || []) {
        const boys = Number(stand.boys || 0);
        const girls = Number(stand.girls || 0);

        const mk = (name, b, g, gender, originalName = stand.name) => ({
          route: route.name,
          name,
          originalName,
          boys: b,
          girls: g,
          total: b + g,
          gender,
        });

        // boys
        if (boys > 0) {
          if (boys > maxEff) {
            let rem = boys;
            while (rem > 0) {
              const chunk = Math.min(rem, maxEff);
              standsToAssign.push(mk(`${stand.name} (boys part)`, chunk, 0, "boys", stand.name));
              rem -= chunk;
            }
          } else {
            standsToAssign.push(mk(`${stand.name}`, boys, 0, "boys", stand.name));
          }
        }
        // girls
        if (girls > 0) {
          if (girls > maxEff) {
            let rem = girls;
            while (rem > 0) {
              const chunk = Math.min(rem, maxEff);
              standsToAssign.push(mk(`${stand.name} (girls part)`, 0, chunk, "girls", stand.name));
              rem -= chunk;
            }
          } else {
            standsToAssign.push(mk(`${stand.name}`, 0, girls, "girls", stand.name));
          }
        }
      }

      const assignByGender = (gender) => {
        const genderStands = standsToAssign.filter((s) => s.gender === gender);

        for (const st of genderStands) {
          let placed = false;

          let routeBuses = assignments
            .filter((b) => b.route === route.name && b.gender === gender)
            .sort(
              (a, b) =>
                b.capacity + collegeOverload - b.assigned - (a.capacity + collegeOverload - a.assigned)
            );

          for (const bus of routeBuses) {
            const eff = bus.capacity + collegeOverload;
            if (bus.assigned + st.total <= eff) {
              bus.stands.push(st);
              bus.boys += st.boys;
              bus.girls += st.girls;
              bus.assigned += st.total;
              placed = true;
              break;
            }
          }

          if (placed) continue;

          const suitable = sortedBuses.find((bus) => {
            const { id } = getBusIdAndNumber(bus);
            const used = assignments.some((a) => a.id === id);
            const eff = bus.capacity + collegeOverload;
            return !used && eff >= st.total;
          });

          if (suitable) {
            const { id, number } = getBusIdAndNumber(suitable);
            assignments.push({
              id,
              number,
              capacity: suitable.capacity,
              assigned: st.total,
              boys: st.boys,
              girls: st.girls,
              stands: [st], // includes gender and originalName
              route: route.name,
              gender,
            });
            placed = true;
          }

          if (!placed) unassignedStands.push(st);
        }
      };

      assignByGender("boys");
      assignByGender("girls");
    }

    if (unassignedStands.length > 0) {
      toast.error("Not enough buses to assign all students while maintaining gender separation.");
    }
    return assignments;
  };

  const assignDayShiftBuses = ({ buses, routes }) => {
    // unchanged logic for day
    routes.sort((a, b) => {
      const total = (r) =>
        (r.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      return total(b) - total(a);
    });
    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);

    let assignments = [];
    let unassignedStands = [];

    for (const route of routes) {
      const maxBusCapacity = Math.max(...sortedBuses.map((b) => b.capacity));
      const maxEff = maxBusCapacity + dayOverload;

      const standsToAssign = [];
      for (const stand of route.stands || []) {
        const boys = Number(stand.boys || 0);
        const girls = Number(stand.girls || 0);

        const mk = (name, b, g, gender, originalName = stand.name) => ({
          route: route.name,
          name,
          originalName,
          boys: b,
          girls: g,
          total: b + g,
          gender,
        });

        if (boys > 0) {
          if (boys > maxEff) {
            let rem = boys;
            while (rem > 0) {
              const chunk = Math.min(rem, maxEff);
              standsToAssign.push(mk(`${stand.name} (boys part)`, chunk, 0, "boys", stand.name));
              rem -= chunk;
            }
          } else {
            standsToAssign.push(mk(`${stand.name}`, boys, 0, "boys", stand.name));
          }
        }
        if (girls > 0) {
          if (girls > maxEff) {
            let rem = girls;
            while (rem > 0) {
              const chunk = Math.min(rem, maxEff);
              standsToAssign.push(mk(`${stand.name} (girls part)`, 0, chunk, "girls", stand.name));
              rem -= chunk;
            }
          } else {
            standsToAssign.push(mk(`${stand.name}`, 0, girls, "girls", stand.name));
          }
        }
      }

      const assignByGender = (gender) => {
        const genderStands = standsToAssign.filter((s) => s.gender === gender);

        for (const st of genderStands) {
          let placed = false;

          let routeBuses = assignments
            .filter((b) => b.route === route.name && b.gender === gender)
            .sort(
              (a, b) =>
                b.capacity + dayOverload - b.assigned - (a.capacity + dayOverload - a.assigned)
            );

          for (const bus of routeBuses) {
            const eff = bus.capacity + dayOverload;
            if (bus.assigned + st.total <= eff) {
              bus.stands.push(st);
              bus.boys += st.boys;
              bus.girls += st.girls;
              bus.assigned += st.total;
              placed = true;
              break;
            }
          }

          if (placed) continue;

          const suitable = sortedBuses.find((bus) => {
            const base = bus?.number ?? bus?._id ?? bus?.id ?? bus?.busNumber ?? "unknown";
            const used = assignments.some((a) => a.id === String(base));
            const eff = bus.capacity + dayOverload;
            return !used && eff >= st.total;
          });

          if (suitable) {
            const base = suitable?.number ?? suitable?._id ?? suitable?.id ?? suitable?.busNumber ?? "unknown";
            assignments.push({
              id: String(base),
              number: String(suitable?.number ?? base),
              capacity: suitable.capacity,
              assigned: st.total,
              boys: st.boys,
              girls: st.girls,
              stands: [st],
              route: route.name,
              gender,
            });
            placed = true;
          }

          if (!placed) unassignedStands.push(st);
        }
      };

      assignByGender("boys");
      assignByGender("girls");
    }

    if (unassignedStands.length > 0) {
      toast.error("Not enough buses to assign all students while maintaining gender separation.");
    }
    return assignments;
  };

  const assignMorningShiftBuses = ({ buses, routes }) => {
    routes.sort((a, b) => {
      const total = (r) =>
        (r.stands || []).reduce((sum, s) => sum + (s.boys || 0) + (s.girls || 0), 0);
      return total(b) - total(a);
    });
    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);

    let assignments = [];
    let unassignedStands = [];

    for (const route of routes) {
      const maxBusCapacity = Math.max(...sortedBuses.map((b) => b.capacity));
      const maxEff = maxBusCapacity + morningOverload;

      const standsToAssign = [];
      for (const stand of route.stands || []) {
        const total = Number(stand.boys || 0) + Number(stand.girls || 0);
        if (total > maxEff) {
          let remaining = total;
          let boys = Number(stand.boys || 0);
          let girls = Number(stand.girls || 0);
          while (remaining > 0) {
            const chunk = Math.min(remaining, maxEff);
            const boyChunk = Math.min(boys, chunk);
            const girlChunk = chunk - boyChunk;
            boys -= boyChunk;
            girls -= girlChunk;
            standsToAssign.push({
              route: route.name,
              name: `${stand.name} (part)`,
              originalName: stand.name,
              boys: boyChunk,
              girls: girlChunk,
              total: chunk,
            });
            remaining -= chunk;
          }
        } else {
          standsToAssign.push({
            route: route.name,
            name: stand.name,
            originalName: stand.name,
            boys: Number(stand.boys || 0),
            girls: Number(stand.girls || 0),
            total,
          });
        }
      }

      for (const st of standsToAssign) {
        let placed = false;

        let routeBuses = assignments
          .filter((b) => b.route === route.name)
          .sort(
            (a, b) =>
              b.capacity + morningOverload - b.assigned -
              (a.capacity + morningOverload - a.assigned)
          );

        for (const bus of routeBuses) {
          const eff = bus.capacity + morningOverload;
          if (bus.assigned + st.total <= eff) {
            bus.stands.push(st);
            bus.boys += st.boys;
            bus.girls += st.girls;
            bus.assigned += st.total;
            placed = true;
            break;
          }
        }

        if (placed) continue;

        const suitable = sortedBuses.find((bus) => {
          const base = bus?.number ?? bus?._id ?? bus?.id ?? bus?.busNumber ?? "unknown";
          const used = assignments.some((a) => a.id === String(base));
          const eff = bus.capacity + morningOverload;
          return !used && eff >= st.total;
        });

        if (suitable) {
          const base = suitable?.number ?? suitable?._id ?? suitable?.id ?? suitable?.busNumber ?? "unknown";
          assignments.push({
            id: String(base),
            number: String(suitable?.number ?? base),
            capacity: suitable.capacity,
            assigned: st.total,
            boys: st.boys,
            girls: st.girls,
            stands: [st],
            route: route.name,
          });
          placed = true;
        }

        if (!placed) unassignedStands.push(st);
      }
    }

    if (unassignedStands.length > 0) {
      toast.error("Not enough buses to assign all students while maintaining route separation.");
    }
    return assignments;
  };

  const assignBuses = ({ buses, routes }) => {
    if (button === 5) return assignMorningShiftBuses({ buses, routes });
    if (button === 2) return assignDayShiftBuses({ buses, routes });
    if (button === 3) return assignCollegeShiftBuses({ buses, routes });
    return [];
  };

  const handleAssign = () => {
    if (activeBuses.length === 0) {
      toast.error("Bus data not loaded or invalid!");
      return;
    }
    const activeRoutes = button === 5 ? stands2 : button === 2 ? stands : stands3;
    if (!activeRoutes || activeRoutes.length === 0) {
      toast.error("Stand data not loaded or invalid!");
      return;
    }

    try {
      const assigned = assignBuses({ buses: activeBuses, routes: activeRoutes });
      if (button === 5) setAssignedBuses(assigned);
      else if (button === 2) setAssignedBusesDay(assigned);
      else if (button === 3) setAssignedBusesCollege(assigned);
      toast.success("Bus assignment done!");
    } catch (err) {
      toast.error("Assignment failed: " + err.message);
    }
  };

  const handleRemove = (busOrId) => {
    const busId = String(typeof busOrId === "object" ? busOrId.id ?? busOrId.number : busOrId);
    if (button === 5) {
      setAssignedBuses((prev) => (prev || []).filter((b) => String(b.id ?? b.number) !== busId));
    } else if (button === 2) {
      setAssignedBusesDay((prev) => (prev || []).filter((b) => String(b.id ?? b.number) !== busId));
    } else if (button === 3) {
      setAssignedBusesCollege((prev) => (prev || []).filter((b) => String(b.id ?? b.number) !== busId));
    }
    toast.success("Assignment removed");
  };

  const summary = (() => {
    const current =
      button === 5 ? assignedBuses || [] : button === 2 ? assignedBusesDay || [] : assignedBusesCollege || [];
    const totalAssigned = current.reduce((s, b) => s + Number(b.assigned || 0), 0);
    const totalCapacity = current.reduce((s, b) => s + Number(b.capacity || 0), 0);
    return {
      totalBuses: current.length,
      totalAssigned,
      totalCapacity,
      underfilledBuses: current.filter((b) => Number(b.assigned) < Number(b.capacity)),
      overloadedBuses: current.filter((b) => Number(b.assigned) > Number(b.capacity)),
    };
  })();

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
                const v = Number(e.target.value);
                if (button === 5) setMorningOverload(v);
                else if (button === 2) setDayOverload(v);
                else if (button === 3) setCollegeOverload(v);
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
          assignedBuses={
            button === 5
              ? assignedBuses
              : button === 2
              ? assignedBusesDay
              : assignedBusesCollege
          }
          mode="automation"
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
};

export default Automation;