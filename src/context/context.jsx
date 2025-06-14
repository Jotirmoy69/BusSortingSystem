import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeBuses, setActiveBuses] = useState([]);
  const [stands, setStands] = useState([]);
  const [assignedBuses, setAssignedBuses] = useState([]);
  const [stands2, setStands2] = useState([]);
  const [automationAssigned, setAutomationAssigned] = useState(false);
  const [automationAssignments, setAutomationAssignments] = useState([]);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);