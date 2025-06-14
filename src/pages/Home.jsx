import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAppContext } from "../context/context";
import AssignmentTable from "../components/AssignmentTable";
import PrePrint from "../components/PrePrint";

const Home = () => {
  const [routes, setRoutes] = useState([]);
  const [prePrintShow, setprePrintShow] = useState(false)
  const {
    activeBuses,
    setActiveBuses,
    stands,
    assignedBuses,
    setStands,
    stands2,
    setStands2,
  } = useAppContext();
  
  const { ipcRenderer } = window.require('electron');

  const handleClick = () => {
    setprePrintShow(true)
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
      setRoutes(routeData);
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
    <div className="p-6 bg-[##F5F5FF] min-h-screen px-40">
      <nav className="flex justify-between mt-10">
        <div className="flex items-center gap-5">
        <img src="./bcpsc.png" className="w-30 h-30" alt="" />
        <h1 className="text-2xl font-bold mb-6">স্কুল বাস ম্যানেজমেন্ট</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <Link
            to={"/selection"}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            ম্যানুয়াল নির্ধারণ
          </Link>
          <Link
            to={"/automation"}
            className="bg-purple-600 cursor-pointer text-white px-4 py-2 rounded"
          >
            স্বয়ংক্রিয় নির্ধারণ
          </Link>
          <button
            onClick={handleClick}
            className="bg-purple-600 cursor-pointer text-white px-4 py-2 rounded"
          >
            প্রিন্ট
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded">
            ডিজাইন
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded">
            রেকর্ডিং
          </button>
          <Link to={"/settings"} className="text-2xl">
            ⚙️
          </Link>
        </div>
      </nav>

      {/* Uncomment and use this if you want to show assigned data table */}
      {/* <div className="overflow-x-auto shadow rounded-lg mt-40">
        <table className="min-w-full table-auto border-collapse">
          <thead>


            <tr className="bg-[#2B7FFF] h-16 text-white text-left">
              <th className="px-6 py-3 font-semibold text-lg text-center">ছাত্র</th>
              <th className="px-6 py-3 font-semibold text-lg text-center">ছাত্রী</th>
              <th className="px-6 py-3 font-semibold text-lg text-end">স্ট্যান্ডসমূহ</th>
            </tr>
          </thead>
          <tbody>
            {assignedData?.boys && assignedData?.girls ? (
              <tr className="border-t h-20 align-middle">
                <td className="px-16 py-4 text-blue-600 font-semibold align-middle text-center">
                  {assignedData.boys.buses.reduce(
                    (total, bus) =>
                      total + bus.stands.reduce((sum, s) => sum + s.count, 0),
                    0
                  )}
                </td>
                <td className="px-16 py-4 text-pink-500 font-semibold align-middle text-center">
                  {assignedData.girls.buses.reduce(
                    (total, bus) =>
                      total + bus.stands.reduce((sum, s) => sum + s.count, 0),
                    0
                  )}
                </td>
                <td className="px-6 py-4 text-gray-800 align-middle text-end">
                  {[
                    ...new Set([
                      ...assignedData.boys.buses.flatMap((bus) =>
                        bus.stands.map((s) => `${s.route}-${s.stand}`)
                      ),
                      ...assignedData.girls.buses.flatMap((bus) =>
                        bus.stands.map((s) => `${s.route}-${s.stand}`)
                      ),
                    ]),
                  ].join(", ")}
                </td>
              </tr>
            ) : (
              <tr className="border-t h-20">
                <td
                  className="px-16 py-4 text-center text-gray-500 font-semibold"
                  colSpan={3}
                >
                  কোনো ডাটা পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> */}

      <AssignmentTable assignedBuses={assignedBuses} />
      <ToastContainer />
      {
        prePrintShow && <PrePrint setprePrintShow={setprePrintShow} />
      }
    </div>
  );
};

export default Home;
