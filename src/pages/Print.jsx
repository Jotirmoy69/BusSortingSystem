import React, { useEffect, useState, useRef } from "react";
const { ipcRenderer } = window.require("electron");
import AssignmentTable from "../components/AssignmentTable";

function Print() {
  const [assignedBuses, setAssignedBuses] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const printRef = useRef();

  // Load assigned bus data
  useEffect(() => {
    ipcRenderer.once("assigned-buses-data", (event, data) => {
      setAssignedBuses(data);
    });
    ipcRenderer.send("request-assigned-buses");

    return () => {
      ipcRenderer.removeAllListeners("assigned-buses-data");
    };
  }, []);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Auto-select Bengali voice if available
      const bnVoice = availableVoices.find(v =>
        v.lang.toLowerCase().includes("bn")
      );
      if (bnVoice) {
        setSelectedVoice(bnVoice.name);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // Print only the table area
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

  // Narrate all buses
  const speakAllBuses = () => {
    const synth = window.speechSynthesis;
    if (!assignedBuses.length || !selectedVoice) return;

    synth.cancel(); // Stop any current speech
    let i = 0;

    const speakNext = () => {
      if (i >= assignedBuses.length) return;

      const bus = assignedBuses[i];
      const standNames = bus.stands.map(s => s.stand).join(", ");
      const message = `Bus ${bus.id} is assigned to route ${bus.route}, with ${bus.assigned} students. The stands are: ${standNames}.`;

      const utter = new SpeechSynthesisUtterance(message);
      utter.voice = voices.find(v => v.name === selectedVoice);

      utter.onend = () => {
        i++;
        speakNext(); // Continue to next bus
      };
      utter.onerror = () => {
        i++;
        speakNext(); // Skip if there's an error
      };

      synth.speak(utter);
    };

    speakNext();
  };

  return (
    <div className="px-10">
      <div className="flex justify-between py-10 items-center">
        <img src="./bcpsc.png" className="w-20" alt="Logo" />
        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold h-10 py-2 px-4 rounded"
          >
            Print Table (A4)
          </button>

          <button
            onClick={speakAllBuses}
            className="bg-green-500 hover:bg-green-700 text-white font-bold h-10 py-2 px-4 rounded"
          >
            🔊 Narrate All
          </button>

          <button
            onClick={() => window.speechSynthesis.cancel()}
            className="bg-red-500 hover:bg-red-700 text-white font-bold h-10 py-2 px-4 rounded"
          >
            ⏹ Stop
          </button>

          <select
            value={selectedVoice || ""}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {voices.map((voice, index) => (
              <option key={index} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div ref={printRef}>
        <AssignmentTable assignedBuses={assignedBuses} mode="manual" />
      </div>
    </div>
  );
}

export default Print;
