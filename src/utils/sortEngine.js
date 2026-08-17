import { getBusId } from "./busUtils";
import {
  splitStandByGender,
  splitStandIfNeeded,
  findExistingBusForStand,
  findSuitableBus,
  assignStandToBus,
  createNewBusAssignment,
  buildUsedBusIdSet,
  sortStandsBySize,
  sortRoutesByDemand,
  sortBusesByCapacity,
  validateSortInputs,
  computeAssignmentSummary,
  createUnassignedEntry,
} from "./assignmentUtils";

export const SHIFT_TYPES = {
  MORNING: "morning",
  DAY: "day",
  COLLEGE: "college",
};

const assignStand = (stand, assignments, sortedBuses, usedBusIds, routeName, overload, gender) => {
  const existingBus = findExistingBusForStand(
    assignments,
    routeName,
    gender,
    stand.total,
    overload
  );

  if (existingBus) {
    assignStandToBus(existingBus, stand);
    return null;
  }

  const suitableBus = findSuitableBus(sortedBuses, usedBusIds, stand.total, overload);
  if (!suitableBus) {
    return createUnassignedEntry(stand, routeName, "No available bus with sufficient capacity");
  }

  const newAssignment = createNewBusAssignment(suitableBus, stand, routeName, gender);
  if (!newAssignment) {
    return createUnassignedEntry(stand, routeName, "Failed to create bus assignment");
  }

  assignments.push(newAssignment);
  usedBusIds.add(getBusId(suitableBus));
  return null;
};

const assignStandsByGender = (
  standsToAssign,
  assignments,
  routeName,
  sortedBuses,
  usedBusIds,
  overload,
  gender
) => {
  const unassigned = [];
  const genderStands = sortStandsBySize(
    standsToAssign.filter((s) => s.gender === gender)
  );

  for (const stand of genderStands) {
    const result = assignStand(
      stand,
      assignments,
      sortedBuses,
      usedBusIds,
      routeName,
      overload,
      gender
    );
    if (result) unassigned.push(result);
  }

  return unassigned;
};

const assignMorningRoute = (route, assignments, sortedBuses, usedBusIds, maxCapacity, overload) => {
  const unassigned = [];
  const standsToAssign = [];

  for (const stand of route.stands || []) {
    standsToAssign.push(...splitStandIfNeeded(stand, maxCapacity, route.name));
  }

  for (const stand of sortStandsBySize(standsToAssign)) {
    const result = assignStand(
      stand,
      assignments,
      sortedBuses,
      usedBusIds,
      route.name,
      overload,
      null
    );
    if (result) unassigned.push(result);
  }

  return unassigned;
};

const assignGenderSeparatedRoute = (
  route,
  assignments,
  sortedBuses,
  usedBusIds,
  maxCapacity,
  overload
) => {
  const standsToAssign = [];

  for (const stand of route.stands || []) {
    standsToAssign.push(...splitStandByGender(stand, maxCapacity, route.name));
  }

  const boysUnassigned = assignStandsByGender(
    standsToAssign,
    assignments,
    route.name,
    sortedBuses,
    usedBusIds,
    overload,
    "boys"
  );
  const girlsUnassigned = assignStandsByGender(
    standsToAssign,
    assignments,
    route.name,
    sortedBuses,
    usedBusIds,
    overload,
    "girls"
  );

  return [...boysUnassigned, ...girlsUnassigned];
};

/**
 * Run the bus sorting algorithm for a given shift.
 *
 * @param {Object} options
 * @param {Array} options.buses - Active fleet
 * @param {Array} options.routes - Route/stand data for the shift
 * @param {string} options.shiftType - 'morning' | 'day' | 'college'
 * @param {number} options.overload - Allowed overload per bus
 * @param {Set|Array} [options.excludeBusIds] - Bus IDs reserved by other shifts
 * @returns {Object} Sort result with assignments, unassigned, stats, success flag
 */
export const runSort = ({
  buses,
  routes,
  shiftType,
  overload = 0,
  excludeBusIds = [],
}) => {
  const validation = validateSortInputs(buses, routes);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      assignments: [],
      unassigned: [],
      stats: null,
    };
  }

  const excludeSet = new Set(
    (excludeBusIds || []).map((id) => String(id)).filter(Boolean)
  );

  const availableBuses = validation.validBuses.filter(
    (b) => !excludeSet.has(getBusId(b))
  );

  if (availableBuses.length === 0) {
    return {
      success: false,
      error: "All buses are reserved by other shifts. Disable cross-shift reservation or clear other assignments.",
      assignments: [],
      unassigned: [],
      stats: null,
    };
  }

  const sortedRoutes = sortRoutesByDemand(routes);
  const sortedBuses = sortBusesByCapacity(availableBuses);
  const maxBusCapacity = sortedBuses.length > 0
    ? Math.max(...sortedBuses.map((b) => Number(b.capacity)))
    : 0;
  const maxCapacity = maxBusCapacity + overload;

  const assignments = [];
  const usedBusIds = buildUsedBusIdSet(assignments);
  let allUnassigned = [];

  for (const route of sortedRoutes) {
    if (!route?.name) continue;

    const routeUnassigned =
      shiftType === SHIFT_TYPES.MORNING
        ? assignMorningRoute(route, assignments, sortedBuses, usedBusIds, maxCapacity, overload)
        : assignGenderSeparatedRoute(route, assignments, sortedBuses, usedBusIds, maxCapacity, overload);

    allUnassigned = allUnassigned.concat(routeUnassigned);
  }

  const stats = computeAssignmentSummary(assignments, overload);
  const totalStudents = sortedRoutes.reduce(
    (sum, r) =>
      sum +
      (r.stands || []).reduce(
        (s, st) => s + Number(st.boys || 0) + Number(st.girls || 0),
        0
      ),
    0
  );

  return {
    success: allUnassigned.length === 0,
    error: allUnassigned.length > 0
      ? `${allUnassigned.length} stand(s) could not be assigned. ${availableBuses.length} bus(es) available, ${stats.totalBuses} used.`
      : null,
    assignments,
    unassigned: allUnassigned,
    stats: {
      ...stats,
      totalStudents,
      unassignedCount: allUnassigned.length,
      busesAvailable: availableBuses.length,
      busesExcluded: excludeSet.size,
    },
  };
};

export const getExcludedBusIds = (otherShiftAssignments) => {
  const ids = [];
  for (const shiftList of otherShiftAssignments) {
    for (const bus of shiftList || []) {
      const id = getBusId(bus);
      if (id) ids.push(id);
    }
  }
  return ids;
};

export const formatUnassignedSummary = (unassigned, maxItems = 5) => {
  if (!unassigned || unassigned.length === 0) return "";

  const lines = unassigned.slice(0, maxItems).map(
    (u) => `${u.route} / ${u.stand}${u.gender ? ` (${u.gender})` : ""}: ${u.students} students`
  );

  if (unassigned.length > maxItems) {
    lines.push(`...and ${unassigned.length - maxItems} more`);
  }

  return lines.join("\n");
};
