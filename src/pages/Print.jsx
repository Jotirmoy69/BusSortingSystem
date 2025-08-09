import React, { useEffect, useState, useRef } from "react";
const { ipcRenderer } = window.require("electron");
import AssignmentTable from "../components/AssignmentTable";
import { useLocation } from "react-router-dom";

function Print() {
  const [assignedBuses, setAssignedBuses] = useState([]); 
  const printRef = useRef();
  const location = useLocation();

  // Load assigned bus data
  useEffect(() => {
    ipcRenderer.once("assigned-buses-data", (event, data) => {
      setAssignedBuses(data);
    });
    ipcRenderer.send("request-assigned-buses");
    console.log(location.pathname);
    
    return () => {
      ipcRenderer.removeAllListeners("assigned-buses-data");
    };
  }, []); 
  return (
    <div className="px-10 h-screen overflow-y-auto">
  <AssignmentTable assignedBuses={assignedBuses} mode="manual" />
</div>

  );
}

export default Print;
 