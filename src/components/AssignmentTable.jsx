import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom"; // ✅ Imported useLocation

const AssignmentTable = ({ 
  assignedBuses = [], 
  mode = 'manual',
  onEdit = () => {},
  onRemove = () => {} 
}) => {

  const location = useLocation(); // ✅ Get current path
  const showActions = ['/morning', '/day'].includes(location.pathname); // ✅ Only show on these paths

  const getBusIdentifier = (bus) => bus.id || bus.number || `bus-${Math.random().toString(36).substr(2, 5)}`;
  const getStandName = (stand) => stand.stand || stand.name || 'Unknown';
  const getTotalStudents = (stand) => stand.total || (stand.boys || 0) + (stand.girls || 0);
  
  const showGender = mode === 'day-shift';

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.3,
        type: "spring",
        stiffness: 100
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  const progressBarVariants = {
    hidden: { width: 0 },
    visible: { 
      width: "100%",
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const standItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    }
  };

  const columnCount = showGender ? 
    (mode === 'automation' ? 9 : 7) : 
    (mode === 'automation' ? 8 : 6);

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <motion.table 
          className="w-full shadow-lg rounded-md overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={tableVariants}
        >
          <thead className="bg-[#8B5DFF] text-white">
            <tr>
              <th className="border border-gray-500 p-2">Bus ID</th>
              <th className="border border-gray-500 p-2">Capacity</th>
              <th className="border border-gray-500 p-2">Assigned</th>
              <th className="border border-gray-500 p-2">Utilization</th>
              {showGender && (
                <th className="border border-gray-500 p-2">Gender</th>
              )}
              <th className="border border-gray-500 p-2">Stands</th>
              {showActions && (
                <th className="border border-gray-500 p-2">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="bg-[#F5F5FF]">
            {assignedBuses.length === 0 ? (
              <motion.tr variants={rowVariants}>
                <td 
                  colSpan={columnCount} 
                  className="text-center p-4 text-gray-500"
                >
                  No buses assigned yet
                </td>
              </motion.tr>
            ) : (
              <AnimatePresence>
                {assignedBuses.map((bus) => {
                  const utilization = bus.capacity ? 
                    Math.round((bus.assigned / bus.capacity) * 100) : 0;
                  const isOverloaded = bus.assigned > bus.capacity;
                  
                  return (
                    <motion.tr
                      key={getBusIdentifier(bus)}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="hover:bg-gray-50"
                      whileHover={{ 
                        backgroundColor: "rgba(249, 250, 251, 0.8)"
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <td className="border border-gray-300 p-3 font-medium">
                        {bus.number || bus.id || 'N/A'}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {bus.capacity || 0}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {bus.assigned || 0}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <motion.div 
                            className={`h-2.5 rounded-full ${
                              isOverloaded ? 'bg-red-600' : 
                              utilization < 80 ? 'bg-yellow-500' : 'bg-green-600'
                            }`}
                            initial="hidden"
                            animate="visible"
                            variants={progressBarVariants}
                            custom={utilization}
                            style={{ 
                              width: `${Math.min(utilization, 100)}%`,
                              originX: 0
                            }}
                          />
                        </div>
                        <motion.span 
                          className={`text-sm ${
                            isOverloaded ? 'text-red-600' : 
                            utilization < 80 ? 'text-yellow-600' : 'text-green-600'
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {utilization}%
                          {isOverloaded && ' (Overloaded)'}
                        </motion.span>
                      </td>
                      
                      {showGender && (
                        <td className="border border-gray-300 p-3">
                          <div className="flex flex-wrap gap-1">
                            {bus.stands && bus.stands.map((stand, index) => (
                              <span 
                                key={index}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  stand.gender === 'boys' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-pink-100 text-pink-800'
                                }`}
                              >
                                {stand.gender || 'mixed'}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}
                      
                      <td className="border border-gray-300 p-3">
                        {bus.stands && bus.stands.length > 0 ? (
                          <motion.ul 
                            className="flex flex-wrap gap-2"
                            initial="hidden"
                            animate="visible"
                            transition={{ staggerChildren: 0.05 }}
                          >
                            {bus.stands.map((stand, index) => (
                              <motion.li 
                                key={index}
                                variants={standItemVariants}
                                className="bg-purple-100 cursor-pointer px-3 py-1 rounded-full text-sm 
                                          flex items-center whitespace-nowrap border border-purple-200"
                                whileHover="hover"
                              >
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"/>
                                {getStandName(stand)} ({getTotalStudents(stand)})
                              </motion.li>
                            ))}
                          </motion.ul>
                        ) : (
                          'No stands'
                        )}
                      </td>
                      
                      {showActions && (
                        <td className="border border-gray-300 p-3">
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => onEdit(bus)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                              title="Edit this assignment"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={() => onRemove(bus.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                              title="Remove this assignment"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Remove
                            </motion.button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </motion.table>
      </div>
    </div>
  );
};

export default AssignmentTable;
