import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useAppContext } from "../context/context";

const PrePrint = ({ setprePrintShow }) => {
 
  const { ipcRenderer } = window.require("electron");

  const { assignedBuses } = useAppContext();
  const handleClick = () => {
    console.log({
      assignedBuses: assignedBuses,
      mode: "automation",
    });
    
    ipcRenderer.send("open-new-window", 
       assignedBuses
    );
  };
  return (
    <div className="h-screen font-[Noto Serif Bengali] w-full flex justify-center items-center fixed top-0 right-0 left-0 bottom-0 backdrop-blur-md">
      <div className="h-62 rounded-2xl relative px-10 py-16 w-1/3 bg-white shadow-2xl">
        <IoCloseOutline
          onClick={() => setprePrintShow(false)}
          className="absolute cursor-pointer top-5 right-5 text-3xl"
        />
        <h1 className="text-3xl text-center">কোন লিস্ট প্রিন্ট করতে চান?</h1>
        <div className="flex justify-around mt-10 gap-5 ">
          <button
            onClick={handleClick}
            className=" bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white"
          >
            প্রভাতি শাখা‌
          </button>
          <button className="  bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center  text-white">
            দিবা শাখা‌
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrePrint;
