import { getBusId, getBusNumber } from "./busUtils";

export const createStandEntry = (name, boys, girls, gender, originalName, routeName) => {
  const boysCount = Number(boys || 0);
  const girlsCount = Number(girls || 0);
  return {
    route: routeName,
    name,
    originalName: originalName || name,
    boys: boysCount,
    girls: girlsCount,
    total: boysCount + girlsCount,
    gender,
  };
};

export const splitStandIfNeeded = (stand, maxCapacity, routeName) => {
  const stands = [];
  const boys = Number(stand.boys || 0);
  const girls = Number(stand.girls || 0);
  const total = boys + girls;

  if (total <= 0) return stands;

  if (total <= maxCapacity) {
    stands.push(createStandEntry(stand.name, boys, girls, null, stand.name, routeName));
    return stands;
  }

  let remaining = total;
  let remainingBoys = boys;
  let remainingGirls = girls;
  let partNum = 1;

  while (remaining > 0) {
    const chunk = Math.min(remaining, maxCapacity);
    const boyChunk = Math.min(remainingBoys, chunk);
    const girlChunk = chunk - boyChunk;

    const partLabel = `${stand.name} (part ${partNum})`;

    stands.push(createStandEntry(
      partLabel,
      boyChunk,
      girlChunk,
      null,
      stand.name,
      routeName
    ));

    remainingBoys -= boyChunk;
    remainingGirls -= girlChunk;
    remaining -= chunk;
    partNum += 1;
  }

  return stands;
};

export const splitStandByGender = (stand, maxCapacity, routeName) => {
  const stands = [];
  const boys = Number(stand.boys || 0);
  const girls = Number(stand.girls || 0);

  if (boys > 0) {
    if (boys > maxCapacity) {
      let remaining = boys;
      let partNum = 1;
      while (remaining > 0) {
        const chunk = Math.min(remaining, maxCapacity);
        stands.push(createStandEntry(
          `${stand.name} (boys part ${partNum})`,
          chunk,
          0,
          "boys",
          stand.name,
          routeName
        ));
        remaining -= chunk;
        partNum += 1;
      }
    } else {
      stands.push(createStandEntry(stand.name, boys, 0, "boys", stand.name, routeName));
    }
  }

  if (girls > 0) {
    if (girls > maxCapacity) {
      let remaining = girls;
      let partNum = 1;
      while (remaining > 0) {
        const chunk = Math.min(remaining, maxCapacity);
        stands.push(createStandEntry(
          `${stand.name} (girls part ${partNum})`,
          0,
          chunk,
          "girls",
          stand.name,
          routeName
        ));
        remaining -= chunk;
        partNum += 1;
      }
    } else {
      stands.push(createStandEntry(stand.name, 0, girls, "girls", stand.name, routeName));
    }
  }

  return stands;
};

export const buildUsedBusIdSet = (assignments) => {
  const used = new Set();
  for (const assignment of assignments || []) {
    const id = getBusId(assignment);
    if (id) used.add(id);
  }
  return used;
};

export const sortStandsBySize = (stands) => {
  return [...(stands || [])].sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
};

export const sortRoutesByDemand = (routes) => {
  return [...(routes || [])].sort((a, b) => {
    const totalA = (a.stands || []).reduce((sum, s) => sum + Number(s.boys || 0) + Number(s.girls || 0), 0);
    const totalB = (b.stands || []).reduce((sum, s) => sum + Number(s.boys || 0) + Number(s.girls || 0), 0);
    return totalB - totalA;
  });
};

export const sortBusesByCapacity = (buses) => {
  return [...(buses || [])]
    .filter((b) => b && Number(b.capacity) > 0)
    .sort((a, b) => Number(b.capacity || 0) - Number(a.capacity || 0));
};

/**
 * Best-fit: pick the smallest unused bus whose effective capacity fits the stand.
 * Minimizes wasted capacity and reduces total buses needed.
 */
export const findSuitableBus = (buses, usedBusIds, standTotal, overload) => {
  if (!buses || buses.length === 0 || standTotal <= 0) return null;

  let bestBus = null;
  let bestWaste = Infinity;

  for (const bus of buses) {
    if (!bus || !bus.capacity) continue;
    const busId = getBusId(bus);
    if (usedBusIds.has(busId)) continue;

    const effectiveCapacity = Number(bus.capacity) + overload;
    if (effectiveCapacity >= standTotal) {
      const waste = effectiveCapacity - standTotal;
      if (waste < bestWaste) {
        bestWaste = waste;
        bestBus = bus;
      }
    }
  }

  return bestBus;
};

