// Audio announcement utility for bus assignments
import { spawn } from 'child_process';
import path from 'path';

/**
 * Generate announcement text for bus assignments
 * @param {Array} assignedBuses - Array of assigned buses
 * @param {string} shift - Shift type (morning, day, college)
 * @returns {string} Formatted announcement text
 */
export const generateAnnouncementText = (assignedBuses, shift = 'morning') => {
  if (!assignedBuses || assignedBuses.length === 0) {
    return "কোন বাস বরাদ্দ করা হয়নি। No buses have been assigned.";
  }

  let announcement = "";
  
  // Add shift-specific greeting
  switch (shift.toLowerCase()) {
    case 'morning':
      announcement += "সকালের শিফটের বাস বরাদ্দ। Morning shift bus assignments. ";
      break;
    case 'day':
      announcement += "দিনের শিফটের বাস বরাদ্দ। Day shift bus assignments. ";
      break;
    case 'college':
      announcement += "কলেজ শিফটের বাস বরাদ্দ। College shift bus assignments. ";
      break;
    default:
      announcement += "বাস বরাদ্দ। Bus assignments. ";
  }

  // Process each bus assignment
  assignedBuses.forEach((bus, index) => {
    const busNumber = bus.number || bus.id || 'Unknown';
    const stands = bus.stands || [];
    
    if (stands.length === 0) {
      announcement += `বাস নম্বর ${busNumber} এর জন্য কোন স্ট্যান্ড নেই। Bus number ${busNumber} has no stands. `;
      return;
    }

    // Group stands by gender for day/college shifts
    if (shift.toLowerCase() === 'day' || shift.toLowerCase() === 'college') {
      const boysStands = stands.filter(stand => stand.gender !== 'girls');
      const girlsStands = stands.filter(stand => stand.gender === 'girls');
      
      if (boysStands.length > 0) {
        const boysStandNames = boysStands.map(stand => stand.name || stand.stand).join(', ');
        announcement += `বাস নম্বর ${busNumber} ছেলেদের জন্য ${boysStandNames}। Bus number ${busNumber} for boys: ${boysStandNames}. `;
      }
      
      if (girlsStands.length > 0) {
        const girlsStandNames = girlsStands.map(stand => stand.name || stand.stand).join(', ');
        announcement += `বাস নম্বর ${busNumber} মেয়েদের জন্য ${girlsStandNames}। Bus number ${busNumber} for girls: ${girlsStandNames}. `;
      }
    } else {
      // Morning shift - mixed gender
      const standNames = stands.map(stand => stand.name || stand.stand).join(', ');
      announcement += `বাস নম্বর ${busNumber} এর জন্য ${standNames}। Bus number ${busNumber}: ${standNames}. `;
    }
  });

  announcement += "ধন্যবাদ। Thank you.";
  return announcement;
};

/**
 * Play audio announcement using the TTS system
 * @param {string} text - Text to be spoken
 * @param {Function} onComplete - Callback when audio finishes
 * @param {Function} onError - Callback for errors
 */
export const playAnnouncement = (text, onComplete = null, onError = null) => {
  try {
    // Get the path to the TTS main script
    const ttsScriptPath = path.join(process.cwd(), 'main.py');
    
    // Spawn Python process to generate TTS
    const pythonProcess = spawn('python', [ttsScriptPath, text], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('TTS generated successfully:', output);
        if (onComplete) onComplete(output.trim());
      } else {
        console.error('TTS generation failed:', errorOutput);
        if (onError) onError(new Error(errorOutput));
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start TTS process:', err);
      if (onError) onError(err);
    });

  } catch (error) {
    console.error('Error in playAnnouncement:', error);
    if (onError) onError(error);
  }
};

/**
 * Generate and play announcement for assigned buses
 * @param {Array} assignedBuses - Array of assigned buses
 * @param {string} shift - Shift type
 * @param {Function} onComplete - Callback when audio finishes
 * @param {Function} onError - Callback for errors
 */
export const announceBusAssignments = (assignedBuses, shift = 'morning', onComplete = null, onError = null) => {
  const announcementText = generateAnnouncementText(assignedBuses, shift);
  console.log('Announcement text:', announcementText);
  
  playAnnouncement(announcementText, onComplete, onError);
};

/**
 * Format announcement text for display
 * @param {Array} assignedBuses - Array of assigned buses
 * @param {string} shift - Shift type
 * @returns {string} Formatted text for display
 */
export const formatAnnouncementForDisplay = (assignedBuses, shift = 'morning') => {
  return generateAnnouncementText(assignedBuses, shift);
};
