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
import { 
  HiOutlineTrash, 
  HiOutlineX,
  HiOutlineSun,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineTruck,
  HiOutlinePencil,
  HiOutlineCog
} from "react-icons/hi";

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
    { id: 0, label: "Day Shift", icon: HiOutlineSun },
    { id: 4, label: "Morning Shift", icon: HiOutlineClock },
    { id: 6, label: "College Shift", icon: HiOutlineAcademicCap },
    { id: 1, label: "Bus Management", icon: HiOutlineTruck },
    { id: 2, label: "Day Update", icon: HiOutlinePencil },
    { id: 5, label: "Morning Update", icon: HiOutlinePencil },
    { id: 7, label: "College Update", icon: HiOutlinePencil },
    { id: 3, label: "Maintenance", icon: HiOutlineCog },
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
      className="flex min-h-screen bg-slate-50 font-[gilroy] text-slate-900 selection:bg-indigo-100"
    >
      {/* Delete Confirmation Modals */}
      <AnimatePresence>
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] backdrop-blur-md bg-black/20 flex items-center justify-center p-6"
            onClick={cancelDeletion}
        >
          <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="premium-card max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={cancelDeletion}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
                <HiOutlineX size={20} />
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  {deleteType === "route" || deleteType === "route-college" ? "Delete Route" : "Delete Bus"}
            </h3>
                <p className="text-slate-500 font-medium">
                  Are you sure you want to delete <span className="font-bold text-slate-900">"{itemToDelete?.name}"</span>? This action cannot be undone.
            </p>
              </div>

              <div className="flex gap-3">
                <button
                onClick={cancelDeletion}
                  className="premium-button-secondary flex-1"
              >
                Cancel
                </button>
                <button
                onClick={confirmDeletion}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
              >
                Delete
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showDeleteConfirm2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] backdrop-blur-md bg-black/20 flex items-center justify-center p-6"
            onClick={cancelDeletion2}
        >
          <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="premium-card max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={cancelDeletion2}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
                <HiOutlineX size={20} />
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Route</h3>
                <p className="text-slate-500 font-medium">
                  Are you sure you want to delete <span className="font-bold text-slate-900">"{itemToDelete2?.name}"</span> route? This action cannot be undone.
            </p>
              </div>

              <div className="flex gap-3">
                <button
                onClick={cancelDeletion2}
                  className="premium-button-secondary flex-1"
              >
                Cancel
                </button>
                <button
                onClick={confirmDeletion2}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
              >
                Delete
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Navigation (Sidebar) */}
      <aside className="w-64 sm:w-72 bg-white border-r border-slate-200/60 fixed h-screen z-20 flex flex-col shadow-sm">
        <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100 mb-2 sm:mb-4 flex flex-col items-center">
          <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-slate-50 p-2 sm:p-2.5 md:p-3 rounded-2xl sm:rounded-3xl shadow-sm mb-2 sm:mb-3 md:mb-4">
            <img src="bcpsc.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-black tracking-tight">System <span className="text-indigo-600">Config</span></h2>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Management Portal</p>
        </div>

        <nav className="flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <p className="px-2 sm:px-3 md:px-4 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Operational Shifts</p>
          {tabs.slice(0, 3).map((tab) => (
              <motion.button
              key={tab.id}
              onClick={() => setIsShow(tab.id)}
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 group ${
                  isShow === tab.id
                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <motion.div
              animate={{
                    scale: isShow === tab.id ? 1.1 : 1,
                    rotate: isShow === tab.id ? 0 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {React.createElement(tab.icon, { 
                    className: `text-lg transition-transform`,
                    size: 20
                  })}
                </motion.div>
                <span className="text-sm font-bold tracking-tight">{tab.label}</span>
              {isShow === tab.id && (
                <motion.div
                    layoutId="activeTab" 
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              </motion.button>
          ))}
          </div>

          <div className="mt-8 space-y-1">
            <p className="px-2 sm:px-3 md:px-4 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Configuration</p>
            {tabs.slice(3).map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setIsShow(tab.id)}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 group ${
                  isShow === tab.id
                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <motion.div
                animate={{
                    scale: isShow === tab.id ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {React.createElement(tab.icon, { 
                    className: `text-lg transition-transform`,
                    size: 20
                  })}
                </motion.div>
                <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                {isShow === tab.id && (
                  <motion.div
                    layoutId="activeTab" 
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            <FaArrowLeftLong /> Exit Settings
          </Link>
      </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 sm:ml-72 min-h-screen relative">
        {/* Top Floating Info Bar */}
        <div className="fixed top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-8 z-30 flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="glass border border-slate-200/50 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-3 sm:gap-4 md:gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Last Data Update</span>
              <div className="text-xs font-bold text-slate-700 mt-1">
                {isShow === 0 && (lastUpdatedDay ? lastUpdatedDay.toLocaleTimeString() : "No data")}
                {isShow === 4 && (lastUpdatedMorning ? lastUpdatedMorning.toLocaleTimeString() : "No data")}
                {isShow === 6 && (lastUpdatedCollege ? lastUpdatedCollege.toLocaleTimeString() : "No data")}
                {![0, 4, 6].includes(isShow) && "System Ready"}
              </div>
            </div>
            
            <div className="w-px h-6 bg-slate-200"></div>

            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Seat Optimization</span>
              <div className={`text-xs font-bold mt-1 ${
                (isShow === 0 && daySeatsNeeded > 0) || (isShow === 4 && morningSeatsNeeded > 0) || (isShow === 6 && collegeSeatsNeeded > 0)
                  ? "text-rose-500" : "text-emerald-500"
              }`}>
                {isShow === 0 && (daySeatsNeeded > 0 ? `${daySeatsNeeded} Required` : "Optimized")}
                {isShow === 4 && (morningSeatsNeeded > 0 ? `${morningSeatsNeeded} Required` : "Optimized")}
                {isShow === 6 && (collegeSeatsNeeded > 0 ? `${collegeSeatsNeeded} Required` : "Optimized")}
                {![0, 4, 6].includes(isShow) && "Functional"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 lg:p-12 pt-16 sm:pt-20 md:pt-24">
      <AnimatePresence mode="wait">
            {isShow === 6 && (
        <motion.div
                key="college-shift"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="premium-card p-4 sm:p-6 md:p-8 lg:p-10"
        >
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900">College Shift</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm italic">Manage routes and student counts for higher education units</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummyCollege(true)}
                    className="premium-button-secondary border-indigo-100 text-indigo-600 hover:bg-indigo-50"
              >
                    Import Data (.xlsx)
              </motion.button>
            </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-slate-200"></span>
                      Route Creation
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Route Designation</label>
                <input
                  value={routeNameCollege}
                  onChange={(e) => setRouteNameCollege(e.target.value)}
                  type="text"
                          className="premium-input text-lg font-bold"
                          placeholder="e.g., North-Bound Express"
                />
              </div>
            </div>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Boys Enrollment</label>
                <input
                  type="number"
                  value={boysCountCollege}
                  onChange={(e) => setBoysCountCollege(e.target.value)}
                        className="premium-input"
                        placeholder="0"
                  min="0"
                />
              </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Girls Enrollment</label>
                <input
                  type="number"
                  value={girlsCountCollege}
                  onChange={(e) => setGirlsCountCollege(e.target.value)}
                        className="premium-input"
                        placeholder="0"
                  min="0"
                />
              </div>
                  </section>


                  <section>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">
                      Stands (Press Enter to add)
              </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[60px] items-center focus-within:ring-2 focus:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                {standNameCollege.map((stand, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center bg-white text-slate-700 gap-3 border border-slate-200 rounded-xl py-2 px-4 shadow-sm group"
                  >
                          <span className="text-sm font-bold">{stand.name}</span>
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{stand.boys}B / {stand.girls}G</span>
                    <button
                      onClick={() => handleRemoveStandCollege(index)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                            <ImCross size={10} />
                    </button>
                  </motion.div>
                ))}
                <input
                  type="text"
                  value={inputCollege}
                  onChange={(e) => setInputCollege(e.target.value)}
                  onKeyDown={handleKeyDownCollege}
                        className="flex-1 min-w-[180px] bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-300"
                        placeholder="Type stand name..."
                />
              </div>
                  </section>

                  <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRouteCollege}
                      className="premium-button-primary w-full py-4 text-base"
                    >
                      Initialize College Route
            </motion.button>
                  </div>


                  <section className="pt-10 border-t border-slate-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-slate-200"></span>
                      Active Route Inventory
                    </h3>
                    
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Designation</th>
                            <th className="px-6 py-4">Stands Coverage</th>
                            <th className="px-6 py-4 text-center">B</th>
                            <th className="px-6 py-4 text-center">G</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                        <tbody className="divide-y divide-slate-50">
                  {routesCollege.length > 0 ? (
                    routesCollege.map((route, index) => (
                              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900">{route.name}</td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {route.stands.map((s, si) => (
                                      <span key={si} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-medium whitespace-nowrap">
                                        {s.name}
                                      </span>
                                    ))}
                                  </div>
                        </td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600">{route.totalBoys}</td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600">{route.totalGirls}</td>
                                <td className="px-6 py-4 text-center">
                                  <button
                            onClick={() => handleDeleteRouteCollege(index)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                                    <HiOutlineTrash size={18} />
                                  </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                              <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No routes registered</td>
                    </tr>
                  )}
                </tbody>
                        {routesCollege.length > 0 && (
                          <tfoot className="bg-slate-50/50 font-black text-slate-900 border-t border-slate-100">
                            <tr>
                              <td className="px-6 py-4">Fleet Summary</td>
                              <td className="px-6 py-4 text-right opacity-40 uppercase text-[10px]">Cumulative Enrollment</td>
                              <td className="px-6 py-4 text-center text-indigo-600">
                                {routesCollege.reduce((acc, route) => acc + (route.totalBoys || 0), 0)}
                    </td>
                              <td className="px-6 py-4 text-center text-indigo-600">
                                {routesCollege.reduce((acc, route) => acc + (route.totalGirls || 0), 0)}
                    </td>
                              <td className="px-6 py-4"></td>
                  </tr>
                </tfoot>
                        )}
              </table>
            </div>
                  </section>
          </div>
        </motion.div>
            )}


            {isShow === 7 && (
        <motion.div
                key="college-update"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="premium-card p-4 sm:p-6 md:p-8 lg:p-10"
        >
                <div className="mb-10 pb-6 border-b border-slate-100">
                  <h1 className="text-3xl font-black text-slate-900">College Route Update</h1>
                  <p className="text-slate-500 font-medium mt-1 text-sm italic">Synchronize student headcounts for existing college routes</p>
          </div>

                <div className="space-y-10">
                  <section className="max-w-xl">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Source Route</label>
              <select
                value={selectedRouteCollege}
                onChange={(e) => setSelectedRouteCollege(e.target.value)}
                      className="premium-input text-lg font-bold"
              >
                      <option value="">Select a route to modify...</option>
                {routesCollege.map((route) => (
                        <option key={route.name} value={route.name}>{route.name}</option>
                ))}
              </select>
                  </section>

            {selectedRouteCollege && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <span className="w-8 h-px bg-slate-200"></span>
                          Registered Stands
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                    {updatedStandsCollege.map((stand, index) => (
                      <motion.div
                        key={index}
                              layout
                              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-indigo-200 transition-colors"
                      >
                              <div className="font-bold text-slate-900">{stand.name}</div>
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase text-slate-400">Boys</span>
                            <input
                              type="number"
                              value={stand.boys}
                                    onChange={(e) => handleUpdateStandCountCollege(index, "boys", e.target.value)}
                                    className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              min="0"
                            />
                          </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase text-slate-400">Girls</span>
                            <input
                              type="number"
                              value={stand.girls}
                                    onChange={(e) => handleUpdateStandCountCollege(index, "girls", e.target.value)}
                                    className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              min="0"
                            />
                          </div>
                          <button
                                  onClick={() => handleRemoveUpdatedStandCollege(index)}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                                  <ImCross size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                      </section>

                      <section className="bg-slate-50 p-8 rounded-3xl border border-slate-200/60">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-6">Append New Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-5">
                      <input
                        type="text"
                        value={newStandNameCollege}
                        onChange={(e) => setNewStandNameCollege(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              placeholder="New Stand Name"
                      />
                    </div>
                          <div className="md:col-span-2">
                      <input
                        type="number"
                        value={newBoysCountCollege}
                        onChange={(e) => setNewBoysCountCollege(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        placeholder="Boys"
                      />
                    </div>
                          <div className="md:col-span-2">
                      <input
                        type="number"
                        value={newGirlsCountCollege}
                              onChange={(e) => setNewGirlsCountCollege(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        placeholder="Girls"
                      />
                    </div>
                          <div className="md:col-span-3">
                            <button
                        onClick={handleAddNewStandCollege}
                              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                      >
                              Add Position
                            </button>
                    </div>
                  </div>
                      </section>

                      <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button
                    onClick={handleUpdateRouteCollege}
                          className="premium-button-primary flex-1 py-4 text-base"
                        >
                          Commit Route Changes
                        </button>
                        <button
                    onClick={() => {
                      setSelectedRouteCollege("");
                      setUpdatedStandsCollege([]);
                    }}
                          className="premium-button-secondary px-10"
                  >
                          Cancel
                        </button>
                </div>
                    </div>
            )}
          </div>
        </motion.div>
            )}


            {isShow === 0 && (
        <motion.div
                key="day-shift"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="premium-card p-4 sm:p-6 md:p-8 lg:p-10"
        >
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900">Day Shift</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm italic">Configure primary day-shift routes and student allocations</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummy3(true)}
                    className="premium-button-secondary border-indigo-100 text-indigo-600 hover:bg-indigo-50"
              >
                    Import Day Data (.xlsx)
              </motion.button>
            </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-slate-200"></span>
                      Route Entry
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Route Designation</label>
                <input
                  value={routeName}
                  onChange={handleChangeRouteName}
                  type="text"
                          className="premium-input text-lg font-bold"
                          placeholder="e.g., Route Alpha"
                />
              </div>
            </div>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Boys Capacity</label>
                <input
                  type="number"
                  value={boysCount}
                  onChange={(e) => setBoysCount(e.target.value)}
                        className="premium-input font-bold"
                        placeholder="0"
                />
              </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Girls Capacity</label>
                <input
                  type="number"
                  value={girlsCount}
                  onChange={(e) => setGirlsCount(e.target.value)}
                        className="premium-input font-bold"
                        placeholder="0"
                />
              </div>
                  </section>

                  <section>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">
                      Stands (Press Enter to append)
              </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[60px] items-center">
                {standName.map((stand, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center bg-white text-slate-700 gap-3 border border-slate-200 rounded-xl py-2 px-4 shadow-sm group"
                  >
                          <span className="text-sm font-bold">{stand.name}</span>
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{stand.boys}B / {stand.girls}G</span>
                    <button
                      onClick={() => handleRemoveStand(index)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                            <ImCross size={10} />
                    </button>
                  </motion.div>
                ))}
                <input
                  type="text"
                  value={input}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                        className="flex-1 min-w-[180px] bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-300"
                        placeholder="Add stand..."
                />
              </div>
                  </section>

                  <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRoute}
                      className="premium-button-primary w-full py-4 text-base"
            >
                      Establish Day Route
            </motion.button>
                  </div>

                  <section className="pt-10 border-t border-slate-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-slate-200"></span>
                      Route Registry
                    </h3>
                    
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Designation</th>
                            <th className="px-6 py-4">Stands Coverage</th>
                            <th className="px-6 py-4 text-center">B</th>
                            <th className="px-6 py-4 text-center">G</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                        <tbody className="divide-y divide-slate-50">
                  {routes.length > 0 ? (
                    routes.map((route, index) => (
                              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900">{route.name}</td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {route.stands.map((s, si) => (
                                      <span key={si} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-medium whitespace-nowrap">
                                        {s.name}
                                      </span>
                                    ))}
                                  </div>
                        </td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600">{route.totalBoys}</td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600">{route.totalGirls}</td>
                                <td className="px-6 py-4 text-center">
                                  <button
                            onClick={() => handleDeleteRoute(index)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                                    <HiOutlineTrash size={18} />
                                  </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                              <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No Day routes registered</td>
                    </tr>
                  )}
                </tbody>
                        {routes.length > 0 && (
                          <tfoot className="bg-slate-50/50 font-black text-slate-900 border-t border-slate-100">
                            <tr>
                              <td className="px-6 py-4 text-indigo-600">Day Summary</td>
                              <td className="px-6 py-4"></td>
                              <td className="px-6 py-4 text-center text-indigo-600">
                                {routes.reduce((acc, route) => acc + (route.totalBoys || 0), 0)}
                    </td>
                              <td className="px-6 py-4 text-center text-indigo-600">
                                {routes.reduce((acc, route) => acc + (route.totalGirls || 0), 0)}
                    </td>
                              <td className="px-6 py-4"></td>
                  </tr>
                </tfoot>
                        )}
              </table>
            </div>
                  </section>
          </div>
        </motion.div>
            )}


            {isShow === 1 && (
        <motion.div
                key="bus-management"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="premium-card p-4 sm:p-6 md:p-8 lg:p-10"
              >
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900">Fleet Assets</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm italic">Manage your transport vehicles and operational capacity</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDummy2(true)}
                    className="premium-button-secondary border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                  >
                    Import Fleet (.xlsx)
                  </motion.button>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-slate-200"></span>
                      Vehicle Onboarding
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Plate / Unit Number</label>
                <input
                  type="text"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                          className="premium-input text-lg font-bold"
                          placeholder="e.g., BUS-001"
                />
              </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Seating Capacity</label>
                <input
                  type="number"
                  value={busCapacity}
                  onChange={(e) => setBusCapacity(e.target.value)}
                          className="premium-input text-lg font-bold"
                          placeholder="40"
                  min="1"
                />
              </div>
            </div>
                    <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddBus}
                        className="premium-button-primary w-full py-4"
                      >
                        Register New Vehicle
              </motion.button>
            </div>
                  </section>

                  <section className="pt-10 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-8">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <span className="w-8 h-px bg-slate-200"></span>
                        Operational Fleet
                      </h3>
                      <div className="flex gap-3">
                        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                          <p className="text-[9px] font-black text-indigo-400 uppercase leading-none mb-1">Active Cap</p>
                          <p className="text-sm font-black text-indigo-600 leading-none">{activeBusCapacity} PAX</p>
                </div>
                        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                          <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Total Cap</p>
                          <p className="text-sm font-black text-white leading-none">{totalBusCapacity} PAX</p>
                </div>
              </div>
            </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Unit Identification</th>
                            <th className="px-6 py-4">Payload (PAX)</th>
                            <th className="px-6 py-4">Operational Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
                        <tbody className="divide-y divide-slate-50">
                {buses.length > 0 ? (
                  buses.map((bus, index) => {
                              const isActive = typeof bus.isActive === "boolean" ? bus.isActive : true;
                    return (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-4 font-black text-slate-900 text-base">{bus.number}</td>
                                  <td className="px-6 py-4 font-bold text-slate-600">{bus.capacity} Students</td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                          <Switch
                            checked={isActive}
                                        onChange={() => handleToggleBusStatus(bus.number, !isActive)}
                            className={`${
                                          isActive ? "bg-indigo-600" : "bg-slate-200"
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                                      >
                                        <span className={`${isActive ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`} />
                          </Switch>
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                                        {isActive ? "Active" : "OOS"}
                          </span>
                                    </div>
                        </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                            onClick={() => handleDeleteBus(bus.number)}
                                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                                      <HiOutlineTrash size={18} />
                                    </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                              <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No vehicles registered in fleet</td>
                  </tr>
                )}
              </tbody>
            </table>
                    </div>
                  </section>
          </div>
        </motion.div>
            )}

            {isShow === 2 && (
        <motion.div
                key="day-update"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="premium-card p-4 sm:p-6 md:p-8 lg:p-10"
        >
                <div className="mb-10 pb-6 border-b border-slate-100">
                  <h1 className="text-3xl font-black text-slate-900">Day Route Sync</h1>
                  <p className="text-slate-500 font-medium mt-1 text-sm italic">Adjust headcounts for specific Day shift routes</p>
          </div>

                <div className="space-y-10">
                  <section className="max-w-xl">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Active Route</label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                      className="premium-input text-lg font-bold"
              >
                      <option value="">Choose route to update...</option>
                {routes.map((route) => (
                        <option key={route.name} value={route.name}>{route.name}</option>
                ))}
              </select>
                  </section>

            {selectedRoute && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <span className="w-8 h-px bg-slate-200"></span>
                          Configured Locations
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                    {updatedStands.map((stand, index) => (
                      <motion.div
                        key={index}
                              layout
                              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors"
                      >
                              <div className="font-bold text-slate-900">{stand.name}</div>
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase text-slate-400">B</span>
                            <input
                              type="number"
                              value={stand.boys}
                                    onChange={(e) => handleUpdateStandCount(index, "boys", e.target.value)}
                                    className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              min="0"
                            />
                          </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase text-slate-400">G</span>
                            <input
                              type="number"
                              value={stand.girls}
                                    onChange={(e) => handleUpdateStandCount(index, "girls", e.target.value)}
                                    className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              min="0"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveUpdatedStand(index)}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                                  <ImCross size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                      </section>

                      <section className="bg-slate-50 p-8 rounded-3xl border border-slate-200/60">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-6">Register New Stand</h3>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-5">
                      <input
                        type="text"
                        value={newStandName}
                        onChange={(e) => setNewStandName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              placeholder="Stand Name"
                      />
                    </div>
                          <div className="md:col-span-2">
                      <input
                        type="number"
                        value={newBoysCount}
                        onChange={(e) => setNewBoysCount(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              placeholder="B"
                      />
                    </div>
                          <div className="md:col-span-2">
                      <input
                        type="number"
                        value={newGirlsCount}
                        onChange={(e) => setNewGirlsCount(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              placeholder="G"
                      />
                    </div>
                          <div className="md:col-span-3">
                            <button
                        onClick={handleAddNewStand}
                              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                      >
                              Add Stand
                            </button>
                    </div>
                  </div>
                      </section>

                      <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button
                    onClick={handleUpdateRoute}
                          className="premium-button-primary flex-1 py-4"
                        >
                          Push Synchronized Data
                        </button>
                        <button
                    onClick={() => {
                      setSelectedRoute("");
                      setUpdatedStands([]);
                    }}
                          className="premium-button-secondary px-10"
                  >
                          Discard
                        </button>
                </div>
                    </div>
            )}
          </div>
        </motion.div>
            )}


            {isShow === 4 && (
        <motion.div
                key="morning-shift"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="premium-card p-4 sm:p-6 md:p-8 lg:p-10"
        >
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900">Morning Shift</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm italic">Manage early morning transit routes and student headcounts</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummy(!dummy)}
                    className="premium-button-secondary border-indigo-100 text-indigo-600 hover:bg-indigo-50"
              >
                    Import Morning Data (.xlsx)
              </motion.button>
            </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-slate-200"></span>
                      Route Creation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Route Name</label>
                <input
                  value={routeName2}
                  onChange={handleChangeRouteName2}
                  type="text"
                          className="premium-input text-lg font-bold"
                          placeholder="e.g., Morning Route 1"
                />
              </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Total Students</label>
                <input
                  type="number"
                  value={boysCount2}
                  onChange={(e) => setBoysCount2(e.target.value)}
                          className="premium-input text-lg font-bold"
                          placeholder="0"
                />
              </div>
            </div>
                  </section>

                  <section>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">
                      Stands (Press Enter to add)
              </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[60px] items-center focus-within:ring-2 focus:ring-indigo-500/20 transition-all">
                {standName2.map((stand, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center bg-white text-slate-700 gap-3 border border-slate-200 rounded-xl py-2 px-4 shadow-sm"
                  >
                          <span className="text-sm font-bold">{stand.name}</span>
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{stand.boys} Pax</span>
                    <button
                      onClick={() => handleRemoveStand2(index)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                            <ImCross size={10} />
                    </button>
                  </motion.div>
                ))}
                <input
                  type="text"
                  value={input2}
                  onChange={handleChange2}
                  onKeyDown={handleKeyDown2}
                        className="flex-1 min-w-[180px] bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-300"
                        placeholder="Add location..."
                />
              </div>
                  </section>

                  <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRoute2}
                      className="premium-button-primary w-full py-4 text-base"
                    >
                      Register Morning Route
            </motion.button>
                  </div>

                  <section className="pt-10 border-t border-slate-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-slate-200"></span>
                      Morning Inventory
                    </h3>
                    
                    <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Designation</th>
                            <th className="px-6 py-4">Stands Coverage</th>
                            <th className="px-6 py-4 text-center">Total Students</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                        <tbody className="divide-y divide-slate-50">
                  {routes2.length > 0 ? (
                    routes2.map((route, index) => (
                              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-black text-slate-900">{route.name}</td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {route.stands.map((s, si) => (
                                      <span key={si} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                                        {s.name}
                                      </span>
                                    ))}
                                  </div>
                        </td>
                                <td className="px-6 py-4 text-center font-black text-slate-600">{route.totalBoys}</td>
                                <td className="px-6 py-4 text-center">
                                  <button
                            onClick={() => handleDeleteRoute2(index)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                                    <HiOutlineTrash size={18} />
                                  </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                              <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No morning routes registered</td>
                    </tr>
                  )}
                </tbody>
                        {routes2.length > 0 && (
                          <tfoot className="bg-slate-50/50 font-black text-slate-900 border-t border-slate-100">
                            <tr>
                              <td className="px-6 py-4 text-indigo-600">Total Shift Capacity</td>
                              <td className="px-6 py-4"></td>
                              <td className="px-6 py-4 text-center text-indigo-600">
                                {routes2.reduce((acc, route) => acc + (route.totalBoys || 0), 0)} PAX
                    </td>
                              <td className="px-6 py-4"></td>
                  </tr>
                </tfoot>
                        )}
              </table>
            </div>
                  </section>
          </div>
        </motion.div>
            )}

            {isShow === 5 && (
        <motion.div
                key="morning-update"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="premium-card p-4 sm:p-6 md:p-8 lg:p-10"
        >
                <div className="mb-10 pb-6 border-b border-slate-100">
                  <h1 className="text-3xl font-black text-slate-900">Morning Route Sync</h1>
                  <p className="text-slate-500 font-medium mt-1 text-sm italic">Adjust student headcounts for early morning transit lines</p>
          </div>

                <div className="space-y-10">
                  <section className="max-w-xl">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Source Morning Route</label>
              <select
                value={selectedRouteMorning}
                onChange={(e) => {
                  setSelectedRouteMorning(e.target.value);
                  if (e.target.value) {
                          const route = routes2.find((r) => r.name === e.target.value);
                    setUpdatedStandsMorning(route ? [...route.stands] : []);
                  }
                }}
                      className="premium-input text-lg font-bold"
              >
                      <option value="">Select a route to modify...</option>
                {routes2.map((route) => (
                        <option key={route.name} value={route.name}>{route.name}</option>
                ))}
              </select>
                  </section>

            {selectedRouteMorning && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <span className="w-8 h-px bg-slate-200"></span>
                          Configured Locations
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                    {updatedStandsMorning.map((stand, index) => (
                      <motion.div
                        key={index}
                              layout
                              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors"
                      >
                              <div className="font-bold text-slate-900">{stand.name}</div>
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase text-slate-400">Total PAX</span>
                            <input
                              type="number"
                              value={stand.boys}
                                    onChange={(e) => handleUpdateStandCountMorning(index, e.target.value)}
                                    className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              min="0"
                            />
                          </div>
                          <button
                                  onClick={() => handleRemoveUpdatedStandMorning(index)}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                                  <ImCross size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                      </section>

                      <section className="bg-slate-50 p-8 rounded-3xl border border-slate-200/60">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-6">Append New Stand</h3>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-6">
                      <input
                        type="text"
                        value={newStandNameMorning}
                        onChange={(e) => setNewStandNameMorning(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              placeholder="New Stand Name"
                      />
                    </div>
                          <div className="md:col-span-3">
                      <input
                        type="number"
                        value={newBoysCountMorning}
                        onChange={(e) => setNewBoysCountMorning(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              placeholder=" PAX"
                      />
                    </div>
                          <div className="md:col-span-3">
                            <button
                        onClick={handleAddNewStandMorning}
                              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                      >
                              Add Position
                            </button>
                    </div>
                  </div>
                      </section>

                      <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button
                    onClick={handleUpdateRouteMorning}
                          className="premium-button-primary flex-1 py-4"
                        >
                          Push Synchronized Data
                        </button>
                        <button
                    onClick={() => {
                      setSelectedRouteMorning("");
                      setUpdatedStandsMorning([]);
                    }}
                          className="premium-button-secondary px-10"
                  >
                          Discard
                        </button>
                </div>
                    </div>
            )}
          </div>
        </motion.div>
            )}

            {isShow === 3 && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="premium-card p-10 flex flex-col items-center justify-center text-center py-20 bg-white"
              >
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
                  <HiOutlineX size={48} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">System Maintenance</h1>
                <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium">
                  Warning: Performing a hard reset will permanently purge all route configurations, fleet data, and current assignments. This action is irreversible.
                </p>
                
                <div className="p-8 bg-rose-50/50 rounded-3xl border border-rose-100 max-w-lg w-full">
                  <h3 className="text-rose-600 font-black uppercase tracking-widest text-[10px] mb-6">Dangerous Operations</h3>
                  <button
                    onClick={handleResetDatabase}
                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-[0.98]"
                  >
                    Nuke Entire Database
                  </button>
                </div>
              </motion.div>
            )}
      </AnimatePresence>
        </div>
      </main>


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
