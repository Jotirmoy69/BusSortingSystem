import React, { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/context";
import "react-toastify/dist/ReactToastify.css";
import AssignmentTable from "../components/AssignmentTable";

const Automation = () => {
  const [button, setButton] = useState(5);
  const [morningOverload, setMorningOverload] = useState(27);
  const [dayOverload, setDayOverload] = useState(10);

  const {
    activeBuses,
    stands3, // college stands
    stands2,
    stands,
    assignedBuses,
    setAssignedBuses,
    assignedBusesDay,
    assignedBusesCollege,
    setAssignedBusesCollege,
    setAssignedBusesDay,
    setAutomationAssigned,

  } = useAppContext();

  const assignDayShiftBuses = ({ buses, routes }) => {
    routes.sort((a, b) => {
      const totalA = a.stands.reduce(
        (sum, s) => sum + (s.boys || 0) + (s.girls || 0),
        0
      );
      const totalB = b.stands.reduce(
        (sum, s) => sum + (s.boys || 0) + (s.girls || 0),
        0
      );
      return totalB - totalA;
    });

    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);

    let assignments = [];
    let unassignedStands = [];

    for (const route of routes) {
      const maxBusCapacity = Math.max(...sortedBuses.map((b) => b.capacity));
      const maxEffectiveCapacity = maxBusCapacity + dayOverload;

      let standsToAssign = [];
      for (const stand of route.stands) {
        const boys = stand.boys || 0;
        const girls = stand.girls || 0;

        if (boys > 0) {
          if (boys > maxEffectiveCapacity) {
            let remainingBoys = boys;
            while (remainingBoys > 0) {
              const chunkSize = Math.min(remainingBoys, maxEffectiveCapacity);
              standsToAssign.push({
                route: route.name,
                name: stand.name + " (boys part)",
                originalName: stand.name,
                boys: chunkSize,
                girls: 0,
                total: chunkSize,
                gender: "boys",
              });
              remainingBoys -= chunkSize;
            }
          } else {
            standsToAssign.push({
              route: route.name,
              name: stand.name + " (boys)",
              boys: boys,
              girls: 0,
              total: boys,
              gender: "boys",
            });
          }
        }

        if (girls > 0) {
          if (girls > maxEffectiveCapacity) {
            let remainingGirls = girls;
            while (remainingGirls > 0) {
              const chunkSize = Math.min(remainingGirls, maxEffectiveCapacity);
              standsToAssign.push({
                route: route.name,
                stand: stand.name + " (girls part)",
                boys: 0,
                girls: chunkSize,
                total: chunkSize,
                gender: "girls",
              });
              remainingGirls -= chunkSize;
            }
          } else {
            standsToAssign.push({
              route: route.name,
              stand: stand.name + " (girls)",
              boys: 0,
              girls: girls,
              total: girls,
              gender: "girls",
            });
          }
        }
      }

      const assignByGender = (gender) => {
        const genderStands = standsToAssign.filter((s) => s.gender === gender);

        for (const stand of genderStands) {
          let assigned = false;

          let routeBuses = assignments.filter(
            (b) => b.route === route.name && b.gender === gender
          );

          routeBuses = routeBuses.sort((a, b) => {
            return (
              b.capacity +
              dayOverload -
              b.assigned -
              (a.capacity + dayOverload - a.assigned)
            );
          });

          for (const bus of routeBuses) {
            const effectiveCapacity = bus.capacity + dayOverload;
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

          const suitableBus = sortedBuses.find((bus) => {
            const busId = bus.number || bus._id || bus.id || "unknown";
            const isUsed = assignments.some((a) => a.id === busId);
            const effectiveCapacity = bus.capacity + dayOverload;
            return !isUsed && effectiveCapacity >= stand.total;
          });

          if (suitableBus) {
            assignments.push({
              id:
                suitableBus.number ||
                suitableBus._id ||
                suitableBus.id ||
                "unknown",
              capacity: suitableBus.capacity,
              assigned: stand.total,
              boys: stand.boys,
              girls: stand.girls,
              stands: [stand],
              route: route.name,
              gender: gender,
            });
            assigned = true;
          }

          if (!assigned) {
            unassignedStands.push(stand);
          }
        }
      };

      assignByGender("boys");
      assignByGender("girls");
    }

    if (unassignedStands.length > 0) {
      toast.error(
        "Not enough buses to assign all students while maintaining gender separation."
      );
    }
    return assignments;
  };

  const assignMorningShiftBuses = ({ buses, routes }) => {
    routes.sort((a, b) => {
      const totalA = a.stands.reduce(
        (sum, s) => sum + (s.boys || 0) + (s.girls || 0),
        0
      );
      const totalB = b.stands.reduce(
        (sum, s) => sum + (s.boys || 0) + (s.girls || 0),
        0
      );
      return totalB - totalA;
    });

    const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);

    let assignments = [];
    let unassignedStands = [];

    for (const route of routes) {
      const maxBusCapacity = Math.max(...sortedBuses.map((b) => b.capacity));
      const maxEffectiveCapacity = maxBusCapacity + morningOverload;

      let standsToAssign = [];
      for (const stand of route.stands) {
        const totalStudents = (stand.boys || 0) + (stand.girls || 0);
        if (totalStudents > maxEffectiveCapacity) {
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
              stand: stand.name + " (part)",
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

      for (const stand of standsToAssign) {
        let assigned = false;

        let routeBuses = assignments.filter((b) => b.route === route.name);
        routeBuses = routeBuses.sort((a, b) => {
          return (
            b.capacity +
            morningOverload -
            b.assigned -
            (a.capacity + morningOverload - a.assigned)
          );
        });

        for (const bus of routeBuses) {
          const effectiveCapacity = bus.capacity + morningOverload;
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

        const suitableBus = sortedBuses.find((bus) => {
          const busId = bus.number || bus._id || bus.id || "unknown";
          const isUsed = assignments.some((a) => a.id === busId);
          const effectiveCapacity = bus.capacity + morningOverload;
          return !isUsed && effectiveCapacity >= stand.total;
        });

        if (suitableBus) {
          assignments.push({
            id:
              suitableBus.number ||
              suitableBus._id ||
              suitableBus.id ||
              "unknown",
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
      toast.error(
        "Not enough buses to assign all students while maintaining route separation."
      );
    }

    return assignments;
  };

  const assignBuses = ({ buses, routes }) => {
    if (button === 5) {
      return assignMorningShiftBuses({ buses, routes });
    } else if (button === 2) {
      return assignDayShiftBuses({ buses, routes });
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

    if (button === 1) {
      const totalStudents =
        totalStudents.boys + totalStudents.girls - activeBuses.length * 25;
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

      button === 5 ? setAssignedBuses(assigned) : setAssignedBusesDay(assigned);
       
      setAutomationAssigned(true);
      toast.success("Bus assignment done!");
    } catch (err) {
      toast.error("Assignment failed: " + err.message);
    }
  };

  const getSummaryData = () => {
    const currentAssignments = button === 5 ? assignedBuses : assignedBusesDay;

    const totalAssigned = currentAssignments.reduce(
      (sum, bus) => sum + Number(bus.assigned || 0),
      0
    );
    const totalCapacity = currentAssignments.reduce(
      (sum, bus) => sum + Number(bus.capacity || 0),
      0
    );

    return {
      totalBuses: currentAssignments.length,
      totalAssigned,
      totalCapacity,
      fullBuses: currentAssignments.filter(
        (bus) => Number(bus.assigned) === Number(bus.capacity)
      ),
      underfilledBuses: currentAssignments.filter(
        (bus) => Number(bus.assigned) < Number(bus.capacity)
      ),
      overloadedBuses: currentAssignments.filter(
        (bus) => Number(bus.assigned) > Number(bus.capacity)
      ),
    };
  };

  const summary = getSummaryData();

  return (
    <div className="w-full font-[clash] min-h-screen px-4 md:px-20 lg:px-40 py-10 md:py-20 bg-white">
      <ToastContainer />
      <nav className="flex flex-col md:flex-row items-center  justify-between gap-4">
        <img src="./src/assets/bcpsc.png" className="w-20 h-20" alt="logo" />
        <div className="flex flex-wrap justify-end   w-full h-10 gap-2">
          {/* Single dynamic overload input */}
          <div className="bg-gray-100 px-4 items-center rounded-lg flex   gap-2 w- max-w-md">
            <label className="text-sm font-medium w-40 text-gray-700">
              {button === 5 ? "Morning" : "Day"} Overload:{" "}<span className="font-bold">{button === 5 ? morningOverload : dayOverload}</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={button === 5 ? morningOverload : dayOverload}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (button === 5) {
                  setMorningOverload(value);
                } else {
                  setDayOverload(value);
                }
              }}
              className="w-32 accent-purple-500"
            />
          </div>

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
          assignedBuses={button === 5 ? assignedBuses : assignedBusesDay}
          mode="automation"
        />
      </div>
    </div>
  );
};

export default Automation;
// import React, { useState } from "react";
// import { FaArrowLeftLong } from "react-icons/fa6";
// import { ToastContainer, toast } from "react-toastify";
// import { Link } from "react-router-dom";
// import { useAppContext } from "../context/context";
// import "react-toastify/dist/ReactToastify.css";
// import AssignmentTable from "../components/AssignmentTable";

// const Automation = () => {
//   const [button, setButton] = useState(5);
//   const [morningOverload, setMorningOverload] = useState(27);
//   const [dayOverload, setDayOverload] = useState(10);
//   const [collegeOverload, setCollegeOverload] = useState(10);

//   const {
//     activeBuses,
//     stands3, // college stands
//     stands2,
//     stands,
//     assignedBuses,
//     setAssignedBuses,
//     assignedBusesDay,
//     assignedBusesCollege,
//     setAssignedBusesCollege,
//     setAssignedBusesDay,
//     setAutomationAssigned,
//   } = useAppContext();

//     const assignDayShiftBuses = ({ buses, routes, overload }) => {
//     routes.sort((a, b) => {
//       const totalA = a.stands.reduce(
//         (sum, s) => sum + (s.boys || 0) + (s.girls || 0),
//         0
//       );
//       const totalB = b.stands.reduce(
//         (sum, s) => sum + (s.boys || 0) + (s.girls || 0),
//         0
//       );
//       return totalB - totalA;
//     });

//     const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);

//     let assignments = [];
//     let unassignedStands = [];

//     for (const route of routes) {
//       const maxBusCapacity = Math.max(...sortedBuses.map((b) => b.capacity));
//       // FIXED: Use passed overload parameter
//       const maxEffectiveCapacity = maxBusCapacity + overload;

//       let standsToAssign = [];
//       for (const stand of route.stands) {
//         const boys = stand.boys || 0;
//         const girls = stand.girls || 0;

//         if (boys > 0) {
//           if (boys > maxEffectiveCapacity) {
//             let remainingBoys = boys;
//             while (remainingBoys > 0) {
//               const chunkSize = Math.min(remainingBoys, maxEffectiveCapacity);
//               standsToAssign.push({
//                 route: route.name,
//                 name: stand.name + " (boys part)",
//                 originalName: stand.name,
//                 boys: chunkSize,
//                 girls: 0,
//                 total: chunkSize,
//                 gender: "boys",
//               });
//               remainingBoys -= chunkSize;
//             }
//           } else {
//             standsToAssign.push({
//               route: route.name,
//               name: stand.name + " (boys)",
//               boys: boys,
//               girls: 0,
//               total: boys,
//               gender: "boys",
//             });
//           }
//         }

//         if (girls > 0) {
//           if (girls > maxEffectiveCapacity) {
//             let remainingGirls = girls;
//             while (remainingGirls > 0) {
//               const chunkSize = Math.min(remainingGirls, maxEffectiveCapacity);
//               standsToAssign.push({
//                 route: route.name,
//                 stand: stand.name + " (girls part)",
//                 boys: 0,
//                 girls: chunkSize,
//                 total: chunkSize,
//                 gender: "girls",
//               });
//               remainingGirls -= chunkSize;
//             }
//           } else {
//             standsToAssign.push({
//               route: route.name,
//               stand: stand.name + " (girls)",
//               boys: 0,
//               girls: girls,
//               total: girls,
//               gender: "girls",
//             });
//           }
//         }
//       }

//       const assignByGender = (gender) => {
//         const genderStands = standsToAssign.filter((s) => s.gender === gender);

//         for (const stand of genderStands) {
//           let assigned = false;

//           let routeBuses = assignments.filter(
//             (b) => b.route === route.name && b.gender === gender
//           );

//           routeBuses = routeBuses.sort((a, b) => {
//             return (
//               b.capacity +
//               overload - // FIXED: Use passed overload
//               b.assigned -
//               (a.capacity + overload - a.assigned) // FIXED: Use passed overload
//             );
//           });

//           for (const bus of routeBuses) {
//             // FIXED: Use passed overload
//             const effectiveCapacity = bus.capacity + overload;
//             if (bus.assigned + stand.total <= effectiveCapacity) {
//               bus.stands.push(stand);
//               bus.boys += stand.boys;
//               bus.girls += stand.girls;
//               bus.assigned += stand.total;
//               assigned = true;
//               break;
//             }
//           }

//           if (assigned) continue;

//           const suitableBus = sortedBuses.find((bus) => {
//             const busId = bus.number || bus._id || bus.id || "unknown";
//             const isUsed = assignments.some((a) => a.id === busId);
//             // FIXED: Use passed overload
//             const effectiveCapacity = bus.capacity + overload;
//             return !isUsed && effectiveCapacity >= stand.total;
//           });

//           if (suitableBus) {
//             assignments.push({
//               id:
//                 suitableBus.number ||
//                 suitableBus._id ||
//                 suitableBus.id ||
//                 "unknown",
//               capacity: suitableBus.capacity,
//               assigned: stand.total,
//               boys: stand.boys,
//               girls: stand.girls,
//               stands: [stand],
//               route: route.name,
//               gender: gender,
//             });
//             assigned = true;
//           }

//           if (!assigned) {
//             unassignedStands.push(stand);
//           }
//         }
//       };

//       assignByGender("boys");
//       assignByGender("girls");
//     }

//     if (unassignedStands.length > 0) {
//       toast.error(
//         "Not enough buses to assign all students while maintaining gender separation."
//       );
//     }
//     return assignments;
//   };

//   const assignMorningShiftBuses = ({ buses, routes }) => {
//     routes.sort((a, b) => {
//       const totalA = a.stands.reduce(
//         (sum, s) => sum + (s.boys || 0) + (s.girls || 0),
//         0
//       );
//       const totalB = b.stands.reduce(
//         (sum, s) => sum + (s.boys || 0) + (s.girls || 0),
//         0
//       );
//       return totalB - totalA;
//     });

//     const sortedBuses = [...buses].sort((a, b) => b.capacity - a.capacity);

//     let assignments = [];
//     let unassignedStands = [];

//     for (const route of routes) {
//       const maxBusCapacity = Math.max(...sortedBuses.map((b) => b.capacity));
//       const maxEffectiveCapacity = maxBusCapacity + morningOverload;

//       let standsToAssign = [];
//       for (const stand of route.stands) {
//         const totalStudents = (stand.boys || 0) + (stand.girls || 0);
//         if (totalStudents > maxEffectiveCapacity) {
//           let remaining = totalStudents;
//           let boys = stand.boys || 0;
//           let girls = stand.girls || 0;
//           while (remaining > 0) {
//             const chunkSize = Math.min(remaining, maxEffectiveCapacity);
//             const boyChunk = Math.min(boys, chunkSize);
//             const girlChunk = chunkSize - boyChunk;
//             boys -= boyChunk;
//             girls -= girlChunk;
//             standsToAssign.push({
//               route: route.name,
//               stand: stand.name + " (part)",
//               boys: boyChunk,
//               girls: girlChunk,
//               total: chunkSize,
//             });
//             remaining -= chunkSize;
//           }
//         } else {
//           standsToAssign.push({
//             route: route.name,
//             stand: stand.name,
//             boys: stand.boys || 0,
//             girls: stand.girls || 0,
//             total: totalStudents,
//           });
//         }
//       }

//       for (const stand of standsToAssign) {
//         let assigned = false;

//         let routeBuses = assignments.filter((b) => b.route === route.name);
//         routeBuses = routeBuses.sort((a, b) => {
//           return (
//             b.capacity +
//             morningOverload -
//             b.assigned -
//             (a.capacity + morningOverload - a.assigned)
//           );
//         });

//         for (const bus of routeBuses) {
//           const effectiveCapacity = bus.capacity + morningOverload;
//           if (bus.assigned + stand.total <= effectiveCapacity) {
//             bus.stands.push(stand);
//             bus.boys += stand.boys;
//             bus.girls += stand.girls;
//             bus.assigned += stand.total;
//             assigned = true;
//             break;
//           }
//         }

//         if (assigned) continue;

//         const suitableBus = sortedBuses.find((bus) => {
//           const busId = bus.number || bus._id || bus.id || "unknown";
//           const isUsed = assignments.some((a) => a.id === busId);
//           const effectiveCapacity = bus.capacity + morningOverload;
//           return !isUsed && effectiveCapacity >= stand.total;
//         });

//         if (suitableBus) {
//           assignments.push({
//             id:
//               suitableBus.number ||
//               suitableBus._id ||
//               suitableBus.id ||
//               "unknown",
//             capacity: suitableBus.capacity,
//             assigned: stand.total,
//             boys: stand.boys,
//             girls: stand.girls,
//             stands: [stand],
//             route: route.name,
//           });
//           assigned = true;
//         }

//         if (!assigned) {
//           unassignedStands.push(stand);
//         }
//       }
//     }

//     if (unassignedStands.length > 0) {
//       toast.error(
//         "Not enough buses to assign all students while maintaining route separation."
//       );
//     }

//     return assignments;
//   };

//  const assignBuses = ({ buses, routes }) => {
//     if (button === 5) {
//       // Pass morningOverload
//       return assignMorningShiftBuses({ buses, routes, overload: morningOverload });
//     } else if (button === 2) {
//       // Pass dayOverload
//       return assignDayShiftBuses({ buses, routes, overload: dayOverload });
//     } else if (button === 3) {
//       // Pass collegeOverload for college shift
//       return assignDayShiftBuses({ buses, routes, overload: collegeOverload });
//     }
//     return [];
//   };
//   const handleAssign = () => {
//     const activeRoutes = 
//       button === 5 ? stands2 : 
//       button === 2 ? stands : 
//       button === 3 ? stands3 : 
//       [];

//     if (!activeRoutes || activeRoutes.length === 0) {
//       toast.error("Stand data not loaded or invalid!");
//       return;
//     }

//     const totalStudents = activeRoutes.reduce(
//       (acc, route) => {
//         route.stands.forEach((stand) => {
//           acc.boys += stand.boys || 0;
//           acc.girls += stand.girls || 0;
//         });
//         return acc;
//       },
//       { boys: 0, girls: 0 }
//     );

//     const totalCapacity = activeBuses.reduce(
//       (acc, bus) => acc + Number(bus.capacity),
//       0
//     );

//     if (button === 1) {
//       const totalStudents =
//         totalStudents.boys + totalStudents.girls - activeBuses.length * 25;
//       if (totalCapacity < totalStudents) {
//         toast.error(
//           `Not enough bus seats! Total students: ${
//             totalStudents.boys + totalStudents.girls
//           }, total seats: ${totalCapacity}`
//         );
//         return;
//       }
//     }

//     try {
//       const assigned = assignBuses({
//         buses: activeBuses,
//         routes: activeRoutes,
//       });

//       if (button === 5) {
//         setAssignedBuses(assigned);
//       } else if (button === 2) {
//         setAssignedBusesDay(assigned);
//       } else if (button === 3) {
//         setAssignedBusesCollege(assigned);
//       }
       
//       // setAutomationAssigned(true); 
//       toast.success("Bus assignment done!");
//     } catch (err) {
//       toast.error("Assignment failed: " + err.message);
//     }
//   };

//   const getSummaryData = () => {
//     const currentAssignments = 
//       button === 5 ? assignedBuses : 
//       button === 2 ? assignedBusesDay : 
//       button === 3 ? assignedBusesCollege : 
//       [];

//     const totalAssigned = currentAssignments.reduce(
//       (sum, bus) => sum + Number(bus.assigned || 0),
//       0
//     );
//     const totalCapacity = currentAssignments.reduce(
//       (sum, bus) => sum + Number(bus.capacity || 0),
//       0
//     );

//     return {
//       totalBuses: currentAssignments.length,
//       totalAssigned,
//       totalCapacity,
//       fullBuses: currentAssignments.filter(
//         (bus) => Number(bus.assigned) === Number(bus.capacity)
//       ),
//       underfilledBuses: currentAssignments.filter(
//         (bus) => Number(bus.assigned) < Number(bus.capacity)
//       ),
//       overloadedBuses: currentAssignments.filter(
//         (bus) => Number(bus.assigned) > Number(bus.capacity)
//       ),
//     };
//   };

//   const summary = getSummaryData();

//   // Determine overload value based on active shift
//   const currentOverload = 
//     button === 5 ? morningOverload : 
//     button === 2 ? dayOverload : 
//     collegeOverload;

//   return (
//     <div className="w-full font-[clash] min-h-screen px-4 md:px-20 lg:px-40 py-10 md:py-20 bg-white">
//       <ToastContainer />
//       <nav className="flex flex-col md:flex-row items-center  justify-between gap-4">
//         <img src="./src/assets/bcpsc.png" className="w-20 h-20" alt="logo" />
//         <div className="flex flex-wrap justify-end   w-full h-10 gap-2">
//           {/* Single dynamic overload input */}
//           <div className="bg-gray-100 px-4 items-center rounded-lg flex   gap-2 w- max-w-md">
//             <label className="text-sm font-medium w-40 text-gray-700">
//               {button === 5 ? "Morning" : 
//                button === 2 ? "Day" : "College"} Overload:{" "}
//               <span className="font-bold">{currentOverload}</span>
//             </label>
//             <input
//               type="range"
//               min="0"
//               max="50"
//               step="1"
//               value={currentOverload}
//               onChange={(e) => {
//                 const value = Number(e.target.value);
//                 if (button === 5) {
//                   setMorningOverload(value);
//                 } else if (button === 2) {
//                   setDayOverload(value);
//                 } else {
//                   setCollegeOverload(value);
//                 }
//               }}
//               className="w-32 accent-purple-500"
//             />
//           </div>

//           <button
//             onClick={() => setButton(2)}
//             className={`px-4 py-2 rounded-md cursor-pointer transition-all duration-200 text-white  ${
//               button === 2 ? "bg-sky-500" : "bg-gray-500"
//             } hover:bg-sky-600`}
//           >
//             Day Shift
//           </button>

//           <button
//             onClick={() => setButton(3)}
//             className={`px-4 py-2 rounded-md cursor-pointer transition-all duration-200 text-white  ${
//               button === 3 ? "bg-green-500" : "bg-gray-500"
//             } hover:bg-green-600`}
//           >
//             College Shift
//           </button>

//           <button
//             onClick={() => setButton(5)}
//             className={`px-4 py-2 rounded-md transition-all cursor-pointer duration-200 text-white  ${
//               button === 5 ? "bg-purple-500" : "bg-gray-500"
//             } hover:bg-purple-600`}
//           >
//             Morning Shift
//           </button>
//           <button
//             onClick={handleAssign}
//             className="px-4 py-2 bg-[#CCFF01] hover:bg-[#9eff01] cursor-pointer transition-all duration-200 rounded-md text-[#191917] font-semibold"
//           >
//             Assign
//           </button>
//         </div>
//         <Link
//           to="/"
//           className="fixed top-5 right-5 z-50 bg-purple-500 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:bg-purple-600 transition-colors"
//           title="Go Back"
//         >
//           <FaArrowLeftLong />
//         </Link>
//       </nav>

//       <div className="mt-10">
//         <div className="mb-6 p-4 bg-white rounded-md shadow-md">
//           <h3 className="text-xl font-bold mb-4">Summary</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div className="p-4 bg-purple-100 rounded-md shadow-sm">
//               <p className="text-sm text-gray-600">Total Buses</p>
//               <p className="text-lg font-semibold">{summary.totalBuses}</p>
//             </div>
//             <div className="p-4 bg-yellow-100 rounded-md shadow-sm">
//               <p className="text-sm text-gray-600">Buses with Empty Seats</p>
//               <p className="text-lg font-semibold">
//                 {summary.underfilledBuses.length > 0
//                   ? summary.underfilledBuses
//                       .map(
//                         (bus) =>
//                           `${bus.id || bus.number} (${
//                             Number(bus.capacity) - Number(bus.assigned)
//                           })`
//                       )
//                       .join(", ")
//                   : "None"}
//               </p>
//             </div>
//             <div className="p-4 bg-pink-100 rounded-md shadow-sm">
//               <p className="text-sm text-gray-600">Overloaded Buses</p>
//               <p className="text-lg font-semibold">
//                 {summary.overloadedBuses.length > 0
//                   ? summary.overloadedBuses
//                       .map(
//                         (bus) =>
//                           `${bus.id || bus.number} (+${
//                             Number(bus.assigned) - Number(bus.capacity)
//                           })`
//                       )
//                       .join(", ")
//                   : "None"}
//               </p>
//             </div>
//           </div>
//         </div>

//         <AssignmentTable
//           assignedBuses={
//             button === 5 ? assignedBuses : 
//             button === 2 ? assignedBusesDay : 
//             assignedBusesCollege
//           }
//           mode="automation"
//         />
//       </div>
//     </div>
//   );
// };

// export default Automation;