// AI Assignment Engine - Genetic Algorithm Implementation
import { Matrix } from 'ml-matrix';

class AIAssignmentEngine {
  constructor(config = {}) {
    this.populationSize = config.populationSize || 50;
    this.generations = config.generations || 100;
    this.mutationRate = config.mutationRate || 0.1;
    this.crossoverRate = config.crossoverRate || 0.8;
    this.eliteSize = config.eliteSize || 5;
    this.isRunning = false;
  }

  // Main optimization function
  async optimizeAssignment(buses, routes, shiftType, constraints) {
    this.isRunning = true;
    
    try {
      // Prepare data for genetic algorithm
      const problemData = this.prepareProblemData(buses, routes, shiftType, constraints);
      
      // Run genetic algorithm
      const bestSolution = this.runGeneticAlgorithm(problemData);
      
      // Convert solution back to assignment format
      const assignments = this.convertSolutionToAssignments(bestSolution, buses, routes, shiftType);
      
      this.isRunning = false;
      return assignments;
    } catch (error) {
      this.isRunning = false;
      throw new Error(`AI optimization failed: ${error.message}`);
    }
  }

  // Prepare data structure for genetic algorithm
  prepareProblemData(buses, routes, shiftType, constraints) {
    const stands = [];
    const busIds = buses.map(bus => bus.number || bus.id);
    
    // Flatten all stands from all routes
    routes.forEach(route => {
      route.stands.forEach(stand => {
        stands.push({
          ...stand,
          routeName: route.name,
          totalStudents: (stand.boys || 0) + (stand.girls || 0)
        });
      });
    });

    return {
      buses: buses,
      busIds: busIds,
      stands: stands,
      shiftType: shiftType,
      constraints: constraints,
      totalStands: stands.length,
      totalBuses: buses.length
    };
  }

  // Genetic Algorithm Implementation
  runGeneticAlgorithm(problemData) {
    let population = this.initializePopulation(problemData);
    
    for (let generation = 0; generation < this.generations; generation++) {
      // Evaluate fitness for all individuals
      // Enforce gender separation first, then capacity constraints, then evaluate fitness
      population = population.map(individual => {
        // Enforce gender separation for day/college shifts first
        let constrainedIndividual = this.enforceGenderSeparation(individual, problemData.shiftType);
        
        // Then enforce capacity constraints
        constrainedIndividual = this.enforceCapacityConstraints(constrainedIndividual, problemData.buses, problemData.constraints);
        
        return {
          ...constrainedIndividual,
          fitness: this.calculateFitness(constrainedIndividual, problemData)
        };
      });
      
      // Sort by fitness (higher is better)
      population.sort((a, b) => b.fitness - a.fitness);
      
      
      // Create new generation
      const newPopulation = [];
      
      // Keep elite individuals
      for (let i = 0; i < this.eliteSize; i++) {
        newPopulation.push({ ...population[i] });
      }
      
      // Generate offspring
      while (newPopulation.length < this.populationSize) {
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);
        
        const offspring = this.crossover(parent1, parent2, problemData);
        const mutatedOffspring = this.mutate(offspring, problemData);
        
        newPopulation.push(mutatedOffspring);
      }
      
      population = newPopulation;
    }
    
