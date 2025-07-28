import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";
import PrePrint from "../components/PrePrint";

const Home = () => {
  // const [routes, setRoutes] = useState([]);
  const [prePrintShow, setprePrintShow] = useState(false);
  const [table, setTable] = useState(false)
  const {
    setActiveBuses,
    assignedBuses,
    assignedBusesDay,
    setStands,
    setStands2,
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
    })();
  }, []);

  return (
    <div className="p-6 bg-[#FFFFFF] min-h-screen px-40">
      <nav className="flex justify-between mt-10">
        <div className="flex items-center gap-5">
          <img src="./bcpsc.png" className="w-30 h-30" alt="" />
          <h1 className="text-2xl font-bold mb-6">Bus Management System</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <Link
            to={"/selection"}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Manual 
          </Link>
          <Link
            to={"/automation"}
            className="bg-purple-600 cursor-pointer text-white px-4 py-2 rounded"
          >
            Automatic
          </Link>
          <button
            onClick={handleClick}
            className="bg-purple-600 cursor-pointer text-white px-4 py-2 rounded"
          >
            Print
          </button>
          
          {/* <button className="bg-purple-600 text-white px-4 py-2 rounded">
            রেকর্ডিং
          </button> */}
          <Link to={"/settings"} className="text-2xl">
            ⚙️
          </Link>
        </div>
      </nav>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4 mt-20">Last Assignments</h2>
          <button onClick={() => setTable(!table)} className="bg-purple-600 hover:bg-purple-500 transition-all cursor-pointer text-white px-4 py-2 mb-4 mt-20 rounded">{table ? "Morning Shift" : "Day Shift"}</button>
      </div>

      {table ? <AssignmentTable assignedBuses={assignedBuses} mode="automation" /> : <AssignmentTable
          assignedBuses={assignedBusesDay}
          mode="automation"
        />}
      <ToastContainer />
      {prePrintShow && <PrePrint setprePrintShow={setprePrintShow} />}
    </div>
  );
};

export default Home;
