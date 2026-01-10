import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeBuses, setActiveBuses] = useState([]);
  const [assignedBuses, setAssignedBuses] = useState([]);
  const [assignedBusesDay, setAssignedBusesDay] = useState([]);
  const [assignedBusesCollege, setAssignedBusesCollege] = useState([]);
  const [stands, setStands] = useState([]); // day shift
  const [stands2, setStands2] = useState([]);
  const [stands3, setStands3] = useState([])
  const [automationAssigned, setAutomationAssigned] = useState(false);

  return (
    <AppContext.Provider
      value={{
        activeBuses,
        setActiveBuses,
        stands,
        setStands,
        stands2,
        setStands2,
        stands3,
        setStands3,
        assignedBuses,
        setAssignedBuses,
        assignedBusesDay, 
        setAssignedBusesDay,
        assignedBusesCollege,
        setAssignedBusesCollege
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);