/**
 * Best-fit consolidation: prefer the bus on the same route with the least remaining space.
 */
export const findExistingBusForStand = (assignments, routeName, gender, standTotal, overload) => {
  if (!assignments || assignments.length === 0 || standTotal <= 0) return null;

  const routeBuses = assignments
    .filter((b) => {
      if (!b) return false;
      const matchesRoute = b.route === routeName;
      const matchesGender = gender
        ? b.gender === gender
        : !b.gender || b.gender === null;
      return matchesRoute && matchesGender;
    })
    .sort((a, b) => {
      const aSpace = Number(a.capacity || 0) + overload - Number(a.assigned || 0);
      const bSpace = Number(b.capacity || 0) + overload - Number(b.assigned || 0);
      return aSpace - bSpace;
    });

  for (const bus of routeBuses) {
    const effectiveCapacity = Number(bus.capacity || 0) + overload;
    const busAssigned = Number(bus.assigned || 0);
    if (busAssigned + standTotal <= effectiveCapacity) {
      return bus;
    }
  }

  return null;
};

export const assignStandToBus = (bus, stand) => {
  if (!bus || !stand) return false;
  if (!bus.stands) bus.stands = [];
  bus.stands.push(stand);
  bus.boys = Number(bus.boys || 0) + Number(stand.boys || 0);
  bus.girls = Number(bus.girls || 0) + Number(stand.girls || 0);
  bus.assigned = Number(bus.assigned || 0) + Number(stand.total || 0);
  return true;
};

export const createNewBusAssignment = (bus, stand, routeName, gender = null) => {
  if (!bus || !stand) return null;
  const id = getBusId(bus);
  const number = getBusNumber(bus);
  if (!id) return null;

  return {
    id,
    number,
    capacity: Number(bus.capacity || 0),
    assigned: Number(stand.total || 0),
    boys: Number(stand.boys || 0),
    girls: Number(stand.girls || 0),
    stands: [stand],
    route: routeName,
    ...(gender && { gender }),
  };
};

export const validateSortInputs = (buses, routes) => {
  if (!Array.isArray(buses) || buses.length === 0) {
    return { valid: false, error: "No active buses available for assignment." };
  }

  const validBuses = buses.filter((b) => b && Number(b.capacity) > 0);
  if (validBuses.length === 0) {
    return { valid: false, error: "All buses have zero or invalid capacity." };
  }

  if (!Array.isArray(routes) || routes.length === 0) {
    return { valid: false, error: "No route/stand data loaded for this shift." };
  }

  const hasStands = routes.some(
    (r) => Array.isArray(r.stands) && r.stands.length > 0
  );
  if (!hasStands) {
    return { valid: false, error: "Routes exist but contain no stands to assign." };
  }

  return { valid: true, validBuses };
};

export const computeAssignmentSummary = (assignments, overload = 0) => {
  const list = assignments || [];
  const totalAssigned = list.reduce((s, b) => s + Number(b.assigned || 0), 0);
  const totalCapacity = list.reduce((s, b) => s + Number(b.capacity || 0), 0);
  const effectiveCapacity = list.reduce(
    (s, b) => s + Number(b.capacity || 0) + overload,
    0
  );

  return {
    totalBuses: list.length,
    totalAssigned,
    totalCapacity,
    effectiveCapacity,
    utilizationRate: totalCapacity > 0
      ? Math.round((totalAssigned / totalCapacity) * 100)
      : 0,
    underfilledBuses: list.filter(
      (b) => Number(b.assigned) < Number(b.capacity)
    ),
    overloadedBuses: list.filter(
      (b) => Number(b.assigned) > Number(b.capacity) + overload
    ),
    withinOverloadBuses: list.filter(
      (b) =>
        Number(b.assigned) > Number(b.capacity) &&
        Number(b.assigned) <= Number(b.capacity) + overload
    ),
  };
};

export const createUnassignedEntry = (stand, routeName, reason) => ({
  route: routeName || stand.route,
  stand: stand.originalName || stand.name,
  gender: stand.gender || null,
  students: Number(stand.total || 0),
  reason,
});
