import React from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaStop, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useAudioAnnouncement } from '../hooks/useAudioAnnouncement';
import { toast } from 'sonner';

const AudioControls = ({ 
  assignedBuses = [], 
  shift = 'morning', 
  className = '',
  showText = true,
  compact = false 
}) => {
  const { 
    isPlaying, 
    isGenerating, 
    playAnnouncement, 
    stopAnnouncement,
    currentAnnouncement 
  } = useAudioAnnouncement();

  const handlePlayAnnouncement = () => {
    if (assignedBuses.length === 0) {
      toast.error('No buses assigned to announce');
      return;
    }
    
    playAnnouncement(assignedBuses, shift);
  };

  const handleStopAnnouncement = () => {
    stopAnnouncement();
    toast.info('Announcement stopped');
  };

  const getShiftDisplayName = () => {
    switch (shift.toLowerCase()) {
      case 'morning': return 'Morning Shift';
      case 'day': return 'Day Shift';
      case 'college': return 'College Shift';
      default: return 'Bus Assignments';
    }
  };

  const getShiftColor = () => {
    switch (shift.toLowerCase()) {
      case 'morning': return 'purple';
      case 'day': return 'blue';
      case 'college': return 'green';
      default: return 'gray';
    }
  };

  const colorClasses = {
    purple: {
      bg: 'bg-purple-600',
      hover: 'hover:bg-purple-700',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    blue: {
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-600',
      hover: 'hover:bg-green-700',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    gray: {
      bg: 'bg-gray-600',
      hover: 'hover:bg-gray-700',
      text: 'text-gray-600',
      border: 'border-gray-200'
    }
  };

  const colors = colorClasses[getShiftColor()];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isPlaying || isGenerating ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStopAnnouncement}
            className={`${colors.bg} ${colors.hover} text-white p-2 rounded-full shadow-md transition-all duration-200`}
            title="Stop announcement"
          >
            <FaStop className="text-sm" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAnnouncement}
            disabled={assignedBuses.length === 0}
            className={`${colors.bg} ${colors.hover} text-white p-2 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            title={`Play ${getShiftDisplayName()} announcement`}
          >
            <FaPlay className="text-sm" />
          </motion.button>
        )}
        
        {isGenerating && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <div className="animate-spin w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full"></div>
            <span>Translating & Generating...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${colors.border} p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaVolumeUp className={`text-lg ${colors.text}`} />
          <h3 className="font-semibold text-gray-800">
            Audio Announcement
          </h3>
        </div>
        
        <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} text-white`}>
          {getShiftDisplayName()}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        {isPlaying || isGenerating ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStopAnnouncement}
            className={`${colors.bg} ${colors.hover} text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all duration-200`}
          >
            <FaStop className="text-sm" />
            Stop Announcement
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAnnouncement}
            disabled={assignedBuses.length === 0}
            className={`${colors.bg} ${colors.hover} text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FaPlay className="text-sm" />
            Play Announcement
          </motion.button>
        )}

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin w-4 h-4 border border-gray-300 border-t-gray-600 rounded-full"></div>
            <span>Translating to Bengali & generating audio...</span>
          </div>
        )}

        {isPlaying && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Playing...</span>
          </div>
        )}
      </div>

      {showText && currentAnnouncement && (
        <div className="bg-gray-50 rounded-lg p-3 border">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Announcement Text:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentAnnouncement}
          </p>
        </div>
      )}

      {assignedBuses.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <FaVolumeMute className="text-2xl mx-auto mb-2 opacity-50" />
          <p className="text-sm">No buses assigned to announce</p>
        </div>
      )}
    </div>
  );
};

export default AudioControls;
