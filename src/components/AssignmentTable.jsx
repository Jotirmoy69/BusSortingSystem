import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AssignmentTable = ({ 
  assignedBuses = [], 
  mode = 'manual',
  onEdit = () => {},
  onRemove = () => {} 
}) => {
  const location = useLocation();

  // Helper functions
  const getBusIdentifier = (bus) => bus.id || bus.number || `bus-${Math.random().toString(36).substr(2, 5)}`;
  const getStandName = (stand) => stand.stand || stand.name || 'Unknown';
  const getTotalStudents = (stand) => stand.total || (stand.boys || 0) + (stand.girls || 0);

  // Animation variants
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

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 font-[Noto Serif Bengali]">
        {mode === 'automation' ? 'অটোমেটিক নির্ধারণসমূহ' : 'বর্তমান নির্ধারণসমূহ'}
      </h2>
      <div className="overflow-x-auto">
        <motion.table 
          className="w-full shadow-lg rounded-md overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={tableVariants}
        >
          <thead className="bg-[#8B5DFF] text-white">
            <tr>
              <th className="border border-gray-500 p-2">বাস নং</th>
              <th className="border border-gray-500 p-2">ধারণক্ষমতা</th>
              <th className="border border-gray-500 p-2">পূর্ণ</th>
              <th className="border border-gray-500 p-2">পূরণের হার</th>
              {mode === 'automation' && (
                <>
                  <th className="border border-gray-500 p-2">ছাত্র</th>
                  <th className="border border-gray-500 p-2">ছাত্রী</th>
                </>
              )}
              <th className="border border-gray-500 p-2">স্ট্যান্ডসমূহ</th>
              {mode === 'automation' && (
                <th className="border border-gray-500 p-2">রাস্তা</th>
              )}
              {location.pathname === '/morning' && mode === 'manual' && (
                <th className="border border-gray-500 p-2">সক্রিয়তা</th>
              )}
            </tr>
          </thead>

          <tbody className="bg-[#F5F5FF]">
            {assignedBuses.length === 0 ? (
              <motion.tr variants={rowVariants}>
                <td 
                  colSpan={mode === 'automation' ? 8 : 6} 
                  className="text-center p-4 text-gray-500"
                >
                  কোনো বাসের জন্য এখনো কোন রাস্তা নির্ধারণ করা হয়নি
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
                      
                      {mode === 'automation' && (
                        <>
                          <td className="border border-gray-300 p-3">
                            {bus.boys ?? 'N/A'}
                          </td>
                          <td className="border border-gray-300 p-3">
                            {bus.girls ?? 'N/A'}
                          </td>
                        </>
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
                      
                      {mode === 'automation' && (
                        <td className="border border-gray-300 p-3">
                          {bus.route || 'N/A'}
                        </td>
                      )}
                      
                      {location.pathname === '/morning' && mode === 'manual' && (
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