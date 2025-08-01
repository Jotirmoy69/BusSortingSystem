import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { Switch } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { useAppContext } from "../context/context";
import { IoClose } from "react-icons/io5";

const Settings = () => {
  // State declarations
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeName2, setRouteName2] = useState("");
  const [routes, setRoutes] = useState([]);
  const [routes2, setRoutes2] = useState([]);
  const [standName, setStandName] = useState([]);
  const [standName2, setStandName2] = useState([]);
  const [boysCount, setBoysCount] = useState("");
  const [boysCount2, setBoysCount2] = useState("");
  const [girlsCount, setGirlsCount] = useState("");
  const [isShow, setIsShow] = useState(0);
  const [totalBusCapacity, setTotalBusCapacity] = useState(0);
  const [activeBusCapacity, setActiveBusCapacity] = useState(0);
  const [totalDayStudents, setTotalDayStudents] = useState(0);
  const [totalMorningStudents, setTotalMorningStudents] = useState(0);
  const [dummy, setDummy] = useState(false);
  const [dummy2, setDummy2] = useState(false);
  const [dummy3, setDummy3] = useState(false); // Update route states
  const [selectedRoute, setSelectedRoute] = useState("");
  const [updatedStands, setUpdatedStands] = useState([]);
  const [newStandName, setNewStandName] = useState("");
  const [newBoysCount, setNewBoysCount] = useState("");
  const [newGirlsCount, setNewGirlsCount] = useState(""); // Morning shift update states
  const [selectedRouteMorning, setSelectedRouteMorning] = useState("");
  const [updatedStandsMorning, setUpdatedStandsMorning] = useState([]);
  const [newStandNameMorning, setNewStandNameMorning] = useState("");
  const [newBoysCountMorning, setNewBoysCountMorning] = useState(""); // Bus management states
  const [busNumber, setBusNumber] = useState("");
  const [busCapacity, setBusCapacity] = useState("");
  const [buses, setBuses] = useState([]); // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const mainContentRef = useRef(null);
  const [showDeleteConfirm2, setShowDeleteConfirm2] = useState(false);
  const [itemToDelete2, setItemToDelete2] = useState(null);
  const { setActiveBuses } = useAppContext();
  const [inputCollege, setInputCollege] = useState("");
  const [routeNameCollege, setRouteNameCollege] = useState("");
  const [routesCollege, setRoutesCollege] = useState([]);
  const [standNameCollege, setStandNameCollege] = useState([]);
  const [boysCountCollege, setBoysCountCollege] = useState("");
  const [girlsCountCollege, setGirlsCountCollege] = useState("");
  const [selectedRouteCollege, setSelectedRouteCollege] = useState("");
  const [updatedStandsCollege, setUpdatedStandsCollege] = useState([]);
  const [newStandNameCollege, setNewStandNameCollege] = useState("");
  const [newBoysCountCollege, setNewBoysCountCollege] = useState("");
  const [newGirlsCountCollege, setNewGirlsCountCollege] = useState("");
  const [dummyCollege, setDummyCollege] = useState(false);
  const [totalCollegeStudents, setTotalCollegeStudents] = useState(0);

  // Tab configuration for animation
  const tabs = [
    { id: 0, label: "Day Shift", icon: "🌞" },
    { id: 4, label: "Morning Shift", icon: "🌅" },
    { id: 6, label: "College Shift", icon: "🎓" }, // New College tab
    { id: 1, label: "Bus Management", icon: "🚌" },
    { id: 2, label: "Update Route (Day)", icon: "🔄" },
    { id: 5, label: "Update Route(Mor)", icon: "🔄" },
    { id: 7, label: "Update Route(Col)", icon: "🔄" }, // New College update tab
    { id: 3, label: "Clear Database", icon: "⚠️" },
  ];

  // Helper functions
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
  // Add college students to totals calculation
  const collegeStudentsTotal = routesCollege.reduce(
    (acc, route) => acc + (route.totalBoys || 0) + (route.totalGirls || 0),
    0
  );
  setTotalCollegeStudents(collegeStudentsTotal);
}, [routesCollege]);

useEffect(() => {
  fetchRoutes();
  fetchRoutes2();
  fetchRoutesCollege(); // Add this
}, []);

