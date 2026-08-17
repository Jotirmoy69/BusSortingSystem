import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";
import PrePrint from "../components/PrePrint";
import { HiOutlineDotsVertical, HiOutlineEye } from "react-icons/hi";
const Home = () => {
  const printRef = useRef();
  const [prePrintShow, setprePrintShow] = useState(false);
  const [table, setTable] = useState(0);
  const {
    setActiveBuses,
    assignedBuses,
    assignedBusesDay,
    setStands,
    setStands2,
    setStands3,
    assignedBusesCollege,
  } = useAppContext();

  const { ipcRenderer } = window.require("electron");

  const handleClick = () => {
    setprePrintShow(true);
  };

  const fetchBuses = async () => {
    try {
      const res = await ipcRenderer.invoke("fetch-buses");
      if (res?.error) {
        toast.error(`Failed to load buses: ${res.error}`);
        return;
      }
      const busData = res.data || [];
      const activeBuses = busData.filter((bus) => bus.isActive === true);
      setActiveBuses(activeBuses);
    } catch (err) {
      console.error("Error fetching buses:", err);
      toast.error("Failed to load bus data. Please restart the application.");
    }
  };

  const fetchRoutes2 = async () => {
    try {
      const res = await ipcRenderer.invoke("fetch-routes-morning");
      if (res?.error) {
        toast.error(`Failed to load morning routes: ${res.error}`);
        return;
      }
      setStands2(res.data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("Failed to load morning route data.");
    }
  };
  const fetchRoutes3 = async () => {
    try {
      const res = await ipcRenderer.invoke("fetch-routes-college");
      if (res?.error) {
        toast.error(`Failed to load college routes: ${res.error}`);
        return;
      }
      setStands3(res.data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("Failed to load college route data.");
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await ipcRenderer.invoke("fetch-routes");
      if (res?.error) {
        toast.error(`Failed to load day routes: ${res.error}`);
        return;
      }
      const routeData = res.data || [];
      setStands(routeData);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("Failed to load day route data.");
    }
  };

  useEffect(() => {
    (async () => {
      await fetchBuses();
      await fetchRoutes();
      await fetchRoutes2();
      await fetchRoutes3();
    })();
  }, []);

  const handleToggle = () => {
    if (table === 1) {
      setTable(2);
    } else if (table === 2) {
      setTable(0);
    } else {
      setTable(1);
    }
  };

  const handlePrint = () => {
    let assignedBusesToPrint;

    if (table === 0) {
      assignedBusesToPrint = assignedBuses;
      if (!assignedBusesToPrint || assignedBusesToPrint.length === 0) {
        toast.error("No Bus assigned to Morning Shift");
        return;
      }
    } else if (table === 1) {
      assignedBusesToPrint = assignedBusesDay;
      if (!assignedBusesToPrint || assignedBusesToPrint.length === 0) {
        toast.error("No Bus assigned to Day Shift");
        return;
      }
    } else if (table === 2) {
      assignedBusesToPrint = assignedBusesCollege; // College Shift buses
      if (!assignedBusesToPrint || assignedBusesToPrint.length === 0) {
        toast.error("No Bus assigned to College Shift");
        return;
      }
    } else {
      toast.error("Invalid shift selected");
      return;
    }

    if (!assignedBusesToPrint || assignedBusesToPrint.length === 0) {
      toast.error("No bus data to print");
      return;
    }

    let gridHTML = '';

    assignedBusesToPrint.forEach((bus) => {
      const busNumber = bus.number || bus.id || 'N/A';
      const gender = bus.gender || '';
      
      let standsHTML = '';
      
      if (bus.stands && bus.stands.length > 0) {
        standsHTML = bus.stands.map((stand) => {
          const standName = stand.originalName || stand.name || '';
          return `<span class="stand-item">${standName}</span>`;
        }).join('');
      } else {
        standsHTML = '<span class="stand-item">No stands</span>';
      }

      gridHTML += `
        <div class="print-row">
          <div class="print-cell-left">
            <div>${busNumber}</div>
            ${gender ? `<div class="gender-text">(${gender})</div>` : ''}
          </div>
          <div class="print-cell-right">
            ${standsHTML}
          </div>
        </div>
      `;
    });

    const printWindow = window.open("", "_blank", "width=800,height=600");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Buses</title>
          <style>
            @page {
              size: A4;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              color: black !important;
            }
            html, body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            body {
              padding: 3px;
            }
            .print-row {
              display: grid;
              grid-template-columns: 22% 78%;
              width: 100%;
              border-bottom: 1px solid black;
              page-break-inside: avoid;
              min-height: 25px;
            }
            .print-cell-left {
              border-right: 1px solid black;
              padding: 4px 3px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              font-weight: bold;
              font-size: 11px;
              background-color: white;
              vertical-align: middle;
              line-height: 1.2;
            }
            .gender-text {
              font-size: 8px;
              color: black !important;
              margin-top: 1px;
              font-weight: normal;
            }
            .print-cell-right {
              padding: 4px 6px;
              display: flex;
              flex-wrap: wrap;
              gap: 2px 4px;
              align-items: center;
              align-content: center;
              font-size: 8px;
              vertical-align: middle;
              line-height: 1.3;
            }
            .stand-item {
              display: inline-block;
              padding: 1px 4px;
              background-color: white;
              border: 1px solid black;
              white-space: nowrap;
              margin: 0;
            }
            .print-header {
              display: grid;
              grid-template-columns: 22% 78%;
              width: 100%;
              border-bottom: 2px solid black;
              background-color: white;
              color: black !important;
              font-weight: bold;
              font-size: 10px;
              margin-bottom: 2px;
            }
            .print-header-left {
              border-right: 1px solid black;
              padding: 4px 3px;
              text-align: center;
            }
            .print-header-right {
              padding: 4px;
              text-align: center;
            }
            @media print {
              .print-row {
              page-break-inside: avoid;
                break-inside: avoid;
              }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="print-header-left">Bus & Gender</div>
            <div class="print-header-right">Stands</div>
          </div>
          ${gridHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  return (
    <div className="min-h-screen bg-slate-50 font-[gilroy] text-slate-900 selection:bg-indigo-100">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-50 p-1.5 sm:p-2 md:p-2.5 rounded-2xl shadow-sm">
            <img src="./bcpsc.png" className="w-full h-full object-contain" alt="BCPSC Logo" />
          </div>
          <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
            Bus Manager <span className="text-indigo-600">Pro</span>
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={"/manual"}
              className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300 shadow-sm"
            >
              Manual
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={"/automation"}
              className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-indigo-600 text-xs sm:text-sm text-white font-medium hover:bg-indigo-700 transition-all duration-300 shadow-md shadow-indigo-100"
            >
              Automatic
            </Link>
          </motion.div>
          
          <div className="h-4 sm:h-6 w-px bg-slate-200 mx-1 sm:mx-2"></div>
          
          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.1, backgroundColor: "rgb(241 245 249)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl text-slate-500"
            title="Display Options"
          >
            <HiOutlineEye className="text-base sm:text-lg md:text-xl" />
          </motion.button>
          <motion.button
            onClick={handlePrint}
            whileHover={{ scale: 1.1, backgroundColor: "rgb(241 245 249)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl text-slate-500"
            title="Print Table"
          >
            <span className="text-sm sm:text-base md:text-lg leading-none">🖨️</span>
          </motion.button>

          <motion.div
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              to={"/settings"}
              className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl text-slate-500 transition-colors duration-300"
            >
              <HiOutlineDotsVertical className="text-base sm:text-lg md:text-xl" />
            </Link>
          </motion.div>
        </div>
      </nav>

      <main className="pt-20 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:pb-12 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col md:flex-row justify-between items-end mb-6 sm:mb-8 md:mb-10 gap-4 sm:gap-6"
        >
          <div className="space-y-1 sm:space-y-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
            >
              Dashboard
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Live Assignments
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm md:text-base text-slate-500 max-w-md"
            >
              Monitor and manage your bus assignments across all shifts in real-time.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
            className="flex bg-white p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm"
          >
            {[0, 1, 2].map((i) => (
              <motion.button
                key={i}
                onClick={() => setTable(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  table === i
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {i === 0 ? "Morning" : i === 1 ? "Day" : "College"}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div ref={printRef} className="p-2">
        {table === 0 ? (
          <AssignmentTable assignedBuses={assignedBuses} mode="automation" />
        ) : table === 1 ? (
          <AssignmentTable assignedBuses={assignedBusesDay} mode="automation" />
        ) : table === 2 ? (
          <AssignmentTable
            assignedBuses={assignedBusesCollege}
            mode="automation"
          />
        ) : null}
        {prePrintShow && <PrePrint setprePrintShow={setprePrintShow} />}
      </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
