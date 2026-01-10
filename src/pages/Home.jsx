import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";
import PrePrint from "../components/PrePrint";
import { HiOutlineDotsVertical } from "react-icons/hi";
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
      const busData = res.data || [];
      const activeBuses = busData.filter((bus) => bus.isActive === true);
      setActiveBuses(activeBuses);
    } catch (err) {
      console.error("Error fetching buses:", err);
      toast.error("বাস লোড করতে সমস্যা হয়েছে");
    }
  };

  const fetchRoutes2 = async () => {
    try {
      const res = await ipcRenderer.invoke("fetch-routes-morning");
      setStands2(res.data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("রুট লোড করতে সমস্যা হয়েছে");
    }
  };
  const fetchRoutes3 = async () => {
    try {
      const res = await ipcRenderer.invoke("fetch-routes-college");
      setStands3(res.data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("রুট লোড করতে সমস্যা হয়েছে");
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await ipcRenderer.invoke("fetch-routes");
      const routeData = res.data || [];
      setStands(routeData);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("রুট লোড করতে সমস্যা হয়েছে");
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
      assignedBusesToPrint = assignedBuses; // Day Shift buses
      if (!assignedBusesToPrint || assignedBusesToPrint.length === 0) {
        toast.error("No Bus assigned to Day Shift");
        return;
      }
    } else if (table === 1) {
      assignedBusesToPrint = assignedBusesDay; // Morning Shift buses
      if (!assignedBusesToPrint || assignedBusesToPrint.length === 0) {
        toast.error("No Bus assigned to Morning Shift");
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

    if (!printRef.current) return;

    const tableElement = printRef.current.querySelector('table');
    if (!tableElement) {
      toast.error("No table found to print");
      return;
    }

    const tbody = tableElement.querySelector('tbody');
    if (!tbody) {
      toast.error("No data found to print");
      return;
    }

    const rows = Array.from(tbody.querySelectorAll('tr'));
    let gridHTML = '';

    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length === 0) return;

      const busCell = cells[0];
      const standsCell = cells.find(cell => {
        const ul = cell.querySelector('ul');
        return ul !== null;
      });

      if (!busCell || !standsCell) return;

      const busNumber = busCell.textContent.trim() || 'N/A';
      const genderMatch = busNumber.match(/\(([^)]+)\)/);
      const gender = genderMatch ? genderMatch[1] : '';
      const busNum = busNumber.replace(/\s*\([^)]+\)\s*/, '').trim();

      const standItems = Array.from(standsCell.querySelectorAll('li'));
      let standsHTML = '';
      
      if (standItems.length > 0) {
        standsHTML = standItems.map(li => {
          const text = li.textContent.trim().replace(/[.,]$/, '');
          return `<span class="stand-item">${text}</span>`;
        }).join('');
      } else {
        const standText = standsCell.textContent.trim();
        if (standText && standText !== 'No stands' && standText !== '') {
          const stands = standText.split(',').map(s => s.trim()).filter(s => s && s !== 'No stands');
          if (stands.length > 0) {
            standsHTML = stands.map(stand => 
              `<span class="stand-item">${stand}</span>`
            ).join('');
          } else {
            standsHTML = '<span class="stand-item">No stands</span>';
          }
        } else {
          standsHTML = '<span class="stand-item">No stands</span>';
        }
      }

      gridHTML += `
        <div class="print-row">
          <div class="print-cell-left">
            <div>${busNum}</div>
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
    <div className="p-6 bg-[#FFFFFF] min-h-screen font-[gilroy] lg:px-40 px-16">
      <nav className="flex justify-between mt-10">
        <div className="flex items-center gap-5">
          <img src="./bcpsc.png" className="md:w-25 w-15" alt="" />
          <h1 className="lg:text-2xl text-xs font-bold mb-2">
            Bus Management System
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <Link
            to={"/manual"}
            className="lg:px-6 px-2 lg:py-2 py-1 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md hover:bg-white/20 
               transition duration-300"
          >
            Manual
          </Link>
          <Link
            to={"/automation"}
            className="lg:px-6 px-2 lg:py-2 py-1 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md hover:bg-white/20 
               transition duration-300"
          >
            Automatic
          </Link>
          <button
            onClick={handleClick}
            className="lg:px-6 px-2 lg:py-2 py-1 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
          >
            Display
          </button>
          <button
            onClick={handlePrint}
            className="lg:px-6 px-2 lg:py-2 py-1 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
          >
            Print Table (A4)
          </button>

          <Link
            to={"/settings"}
            className="text-4xl hover:rotate-90 transition-all duration-300"
          >
            <HiOutlineDotsVertical />
          </Link>
        </div>
      </nav>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4 mt-20">Last Assignments</h2>
        <button
          onClick={handleToggle}
          className="px-6 py-2 mt-20 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md hover:bg-white/20 
               transition duration-300 cursor-pointer"
        >
          {table === 0
            ? "Morning Shift"
            : table === 1
            ? "Day Shift"
            : "College Shift"}
        </button>
      </div>
      <div ref={printRef}>
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
  );
};

export default Home;
