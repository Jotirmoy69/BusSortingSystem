import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { generateBengaliAnnouncement } from '../utils/bengaliTranslator';

/**
 * Custom hook for managing audio announcements
 */
export const useAudioAnnouncement = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const audioRef = useRef(null);
  const processRef = useRef(null);

  // Stop current audio/process
  const stopAnnouncement = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    if (processRef.current) {
      processRef.current.kill();
      processRef.current = null;
    }
    
    setIsPlaying(false);
    setIsGenerating(false);
  }, []);

  // Play announcement using Electron's main process
  const playAnnouncement = useCallback(async (assignedBuses, shift = 'morning') => {
    if (isPlaying || isGenerating) {
      toast.warning('Another announcement is already playing');
      return;
    }

    if (!assignedBuses || assignedBuses.length === 0) {
      toast.error('No buses assigned to announce');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate Bengali announcement text with translation
      toast.info('Translating to Bengali...');
      const announcementText = await generateBengaliAnnouncement(assignedBuses, shift);
      setCurrentAnnouncement(announcementText);

      // Use Electron IPC to handle TTS generation
      if (typeof window !== 'undefined' && window.require) {
        const { ipcRenderer } = window.require('electron');
        
        const result = await ipcRenderer.invoke('generate-tts-announcement', {
          text: announcementText,
          shift: shift
        });

        if (result.success) {
          setIsGenerating(false);
          setIsPlaying(true);
          
          // Play the generated audio file
          const audio = new Audio(result.audioPath);
          audioRef.current = audio;
          
          audio.onended = () => {
            setIsPlaying(false);
            audioRef.current = null;
          };
          
          audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            setIsPlaying(false);
            toast.error('Failed to play announcement audio');
          };
          
          await audio.play();
          toast.success('Playing Bengali bus assignment announcement');
          
        } else {
          throw new Error(result.error || 'Failed to generate TTS');
        }
      } else {
        // Not in Electron environment, show error
        throw new Error('Not running in Electron environment');
      }
      
    } catch (error) {
      console.error('Announcement error:', error);
      setIsGenerating(false);
      setIsPlaying(false);
      toast.error(`Failed to generate announcement: ${error.message}`);
    }
  }, [isPlaying, isGenerating]);

  // Generate announcement text (same as utility function)
  const generateAnnouncementText = useCallback((assignedBuses, shift = 'morning') => {
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
  }, []);

  return {
    isPlaying,
    isGenerating,
    currentAnnouncement,
    playAnnouncement,
    stopAnnouncement,
    generateAnnouncementText
  };
};