useEffect(() => {
  if (selectedRouteCollege && isShow === 7) {
    const route = routesCollege.find((r) => r.name === selectedRouteCollege);
    if (route) {
      setUpdatedStandsCollege([...route.stands]);
    }
  }
}, [selectedRouteCollege, isShow]);
  // Calculate totals whenever routes or buses change
  useEffect(() => {
    // Calculate total bus capacity
    const busCapacityTotal = buses.reduce(
      (acc, bus) => acc + (bus.capacity || 0),
      0
    );
    setTotalBusCapacity(busCapacityTotal);

    // Calculate total day shift students
    const dayStudentsTotal = routes.reduce(
      (acc, route) => acc + (route.totalBoys || 0) + (route.totalGirls || 0),
      0
    );
    setTotalDayStudents(dayStudentsTotal);

    // Calculate total morning shift students
    const morningStudentsTotal = routes2.reduce(
      (acc, route) => acc + (route.totalBoys || 0),
      0
    );
    setTotalMorningStudents(morningStudentsTotal);
  }, [routes, routes2, buses]);

  // Add this useEffect to load stands when a route is selected
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


  // College Shift handlers
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
      toast.error("শুধুমাত্র স্পেস বা খালি নাম ব্যবহার করা যাবে না");
      return;
    }

    if (!boysCountCollege || isNaN(parseInt(boysCountCollege))) {
      toast.error("ছাত্র সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
      return;
    }

    if (!girlsCountCollege || isNaN(parseInt(girlsCountCollege))) {
      toast.error("ছাত্রী সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
      return;
    }

    const isDuplicateInCurrent = standNameCollege.some(
      (stand) => stand.name.trim().toLowerCase() === newStand
    );

    if (isDuplicateInCurrent) {
      toast.error("এই স্ট্যান্ড নাম ইতোমধ্যে যোগ করা হয়েছে");
      return;
    }

    const isDuplicateInRoutes = routesCollege.some((route) =>
      route.stands.some(
        (stand) => stand.name.trim().toLowerCase() === newStand
      )
    );

    if (isDuplicateInRoutes) {
      toast.error("এই স্ট্যান্ড নাম ইতোমধ্যে অন্য একটি রুটে রয়েছে");
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
    toast.error("রুটের নাম লিখুন");
    return;
  }

  if (!standNameCollege.length) {
    toast.error("অন্তত একটি স্ট্যান্ড যোগ করুন");
    return;
  }

  if (routesCollege.some((route) => route.name.toLowerCase() === routeNameValue)) {
    toast.error("এই রুট নাম ইতিমধ্যে রয়েছে");
    return;
  }

  try {
    const totalBoys = standNameCollege.reduce((acc, curr) => acc + curr.boys, 0);
    const totalGirls = standNameCollege.reduce((acc, curr) => acc + curr.girls, 0);

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
    toast.success("কলেজ শিফট রুট যোগ করা হয়েছে");
  } catch (err) {
    console.error("Error inserting college route:", err);
    toast.error("রুট যোগ করতে সমস্যা হয়েছে");
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
    toast.error("কলেজ রুট লোড করতে সমস্যা হয়েছে");
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
    toast.success("কলেজ শিফট ডাটা এক্সেল থেকে প্রয়োগ করা হয়েছে!");
  };

  reader.readAsBinaryString(file);
};

const handleUpdateRouteCollege = async () => {
  if (!selectedRouteCollege) {
    toast.error("রুট নির্বাচন করুন");
    return;
  }

  if (!updatedStandsCollege.length) {
    toast.error("অন্তত একটি স্ট্যান্ড যোগ করুন");
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
      totalGirls
    });

    if (result?.success) {
      await fetchRoutesCollege();
      setSelectedRouteCollege("");
      setUpdatedStandsCollege([]);
      setNewStandNameCollege("");
      setNewBoysCountCollege("");
      setNewGirlsCountCollege("");
      toast.success("কলেজ রুট আপডেট করা হয়েছে");
    } else {
      const errorMsg = result?.error || "রুট আপডেট করতে ব্যর্থ";
      toast.error(errorMsg);
    }
  } catch (err) {
    console.error("Error updating college route:", err);
    toast.error(err.message || "রুট আপডেট করতে সমস্যা হয়েছে");
  }
};