    // Return best solution with gender separation and capacity enforcement
    population.sort((a, b) => b.fitness - a.fitness);
    const bestSolution = population[0];
    let finalSolution = this.enforceGenderSeparation(bestSolution, problemData.shiftType);
    finalSolution = this.enforceCapacityConstraints(finalSolution, problemData.buses, problemData.constraints);
    return finalSolution;
  }

  // Initialize random population
  initializePopulation(problemData) {
    const population = [];
    
    for (let i = 0; i < this.populationSize; i++) {
      const individual = {
        assignments: this.createRandomAssignment(problemData),
        fitness: 0
      };
      population.push(individual);
    }
    
    return population;
  }

  // Create random assignment
  createRandomAssignment(problemData) {
    const assignments = [];
    const { buses, stands, shiftType } = problemData;
    
    // Group stands by route
    const standsByRoute = {};
    stands.forEach(stand => {
      if (!standsByRoute[stand.routeName]) {
        standsByRoute[stand.routeName] = [];
      }
      standsByRoute[stand.routeName].push(stand);
    });
    
    // Assign each route to a RANDOM bus for diversity
    Object.keys(standsByRoute).forEach(routeName => {
      const routeStands = standsByRoute[routeName];
      const totalStudents = routeStands.reduce((sum, stand) => sum + stand.totalStudents, 0);
      
      // Randomly select a bus for diversity
      const randomBus = buses[Math.floor(Math.random() * buses.length)];
      
      assignments.push({
        busId: randomBus.number || randomBus.id,
        routeName: routeName,
        stands: routeStands,
        totalStudents: totalStudents
      });
    });
    
    return assignments;
  }

  // Calculate fitness score
  calculateFitness(individual, problemData) {
    let fitness = 0;
    const { buses, constraints, shiftType } = problemData;
    
    // 1. CRITICAL: Respect capacity constraints (30% weight) - Important but not overwhelming
    const overloadScore = this.calculateOverloadScore(individual, buses, constraints);
    fitness += overloadScore * 0.3;
    
    // 2. Maximize bus utilization (35% weight) - Higher weight for better efficiency
    const utilizationScore = this.calculateUtilizationScore(individual, buses);
    fitness += utilizationScore * 0.35;
    
    // 3. Minimize unassigned students (25% weight) - Higher weight to assign more students
    const unassignedScore = this.calculateUnassignedScore(individual, problemData);
    fitness += unassignedScore * 0.25;
    
    // 4. Balance gender distribution for day/college shifts (5% weight)
    const genderScore = this.calculateGenderBalanceScore(individual, shiftType);
    fitness += genderScore * 0.05;
    
    // 5. Minimize route complexity (5% weight)
    const complexityScore = this.calculateComplexityScore(individual);
    fitness += complexityScore * 0.05;
    
    return Math.max(0, fitness);
  }

  // Calculate overload penalty - HEAVILY penalize overload
  calculateOverloadScore(individual, buses, constraints) {
    let totalOverloadPenalty = 0;
    const maxOverload = constraints.morningOverload || constraints.dayOverload || constraints.collegeOverload || 0;
    
    individual.assignments.forEach(assignment => {
      const bus = buses.find(b => (b.number || b.id) === assignment.busId);
      if (bus) {
        const maxAllowed = bus.capacity + maxOverload;
        const actualStudents = assignment.totalStudents;
        
        if (actualStudents > maxAllowed) {
          // Moderate penalty for overload - linear penalty
          const overloadAmount = actualStudents - maxAllowed;
          const penalty = overloadAmount * 5; // Linear penalty instead of exponential
          totalOverloadPenalty += penalty;
        }
      }
    });
    
    // Return score (higher is better), heavily penalize overload
    return Math.max(0, 1000 - totalOverloadPenalty);
  }

  // Calculate bus utilization score
  calculateUtilizationScore(individual, buses) {
    let totalUtilization = 0;
    let assignedBuses = 0;
    
    individual.assignments.forEach(assignment => {
      const bus = buses.find(b => (b.number || b.id) === assignment.busId);
      if (bus) {
        const utilization = Math.min(100, (assignment.totalStudents / bus.capacity) * 100);
        totalUtilization += utilization;
        assignedBuses++;
      }
    });
    
    return assignedBuses > 0 ? totalUtilization / assignedBuses : 0;
  }

  // Calculate route complexity score
  calculateComplexityScore(individual) {
    // Prefer fewer buses with more students per bus
    const busUsage = {};
    individual.assignments.forEach(assignment => {
      busUsage[assignment.busId] = (busUsage[assignment.busId] || 0) + assignment.totalStudents;
    });
    
    const usedBuses = Object.keys(busUsage).length;
    const totalStudents = Object.values(busUsage).reduce((sum, students) => sum + students, 0);
    const avgStudentsPerBus = totalStudents / usedBuses;
    
    return Math.min(100, avgStudentsPerBus);
  }

  // Calculate gender balance score - ensure proper gender separation for day/college shifts
  calculateGenderBalanceScore(individual, shiftType) {
    if (shiftType === 'morning') return 100; // No gender separation for morning
    
    let genderSeparationScore = 0;
    let totalBuses = 0;
    
    // Check each bus assignment for proper gender separation
    individual.assignments.forEach(assignment => {
      let boys = 0;
      let girls = 0;
      
      assignment.stands.forEach(stand => {
        boys += stand.boys || 0;
        girls += stand.girls || 0;
      });
      
      totalBuses++;
      
      // For day/college shifts, buses should be either boys-only or girls-only
      if (boys > 0 && girls > 0) {
        // Mixed gender bus - penalize heavily
        genderSeparationScore -= 50;
      } else if (boys > 0 || girls > 0) {
        // Single gender bus - reward
        genderSeparationScore += 100;
      }
    });
    
    return totalBuses > 0 ? Math.max(0, genderSeparationScore / totalBuses) : 100;
  }

  // Calculate unassigned students score
  calculateUnassignedScore(individual, problemData) {
    const assignedStudents = individual.assignments.reduce(
      (sum, assignment) => sum + assignment.totalStudents, 0
    );
    const totalStudents = problemData.stands.reduce(
      (sum, stand) => sum + stand.totalStudents, 0
    );
    
    const unassignedRatio = Math.max(0, (totalStudents - assignedStudents) / totalStudents);
    return (1 - unassignedRatio) * 100;
  }

  // Tournament selection
  tournamentSelection(population) {
    const tournamentSize = 3;
    let best = population[Math.floor(Math.random() * population.length)];
    
    for (let i = 1; i < tournamentSize; i++) {
      const candidate = population[Math.floor(Math.random() * population.length)];
      if (candidate.fitness > best.fitness) {
        best = candidate;
      }
    }
    
    return best;
  }

  // Crossover operation
  crossover(parent1, parent2, problemData) {
    if (Math.random() > this.crossoverRate) {
      return { ...parent1 };
    }
    
    const child = {
      assignments: [],
      fitness: 0
    };
    
    // Uniform crossover - randomly select from each parent
    const allRoutes = new Set();
    parent1.assignments.forEach(assignment => allRoutes.add(assignment.routeName));
    parent2.assignments.forEach(assignment => allRoutes.add(assignment.routeName));
    
    allRoutes.forEach(routeName => {
      const parent1Assignment = parent1.assignments.find(a => a.routeName === routeName);
      const parent2Assignment = parent2.assignments.find(a => a.routeName === routeName);
      
      if (parent1Assignment && parent2Assignment) {
        child.assignments.push(Math.random() < 0.5 ? parent1Assignment : parent2Assignment);
      } else if (parent1Assignment) {
        child.assignments.push(parent1Assignment);
      } else if (parent2Assignment) {
        child.assignments.push(parent2Assignment);
      }
    });
    
    return child;
  }

  // Mutation operation - respect capacity constraints
  mutate(individual, problemData) {
    if (Math.random() > this.mutationRate) {
      return individual;
    }
    
    const mutated = { ...individual };
    
    // Randomly reassign a route to a different bus
    if (mutated.assignments.length > 0) {
      const randomIndex = Math.floor(Math.random() * mutated.assignments.length);
      const randomBus = problemData.buses[Math.floor(Math.random() * problemData.buses.length)];
      mutated.assignments[randomIndex].busId = randomBus.number || randomBus.id;
      
      // Enforce gender separation and capacity constraints after mutation
      let constrainedMutated = this.enforceGenderSeparation(mutated, problemData.shiftType);
      return this.enforceCapacityConstraints(constrainedMutated, problemData.buses, problemData.constraints);
    }
    
    return mutated;
  }

  // Validate assignment constraints - STRICT capacity enforcement
  validateAssignment(assignment, buses, constraints) {
    const bus = buses.find(b => (b.number || b.id) === assignment.busId);
    if (!bus) return false;
    
    const maxOverload = constraints.morningOverload || constraints.dayOverload || constraints.collegeOverload || 0;
    const maxAllowed = bus.capacity + maxOverload;
    
    // STRICT: Never allow more than capacity + small overload
    return assignment.totalStudents <= maxAllowed;
  }

  // Enforce capacity constraints on individual
  enforceCapacityConstraints(individual, buses, constraints) {
    const maxOverload = constraints.morningOverload || constraints.dayOverload || constraints.collegeOverload || 0;
    
    individual.assignments.forEach(assignment => {
      const bus = buses.find(b => (b.number || b.id) === assignment.busId);
      if (bus) {
        const maxAllowed = bus.capacity + maxOverload;
        
        // STRICT: Never allow overload - remove stands until within capacity
        if (assignment.totalStudents > maxAllowed) {
          // Keep removing stands until we're within capacity
          while (assignment.totalStudents > maxAllowed && assignment.stands.length > 0) {
            // Remove the largest stand
            const sortedStands = [...assignment.stands].sort((a, b) => 
              ((b.boys || 0) + (b.girls || 0)) - ((a.boys || 0) + (a.girls || 0))
            );
            
            const largestStand = sortedStands[0];
            assignment.stands = assignment.stands.filter(stand => stand !== largestStand);
            
            // Recalculate total
            assignment.totalStudents = assignment.stands.reduce((sum, stand) => 
              sum + (stand.boys || 0) + (stand.girls || 0), 0
            );
          }
        }
      }
    });
    
    return individual;
  }

  // Enforce gender separation for day/college shifts
  enforceGenderSeparation(individual, shiftType) {
    if (shiftType === 'morning') return individual; // No gender separation for morning
    
    individual.assignments.forEach(assignment => {
      let boys = 0;
      let girls = 0;
      
      assignment.stands.forEach(stand => {
        boys += stand.boys || 0;
        girls += stand.girls || 0;
      });
      
      // If mixed gender, keep the larger group to maintain separation
      if (boys > 0 && girls > 0) {
        if (boys >= girls) {
          // Keep boys, remove girls stands
          assignment.stands = assignment.stands.filter(stand => (stand.boys || 0) > 0);
        } else {
          // Keep girls, remove boys stands
          assignment.stands = assignment.stands.filter(stand => (stand.girls || 0) > 0);
        }
        
        // Recalculate totals
        assignment.totalStudents = assignment.stands.reduce((sum, stand) => 
          sum + (stand.boys || 0) + (stand.girls || 0), 0
        );
      }
    });
    
    return individual;
  }

  // Convert solution to assignment format
  convertSolutionToAssignments(solution, buses, routes, shiftType) {
    const assignments = [];
    const busAssignments = {};
    
    // Group assignments by bus
    solution.assignments.forEach(assignment => {
      const busId = assignment.busId;
      if (!busAssignments[busId]) {
        busAssignments[busId] = {
          busId: busId,
          stands: [],
          totalStudents: 0,
          boys: 0,
          girls: 0
        };
      }
      
      assignment.stands.forEach(stand => {
        busAssignments[busId].stands.push({
          name: stand.name,
          originalName: stand.name,
          boys: stand.boys || 0,
          girls: stand.girls || 0,
          total: stand.totalStudents
        });
        busAssignments[busId].totalStudents += stand.totalStudents;
        busAssignments[busId].boys += stand.boys || 0;
        busAssignments[busId].girls += stand.girls || 0;
      });
    });
    
    // Convert to final format
    Object.values(busAssignments).forEach(assignment => {
      const bus = buses.find(b => (b.number || b.id) === assignment.busId);
      if (bus) {
        assignments.push({
          id: assignment.busId,
          number: assignment.busId,
          capacity: bus.capacity,
          assigned: assignment.totalStudents,
          boys: assignment.boys,
          girls: assignment.girls,
          stands: assignment.stands,
          route: assignment.stands[0]?.routeName || 'AI Assignment',
          gender: (shiftType === 'day' || shiftType === 'college') ? (assignment.boys > assignment.girls ? 'boys' : 'girls') : undefined
        });
      }
    });
    
    return assignments;
  }
}

export default AIAssignmentEngine;
