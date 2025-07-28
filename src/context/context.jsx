import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeBuses, setActiveBuses] = useState([]);
  const [stands, setStands] = useState([]); // day shift
  const [assignedBuses, setAssignedBuses] = useState([]);
  const [assignedBusesDay, setAssignedBusesDay] = useState([]);
  const [stands2, setStands2] = useState([]);
  const [automationAssigned, setAutomationAssigned] = useState(false);
  const [automationAssignments, setAutomationAssignments] = useState([]);
  const [automationAssignmentsDay, setAutomationAssignmentsDay] = useState([]);

  return (
    <AppContext.Provider
      value={{
        activeBuses,
        setActiveBuses,
        stands,
        setStands,
        stands2,
        setStands2,
        assignedBuses,
        setAssignedBuses,
        automationAssigned,
        setAutomationAssigned,
        automationAssignments,
        setAutomationAssignments,
        assignedBusesDay, 
        setAssignedBusesDay,
        automationAssignmentsDay,
        setAutomationAssignmentsDay
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);