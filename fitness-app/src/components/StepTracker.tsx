'use client';

import { useState, useEffect } from 'react';

export interface StepData {
  steps: number;
  lastUpdated: Date;
}

export function useStepTracker() {
  const [stepData, setStepData] = useState<StepData>({ steps: 0, lastUpdated: new Date() });
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let lastAcceleration = 0;
    const stepThreshold = 2.5;
    let lastStepTime = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration && event.acceleration.x !== null && event.acceleration.y !== null && event.acceleration.z !== null) {
        const { x, y, z } = event.acceleration;
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const currentTime = Date.now();
        
        // Simple step detection: look for acceleration peaks with minimum time between steps
        if (acceleration > stepThreshold && 
            acceleration > lastAcceleration && 
            currentTime - lastStepTime > 300) { // Minimum 300ms between steps
          
          setStepData(prev => {
            const newSteps = prev.steps + 1;
            localStorage.setItem('dailySteps', newSteps.toString());
            return {
              steps: newSteps,
              lastUpdated: new Date()
            };
          });
          
          lastStepTime = currentTime;
        }
        
        lastAcceleration = acceleration;
      }
    };

    const startTracking = async () => {
      try {
        // Load saved steps from localStorage
        const savedSteps = localStorage.getItem('dailySteps');
        const savedDate = localStorage.getItem('stepsDate');
        const today = new Date().toDateString();
        
        if (savedDate === today && savedSteps) {
          setStepData({ 
            steps: parseInt(savedSteps), 
            lastUpdated: new Date() 
          });
        } else {
          // Reset steps for new day
          localStorage.setItem('stepsDate', today);
          localStorage.setItem('dailySteps', '0');
        }

        // Check if DeviceMotionEvent is supported
        if (typeof DeviceMotionEvent !== 'undefined') {
          // Request permission for iOS devices
          if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
            const permission = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
            if (permission === 'granted') {
              window.addEventListener('devicemotion', handleDeviceMotion);
              setIsTracking(true);
            } else {
              console.log('Device motion permission denied');
              simulateSteps();
            }
          } else {
            // Android or other devices - no permission needed
            window.addEventListener('devicemotion', handleDeviceMotion);
            setIsTracking(true);
          }
        } else {
          console.log('DeviceMotionEvent not supported');
          simulateSteps();
        }
      } catch (error) {
        console.error('Error starting step tracking:', error);
        simulateSteps();
      }
    };

    const simulateSteps = () => {
      // For development/testing - simulate step increments
      const interval = setInterval(() => {
        setStepData(prev => {
          const newSteps = prev.steps + Math.floor(Math.random() * 3);
          localStorage.setItem('dailySteps', newSteps.toString());
          return {
            steps: newSteps,
            lastUpdated: new Date()
          };
        });
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    };

    startTracking();

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      setIsTracking(false);
    };
  }, []);

  const resetSteps = () => {
    setStepData({ steps: 0, lastUpdated: new Date() });
    localStorage.setItem('dailySteps', '0');
    localStorage.setItem('stepsDate', new Date().toDateString());
  };

  return {
    stepData,
    isTracking,
    resetSteps
  };
} 