import { useEffect, useState,useRef } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";
import PrePrint from "../components/PrePrint";
import { HiOutlineDotsVertical } from "react-icons/hi";
  // Tailwind Heroicons



const Home = () => {
  // const [routes, setRoutes] = useState([]);
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
    }else {
      setTable(1);
    }
  }

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

  const printContents = printRef.current.innerHTML;
  const printWindow = window.open("", "_blank", "width=800,height=600");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Buses</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            html, body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              height: 100%;
            }
            body {
              box-sizing: border-box;
              overflow: hidden;
              /* Approx. 2 pages of content */
              max-height: calc(2 * 297mm - 40mm);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px; /* Make table compact */
            }
            th, td {
              border: 1px solid #333;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  return (
    <div className="p-6 bg-[#FFFFFF] min-h-screen font-[gilroy] px-40">
      <nav className="flex justify-between mt-10">
        <div className="flex items-center gap-5">
          <img src="./bcpsc.png" className="w-25 " alt="" />
          <h1 className="text-2xl font-bold mb-2">Bus Management System</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <Link
            to={"/selection"}
            className="px-6 py-2 rounded-lg 
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
            className="px-6 py-2 rounded-lg 
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
            className="px-6 py-2 rounded-lg 
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
            className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
          >
            Print Table (A4)
          </button> 

          {/* <button className="bg-purple-600 text-white px-4 py-2 rounded">
            রেকর্ডিং
          </button> */}
          <Link to={"/settings"} className="text-4xl hover:rotate-90 transition-all duration-300">
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
          {table === 0 ? "Day Shift" : table === 1 ? "Morning Shift" : "College Shift"}
        </button>
      </div >
            <div ref={printRef}>

      {table === 0  ? (
        <AssignmentTable assignedBuses={assignedBuses} mode="automation" />
      ) : table === 1 ? (
        <AssignmentTable assignedBuses={assignedBusesDay} mode="automation" />
      ) : table === 2 ? (
        <AssignmentTable assignedBuses={assignedBusesCollege} mode="automation" />
      ): null}
      <ToastContainer />
      {prePrintShow && <PrePrint setprePrintShow={setprePrintShow} />}
      </div>
    </div>
  );
};

export default Home;
