// Bengali translation utility for bus announcements
// This file now only contains client-side utilities, actual translation happens in Electron main process

/**
 * Simple fallback translation for common bus terms
 * @param {string} text - English text to translate
 * @returns {string} Bengali translated text
 */
const fallbackTranslate = (text) => {
  const translations = {
    'bus': 'বাস',
    'number': 'নম্বর',
    'boys': 'ছেলেদের',
    'girls': 'মেয়েদের',
    'for': 'জন্য',
    'stand': 'স্ট্যান্ড',
    'stands': 'স্ট্যান্ড',
    'morning': 'সকাল',
    'day': 'দিন',
    'college': 'কলেজ',
    'shift': 'শিফট',
    'assignment': 'বরাদ্দ',
    'assignments': 'বরাদ্দ',
    'thank you': 'ধন্যবাদ',
    'no buses': 'কোন বাস নেই',
    'assigned': 'বরাদ্দ করা হয়েছে',
    'has no stands': 'এর জন্য কোন স্ট্যান্ড নেই',
    'bus number': 'বাস নম্বর',
    'morning shift': 'সকালের শিফট',
    'day shift': 'দিনের শিফট',
    'college shift': 'কলেজ শিফট',
    'bus assignments': 'বাস বরাদ্দ'
  };

  let translated = text.toLowerCase();
  
  // Replace common phrases first
  for (const [english, bengali] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(english, 'gi'), bengali);
  }
  
  return translated;
};

/**
 * Translate English text to Bengali using Electron IPC
 * @param {string} text - English text to translate
 * @returns {Promise<string>} Bengali translated text
 */
export const translateToBengali = async (text) => {
  try {
    // Check if we're in Electron environment
    if (typeof window !== 'undefined' && window.require) {
      const { ipcRenderer } = window.require('electron');
      
      const result = await ipcRenderer.invoke('translate-to-bengali', text);
      
      if (result.success) {
        return result.translatedText;
      } else {
        console.warn('Translation failed, using fallback:', result.error);
        return fallbackTranslate(text);
      }
    } else {
      // Not in Electron environment, use fallback
      console.warn('Not in Electron environment, using fallback translation');
      return fallbackTranslate(text);
    }
  } catch (error) {
    console.warn('Translation error, using fallback:', error);
    return fallbackTranslate(text);
  }
};

/**
 * Translate bus assignment data to Bengali
 * @param {Array} assignedBuses - Array of assigned buses
 * @param {string} shift - Shift type
 * @returns {Promise<string>} Bengali announcement text
 */
export const translateBusAssignmentsToBengali = async (assignedBuses, shift = 'morning') => {
  if (!assignedBuses || assignedBuses.length === 0) {
    return "কোন বাস বরাদ্দ করা হয়নি।";
  }

  let announcement = "";
  
  // Add shift-specific greeting in Bengali
  switch (shift.toLowerCase()) {
    case 'morning':
      announcement += "সকালের শিফটের বাস বরাদ্দ। ";
      break;
    case 'day':
      announcement += "দিনের শিফটের বাস বরাদ্দ। ";
      break;
    case 'college':
      announcement += "কলেজ শিফটের বাস বরাদ্দ। ";
      break;
    default:
      announcement += "বাস বরাদ্দ। ";
  }

  // Process each bus assignment
  for (const bus of assignedBuses) {
    const busNumber = bus.number || bus.id || 'Unknown';
    const stands = bus.stands || [];
    
    if (stands.length === 0) {
      announcement += `বাস নম্বর ${busNumber} এর জন্য কোন স্ট্যান্ড নেই। `;
      continue;
    }

    // Group stands by gender for day/college shifts
    if (shift.toLowerCase() === 'day' || shift.toLowerCase() === 'college') {
      const boysStands = stands.filter(stand => stand.gender !== 'girls');
      const girlsStands = stands.filter(stand => stand.gender === 'girls');
      
      if (boysStands.length > 0) {
        const boysStandNames = boysStands.map(stand => stand.name || stand.stand);
        // Use fallback translation for stand names
        const boysStandsText = boysStandNames.join(', ');
        announcement += `বাস নম্বর ${busNumber} ছেলেদের জন্য ${boysStandsText}। `;
      }
      
      if (girlsStands.length > 0) {
        const girlsStandNames = girlsStands.map(stand => stand.name || stand.stand);
        // Use fallback translation for stand names
        const girlsStandsText = girlsStandNames.join(', ');
        announcement += `বাস নম্বর ${busNumber} মেয়েদের জন্য ${girlsStandsText}। `;
      }
    } else {
      // Morning shift - mixed gender
      const standNames = stands.map(stand => stand.name || stand.stand);
      const standsText = standNames.join(', ');
      announcement += `বাস নম্বর ${busNumber} এর জন্য ${standsText}। `;
    }
  }

  announcement += "ধন্যবাদ।";
  return announcement;
};

/**
 * Generate Bengali announcement text with translation
 * @param {Array} assignedBuses - Array of assigned buses
 * @param {string} shift - Shift type
 * @returns {Promise<string>} Bengali announcement text
 */
export const generateBengaliAnnouncement = async (assignedBuses, shift = 'morning') => {
  try {
    return await translateBusAssignmentsToBengali(assignedBuses, shift);
  } catch (error) {
    console.error('Error generating Bengali announcement:', error);
    // Fallback to basic Bengali text
    return `বাস বরাদ্দ সম্পন্ন। মোট ${assignedBuses.length} টি বাস বরাদ্দ করা হয়েছে।`;
  }
};
