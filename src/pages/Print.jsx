import React, { useEffect, useState, useRef } from "react";
const { ipcRenderer } = window.require("electron");

import AssignmentTable from "../components/AssignmentTable";

function Print() {
  const [assignedBuses, setAssignedBuses] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    ipcRenderer.once("assigned-buses-data", (event, data) => {
      setAssignedBuses(data);
    });
    ipcRenderer.send("request-assigned-buses");

    return () => {
      ipcRenderer.removeAllListeners("assigned-buses-data");
    };
  }, []);

  // Print handler to print only the table area
  const handlePrint = () => {
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
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #333;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
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
    <div className="px-10"> 
      <div className="flex justify-between py-10">
        <img src="./bcpsc.png" className="w-20" alt="" />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold h-10 py-2 px-4 rounded"
          onClick={handlePrint}
          style={{
            marginBottom: "20px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Print Table (A4)
        </button>
      </div>
      <div ref={printRef}>
        <AssignmentTable assignedBuses={assignedBuses} mode="manual" />
      </div>
    </div>
  );
}

export default Print;
