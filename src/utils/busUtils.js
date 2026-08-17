export const getBusId = (bus) => {
  return String(bus?.id ?? bus?.number ?? bus?._id ?? bus?.busNumber ?? "");
};

export const getBusNumber = (bus) => {
  return String(bus?.number ?? bus?.id ?? bus?._id ?? bus?.busNumber ?? "");
};

export const normalizeStandName = (name) => {
  return String(name || "")
    .trim()
    .replace(/\s*\((boys|girls)\s+part\s+\d+\)\s*$/i, "")
    .replace(/\s*\(part\s+\d+\)\s*$/i, "")
    .replace(/\s*\((boys|girls)\s+part\)\s*$/i, "")
    .replace(/\s*\(part\)\s*$/i, "");
};

export const getAvailableBuses = (activeBuses, assignedBuses, editingBusId = "") => {
  const editingId = String(editingBusId);
  const assignedIds = (assignedBuses || []).map((b) => getBusId(b));
  const assignedFiltered = assignedIds.filter((id) => id !== editingId);
  
  return (activeBuses || []).filter((bus) => {
    const id = getBusId(bus);
    return !assignedFiltered.includes(id);
  });
};

export const getAssignedStandNames = (assignedBuses, tempSelect, editingBusId = "", normalizeFn = normalizeStandName) => {
  const editingId = String(editingBusId);
  const boysAssigned = new Set();
  const girlsAssigned = new Set();

  (assignedBuses || []).forEach((bus) => {
    const busId = getBusId(bus);
    if (busId === editingId) return;

    (bus.stands || []).forEach((stand) => {
      const base = normalizeFn(stand.originalName ?? stand.name);
      if (stand.gender === "girls") {
        girlsAssigned.add(base);
      } else {
        boysAssigned.add(base);
      }
    });
  });

  if (Array.isArray(tempSelect)) {
    tempSelect.forEach((stand) => {
      if (!stand?.name) return;
      const base = normalizeFn(stand.name);
      const gender = stand.gender || "boys";
      if (gender === "girls") {
        girlsAssigned.add(base);
      } else {
        boysAssigned.add(base);
      }
    });
  } else if (tempSelect?.boys || tempSelect?.girls) {
    (tempSelect.boys || []).forEach((s) => {
      boysAssigned.add(normalizeFn(s.name));
    });
    (tempSelect.girls || []).forEach((s) => {
      girlsAssigned.add(normalizeFn(s.name));
    });
  }

  return {
    boys: Array.from(boysAssigned),
    girls: Array.from(girlsAssigned),
  };
};

export const calculateOccupancy = (selectedStudents, capacity) => {
  if (!capacity || capacity === 0) return 0;
  return Math.min(100, (selectedStudents / capacity) * 100);
};

export const getStudentCount = (stand, gender) => {
  if (gender === "boys") {
    return Number(stand.boys || 0);
  }
  return Number(stand.girls || 0);
};


