import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useAppContext } from "../context/context";
import { useLocation } from "react-router-dom";

const PrePrint = ({ setprePrintShow }) => {
  const location = useLocation();
 
  const { ipcRenderer } = window.require("electron");

  const { assignedBuses , assignedBusesDay } = useAppContext();
  const handleClick = () => {
    console.log({
      assignedBuses: assignedBuses,
      mode: "automation",
    });
    
    ipcRenderer.send("open-new-window", 
       assignedBuses
    );
  };
  const handleClickDay = () => {
    // console.log({
    //   assignedBuses: assignedBusesDay,
    //   mode: "automation",
    // },);
    console.log(location.pathname);
    
    
    ipcRenderer.send("open-new-window", 
      assignedBusesDay
    );
  };
  return (
    <div className="h-screen font-[clash] w-full flex justify-center items-center fixed top-0 right-0 left-0 bottom-0 backdrop-blur-md">
      <div className="h-62 rounded-2xl relative px-10 py-16 w-1/3 bg-white shadow-2xl">
        <IoCloseOutline
          onClick={() => setprePrintShow(false)}
          className="absolute cursor-pointer top-5 right-5 text-3xl"
        />
        <h1 className="text-3xl text-center">Which One You Want to print</h1>
        <div className="flex justify-around mt-10 gap-5 ">
          <button
            onClick={handleClick}
            className=" bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white"
          >
            Morning Shift
          </button>
          <button onClick={handleClickDay} className="  bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center  text-white">
            Day Shift
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrePrint;