const handleAddNewStandCollege = () => {
  const trimmedName = newStandNameCollege.trim().toLowerCase();

  if (!trimmedName) {
    toast.error("স্ট্যান্ডের নাম লিখুন");
    return;
  }

  if (!newBoysCountCollege || isNaN(parseInt(newBoysCountCollege))) {
    toast.error("ছাত্র সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
    return;
  }

  if (!newGirlsCountCollege || isNaN(parseInt(newGirlsCountCollege))) {
    toast.error("ছাত্রী সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
    return;
  }

  const isDuplicate = updatedStandsCollege.some(
    (stand) => stand.name.toLowerCase() === trimmedName
  );

  if (isDuplicate) {
    toast.error("এই স্ট্যান্ড নাম ইতিমধ্যে রয়েছে");
    return;
  }

  const isDuplicateInOtherRoutes = routesCollege.some(
    (route) =>
      route.name !== selectedRouteCollege &&
      route.stands.some((stand) => stand.name.toLowerCase() === trimmedName)
  );

  if (isDuplicateInOtherRoutes) {
    toast.error("এই স্ট্যান্ড নাম ইতিমধ্যে অন্য একটি রুটে রয়েছে");
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

// Add to confirmDeletion function
const confirmDeletion = async () => {
  if (!itemToDelete) return;

  try {
    const ipcRenderer = getIpcRenderer();

    // Existing delete handlers...

    // Add college route deletion
    if (itemToDelete.type === "route-college") {
      const result = await ipcRenderer.invoke(
        "delete-route-college",
        itemToDelete.name
      );

      if (result?.success) {
        await fetchRoutesCollege();
        toast.success("কলেজ রুটটি মুছে ফেলা হয়েছে");
      } else {
        toast.error("রুট মুছে ফেলতে ব্যর্থ");
      }
    }
  } catch (err) {
    console.error("Error deleting:", err);
    toast.error("কলেজ রুট মুছে ফেলতে সমস্যা হয়েছে");
  }

  setShowDeleteConfirm(false);
  setItemToDelete(null);
  if (mainContentRef.current) {
    mainContentRef.current.focus();
  }
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

  useEffect(() => {
    if (!buses || buses.length === 0) return;

    // Calculate total bus capacity
    const busCapacityTotal = buses.reduce(
      (acc, bus) => acc + (bus.capacity || 0),
      0
    );
    setTotalBusCapacity(busCapacityTotal);

    // Calculate active bus capacity
    const activeCapacity = buses.reduce(
      (acc, bus) => acc + (bus.isActive ? bus.capacity || 0 : 0),
      0
    );
    setActiveBusCapacity(activeCapacity);

    // Calculate total day shift students
    const dayStudentsTotal = routes.reduce(
      (acc, route) => acc + (route.totalBoys || 0) + (route.totalGirls || 0),
      0
    );
    setTotalDayStudents(dayStudentsTotal);

    // Calculate total morning shift students
    const morningStudentsTotal = routes2.reduce(
      (acc, route) => acc + (route.totalBoys || 0),
      0
    );
    setTotalMorningStudents(morningStudentsTotal);
  }, [routes, routes2, buses]);

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
      toast.success("Data applied from Excel Successfully!");
    };

    reader.readAsBinaryString(file);
  };

  // Data fetching
  const fetchRoutes = async () => {
    try {
      const ipcRenderer = getIpcRenderer();
      const res = await ipcRenderer.invoke("fetch-routes");
      setRoutes(res.data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("রুট লোড করতে সমস্যা হয়েছে");
    }
  };

  const fetchRoutes2 = async () => {
    try {
      const ipcRenderer = getIpcRenderer();
      const res = await ipcRenderer.invoke("fetch-routes-morning");
      setRoutes2(res.data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast.error("রুট লোড করতে সমস্যা হয়েছে");
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
      toast.error("বাস লোড করতে সমস্যা হয়েছে");
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
  // Event handlers
  const handleChangeRouteName = (e) => {
    setRouteName(e.target.value);
  };

  const handleChangeRouteName2 = (e) => {
    setRouteName2(e.target.value);
  };

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
        toast.error("শুধুমাত্র স্পেস বা খালি নাম ব্যবহার করা যাবে না");
        return;
      }

      if (!boysCount || isNaN(parseInt(boysCount))) {
        toast.error("ছাত্র সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
        return;
      }

      if (!girlsCount || isNaN(parseInt(girlsCount))) {
        toast.error("ছাত্রী সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
        return;
      }

      const isDuplicateInCurrent = standName.some(
        (stand) => stand.name.trim().toLowerCase() === newStand
      );

      if (isDuplicateInCurrent) {
        toast.error("এই স্ট্যান্ড নাম ইতোমধ্যে যোগ করা হয়েছে");
        return;
      }

      const isDuplicateInRoutes = routes.some((route) =>
        route.stands.some(
          (stand) => stand.name.trim().toLowerCase() === newStand
        )
      );

      if (isDuplicateInRoutes) {
        toast.error("এই স্ট্যান্ড নাম ইতোমধ্যে অন্য একটি রুটে রয়েছে");
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
        toast.error("শুধুমাত্র স্পেস বা খালি নাম ব্যবহার করা যাবে না");
        return;
      }

      if (!boysCount2 || isNaN(parseInt(boysCount2))) {
        toast.error("ছাত্র সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
        return;
      }

      const isDuplicateInCurrent = standName2.some(
        (stand) => stand.name.trim().toLowerCase() === newStand
      );

      if (isDuplicateInCurrent) {
        toast.error("এই স্ট্যান্ড নাম ইতোমধ্যে যোগ করা হয়েছে");
        return;
      }

      const isDuplicateInRoutes = routes2.some((route) =>
        route.stands.some(
          (stand) => stand.name.trim().toLowerCase() === newStand
        )
      );

      if (isDuplicateInRoutes) {
        toast.error("এই স্ট্যান্ড নাম ইতোমধ্যে অন্য একটি রুটে রয়েছে");
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
      toast.error("রুটের নাম লিখুন");
      return;
    }

    if (!standName.length) {
      toast.error("অন্তত একটি স্ট্যান্ড যোগ করুন");
      return;
    }

    if (routes.some((route) => route.name.toLowerCase() === routeNameValue)) {
      toast.error("এই রুট নাম ইতিমধ্যে রয়েছে");
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
      toast.success("রুট যোগ করা হয়েছে");
    } catch (err) {
      console.error("Error inserting route:", err);
      toast.error("রুট যোগ করতে সমস্যা হয়েছে");
    }
  };

  const handleAddRoute2 = async () => {
    const routeNameValue = routeName2.trim().toLowerCase();

    if (!routeNameValue) {
      toast.error("রুটের নাম লিখুন");
      return;
    }

    if (!standName2.length) {
      toast.error("অন্তত একটি স্ট্যান্ড যোগ করুন");
      return;
    }

    if (routes2.some((route) => route.name.toLowerCase() === routeNameValue)) {
      toast.error("এই রুট নাম ইতিমধ্যে রয়েছে");
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
      toast.success("রুট যোগ করা হয়েছে");
    } catch (err) {
      console.error("Error inserting route:", err);
      toast.error("রুট যোগ করতে সমস্যা হয়েছে");
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

      toast.success(`বাস ${newStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`);
    } catch (err) {
      console.error("Error updating bus status:", err);
      toast.error("স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে");
    }
  };

  // const confirmDeletion = async () => {
  //   if (!itemToDelete) return;

  //   try {
  //     const ipcRenderer = getIpcRenderer();

  //     if (itemToDelete.type === "route") {
  //       const result = await ipcRenderer.invoke(
  //         "delete-route",
  //         itemToDelete.name
  //       );

  //       if (result?.success) {
  //         await fetchRoutes();
  //         toast.success("রুটটি মুছে ফেলা হয়েছে");
  //       } else {
  //         toast.error("রুট মুছে ফেলতে ব্যর্থ");
  //       }
  //     } else if (itemToDelete.type === "bus") {
  //       const result = await ipcRenderer.invoke(
  //         "delete-bus",
  //         itemToDelete.name
  //       );

  //       if (result?.success) {
  //         await fetchBuses();
  //         toast.success("বাসটি মুছে ফেলা হয়েছে");
  //       } else {
  //         toast.error("বাস মুছে ফেলতে ব্যর্থ");
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error deleting:", err);
  //     toast.error(
  //       itemToDelete.type === "route"
  //         ? "রুট মুছে ফেলতে সমস্যা হয়েছে"
  //         : "বাস মুছে ফেলতে সমস্যা হয়েছে"
  //     );
  //   }

  //   setShowDeleteConfirm(false);
  //   setItemToDelete(null);
  //   if (mainContentRef.current) {
  //     mainContentRef.current.focus();
  //   }
  // };

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
          toast.success("রুটটি মুছে ফেলা হয়েছে");
        } else {
          toast.error("রুট মুছে ফেলতে ব্যর্থ");
        }
      }
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("রুট মুছে ফেলতে সমস্যা হয়েছে");
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
      toast.error("বাস নং লিখুন");
      return;
    }

    if (!busCapacity || parseInt(busCapacity) <= 0) {
      toast.error("বাসের ধারণক্ষমতা লিখুন");
      return;
    }

    const busExists = buses.some(
      (bus) => bus.number.toLowerCase() === busNumber.trim().toLowerCase()
    );

    if (busExists) {
      toast.error("এই বাস নম্বর ইতিমধ্যে রয়েছে");
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
      toast.success("বাস যোগ করা হয়েছে");
    } catch (err) {
      console.error("Error adding bus:", err);
      toast.error("বাস যোগ করতে সমস্যা হয়েছে");
    }
  };

  const handleUpdateRoute = async () => {
    if (!selectedRoute) {
      toast.error("রুট নির্বাচন করুন");
      return;
    }

    if (!updatedStands.length) {
      toast.error("অন্তত একটি স্ট্যান্ড যোগ করুন");
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
        toast.success("রুট আপডেট করা হয়েছে");
      } else {
        const errorMsg = result?.error || "রুট আপডেট করতে ব্যর্থ";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error updating route:", err);
      toast.error(err.message || "রুট আপডেট করতে সমস্যা হয়েছে");
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
      toast.error("স্ট্যান্ডের নাম লিখুন");
      return;
    }

    if (!newBoysCount || isNaN(parseInt(newBoysCount))) {
      toast.error("ছাত্র সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
      return;
    }

    if (!newGirlsCount || isNaN(parseInt(newGirlsCount))) {
      toast.error("ছাত্রী সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
      return;
    }

    const isDuplicate = updatedStands.some(
      (stand) => stand.name.toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      toast.error("এই স্ট্যান্ড নাম ইতিমধ্যে রয়েছে");
      return;
    }

    const isDuplicateInOtherRoutes = routes.some(
      (route) =>
        route.name !== selectedRoute &&
        route.stands.some((stand) => stand.name.toLowerCase() === trimmedName)
    );

    if (isDuplicateInOtherRoutes) {
      toast.error("এই স্ট্যান্ড নাম ইতিমধ্যে অন্য একটি রুটে রয়েছে");
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

  // Morning shift update handlers
  const handleUpdateRouteMorning = async () => {
    if (!selectedRouteMorning) {
      toast.error("রুট নির্বাচন করুন");
      return;
    }

    if (!updatedStandsMorning.length) {
      toast.error("অন্তত একটি স্ট্যান্ড যোগ করুন");
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
        toast.success("মর্নিং শিফট রুট আপডেট করা হয়েছে");
      } else {
        toast.error("রুট আপডেট করতে ব্যর্থ");
      }
    } catch (err) {
      console.error("Error updating morning route:", err);
      toast.error("রুট আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const handleAddNewStandMorning = () => {
    const trimmedName = newStandNameMorning.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("স্ট্যান্ডের নাম লিখুন");
      return;
    }

    if (!newBoysCountMorning || isNaN(parseInt(newBoysCountMorning))) {
      toast.error("ছাত্র সংখ্যা লিখুন (অবশ্যই সংখ্যা হতে হবে)");
      return;
    }

    const isDuplicate = updatedStandsMorning.some(
      (stand) => stand.name.toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      toast.error("এই স্ট্যান্ড নাম ইতিমধ্যে রয়েছে");
      return;
    }

    const isDuplicateInOtherRoutes = routes2.some(
      (route) =>
        route.name !== selectedRouteMorning &&
        route.stands.some((stand) => stand.name.toLowerCase() === trimmedName)
    );

    if (isDuplicateInOtherRoutes) {
      toast.error("এই স্ট্যান্ড নাম ইতিমধ্যে অন্য একটি রুটে রয়েছে");
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
        await fetchBuses();
        toast.success("ডাটাবেস রিসেট করা হয়েছে");
      } else {
        toast.error("ডাটাবেস রিসেট করতে ব্যর্থ");
      }
    } catch (err) {
      console.error("Error resetting database:", err);
      toast.error("ডাটাবেস রিসেট করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div
      ref={mainContentRef}
      tabIndex="-1"
      className="flex min-h-screen overflow-x-hidden bg-[#F5F5FF] text-[#2F1C6A] -800"
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
              {deleteType === "route" ? "রুট মুছে ফেলুন" : "বাস মুছে ফেলুন"}
            </h3>
            <p className="mb-6">
              আপনি কি "{itemToDelete.name}"{" "}
              {deleteType === "route" ? "রুটটি" : "বাসটি"} মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelDeletion}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                বাতিল
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={confirmDeletion}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                মুছে ফেলুন
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
            <h3 className="text-xl font-bold mb-4">রুট মুছে ফেলুন</h3>
            <p className="mb-6">
              আপনি কি "{itemToDelete2.name}" রুটটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelDeletion2}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                বাতিল
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={confirmDeletion2}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                মুছে ফেলুন
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Link
        to="/"
        className="fixed top-5 right-5 z-50 bg-purple-500 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:bg-purple-600 transition-colors"
        title="পেছনে যান"
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
          <div className="text-xl font-bold text-[#2F1C6A]">সেটিংস মেনু</div>
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

      {/* College Shift */}
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
            <div className="text-lg font-semibold">
              Total Students: {totalCollegeStudents}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">🛣️</span>
                <h1 className="text-xl font-bold mb-5 flex items-center">
                  রাস্তা ব্যবস্থাপনা
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummyCollege(true)}
                className="bg-[#673DE5] cursor-pointer duration-200 text-white px-6 py-3 rounded-md font-bold hover:bg-[#5025D1] transition-colors"
              >
                Add From Excel
              </motion.button>
            </div>

            <div className="flex gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 font-bold">রাস্তার নাম</label>
                <input
                  value={routeNameCollege}
                  onChange={(e) => setRouteNameCollege(e.target.value)}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="যেমন: রুট ১"
                />
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  ছাত্র সংখ্যা
                </label>
                <input
                  type="number"
                  value={boysCountCollege}
                  onChange={(e) => setBoysCountCollege(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="যেমন: ২৫"
                  min="0"
                />
              </div>
              <div className="w-full md:w-1/2 px-3">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  ছাত্রী সংখ্যা
                </label>
                <input
                  type="number"
                  value={girlsCountCollege}
                  onChange={(e) => setGirlsCountCollege(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="যেমন: ২৫"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-bold">
                স্ট্যান্ডসমূহ (কমা বা স্পেস দিয়ে পৃথক করুন)
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
                      {stand.name} ({stand.boys} ছাত্র, {stand.girls} ছাত্রী)
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
                  placeholder="স্ট্যান্ডের নাম লিখুন"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRouteCollege}
              className="bg-[#673DE5] cursor-pointer duration-200 text-white px-6 py-3 rounded font-bold hover:bg-[#5025D1] transition-colors"
            >
              রুট যুক্ত করুন
            </motion.button>

            <div className="w-full mt-8">
              <h3 className="mb-4">সকল রুটের তালিকা</h3>
              <table className="w-full mt-5">
                <thead className="bg-[#8B5DFF]">
                  <tr className="text-white rounded-tl-lg text-left">
                    <th className="p-3 border-b-2 border-gray-200">রুট নাম</th>
                    <th className="p-3 border-b-2 border-gray-200">
                      স্ট্যান্ডসমূহ
                    </th>
                    <th className="p-3 border-b-2 border-gray-200">ছাত্র</th>
                    <th className="p-3 border-b-2 border-gray-200">ছাত্রী</th>
                    <th className="p-3 border-b-2 border-gray-200">ডিলিট</th>
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
                            className="text-red-500 px-4 py-2 rounded font-bold hover:scale-130 transition-all cursor-pointer"
                          >
                            🗑️
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
                        কোনো রুট পাওয়া যায়নি
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

      {/* Update College Shift Route */}
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
              রুট আপডেট করুন (কলেজ শিফট)
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-5 flex items-center">
              <span className="mr-2">🔄</span> কলেজ শিফট রুট আপডেট করুন
            </h2>

            <div className="mb-5">
              <label className="block mb-2 font-bold">রুট নির্বাচন করুন</label>
              <select
                value={selectedRouteCollege}
                onChange={(e) => setSelectedRouteCollege(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none"
              >
                <option value="">রুট নির্বাচন করুন</option>
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
                  <h3 className="text-lg font-semibold mb-3">স্ট্যান্ডসমূহ</h3>
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
                            <label className="block text-sm mb-1">ছাত্র</label>
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
                            <label className="block text-sm mb-1">ছাত্রী</label>
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
                  <h3 className="text-lg font-semibold mb-3">
                    নতুন স্ট্যান্ড যোগ করুন
                  </h3>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/3 px-3 mb-4">
                      <label className="block mb-2">স্ট্যান্ডের নাম</label>
                      <input
                        type="text"
                        value={newStandNameCollege}
                        onChange={(e) => setNewStandNameCollege(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="স্ট্যান্ডের নাম"
                      />
                    </div>
                    <div className="w-full md:w-1/4 px-3 mb-4">
                      <label className="block mb-2">ছাত্র সংখ্যা</label>
                      <input
                        type="number"
                        value={newBoysCountCollege}
                        onChange={(e) => setNewBoysCountCollege(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="ছাত্র"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/4 px-3 mb-4">
                      <label className="block mb-2">ছাত্রী সংখ্যা</label>
                      <input
                        type="number"
                        value={newGirlsCountCollege}
                        onChange={(e) =>
                          setNewGirlsCountCollege(e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="ছাত্রী"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/6 px-3 mb-4 flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNewStandCollege}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      >
                        যোগ করুন
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateRouteCollege}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded font-bold"
                  >
                    আপডেট করুন
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
                    রিসেট করুন
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Day Shift */}
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
            <div className="text-lg font-semibold">
              Total Students: {totalDayStudents}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-cente">
                <span className="mr-2 ">🛣️</span>
                <h1 className="text-xl font-bold mb-5 flex items-center">
                  {" "}
                  রাস্তা ব্যবস্থাপনা
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummy3(true)}
                className="bg-[#673DE5] cursor-pointer duration-200 text-white px-6 py-3 rounded-md font-bold hover:bg-[#5025D1] transition-colors"
              >
                Add From Excel
              </motion.button>
            </div>

            <div className="flex gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 font-bold">রাস্তার নাম</label>
                <input
                  value={routeName}
                  onChange={handleChangeRouteName}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="যেমন: রুট ১"
                />
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  ছাত্র সংখ্যা
                </label>
                <input
                  type="number"
                  value={boysCount}
                  onChange={(e) => setBoysCount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="যেমন: ২৫"
                  min="0"
                />
              </div>
              <div className="w-full md:w-1/2 px-3">
                <label className="block text-[#2F1C6A] -700 text-sm font-bold mb-2">
                  ছাত্রী সংখ্যা
                </label>
                <input
                  type="number"
                  value={girlsCount}
                  onChange={(e) => setGirlsCount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="যেমন: ২৫"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-bold">
                স্ট্যান্ডসমূহ (কমা বা স্পেস দিয়ে পৃথক করুন)
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
                      {stand.name} ({stand.boys} ছাত্র, {stand.girls} ছাত্রী)
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
                  placeholder="স্ট্যান্ডের নাম লিখুন"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRoute}
              className="bg-[#673DE5] cursor-pointer  duration-200 text-white px-6 py-3 rounded font-bold hover:bg-[#5025D1] transition-colors"
            >
              রুট যুক্ত করুন
            </motion.button>

            <div className="w-full mt-8">
              <h3 className="mb-4">সকল রুটের তালিকা</h3>
              <table className="w-full mt-5">
                <thead className="bg-[#8B5DFF]">
                  <tr className="text-white  rounded-tl-lg  text-left">
                    <th className="p-3 border-b-2 border-gray-200">রুট নাম</th>
                    <th className="p-3 border-b-2 border-gray-200">
                      স্ট্যান্ডসমূহ
                    </th>
                    <th className="p-3 border-b-2 border-gray-200">ছাত্র</th>
                    <th className="p-3 border-b-2 border-gray-200">ছাত্রী</th>
                    <th className="p-3 border-b-2 border-gray-200">ডিলিট</th>
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
                            className="text-red-500 px-4 py-2 rounded font-bold hover:scale-130 transition-all cursor-pointer"
                          >
                            🗑️
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
                        কোনো রুট পাওয়া যায়নি
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

      {/* College Excel Modal */}
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

      {/* Bus Management */}
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
          <h1 className="text-2xl font-bold mb-4">বাস ম্যানেজমেন্ট</h1>
          <div className="border-b border-gray-200 w-full"></div>

          <div className="shadow-lg rounded-sm p-10 mb-4 mt-8">
            <div className="flex gap-5 mb-4">
              <div className="flex-1">
                <label className="block font-bold mb-2">বাস নং</label>
                <input
                  type="text"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
                  placeholder="যেমন: ০১"
                />
              </div>
              <div className="flex-1">
                <label className="block font-bold mb-2">ধারণক্ষমতা</label>
                <input
                  type="number"
                  value={busCapacity}
                  onChange={(e) => setBusCapacity(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
                  placeholder="যেমন: ৪০"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-5 justify-between">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddBus}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded transition-all hover:translate-y-[-2px] shadow hover:shadow-md"
              >
                বাস যোগ করুন
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDummy2(true)}
                className="bg-purple-500 chutiya hover:bg-purple-600 text-white font-bold py-3 px-6 rounded transition-all hover:translate-y-[-2px] shadow hover:shadow-md"
              >
                Add Bus from Excel
              </motion.button>
            </div>

            <div className="mt-8 mb-4 flex justify-between text-lg font-semibold">
              <h1>সকল বাসের তালিকা</h1>
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
                    বাস নং
                  </th>
                  <th className="p-3 text-left font-bold border-b-2 border-gray-200">
                    ধারণক্ষমতা
                  </th>
                  <th className="p-3 text-left font-bold border-b-2 border-gray-200">
                    স্ট্যাটাস
                  </th>
                  <th className="p-3 text-left font-bold border-b-2 border-gray-200">
                    ডিলিট
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
                        <td className="p-3">{bus.capacity} জন</td>
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
                            {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                        </td>
                        <td className="p-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteBus(bus.number)}
                            className="text-red-500 text-xl hover:scale-110 transition-transform"
                          >
                            🗑️
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
                      কোনো বাস পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Update Day Shift Route */}
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
              রুট আপডেট করুন (ডে শিফট)
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-5 flex items-center">
              <span className="mr-2">🔄</span> রুট আপডেট করুন
            </h2>

            <div className="mb-5">
              <label className="block mb-2 font-bold">রুট নির্বাচন করুন</label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none"
              >
                <option value="">রুট নির্বাচন করুন</option>
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
                  <h3 className="text-lg font-semibold mb-3">স্ট্যান্ডসমূহ</h3>
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
                            <label className="block text-sm mb-1">ছাত্র</label>
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
                            <label className="block text-sm mb-1">ছাত্রী</label>
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
                  <h3 className="text-lg font-semibold mb-3">
                    নতুন স্ট্যান্ড যোগ করুন
                  </h3>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/3 px-3 mb-4">
                      <label className="block mb-2">স্ট্যান্ডের নাম</label>
                      <input
                        type="text"
                        value={newStandName}
                        onChange={(e) => setNewStandName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="স্ট্যান্ডের নাম"
                      />
                    </div>
                    <div className="w-full md:w-1/4 px-3 mb-4">
                      <label className="block mb-2">ছাত্র সংখ্যা</label>
                      <input
                        type="number"
                        value={newBoysCount}
                        onChange={(e) => setNewBoysCount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="ছাত্র"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/4 px-3 mb-4">
                      <label className="block mb-2">ছাত্রী সংখ্যা</label>
                      <input
                        type="number"
                        value={newGirlsCount}
                        onChange={(e) => setNewGirlsCount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="ছাত্রী"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/6 px-3 mb-4 flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNewStand}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      >
                        যোগ করুন
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateRoute}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded font-bold"
                  >
                    আপডেট করুন
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRoute("");
                      setUpdatedStands([]);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-bold"
                  >
                    রিসেট করুন
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Reset Data */}
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
              ডাটা রিসেট
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-5 flex items-center">
              <span className="mr-2">⚠️</span> ডাটাবেস রিসেট করুন
            </h2>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="text-yellow-700">
                সতর্কতা: এই অপারেশনটি সমস্ত রুট এবং বাস ডাটা মুছে ফেলবে। এটি
                শুধুমাত্র তখন ব্যবহার করুন যখন আপনি নিশ্চিত যে আপনি সমস্ত ডাটা
                রিসেট করতে চান।
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-10">
              <div className="text-5xl mb-6">🔄</div>
              <h3 className="text-2xl font-bold mb-4">ডাটাবেস রিসেট করুন</h3>
              <p className="text-[#2F1C6A] -600 mb-8 text-center max-w-md">
                এই বোতাম টিপলে সমস্ত রুট এবং বাস ডাটা স্থায়ীভাবে মুছে যাবে।
                পূর্বে সংরক্ষিত কোনো ডাটা পুনরুদ্ধার করা যাবে না।
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetDatabase}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
              >
                ডাটাবেস রিসেট করুন
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Morning Shift */}
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
            <div className="text-lg font-semibold">
              Total Students: {totalMorningStudents}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between  items-center">
              <div className="flex items-cente">
                <span className="mr-2 ">🛣️</span>
                <h1 className="text-xl font-bold mb-5 flex items-center">
                  {" "}
                  রাস্তা ব্যবস্থাপনা
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDummy(!dummy)}
                className="bg-[#673DE5] cursor-pointer  duration-200 text-white px-6 py-3 rounded-md font-bold hover:bg-[#5025D1] transition-colors"
              >
                Add From Excel
              </motion.button>
            </div>

            <div className="flex gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 font-bold">রাস্তার নাম</label>
                <input
                  value={routeName2}
                  onChange={handleChangeRouteName2}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  placeholder="যেমন: রুট ১"
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
                  placeholder="যেমন: ২৫"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-bold">
                স্ট্যান্ডসমূহ (কমা বা স্পেস দিয়ে পৃথক করুন)
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
                      {stand.name} ({stand.boys} ছাত্র)
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
                  placeholder="স্ট্যান্ডের নাম লিখুন"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRoute2}
              className="bg-[#673DE5] cursor-pointer  duration-200 text-white px-6 py-3 rounded font-bold hover:bg-[#5025D1] transition-colors"
            >
              রুট যুক্ত করুন
            </motion.button>

            <div className="w-full mt-8">
              <h3 className="mb-4">সকল রুটের তালিকা</h3>
              <table className="w-full mt-5">
                <thead className="bg-[#8B5DFF]">
                  <tr className="bg-ray-100 text-white text-left">
                    <th className="p-3 border-b-2 border-gray-200">রুট নাম</th>
                    <th className="p-3 border-b-2 border-gray-200">
                      স্ট্যান্ডসমূহ
                    </th>
                    <th className="p-3 border-b-2 border-gray-200">ছাত্র</th>
                    <th className="p-3 border-b-2 border-gray-200">ডিলিট</th>
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
                            className="text-red-500 px-4 py-2 rounded font-bold hover:scale-130 transition-all cursor-pointer"
                          >
                            🗑️
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
                        কোনো রুট পাওয়া যায়নি
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

      {/* Update Morning Shift Route */}
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
              রুট আপডেট করুন (মর্নিং শিফট)
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-5 flex items-center">
              <span className="mr-2">🔄</span> মর্নিং শিফট রুট আপডেট করুন
            </h2>

            <div className="mb-5">
              <label className="block mb-2 font-bold">রুট নির্বাচন করুন</label>
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
                <option value="">রুট নির্বাচন করুন</option>
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
                  <h3 className="text-lg font-semibold mb-3">স্ট্যান্ডসমূহ</h3>
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
                              ছাত্র সংখ্যা
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
                  <h3 className="text-lg font-semibold mb-3">
                    নতুন স্ট্যান্ড যোগ করুন
                  </h3>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/2 px-3 mb-4">
                      <label className="block mb-2">স্ট্যান্ডের নাম</label>
                      <input
                        type="text"
                        value={newStandNameMorning}
                        onChange={(e) => setNewStandNameMorning(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="স্ট্যান্ডের নাম"
                      />
                    </div>
                    <div className="w-full md:w-1/3 px-3 mb-4">
                      <label className="block mb-2">ছাত্র সংখ্যা</label>
                      <input
                        type="number"
                        value={newBoysCountMorning}
                        onChange={(e) => setNewBoysCountMorning(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="ছাত্র"
                        min="0"
                      />
                    </div>
                    <div className="w-full md:w-1/6 px-3 mb-4 flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNewStandMorning}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      >
                        যোগ করুন
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateRouteMorning}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded font-bold"
                  >
                    আপডেট করুন
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRouteMorning("");
                      setUpdatedStandsMorning([]);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-bold"
                  >
                    রিসেট করুন
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dummy Upload Modal */}
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
                Upload Dummy XLSX
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

      <ToastContainer />
    </div>
  );
};

export default Settings;
