import { FaRegTrashAlt } from "react-icons/fa";
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { Switch } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import * as XLSX from "xlsx";
import { useAppContext } from "../context/context";
import { IoClose } from "react-icons/io5";

const Settings = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [inputCollege, setInputCollege] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeName2, setRouteName2] = useState("");
  const [routeNameCollege, setRouteNameCollege] = useState("");
  const [routes, setRoutes] = useState([]);
  const [routes2, setRoutes2] = useState([]);
  const [routesCollege, setRoutesCollege] = useState([]);
  const [standName, setStandName] = useState([]);
  const [standName2, setStandName2] = useState([]);
  const [standNameCollege, setStandNameCollege] = useState([]);
  const [boysCount, setBoysCount] = useState("");
  const [boysCount2, setBoysCount2] = useState("");
  const [girlsCount, setGirlsCount] = useState("");
  const [boysCountCollege, setBoysCountCollege] = useState("");
  const [girlsCountCollege, setGirlsCountCollege] = useState("");
  const [isShow, setIsShow] = useState(0);
  const [totalBusCapacity, setTotalBusCapacity] = useState(0);
  const [activeBusCapacity, setActiveBusCapacity] = useState(0);
  const [totalDayStudents, setTotalDayStudents] = useState(0);
  const [totalMorningStudents, setTotalMorningStudents] = useState(0);
  const [totalCollegeStudents, setTotalCollegeStudents] = useState(0);
  const [lastUpdatedDay, setLastUpdatedDay] = useState(null);
  const [lastUpdatedMorning, setLastUpdatedMorning] = useState(null);
  const [lastUpdatedCollege, setLastUpdatedCollege] = useState(null);
  const [daySeatsNeeded, setDaySeatsNeeded] = useState(0);
  const [morningSeatsNeeded, setMorningSeatsNeeded] = useState(0);
  const [collegeSeatsNeeded, setCollegeSeatsNeeded] = useState(0);
  const [dummy, setDummy] = useState(false);
  const [dummy2, setDummy2] = useState(false);
  const [dummy3, setDummy3] = useState(false);
  const [dummyCollege, setDummyCollege] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [updatedStands, setUpdatedStands] = useState([]);
  const [newStandName, setNewStandName] = useState("");
  const [newBoysCount, setNewBoysCount] = useState("");
  const [newGirlsCount, setNewGirlsCount] = useState("");
  const [selectedRouteMorning, setSelectedRouteMorning] = useState("");
  const [updatedStandsMorning, setUpdatedStandsMorning] = useState([]);
  const [newStandNameMorning, setNewStandNameMorning] = useState("");
  const [newBoysCountMorning, setNewBoysCountMorning] = useState("");
  const [selectedRouteCollege, setSelectedRouteCollege] = useState("");
  const [updatedStandsCollege, setUpdatedStandsCollege] = useState([]);
  const [newStandNameCollege, setNewStandNameCollege] = useState("");
  const [newBoysCountCollege, setNewBoysCountCollege] = useState("");
  const [newGirlsCountCollege, setNewGirlsCountCollege] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [busCapacity, setBusCapacity] = useState("");
  const [buses, setBuses] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [showDeleteConfirm2, setShowDeleteConfirm2] = useState(false);
  const [itemToDelete2, setItemToDelete2] = useState(null);
  const mainContentRef = useRef(null);
  const { setActiveBuses } = useAppContext();
  const tabs = [
    { id: 0, label: "Day Shift", icon: "➤" },
    { id: 4, label: "Morning Shift", icon: "➤" },
    { id: 6, label: "College Shift", icon: "➤" },
    { id: 1, label: "Bus Management", icon: "➤" },
    { id: 2, label: "Day Update", icon: "➤" },
    { id: 5, label: "Morning Update", icon: "➤" },
    { id: 7, label: "Collage Update", icon: "➤" },
    { id: 3, label: "Clear Database", icon: "➤" },
  ];

  const getIpcRenderer = () => {
    if (window.require) {
      return window.require("electron").ipcRenderer;
    }
    return {
      invoke: () => {
        console.error("Electron IPC not available");
        return Promise.resolve({ data: [] });
      },
    };
  };


  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);
  useEffect(() => {
    const collegeStudentsTotal = routesCollege.reduce(
      (acc, route) => acc + (route.totalBoys || 0) + (route.totalGirls || 0),
      0
    );
    setTotalCollegeStudents(collegeStudentsTotal);
  }, [routesCollege]);

  const calculateSeatCapacity = () => {
    const daySeatsNeeded = Math.max(0, totalDayStudents - activeBusCapacity);
    const morningSeatsNeeded = Math.max(0, totalMorningStudents - activeBusCapacity);
    const collegeSeatsNeeded = Math.max(0, totalCollegeStudents - activeBusCapacity);
    
    setDaySeatsNeeded(daySeatsNeeded);
    setMorningSeatsNeeded(morningSeatsNeeded);
    setCollegeSeatsNeeded(collegeSeatsNeeded);
  };

  useEffect(() => {
    calculateSeatCapacity();
  }, [totalDayStudents, totalMorningStudents, totalCollegeStudents, activeBusCapacity]);

  useEffect(() => {
    calculateSeatCapacity();
  }, [isShow]);

  useEffect(() => {
    calculateSeatCapacity();
  }, [routes, routes2, routesCollege]);

  useEffect(() => {
    calculateSeatCapacity();
  }, [buses]);

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
    fetchRoutes2();
    fetchRoutesCollege();
  }, []);

  useEffect(() => {
    if (selectedRouteCollege && isShow === 7) {
      const route = routesCollege.find((r) => r.name === selectedRouteCollege);
      if (route) {
        setUpdatedStandsCollege([...route.stands]);
      }
    }
  }, [selectedRouteCollege, isShow]);

  useEffect(() => {
    const busCapacityTotal = buses.reduce(
      (acc, bus) => acc + (bus.capacity || 0),
      0
    );
    setTotalBusCapacity(busCapacityTotal);

    const activeCapacity = buses.reduce(
      (acc, bus) => acc + (bus.isActive ? bus.capacity || 0 : 0),
      0
    );
    setActiveBusCapacity(activeCapacity);

    const dayStudentsTotal = routes.reduce(
      (acc, route) => acc + (route.totalBoys || 0) + (route.totalGirls || 0),
      0
    );
    setTotalDayStudents(dayStudentsTotal);

    const morningStudentsTotal = routes2.reduce(
      (acc, route) => acc + (route.totalBoys || 0),
      0
    );
    setTotalMorningStudents(morningStudentsTotal);
  }, [routes, routes2, buses]);

  useEffect(() => {
    if (selectedRoute && isShow === 2) {
      const route = routes.find((r) => r.name === selectedRoute);
      if (route) {
        setUpdatedStands([...route.stands]);
      }
    }
  }, [selectedRoute, isShow]);

  useEffect(() => {
    if (selectedRouteMorning && isShow === 5) {
      const route = routes2.find((r) => r.name === selectedRouteMorning);
      if (route) {
        setUpdatedStandsMorning([...route.stands]);
      }
    }
  }, [selectedRouteMorning, isShow]);

  const handleKeyDownCollege = (e) => {
    if (e.key === "Enter" || e.key === "NumpadEnter" || e.key === ",") {
      e.preventDefault();
      const forbiddenCharsRegex =
        /[!@#$%^&*()_+{}:"<>?|~`0-9\-=\[\];'\/><.,\\]/g;
      let cleanedInput = inputCollege.replace(forbiddenCharsRegex, "").trim();
      const words = cleanedInput.split(/\s+/);
      cleanedInput = words.length === 1 ? words[0] : words.join(" ");
      const newStand = cleanedInput.toLowerCase();

      if (!cleanedInput) {
        toast.error("Only space or empty name cannot be used");
        return;
      }

      if (!boysCountCollege || isNaN(parseInt(boysCountCollege))) {
        toast.error("Enter number of boys (must be a number)");
        return;
      }

      if (!girlsCountCollege || isNaN(parseInt(girlsCountCollege))) {
        toast.error("Enter number of girls (must be a number)");
        return;
      }

      const isDuplicateInCurrent = standNameCollege.some(
        (stand) => stand.name.trim().toLowerCase() === newStand
      );

      if (isDuplicateInCurrent) {
        toast.error("This stand name has already been added");
        return;
      }

      const isDuplicateInRoutes = routesCollege.some((route) =>
        route.stands.some(
          (stand) => stand.name.trim().toLowerCase() === newStand
        )
      );

      if (isDuplicateInRoutes) {
        toast.error("This stand name already exists in another route");
        return;
      }

      setStandNameCollege((prev) => [
        ...prev,
        {
          name: cleanedInput,
          boys: parseInt(boysCountCollege),
          girls: parseInt(girlsCountCollege),
        },
      ]);

      setBoysCountCollege("");
      setGirlsCountCollege("");
      setInputCollege("");
    }
  };

  const handleChangeCollege = (e) => setInputCollege(e.target.value);

  const handleRemoveStandCollege = (index) => {
    setStandNameCollege((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRouteCollege = async () => {
    const routeNameValue = routeNameCollege.trim().toLowerCase();

    if (!routeNameValue) {
      toast.error("Enter the route name");
      return;
    }

    if (!standNameCollege.length) {
      toast.error("Add at least one stand");
      return;
    }

    if (
      routesCollege.some((route) => route.name.toLowerCase() === routeNameValue)
    ) {
      toast.error("This route name already exists");
      return;
    }

    try {
      const totalBoys = standNameCollege.reduce(
        (acc, curr) => acc + curr.boys,
        0
      );
      const totalGirls = standNameCollege.reduce(
        (acc, curr) => acc + curr.girls,
        0
      );

      const ipcRenderer = getIpcRenderer();
      await ipcRenderer.invoke("insert-route-college", {
        name: routeNameCollege.trim(),
        stands: [...standNameCollege],
        totalBoys,
        totalGirls,
      });

      await fetchRoutesCollege();
      setRouteNameCollege("");
      setStandNameCollege([]);
      setBoysCountCollege("");
      setGirlsCountCollege("");
      toast.success("College shift route has been added");
    } catch (err) {
      console.error("Error inserting college route:", err);
      toast.error("Failed to add route");
    }
  };

  const handleDeleteRouteCollege = (index) => {
    const routeToDelete = routesCollege[index];
    if (!routeToDelete) return;

    setItemToDelete({
      type: "route-college",
      index,
      name: routeToDelete.name,
    });
    setDeleteType("route-college");
    setShowDeleteConfirm(true);
  };

  const fetchRoutesCollege = async () => {
    try {
      const ipcRenderer = getIpcRenderer();
      const res = await ipcRenderer.invoke("fetch-routes-college");
      setRoutesCollege(res.data || []);
    } catch (err) {
      console.error("Error fetching college routes:", err);
      toast.error("Failed to load college routes");
    }
  };

  const handleCollegeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const routeMap = {};

      for (let i = 1; i < rows.length; i++) {
        const [standName, boysCount, girlsCount, routeName] = rows[i];

        if (
          !routeName ||
          !standName ||
          boysCount === undefined ||
          girlsCount === undefined
        )
          continue;

        if (!routeMap[routeName]) {
          routeMap[routeName] = {
            name: routeName,
            stands: [],
            totalBoys: 0,
            totalGirls: 0,
          };
        }

        const boys = Number(boysCount);
        const girls = Number(girlsCount);
        routeMap[routeName].stands.push({
          name: standName,
          boys: boys,
          girls: girls,
        });

        routeMap[routeName].totalBoys += boys;
        routeMap[routeName].totalGirls += girls;
      }

      const parsedData = Object.values(routeMap);

      const ipcRenderer = getIpcRenderer();
      setRoutesCollege(parsedData);

      await ipcRenderer.invoke("insert-route-college-dummy", parsedData);
      fetchRoutesCollege();
      setLastUpdatedCollege(new Date());
      toast.success("College shift data has been applied from Excel!");
    };

    reader.readAsBinaryString(file);
  };

  const handleUpdateRouteCollege = async () => {
    if (!selectedRouteCollege) {
      toast.error("Please select a route");
      return;
    }

    if (!updatedStandsCollege.length) {
      toast.error("Add at least one stand");
      return;
    }

    try {
      const totalBoys = updatedStandsCollege.reduce(
        (acc, curr) => acc + Number(curr.boys || 0),
        0
      );
      const totalGirls = updatedStandsCollege.reduce(
        (acc, curr) => acc + Number(curr.girls || 0),
        0
      );

      const ipcRenderer = getIpcRenderer();
      const result = await ipcRenderer.invoke("update-route-college", {
        name: selectedRouteCollege,
        stands: updatedStandsCollege,
        totalBoys,
        totalGirls,
      });

      if (result?.success) {
        await fetchRoutesCollege();
        setSelectedRouteCollege("");
        setUpdatedStandsCollege([]);
        setNewStandNameCollege("");
        setNewBoysCountCollege("");
        setNewGirlsCountCollege("");
        toast.success("College route has been updated");
      } else {
        const errorMsg = result?.error || "Failed to update route";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error updating college route:", err);
      toast.error(err.message || "An error occurred while updating the route");
    }
  };

  const handleAddNewStandCollege = () => {
    const trimmedName = newStandNameCollege.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("Enter the stand name");
      return;
    }

    if (!newBoysCountCollege || isNaN(parseInt(newBoysCountCollege))) {
      toast.error("Enter number of boys (must be a number)");
      return;
    }

    if (!newGirlsCountCollege || isNaN(parseInt(newGirlsCountCollege))) {
      toast.error("Enter number of girls (must be a number)");
      return;
    }

    const isDuplicate = updatedStandsCollege.some(
      (stand) => stand.name.toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      toast.error("This stand name already exists");
      return;
    }

    const isDuplicateInOtherRoutes = routesCollege.some(
      (route) =>
        route.name !== selectedRouteCollege &&
        route.stands.some((stand) => stand.name.toLowerCase() === trimmedName)
    );

    if (isDuplicateInOtherRoutes) {
      toast.error("This stand name already exists in another route");
      return;
    }

    setUpdatedStandsCollege((prev) => [
      ...prev,
      {
        name: newStandNameCollege.trim(),
        boys: parseInt(newBoysCountCollege),
        girls: parseInt(newGirlsCountCollege),
      },
    ]);

    setNewStandNameCollege("");
    setNewBoysCountCollege("");
    setNewGirlsCountCollege("");
  };

  const handleUpdateStandCountCollege = (index, type, value) => {
    const newValue = parseInt(value);
    if (isNaN(newValue)) return;

    setUpdatedStandsCollege((prev) =>
      prev.map((stand, i) =>
        i === index ? { ...stand, [type]: newValue } : stand
      )
    );
  };

  const handleRemoveUpdatedStandCollege = (index) => {
    setUpdatedStandsCollege((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDayShiftUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const routeMap = {};

      for (let i = 1; i < rows.length; i++) {
        const [standName, boysCount, girlsCount, routeName] = rows[i];

        if (
          !routeName ||
          !standName ||
          boysCount === undefined ||
          girlsCount === undefined
        )
          continue;

        if (!routeMap[routeName]) {
          routeMap[routeName] = {
            name: routeName,
            stands: [],
            totalBoys: 0,
            totalGirls: 0,
          };
        }

        const boys = Number(boysCount);
        const girls = Number(girlsCount);
        routeMap[routeName].stands.push({
          name: standName,
          boys: boys,
          girls: girls,
        });

        routeMap[routeName].totalBoys += boys;
        routeMap[routeName].totalGirls += girls;
      }

      const parsedData = Object.values(routeMap);

      const ipcRenderer = getIpcRenderer();
      setRoutes(parsedData);
      console.log(...parsedData);

      await ipcRenderer.invoke("insert-route-dummy", parsedData);
      fetchRoutes();
      setLastUpdatedDay(new Date());
      toast.success("Day shift data applied from Excel successfully!");
    };

    reader.readAsBinaryString(file);
  };

  const handleBusUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const busData = [];

      for (let i = 1; i < rows.length; i++) {
        const [number, capacity] = rows[i];

        if (!number || capacity === undefined) continue;

        busData.push({
          number: String(number),
          capacity: Number(capacity),
          isActive: true,
        });
      }

      toast.success("Bus data uploaded successfully!");

      const ipcRenderer = getIpcRenderer();
      console.log(...busData);

      await ipcRenderer.invoke("insert-bus-dummy", busData);
      fetchBuses();
    };

    reader.readAsBinaryString(file);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const routeMap = {};

      for (let i = 1; i < rows.length; i++) {
        const [standName, boysCount, routeName] = rows[i];

        if (!routeName || !standName || boysCount === undefined) continue;

        if (!routeMap[routeName]) {
          routeMap[routeName] = {
            name: routeName,
            stands: [],
            totalBoys: 0,
          };
        }

        const boys = Number(boysCount);
        routeMap[routeName].stands.push({
          name: standName,
          boys: boys,
        });

        routeMap[routeName].totalBoys += boys;
      }

      const parsedData = Object.values(routeMap);

      const ipcRenderer = getIpcRenderer();
      setRoutes2(parsedData);
      console.log(...parsedData);

      await ipcRenderer.invoke("insert-route-morning-dummy", parsedData);
      fetchRoutes2();
      setLastUpdatedMorning(new Date());
      toast.success("Data applied from Excel Successfully!");
    };

    reader.readAsBinaryString(file);
  };

  const fetchRoutes = async () => {
    try {
      const ipcRenderer = getIpcRenderer();
      const res = await ipcRenderer.invoke("fetch-routes");
      setRoutes(res.data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("Failed to load routes");
    }
  };

  const fetchRoutes2 = async () => {
    try {
      const ipcRenderer = getIpcRenderer();
      const res = await ipcRenderer.invoke("fetch-routes-morning");
      setRoutes2(res.data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("Failed to load routes");
    }
  };

  const fetchBuses = async () => {
    try {
      const ipcRenderer = getIpcRenderer();
      const res = await ipcRenderer.invoke("fetch-buses");
      setBuses(res.data || []);
      setActiveBuses(res.data || []);
    } catch (err) {
      console.error("Error fetching buses:", err);
      toast.error("Failed to load buses");
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchRoutes2();
  }, []);

  useEffect(() => {
    if (isShow === 1 || isShow === 2 || isShow === 5) {
      fetchBuses();
    }
  }, [isShow]);

  const handleChangeRouteName = (e) => setRouteName(e.target.value);
  const handleChangeRouteName2 = (e) => setRouteName2(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "NumpadEnter" || e.key === ",") {
      e.preventDefault();
      const forbiddenCharsRegex =
        /[!@#$%^&*()_+{}:"<>?|~`0-9\-=\[\];'\/><.,\\]/g;
      let cleanedInput = input.replace(forbiddenCharsRegex, "").trim();
      const words = cleanedInput.split(/\s+/);
      cleanedInput = words.length === 1 ? words[0] : words.join(" ");
      const newStand = cleanedInput.toLowerCase();

      if (!cleanedInput) {
        toast.error("Space-only or empty names are not allowed");
        return;
      }

      if (!boysCount || isNaN(parseInt(boysCount))) {
        toast.error("Enter number of boys (must be a number)");
        return;
      }

      if (!girlsCount || isNaN(parseInt(girlsCount))) {
        toast.error("Enter number of girls (must be a number)");
        return;
      }

      const isDuplicateInCurrent = standName.some(
        (stand) => stand.name.trim().toLowerCase() === newStand
      );

      if (isDuplicateInCurrent) {
        toast.error("This stand name has already been added");
        return;
      }

      const isDuplicateInRoutes = routes.some((route) =>
        route.stands.some(
          (stand) => stand.name.trim().toLowerCase() === newStand
        )
      );

      if (isDuplicateInRoutes) {
        toast.error("This stand name already exists in another route");
        return;
      }

      setStandName((prev) => [
        ...prev,
        {
          name: cleanedInput,
          boys: parseInt(boysCount),
          girls: parseInt(girlsCount),
        },
      ]);

      setBoysCount("");
      setGirlsCount("");
      setInput("");
    }
  };

  const handleKeyDown2 = (e) => {
    if (e.key === "Enter" || e.key === "NumpadEnter" || e.key === ",") {
      e.preventDefault();
      const forbiddenCharsRegex =
        /[!@#$%^&*()_+{}:"<>?|~`0-9\-=\[\];'\/><.,\\]/g;
      let cleanedInput = input2.replace(forbiddenCharsRegex, "").trim();
      const words = cleanedInput.split(/\s+/);
      cleanedInput = words.length === 1 ? words[0] : words.join(" ");
      const newStand = cleanedInput.toLowerCase();

      if (!cleanedInput) {
        toast.error("Space-only or empty names are not allowed");
        return;
      }

      if (!boysCount2 || isNaN(parseInt(boysCount2))) {
        toast.error("Enter number of boys (must be a number)");
        return;
      }

      const isDuplicateInCurrent = standName2.some(
        (stand) => stand.name.trim().toLowerCase() === newStand
      );

      if (isDuplicateInCurrent) {
        toast.error("This stand name has already been added");
        return;
      }

      const isDuplicateInRoutes = routes2.some((route) =>
        route.stands.some(
          (stand) => stand.name.trim().toLowerCase() === newStand
        )
      );

      if (isDuplicateInRoutes) {
        toast.error("This stand name already exists in another route");
        return;
      }

      setStandName2((prev) => [
        ...prev,
        {
          name: cleanedInput,
          boys: parseInt(boysCount2),
        },
      ]);

      setBoysCount2("");
      setInput2("");
    }
  };

  const handleChange = (e) => setInput(e.target.value);
  const handleChange2 = (e) => setInput2(e.target.value);

  const handleRemoveStand = (index) => {
    setStandName((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveStand2 = (index) => {
    setStandName2((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRoute = async () => {
    const routeNameValue = routeName.trim().toLowerCase();

    if (!routeNameValue) {
      toast.error("Enter route name");
      return;
    }

    if (!standName.length) {
      toast.error("Add at least one stand");
      return;
    }

    if (routes.some((route) => route.name.toLowerCase() === routeNameValue)) {
      toast.error("This route name already exists");
      return;
    }

    try {
      const totalBoys = standName.reduce((acc, curr) => acc + curr.boys, 0);
      const totalGirls = standName.reduce((acc, curr) => acc + curr.girls, 0);

      const ipcRenderer = getIpcRenderer();
      await ipcRenderer.invoke("insert-route", {
        name: routeName.trim(),
        stands: [...standName],
        totalBoys,
        totalGirls,
      });

      await fetchRoutes();
      setRouteName("");
      setStandName([]);
      setBoysCount("");
      setGirlsCount("");
      toast.success("Route added successfully");
    } catch (err) {
      console.error("Error inserting route:", err);
      toast.error("Failed to add route");
    }
  };

  const handleAddRoute2 = async () => {
    const routeNameValue = routeName2.trim().toLowerCase();

    if (!routeNameValue) {
      toast.error("Enter route name");
      return;
    }

    if (!standName2.length) {
      toast.error("Add at least one stand");
      return;
    }

    if (routes2.some((route) => route.name.toLowerCase() === routeNameValue)) {
      toast.error("This route name already exists");
      return;
    }

    try {
      const totalBoys = standName2.reduce((acc, curr) => acc + curr.boys, 0);

      const ipcRenderer = getIpcRenderer();
      await ipcRenderer.invoke("insert-route-morning", {
        name: routeName2.trim(),
        stands: [...standName2],
        totalBoys,
      });

      await fetchRoutes2();
      setRouteName2("");
      setStandName2([]);
      setBoysCount2("");
      toast.success("Route added successfully");
    } catch (err) {
      console.error("Error inserting route:", err);
      toast.error("Failed to add route");
    }
  };

  const handleDeleteRoute = (index) => {
    const routeToDelete = routes[index];
    if (!routeToDelete) return;

    setItemToDelete({
      type: "route",
      index,
      name: routeToDelete.name,
    });
    setDeleteType("route");
    setShowDeleteConfirm(true);
  };

  const handleDeleteRoute2 = (index) => {
    const routeToDelete = routes2[index];
    if (!routeToDelete) return;

    setItemToDelete2({
      type: "route",
      index,
      name: routeToDelete.name,
    });
    setShowDeleteConfirm2(true);
  };

  const handleDeleteBus = (busNumber) => {
    setItemToDelete({
      type: "bus",
      name: busNumber,
    });
    setDeleteType("bus");
    setShowDeleteConfirm(true);
  };

  const handleToggleBusStatus = async (busNumber, newStatus) => {
    try {
      const ipcRenderer = getIpcRenderer();
      await ipcRenderer.invoke("update-bus-status", {
        number: busNumber,
        isActive: newStatus,
      });

      setBuses((prev) =>
        prev.map((bus) =>
          bus.number === busNumber ? { ...bus, isActive: newStatus } : bus
        )
      );

      toast.success(`Bus ${newStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      console.error("Error updating bus status:", err);
      toast.error("Failed to update status");
    }
  };

  const confirmDeletion = async () => {
    if (!itemToDelete) return;

    try {
      const ipcRenderer = getIpcRenderer();

      if (itemToDelete.type === "route") {
        const result = await ipcRenderer.invoke(
          "delete-route",
          itemToDelete.name
        );

        if (result?.success) {
          await fetchRoutes();
          toast.success("Route deleted successfully");
        } else {
          toast.error("Failed to delete route");
        }
      } else if (itemToDelete.type === "bus") {
        const result = await ipcRenderer.invoke(
          "delete-bus",
          itemToDelete.name
        );

        if (result?.success) {
          await fetchBuses();
          toast.success("Bus deleted successfully");
        } else {
          toast.error("Failed to delete bus");
        }
      } else if (itemToDelete.type === "route-college") {
        const result = await ipcRenderer.invoke(
          "delete-route-college",
          itemToDelete.name
        );

        if (result?.success) {
          await fetchRoutesCollege();
          toast.success("College route deleted successfully");
        } else {
          toast.error("Failed to delete route");
        }
      }
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Deletion failed");
    }

    setShowDeleteConfirm(false);
    setItemToDelete(null);
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const confirmDeletion2 = async () => {
    if (!itemToDelete2) return;

    try {
      const ipcRenderer = getIpcRenderer();

      if (itemToDelete2.type === "route") {
        const result = await ipcRenderer.invoke(
          "delete-route-morning",
          itemToDelete2.name
        );

        if (result?.success) {
          await fetchRoutes2();
          toast.success("Route deleted successfully");
        } else {
          toast.error("Failed to delete route");
        }
      }
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Deletion failed");
    }

    setShowDeleteConfirm2(false);
    setItemToDelete2(null);
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const cancelDeletion = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const cancelDeletion2 = () => {
    setShowDeleteConfirm2(false);
    setItemToDelete2(null);
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const handleAddBus = async () => {
    const totalBusCapacity = buses.reduce(
      (acc, bus) => acc + (bus.capacity || 0),
      0
    );
    setTotalBusCapacity(totalBusCapacity);

    if (!busNumber.trim()) {
      toast.error("Enter bus number");
      return;
    }

    if (!busCapacity || parseInt(busCapacity) <= 0) {
      toast.error("Enter valid bus capacity");
      return;
    }

    const busExists = buses.some(
      (bus) => bus.number.toLowerCase() === busNumber.trim().toLowerCase()
    );

    if (busExists) {
      toast.error("This bus number already exists");
      return;
    }

    try {
      const ipcRenderer = getIpcRenderer();
      await ipcRenderer.invoke("insert-bus", {
        number: busNumber.trim(),
        capacity: parseInt(busCapacity),
        isActive: true,
      });

      await fetchBuses();
      setBusNumber("");
      setBusCapacity("");
      toast.success("Bus added successfully");
    } catch (err) {
      console.error("Error adding bus:", err);
      toast.error("Failed to add bus");
    }
  };

  const handleUpdateRoute = async () => {
    if (!selectedRoute) {
      toast.error("Please select a route");
      return;
    }

    if (!updatedStands.length) {
      toast.error("Add at least one stand");
      return;
    }

    try {
      const totalBoys = updatedStands.reduce(
        (acc, curr) => acc + Number(curr.boys || 0),
        0
      );
      const totalGirls = updatedStands.reduce(
        (acc, curr) => acc + Number(curr.girls || 0),
        0
      );

      const ipcRenderer = getIpcRenderer();
      const result = await ipcRenderer.invoke("update-route", {
        name: selectedRoute,
        stands: updatedStands,
        totalBoys,
        totalGirls,
      });

      if (result?.success) {
        await fetchRoutes();
        resetForm();
        toast.success("Route updated successfully");
      } else {
        const errorMsg = result?.error || "Failed to update route";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error updating route:", err);
      toast.error("Route update failed");
    }
  };

  const resetForm = () => {
    setSelectedRoute("");
    setUpdatedStands([]);
    setNewStandName("");
    setNewBoysCount("");
    setNewGirlsCount("");
  };

  const handleAddNewStand = () => {
    const trimmedName = newStandName.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("Enter stand name");
      return;
    }

    if (!newBoysCount || isNaN(parseInt(newBoysCount))) {
      toast.error("Enter number of boys (must be a number)");
      return;
    }

    if (!newGirlsCount || isNaN(parseInt(newGirlsCount))) {
      toast.error("Enter number of girls (must be a number)");
      return;
    }

    const isDuplicate = updatedStands.some(
      (stand) => stand.name.toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      toast.error("This stand name already exists");
      return;
    }

    const isDuplicateInOtherRoutes = routes.some(
      (route) =>
        route.name !== selectedRoute &&
        route.stands.some((stand) => stand.name.toLowerCase() === trimmedName)
    );

    if (isDuplicateInOtherRoutes) {
      toast.error("This stand name already exists in another route");
      return;
    }

    setUpdatedStands((prev) => [
      ...prev,
      {
        name: newStandName.trim(),
        boys: parseInt(newBoysCount),
        girls: parseInt(newGirlsCount),
      },
    ]);

    setNewStandName("");
    setNewBoysCount("");
    setNewGirlsCount("");
  };

  const handleUpdateStandCount = (index, type, value) => {
    const newValue = parseInt(value);
    if (isNaN(newValue)) return;

    setUpdatedStands((prev) =>
      prev.map((stand, i) =>
        i === index ? { ...stand, [type]: newValue } : stand
      )
    );
  };

  const handleRemoveUpdatedStand = (index) => {
    setUpdatedStands((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRouteMorning = async () => {
    if (!selectedRouteMorning) {
      toast.error("Please select a route");
      return;
    }

    if (!updatedStandsMorning.length) {
      toast.error("Add at least one stand");
      return;
    }

    try {
      const totalBoys = updatedStandsMorning.reduce(
        (acc, curr) => acc + curr.boys,
        0
      );

      const ipcRenderer = getIpcRenderer();
      const result = await ipcRenderer.invoke("update-route-morning", {
        name: selectedRouteMorning,
        stands: updatedStandsMorning,
        totalBoys,
      });

      if (result?.success) {
        await fetchRoutes2();
        setSelectedRouteMorning("");
        setUpdatedStandsMorning([]);
        setNewStandNameMorning("");
        setNewBoysCountMorning("");
        toast.success("Morning shift route updated successfully");
      } else {
        toast.error("Failed to update route");
      }
    } catch (err) {
      console.error("Error updating morning route:", err);
      toast.error("Route update failed");
    }
  };

  const handleAddNewStandMorning = () => {
    const trimmedName = newStandNameMorning.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("Enter stand name");
      return;
    }

    if (!newBoysCountMorning || isNaN(parseInt(newBoysCountMorning))) {
      toast.error("Enter number of boys (must be a number)");
      return;
    }

    const isDuplicate = updatedStandsMorning.some(
      (stand) => stand.name.toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      toast.error("This stand name already exists");
      return;
    }

    const isDuplicateInOtherRoutes = routes2.some(
      (route) =>
        route.name !== selectedRouteMorning &&
        route.stands.some((stand) => stand.name.toLowerCase() === trimmedName)
    );

    if (isDuplicateInOtherRoutes) {
      toast.error("This stand name already exists in another route");
      return;
    }

    setUpdatedStandsMorning((prev) => [
      ...prev,
      {
        name: newStandNameMorning.trim(),
        boys: parseInt(newBoysCountMorning),
      },
    ]);

    setNewStandNameMorning("");
    setNewBoysCountMorning("");
  };

  const handleUpdateStandCountMorning = (index, value) => {
    const newValue = parseInt(value);
    if (isNaN(newValue)) return;

    setUpdatedStandsMorning((prev) =>
      prev.map((stand, i) =>
        i === index ? { ...stand, boys: newValue } : stand
      )
    );
  };

  const handleRemoveUpdatedStandMorning = (index) => {
    setUpdatedStandsMorning((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetDatabase = async () => {
    try {
      const ipcRenderer = getIpcRenderer();
      const result = await ipcRenderer.invoke("reset-database");

      if (result?.success) {
        await fetchRoutes();
        await fetchRoutes2();
        fetchRoutesCollege();
        await fetchBuses();
        toast.success("Database reset successfully");
      } else {
        toast.error("Failed to reset database");
      }
    } catch (err) {
      console.error("Error resetting database:", err);
      toast.error("Database reset failed");
    }
  };

  return (
    <div
      ref={mainContentRef}
      tabIndex="-1"
      className="flex min-h-screen overflow-x-hidden font-[gilroy] bg-[#F5F5FF] text-[#2F1C6A] -800"
    >
      {/* Delete Confirmation Modals */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">
              {deleteType === "route" ? "Delete Route" : "Delete Bus"}
            </h3>
            <p className="mb-6">
              Are you sure you want to delete "{itemToDelete.name}"?
            </p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelDeletion}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={confirmDeletion}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showDeleteConfirm2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Delete Route</h3>
            <p className="mb-6">
              Are you sure you want to delete "{itemToDelete2.name}" route?
            </p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelDeletion2}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={confirmDeletion2}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="fixed top-3 right-20 z-50 flex gap-2">
        <div className="bg-white rounded-lg shadow-md p-3 min-w-[200px]">
          <div className="text-xs text-gray-600 mb-1">Last Updated:</div>
          <div className="text-sm font-medium text-gray-800">
            {isShow === 0 && lastUpdatedDay && (
              <span>Day: {lastUpdatedDay.toLocaleString()}</span>
            )}
            {isShow === 4 && lastUpdatedMorning && (
              <span>Morning: {lastUpdatedMorning.toLocaleString()}</span>
            )}
            {isShow === 6 && lastUpdatedCollege && (
              <span>College: {lastUpdatedCollege.toLocaleString()}</span>
            )}
            {((isShow === 0 && !lastUpdatedDay) || 
              (isShow === 4 && !lastUpdatedMorning) || 
              (isShow === 6 && !lastUpdatedCollege)) && (
              <span className="text-gray-500">No data imported yet</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 min-w-[200px]">
          <div className="text-xs text-gray-600 mb-1">Seat Status:</div>
          <div className="text-sm font-medium">
            {isShow === 0 && (
              <span className={
                buses.length === 0 || activeBusCapacity === 0
                  ? "text-gray-500" 
                  : totalDayStudents === 0 
                    ? "text-gray-500" 
                    : daySeatsNeeded > 0 
                      ? "text-red-600" 
                      : "text-green-600"
              }>
                {buses.length === 0 || activeBusCapacity === 0
                  ? "No bus added"
                  : totalDayStudents === 0
                    ? "No data"
                    : daySeatsNeeded > 0 
                  ? `${daySeatsNeeded} more seats needed`
                  : "Seats are sufficient"
                }
              </span>
            )}
            {isShow === 4 && (
              <span className={
                buses.length === 0 || activeBusCapacity === 0
                  ? "text-gray-500" 
                  : totalMorningStudents === 0 
                    ? "text-gray-500" 
                    : morningSeatsNeeded > 0 
                      ? "text-red-600" 
                      : "text-green-600"
              }>
                {buses.length === 0 || activeBusCapacity === 0
                  ? "No bus added"
                  : totalMorningStudents === 0
                    ? "No data"
                    : morningSeatsNeeded > 0 
                  ? `${morningSeatsNeeded} more seats needed`
                  : "Seats are sufficient"
                }
              </span>
            )}
            {isShow === 6 && (
              <span className={
                buses.length === 0 || activeBusCapacity === 0
                  ? "text-gray-500" 
                  : totalCollegeStudents === 0 
                    ? "text-gray-500" 
                    : collegeSeatsNeeded > 0 
                      ? "text-red-600" 
                      : "text-green-600"
              }>
                {buses.length === 0 || activeBusCapacity === 0
                  ? "No bus added"
                  : totalCollegeStudents === 0
                    ? "No data"
                    : collegeSeatsNeeded > 0 
                  ? `${collegeSeatsNeeded} more seats needed`
                  : "Seats are sufficient"
                }
              </span>
            )}
            {![0, 4, 6].includes(isShow) && (
              <span className="text-gray-500">Not applicable</span>
            )}
          </div>
        </div>
      </div>

      <Link
        to="/"
        className="fixed top-5 right-5 z-50 bg-purple-500 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:bg-purple-600 transition-colors"
        title="Go back"
      >
        <FaArrowLeftLong />
      </Link>

      <div className="w-64 bg-purple-100 shadow-md fixed h-screen p-5 z-10">
        <div className="text-center pb-5 border-b border-gray-200 mb-5">
          <img
            src="bcpsc.png"
            alt="School Logo"
            className="max-w-[50%] mx-auto mb-2"
          />
          <div className="text-xl font-bold text-[#2F1C6A]">Settings Menu</div>
        </div>

        <ul className="space-y-2">
          {tabs.slice(0, 3).map((tab) => (
            <motion.li
              key={tab.id}
              initial={false}
              animate={{
                backgroundColor:
                  isShow === tab.id ? "rgb(243 232 255)" : "transparent",
              }}
              className={`${
                isShow === tab.id
                  ? "text-purple-700 font-medium"
                  : "text-[#2F1C6A] hover:bg-purple-50"
              } flex items-center p-3 cursor-pointer relative rounded-lg`}
              onClick={() => setIsShow(tab.id)}
            >
              {isShow === tab.id && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-lg"
                  layoutId="leftBorder"
                />
              )}
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.li>
          ))}

          <div className="fixed left-6 bottom-10 w-52">
            {tabs.slice(3).map((tab) => (
              <motion.li
                key={tab.id}
                initial={false}
                animate={{
                  backgroundColor:
                    isShow === tab.id ? "rgb(243 232 255)" : "transparent",
                }}
                className={`${
                  isShow === tab.id
                    ? "text-purple-700 font-medium"
                    : "text-[#2F1C6A] hover:bg-purple-50"
                } flex items-center p-3 cursor-pointer relative rounded-lg`}
                onClick={() => setIsShow(tab.id)}
              >
                {isShow === tab.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-lg"
                    layoutId="leftBorder"
                  />
                )}
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.li>
            ))}
          </div>
        </ul>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isShow}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ml-64 p-8 ${isShow !== 6 ? "hidden" : ""}`}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#2F1C6A] -800">
              College Shift
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-xl font-bold mb-5 flex items-center">
                  Route Management
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummyCollege(true)}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Add From Excel
              </motion.button>
            </div>

            <div className="flex gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 font-bold">Route Name</label>
                <input
                  value={routeNameCollege}
                  onChange={(e) => setRouteNameCollege(e.target.value)}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="e.g., Route 1"
                />
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  Boys Count
                </label>
                <input
                  type="number"
                  value={boysCountCollege}
                  onChange={(e) => setBoysCountCollege(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="e.g., 25"
                  min="0"
                />
              </div>
              <div className="w-full md:w-1/2 px-3">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  Girls Count
                </label>
                <input
                  type="number"
                  value={girlsCountCollege}
                  onChange={(e) => setGirlsCountCollege(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="e.g., 25"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-bold">
                Stands (Separate with Comma or Enter)
              </label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[50px] items-center">
                {standNameCollege.map((stand, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-[#3498DB] text-white gap-2 border border-gray-300 rounded-full py-3 px-4"
                  >
                    <span className="font-bold">
                      {stand.name} ({stand.boys} boys, {stand.girls} girls)
                    </span>
                    <button
                      onClick={() => handleRemoveStandCollege(index)}
                      className="text-white cursor-pointer"
                    >
                      <ImCross
                        className="hover:rotate-90 duration-200 transition-all"
                        size={15}
                      />
                    </button>
                  </motion.div>
                ))}
                <input
                  type="text"
                  value={inputCollege}
                  onChange={(e) => setInputCollege(e.target.value)}
                  onKeyDown={handleKeyDownCollege}
                  className="flex-1 min-w-[100px] p-2 border-none outline-none"
                  placeholder="Enter stand name"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRouteCollege}
              className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
            >
              Add Route
            </motion.button>

            <div className="w-full mt-8">
              <h3 className="mb-4">All Routes List</h3>
              <table className="w-full mt-5">
                <thead className="bg-[#8B5DFF]">
                  <tr className="text-white rounded-tl-lg text-left">
                    <th className="p-3 border-b-2 border-gray-200">
                      Route Name
                    </th>
                    <th className="p-3 border-b-2 border-gray-200">Stands</th>
                    <th className="p-3 border-b-2 border-gray-200">Boys</th>
                    <th className="p-3 border-b-2 border-gray-200">Girls</th>
                    <th className="p-3 border-b-2 border-gray-200">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {routesCollege.length > 0 ? (
                    routesCollege.map((route, index) => (
                      <tr key={index}>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.name}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.stands.map((stand) => stand.name).join(", ")}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.totalBoys}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.totalGirls}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteRouteCollege(index)}
                            className="px-6 py-2 rounded-lg 
                 border   
               backdrop-blur-md 
               text-white   font-semibold 
                 cursor-pointer   hover:scale-120
               transition duration-300"
                          >
                            <FaRegTrashAlt className="text-black" />
                          </motion.button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-3 text-center text-[#2F1C6A] -500"
                      >
                        No routes found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="p-3">Total</td>
                    <td className="p-3"></td>
                    <td className="p-3">
                      {routesCollege.reduce(
                        (acc, route) => acc + (route.totalBoys || 0),
                        0
                      )}
                    </td>
                    <td className="p-3">
                      {routesCollege.reduce(
                        (acc, route) => acc + (route.totalGirls || 0),
                        0
                      )}
                    </td>
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={isShow}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ml-64 p-8 ${isShow !== 7 ? "hidden" : ""}`}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#2F1C6A] -800">
              Update Route (College Shift)
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-5 flex items-center">
              <span className="mr-2">🔄</span> Update College Shift Route
            </h2>

            <div className="mb-5">
              <label className="block mb-2 font-bold">Select Route</label>
              <select
                value={selectedRouteCollege}
                onChange={(e) => setSelectedRouteCollege(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none"
              >
                <option value="">Select a route</option>
                {routesCollege.map((route) => (
                  <option key={route.name} value={route.name}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedRouteCollege && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Stands</h3>
                  <div className="space-y-3">
                    {updatedStandsCollege.map((stand, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded"
                      >
                        <div className="font-bold">{stand.name}</div>
                        <div className="flex items-center space-x-3">
                          <div>
                            <label className="block text-sm mb-1">Boys</label>
                            <input
                              type="number"
                              value={stand.boys}
                              onChange={(e) =>
                                handleUpdateStandCountCollege(
                                  index,
                                  "boys",
                                  e.target.value
                                )
                              }
                              className="w-20 p-2 border border-gray-300 rounded"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Girls</label>
                            <input
                              type="number"
                              value={stand.girls}
                              onChange={(e) =>
                                handleUpdateStandCountCollege(
                                  index,
                                  "girls",
                                  e.target.value
                                )
                              }
                              className="w-20 p-2 border border-gray-300 rounded"
                              min="0"
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveUpdatedStandCollege(index)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <ImCross />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-lg font-semibold mb-3">Add New Stand</h3>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/3 px-3 mb-4">
                      <label className="block mb-2">Stand Name</label>
                      <input
                        type="text"
                        value={newStandNameCollege}
                        onChange={(e) => setNewStandNameCollege(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Stand name"
                      />
                    </div>
                    <div className="w-full md:w-1/4 px-3 mb-4">
                      <label className="block mb-2">Boys Count</label>
                      <input
                        type="number"
                        value={newBoysCountCollege}
                        onChange={(e) => setNewBoysCountCollege(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Boys"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/4 px-3 mb-4">
                      <label className="block mb-2">Girls Count</label>
                      <input
                        type="number"
                        value={newGirlsCountCollege}
                        onChange={(e) =>
                          setNewGirlsCountCollege(e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Girls"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/6 px-3 mb-4 flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNewStandCollege}
                        className="px-6 py-2 rounded-lg 
               bg-green-600 border border-green-600/20 
               backdrop-blur-md 
               text-white hover:text-green-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateRouteCollege}
                    className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
                  >
                    Update
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRouteCollege("");
                      setUpdatedStandsCollege([]);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-bold"
                  >
                    Reset
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={isShow}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ml-64 p-8 ${isShow !== 0 ? "hidden" : ""}`}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#2F1C6A] -800">
              Day Shift
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-xl font-bold mb-5 flex items-center">
                  Route Management
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummy3(true)}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Add From Excel
              </motion.button>
            </div>

            <div className="flex gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 font-bold">Route Name</label>
                <input
                  value={routeName}
                  onChange={handleChangeRouteName}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="e.g., Route 1"
                />
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  Boys Count
                </label>
                <input
                  type="number"
                  value={boysCount}
                  onChange={(e) => setBoysCount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="e.g., 25"
                  min="0"
                />
              </div>
              <div className="w-full md:w-1/2 px-3">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  Girls Count
                </label>
                <input
                  type="number"
                  value={girlsCount}
                  onChange={(e) => setGirlsCount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="e.g., 25"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-bold">
                Stands (Separate with Comma or Enter)
              </label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[50px] items-center">
                {standName.map((stand, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-[#3498DB] text-white gap-2 border border-gray-300 rounded-full py-3 px-4"
                  >
                    <span className="font-bold">
                      {stand.name} ({stand.boys} boys, {stand.girls} girls)
                    </span>
                    <button
                      onClick={() => handleRemoveStand(index)}
                      className="text-white cursor-pointer"
                    >
                      <ImCross
                        className="hover:rotate-90 duration-200 transition-all"
                        size={15}
                      />
                    </button>
                  </motion.div>
                ))}
                <input
                  type="text"
                  value={input}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-w-[100px] p-2 border-none outline-none"
                  placeholder="Enter stand name"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRoute}
              className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
            >
              Add Route
            </motion.button>

            <div className="w-full mt-8">
              <h3 className="mb-4">All Routes List</h3>
              <table className="w-full mt-5">
                <thead className="bg-[#8B5DFF]">
                  <tr className="text-white  rounded-tl-lg  text-left">
                    <th className="p-3 border-b-2 border-gray-200">
                      Route Name
                    </th>
                    <th className="p-3 border-b-2 border-gray-200">Stands</th>
                    <th className="p-3 border-b-2 border-gray-200">Boys</th>
                    <th className="p-3 border-b-2 border-gray-200">Girls</th>
                    <th className="p-3 border-b-2 border-gray-200">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.length > 0 ? (
                    routes.map((route, index) => (
                      <tr key={index}>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.name}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.stands.map((stand) => stand.name).join(", ")}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.totalBoys}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.totalGirls}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteRoute(index)}
                            className="px-6 py-2 rounded-lg 
                 border   
               backdrop-blur-md 
               text-white   font-semibold 
                 cursor-pointer   hover:scale-120
               transition duration-300"
                          >
                            <FaRegTrashAlt className="text-black" />
                          </motion.button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-3 text-center text-[#2F1C6A] -500"
                      >
                        No routes found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="p-3">Total</td>
                    <td className="p-3"></td>
                    <td className="p-3">
                      {routes.reduce(
                        (acc, route) => acc + (route.totalBoys || 0),
                        0
                      )}
                    </td>
                    <td className="p-3">
                      {routes.reduce(
                        (acc, route) => acc + (route.totalGirls || 0),
                        0
                      )}
                    </td>
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={isShow}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ml-64 p-8 ${isShow !== 1 ? "hidden" : ""}`}
          id="bus-management"
        >
          <h1 className="text-2xl font-bold mb-4">Bus Management</h1>
          <div className="border-b border-gray-200 w-full"></div>

          <div className="shadow-lg rounded-sm p-10 mb-4 mt-8">
            <div className="flex gap-5 mb-4">
              <div className="flex-1">
                <label className="block font-bold mb-2">Bus Number</label>
                <input
                  type="text"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 01"
                />
              </div>
              <div className="flex-1">
                <label className="block font-bold mb-2">Capacity</label>
                <input
                  type="number"
                  value={busCapacity}
                  onChange={(e) => setBusCapacity(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 40"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-5 justify-between">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddBus}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Add Bus
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDummy2(true)}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Add Bus from Excel
              </motion.button>
            </div>

            <div className="mt-8 mb-4 flex justify-between text-lg font-semibold">
              <h1>All Buses List</h1>
              <div className="flex gap-4">
                <div className="bg-purple-5 shadow-2xl border-3 border-[#673DE6] px-3 py-1 rounded">
                  Active Capacity: {activeBusCapacity}
                </div>
                <div className="bg-purple-500 drop-shadow-2xl text-white px-3 py-2 rounded">
                  Total Capacity: {totalBusCapacity}
                </div>
              </div>
            </div>
            <table className="w-full mt-5">
              <thead className="bg-[#8B5DFF] ">
                <tr className="bg-gray-10 text-white">
                  <th className="p-3 text-left font-bold border-b-2 border-gray-200">
                    Bus Number
                  </th>
                  <th className="p-3 text-left font-bold border-b-2 border-gray-200">
                    Capacity
                  </th>
                  <th className="p-3 text-left font-bold border-b-2 border-gray-200">
                    Status
                  </th>
                  <th className="p-3 text-left font-bold border-b-2 border-gray-200">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {buses.length > 0 ? (
                  buses.map((bus, index) => {
                    const isActive =
                      typeof bus.isActive === "boolean" ? bus.isActive : true;

                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="p-3">{bus.number}</td>
                        <td className="p-3 fot">{bus.capacity} Students</td>
                        <td className="p-3 flex items-center">
                          <Switch
                            checked={isActive}
                            onChange={() =>
                              handleToggleBusStatus(bus.number, !isActive)
                            }
                            className={`${
                              isActive ? "bg-purple-600" : "bg-gray-400"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                          >
                            <span className="sr-only">Toggle bus status</span>
                            <span
                              className={`${
                                isActive ? "translate-x-6" : "translate-x-1"
                              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                          </Switch>
                          <span className="ml-2 text-sm">
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteBus(bus.number)}
                            className="px-6 py-2 rounded-lg 
                  
               backdrop-blur-md 
               text-white   font-semibold 
                 cursor-pointer   hover:scale-120
               transition duration-300"
                          >
                            <FaRegTrashAlt className="text-black" />
                          </motion.button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-3 text-center text-[#2F1C6A] -500"
                    >
                      No buses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={isShow}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ml-64 p-8 ${isShow !== 2 ? "hidden" : ""}`}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#2F1C6A] -800">
              Update Route (Day Shift)
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-5 flex items-center">
              <span className="mr-2">🔄</span> Update Route
            </h2>

            <div className="mb-5">
              <label className="block mb-2 font-bold">Select Route</label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none"
              >
                <option value="">Select a route</option>
                {routes.map((route) => (
                  <option key={route.name} value={route.name}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedRoute && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Stands</h3>
                  <div className="space-y-3">
                    {updatedStands.map((stand, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded"
                      >
                        <div className="font-bold">{stand.name}</div>
                        <div className="flex items-center space-x-3">
                          <div>
                            <label className="block text-sm mb-1">Boys</label>
                            <input
                              type="number"
                              value={stand.boys}
                              onChange={(e) =>
                                handleUpdateStandCount(
                                  index,
                                  "boys",
                                  e.target.value
                                )
                              }
                              className="w-20 p-2 border border-gray-300 rounded"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Girls</label>
                            <input
                              type="number"
                              value={stand.girls}
                              onChange={(e) =>
                                handleUpdateStandCount(
                                  index,
                                  "girls",
                                  e.target.value
                                )
                              }
                              className="w-20 p-2 border border-gray-300 rounded"
                              min="0"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveUpdatedStand(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <ImCross />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-lg font-semibold mb-3">Add New Stand</h3>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/3 px-3 mb-4">
                      <label className="block mb-2">Stand Name</label>
                      <input
                        type="text"
                        value={newStandName}
                        onChange={(e) => setNewStandName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Stand name"
                      />
                    </div>
                    <div className="w-full md:w-1/4 px-3 mb-4">
                      <label className="block mb-2">Boys Count</label>
                      <input
                        type="number"
                        value={newBoysCount}
                        onChange={(e) => setNewBoysCount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Boys"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/4 px-3 mb-4">
                      <label className="block mb-2">Girls Count</label>
                      <input
                        type="number"
                        value={newGirlsCount}
                        onChange={(e) => setNewGirlsCount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Girls"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/6 px-3 mb-4 flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNewStand}
                        className="px-6 py-2 rounded-lg 
               bg-green-600 border border-green-600/20 
               backdrop-blur-md 
               text-white hover:text-green-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateRoute}
                    className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
                  >
                    Update
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRoute("");
                      setUpdatedStands([]);
                    }}
                    className="px-6 py-2 rounded-lg 
               bg-gray-600 border border-gray-600/20 
               backdrop-blur-md 
               text-white hover:text-gray-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
                  >
                    Reset
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={isShow}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ml-64 p-8 ${isShow !== 3 ? "hidden" : ""}`}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#2F1C6A] -800">
              Reset Data
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-5 flex items-center">
              <span className="mr-2">⚠️</span> Reset Database
            </h2>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="text-yellow-700">
                Warning: This operation will delete all route and bus data. Use
                this only when you are sure you want to reset all data.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-10">
              <div className="text-5xl mb-6">🔄</div>
              <h3 className="text-2xl font-bold mb-4">Reset Database</h3>
              <p className="text-[#2F1C6A] -600 mb-8 text-center max-w-md">
                Clicking this button will permanently delete all route and bus
                data. Previously saved data cannot be recovered.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetDatabase}
                className="px-6 py-2 rounded-lg 
               bg-red-600 border border-red-600/20 
               backdrop-blur-md 
               text-white hover:text-red-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Reset Database
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={isShow}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ml-64 p-8 ${isShow !== 4 ? "hidden" : ""}`}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#2F1C6A] -800">
              Morning Shift
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between  items-center">
              <div className="flex items-center">
                <h1 className="text-xl font-bold mb-5 flex items-center">
                  Route Management
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummy(!dummy)}
                className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
              >
                Add From Excel
              </motion.button>
            </div>

            <div className="flex gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 font-bold">Route Name</label>
                <input
                  value={routeName2}
                  onChange={handleChangeRouteName2}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="e.g., Route 1"
                />
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-2/2 px-3 mb-6 md:mb-0">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  Student Number
                </label>
                <input
                  type="number"
                  value={boysCount2}
                  onChange={(e) => setBoysCount2(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="e.g., 25"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-bold">
                Stands (Separate with Comma or Enter)
              </label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[50px] items-center">
                {standName2.map((stand, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center bg-[#3498DB] text-white gap-2 border border-gray-300 rounded-full py-3 px-4"
                  >
                    <span className="font-bold">
                      {stand.name} ({stand.boys} students)
                    </span>
                    <button
                      onClick={() => handleRemoveStand2(index)}
                      className="text-white cursor-pointer"
                    >
                      <ImCross
                        className="hover:rotate-90 duration-200 transition-all"
                        size={15}
                      />
                    </button>
                  </motion.div>
                ))}
                <input
                  type="text"
                  value={input2}
                  onChange={handleChange2}
                  onKeyDown={handleKeyDown2}
                  className="flex-1 min-w-[100px] p-2 border-none outline-none"
                  placeholder="Enter stand name"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRoute2}
              className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
            >
              Add Route
            </motion.button>

            <div className="w-full mt-8">
              <h3 className="mb-4">All Routes List</h3>
              <table className="w-full mt-5">
                <thead className="bg-[#8B5DFF]">
                  <tr className="bg-ray-100 text-white text-left">
                    <th className="p-3 border-b-2 border-gray-200">
                      Route Name
                    </th>
                    <th className="p-3 border-b-2 border-gray-200">Stands</th>
                    <th className="p-3 border-b-2 border-gray-200">Students</th>
                    <th className="p-3 border-b-2 border-gray-200">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {routes2.length > 0 ? (
                    routes2.map((route, index) => (
                      <tr key={index}>
                        <td className="p-3 border-b-2 border-gray-200">
                          {route.name}
                        </td>
                        <td className="p-3 border-b-2  border-gray-200">
                          {route.stands.map((stand) => stand.name).join(", ")}
                        </td>
                        <td className="p-3 border-b-2 text-end border-gray-200">
                          {route.totalBoys}
                        </td>
                        <td className="p-3 border-b-2 border-gray-200">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteRoute2(index)}
                            className="px-6 py-2 rounded-lg 
                 border   
               backdrop-blur-md 
               text-white   font-semibold 
                 cursor-pointer   hover:scale-120
               transition duration-300"
                          >
                            <FaRegTrashAlt className="text-black" />
                          </motion.button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-3 text-center text-[#2F1C6A] -500"
                      >
                        No routes found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="p-3">Total</td>
                    <td className="p-3"></td>
                    <td className="p-3 text-end">
                      {routes2.reduce(
                        (acc, route) => acc + (route.totalBoys || 0),
                        0
                      )}
                    </td>
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={isShow}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ml-64 p-8 ${isShow !== 5 ? "hidden" : ""}`}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#2F1C6A] -800">
              Update Route (Morning Shift)
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-5 flex items-center">
              <span className="mr-2">🔄</span> Update Morning Shift Route
            </h2>

            <div className="mb-5">
              <label className="block mb-2 font-bold">Select Route</label>
              <select
                value={selectedRouteMorning}
                onChange={(e) => {
                  setSelectedRouteMorning(e.target.value);
                  if (e.target.value) {
                    const route = routes2.find(
                      (r) => r.name === e.target.value
                    );
                    setUpdatedStandsMorning(route ? [...route.stands] : []);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none"
              >
                <option value="">Select a route</option>
                {routes2.map((route) => (
                  <option key={route.name} value={route.name}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedRouteMorning && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Stands</h3>
                  <div className="space-y-3">
                    {updatedStandsMorning.map((stand, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded"
                      >
                        <div className="font-bold">{stand.name}</div>
                        <div className="flex items-center space-x-3">
                          <div>
                            <label className="block text-sm mb-1">
                              Student Number
                            </label>
                            <input
                              type="number"
                              value={stand.boys}
                              onChange={(e) =>
                                handleUpdateStandCountMorning(
                                  index,
                                  e.target.value
                                )
                              }
                              className="w-20 p-2 border border-gray-300 rounded"
                              min="0"
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveUpdatedStandMorning(index)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <ImCross />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-lg font-semibold mb-3">Add New Stand</h3>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/2 px-3 mb-4">
                      <label className="block mb-2">Stand Name</label>
                      <input
                        type="text"
                        value={newStandNameMorning}
                        onChange={(e) => setNewStandNameMorning(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Stand name"
                      />
                    </div>
                    <div className="w-full md:w-1/3 px-3 mb-4">
                      <label className="block mb-2">Student Number</label>
                      <input
                        type="number"
                        value={newBoysCountMorning}
                        onChange={(e) => setNewBoysCountMorning(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Students"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/6 px-3 mb-4 flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNewStandMorning}
                        className="px-6 py-2 rounded-lg 
               bg-green-600 border border-green-600/20 
               backdrop-blur-md 
               text-white hover:text-green-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateRouteMorning}
                    className="px-6 py-2 rounded-lg 
               bg-purple-600 border border-purple-600/20 
               backdrop-blur-md 
               text-white hover:text-purple-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
                  >
                    Update
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRouteMorning("");
                      setUpdatedStandsMorning([]);
                    }}
                    className="px-6 py-2 rounded-lg 
               bg-gray-600 border border-gray-600/20 
               backdrop-blur-md 
               text-white hover:text-gray-900 font-semibold 
               shadow-md cursor-pointer hover:bg-white/20 
               transition duration-300"
                  >
                    Reset
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {dummyCollege && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 fixed z-99 backdrop-blur-md top-0 right-0 flex justify-center items-center bottom-0 left-0"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="h-64 rounded-2xl flex items-center relative justify-center w-1/3 bg-[#F5F5FF] shadow-2xl"
            >
              <IoClose
                className="absolute top-3 right-3 text-2xl cursor-pointer hover:rotate-90 transition-all duration-200"
                onClick={() => setDummyCollege(false)}
              />
              <label className="cursor-pointer bg-purple-500 transition-all duration-200 text-white px-4 py-2 rounded hover:bg-purple-600">
                Upload College XLSX
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleCollegeUpload}
                  className="hidden"
                />
              </label>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dummy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 fixed z-99 backdrop-blur-md top-0 right-0 flex justify-center items-center bottom-0 left-0"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="h-64 rounded-2xl flex items-center relative justify-center w-1/3 bg-[#F5F5FF] shadow-2xl"
            >
              <IoClose
                className="absolute top-3 right-3 text-2xl cursor-pointer hover:rotate-90 transition-all duration-200"
                onClick={() => setDummy(false)}
              />
              <label className="cursor-pointer bg-purple-500 transition-all duration-200 text-white px-4 py-2 rounded hover:bg-purple-600">
                Upload Morning Shift XLSX
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dummy2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 fixed z-99 backdrop-blur-md top-0 right-0 flex justify-center items-center bottom-0 left-0"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="h-64 rounded-2xl flex items-center relative justify-center w-1/3 bg-[#F5F5FF] shadow-2xl"
            >
              <IoClose
                className="absolute top-3 right-3 text-2xl cursor-pointer hover:rotate-90 transition-all duration-200"
                onClick={() => setDummy2(false)}
              />
              <label className="cursor-pointer bg-purple-500 transition-all duration-200 text-white px-4 py-2 rounded hover:bg-purple-600">
                Upload Buses XLSX
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleBusUpload}
                  className="hidden"
                />
              </label>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dummy3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 fixed z-99 backdrop-blur-md top-0 right-0 flex justify-center items-center bottom-0 left-0"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="h-64 rounded-2xl flex items-center relative justify-center w-1/3 bg-[#F5F5FF] shadow-2xl"
            >
              <IoClose
                className="absolute top-3 right-3 text-2xl cursor-pointer hover:rotate-90 transition-all duration-200"
                onClick={() => setDummy3(false)}
              />
              <label className="cursor-pointer bg-purple-500 transition-all duration-200 text-white px-4 py-2 rounded hover:bg-purple-600">
                Upload Day Shift XLSX
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleDayShiftUpload}
                  className="hidden"
                />
              </label>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;
