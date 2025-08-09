import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useAppContext } from "../context/context";
import { useLocation } from "react-router-dom";

const PrePrint = ({ setprePrintShow }) => {
  const location = useLocation();

  const { ipcRenderer } = window.require("electron");

  const { assignedBuses, assignedBusesDay, assignedBusesCollege } =
    useAppContext();
  const handleClick = () => {
    console.log({
      assignedBuses: assignedBuses,
      mode: "automation",
    });

    ipcRenderer.send("open-new-window", assignedBuses);
  };
  const handleClickDay = () => {
    console.log(location.pathname);
    ipcRenderer.send("open-new-window", assignedBusesDay);
  };
  const handleClickCollege = () => {
    ipcRenderer.send("open-new-window", assignedBusesCollege);
  };
  return (
    <div className="h-screen font-[clash] w-full flex justify-center items-center fixed top-0 right-0 left-0 bottom-0 backdrop-blur-md">
      <div className="h-62 rounded-2xl relative px-10 py-16 w-1/3 bg-white shadow-2xl">
        <IoCloseOutline
          onClick={() => setprePrintShow(false)}
          className="absolute cursor-pointer hover:rotate-90 transition-all duration-300   top-5 right-5 text-3xl"
        />
        <h1 className="text-3xl text-center">Which One You Want to print</h1>
        <div className="flex justify-around mt-10 gap-5 ">
          <button
            onClick={handleClick}
            className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
          >
            Morning 
          </button>
          <button
            onClick={handleClickDay}
            className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
          >
            Day 
          </button>
          <button
            onClick={handleClickCollege}
            className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
          >
            College 
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrePrint;
