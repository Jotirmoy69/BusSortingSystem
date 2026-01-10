import { getBusId, getBusNumber } from "./busUtils";

export const createStandEntry = (name, boys, girls, gender, originalName, routeName) => {
  return {
    route: routeName,
    name,
    originalName: originalName || name,
    boys: Number(boys || 0),
    girls: Number(girls || 0),
    total: Number(boys || 0) + Number(girls || 0),
    gender,
  };
};

export const splitStandIfNeeded = (stand, maxCapacity, routeName) => {
  const stands = [];
  const boys = Number(stand.boys || 0);
  const girls = Number(stand.girls || 0);
  const total = boys + girls;

  if (total <= maxCapacity) {
    stands.push(createStandEntry(stand.name, boys, girls, null, stand.name, routeName));
    return stands;
  }

  let remaining = total;
  let remainingBoys = boys;
  let remainingGirls = girls;

  while (remaining > 0) {
    const chunk = Math.min(remaining, maxCapacity);
    const boyChunk = Math.min(remainingBoys, chunk);
    const girlChunk = chunk - boyChunk;
    
    stands.push(createStandEntry(
      `${stand.name} (part)`,
      boyChunk,
      girlChunk,
      null,
      stand.name,
      routeName
    ));
    
    remainingBoys -= boyChunk;
    remainingGirls -= girlChunk;
    remaining -= chunk;
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
      while (remaining > 0) {
        const chunk = Math.min(remaining, maxCapacity);
        stands.push(createStandEntry(
          `${stand.name} (boys part)`,
          chunk,
          0,
          "boys",
          stand.name,
          routeName
        ));
        remaining -= chunk;
      }
    } else {
      stands.push(createStandEntry(stand.name, boys, 0, "boys", stand.name, routeName));
    }
  }

  if (girls > 0) {
    if (girls > maxCapacity) {
      let remaining = girls;
      while (remaining > 0) {
        const chunk = Math.min(remaining, maxCapacity);
        stands.push(createStandEntry(
          `${stand.name} (girls part)`,
          0,
          chunk,
          "girls",
          stand.name,
          routeName
        ));
        remaining -= chunk;
      }
    } else {
      stands.push(createStandEntry(stand.name, 0, girls, "girls", stand.name, routeName));
    }
  }

  return stands;
};

export const findSuitableBus = (sortedBuses, assignments, standTotal, overload) => {
  if (!sortedBuses || sortedBuses.length === 0) return null;
  return sortedBuses.find((bus) => {
    if (!bus || !bus.capacity) return false;
    const busId = getBusId(bus);
    const isUsed = (assignments || []).some((a) => getBusId(a) === busId);
    const effectiveCapacity = Number(bus.capacity || 0) + overload;
    return !isUsed && effectiveCapacity >= standTotal;
  });
};

export const findExistingBusForStand = (assignments, routeName, gender, standTotal, overload) => {
  if (!assignments || assignments.length === 0) return null;
  const routeBuses = assignments
    .filter((b) => {
      if (!b) return false;
      const matchesRoute = b.route === routeName;
      const matchesGender = gender ? (b.gender === gender) : (!b.gender || b.gender === null);
      return matchesRoute && matchesGender;
    })
    .sort((a, b) => {
      const aCapacity = Number(a.capacity || 0);
      const bCapacity = Number(b.capacity || 0);
      const aAssigned = Number(a.assigned || 0);
      const bAssigned = Number(b.assigned || 0);
      const aSpace = aCapacity + overload - aAssigned;
      const bSpace = bCapacity + overload - bAssigned;
      return bSpace - aSpace;
    });

  for (const bus of routeBuses) {
    const busCapacity = Number(bus.capacity || 0);
    const busAssigned = Number(bus.assigned || 0);
    const effectiveCapacity = busCapacity + overload;
    if (busAssigned + standTotal <= effectiveCapacity) {
      return bus;
    }
  }

  return null;
};

export const assignStandToBus = (bus, stand) => {
  if (!bus || !stand) return;
  if (!bus.stands) bus.stands = [];
  bus.stands.push(stand);
  bus.boys = Number(bus.boys || 0) + Number(stand.boys || 0);
  bus.girls = Number(bus.girls || 0) + Number(stand.girls || 0);
  bus.assigned = Number(bus.assigned || 0) + Number(stand.total || 0);
};

export const createNewBusAssignment = (bus, stand, routeName, gender = null) => {
  if (!bus || !stand) return null;
  const id = getBusId(bus);
  const number = getBusNumber(bus);
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

