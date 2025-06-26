'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Exercise {
  id: string;
  name: string;
  sets: {
    reps: number;
    weight?: number; // Optional for cardio
    calories?: number; // Only for cardio
  }[];
  isMinimized?: boolean;
}

interface WorkoutSession {
  id: string;
  bodyPart: string;
  startTime: Date;
  exercises: Exercise[];
  isActive: boolean;
  isPaused: boolean;
  duration: number; // in seconds
}

interface WorkoutContextType {
  currentWorkout: WorkoutSession | null;
  startWorkout: (bodyPart: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  endWorkout: () => void;
  addExercise: (exerciseName: string) => void;
  addSet: (exerciseId: string, reps: number, weight?: number, calories?: number) => void;
  removeExercise: (exerciseId: string) => void;
  toggleExerciseMinimized: (exerciseId: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentWorkout && currentWorkout.isActive && !currentWorkout.isPaused) {
      interval = setInterval(() => {
        setCurrentWorkout(prev => {
          if (!prev) return null;
          const now = new Date();
          const duration = Math.floor((now.getTime() - prev.startTime.getTime()) / 1000);
          return { ...prev, duration };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentWorkout]);

  const startWorkout = (bodyPart: string) => {
    const newWorkout: WorkoutSession = {
      id: Date.now().toString(),
      bodyPart,
      startTime: new Date(),
      exercises: [],
      isActive: true,
      isPaused: false,
      duration: 0
    };
    setCurrentWorkout(newWorkout);
  };

  const pauseWorkout = () => {
    setCurrentWorkout(prev => 
      prev ? { ...prev, isPaused: true } : null
    );
  };

  const resumeWorkout = () => {
    setCurrentWorkout(prev => 
      prev ? { ...prev, isPaused: false } : null
    );
  };

  const endWorkout = () => {
    if (currentWorkout) {
      // Calculate total calories (for cardio workouts)
      let totalCalories = 0;
      if (currentWorkout.bodyPart.toLowerCase() === 'cardio') {
        currentWorkout.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            totalCalories += set.calories || 0;
          });
        });
      } else {
        // For non-cardio workouts, estimate calories based on duration
        totalCalories = Math.floor((currentWorkout.duration / 60) * 6); // 6 calories per minute
      }

      // Save completed workout to localStorage
      const completedWorkout = {
        id: currentWorkout.id,
        name: `${currentWorkout.bodyPart} Workout`,
        bodyPart: currentWorkout.bodyPart,
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        duration: Math.floor(currentWorkout.duration / 60), // Convert to minutes
        calories: totalCalories,
        status: 'Completed' as const,
        notes: `${currentWorkout.exercises.length} exercises completed`,
        exercises: currentWorkout.exercises // Save full exercise data
      };

      // Get existing sessions and add the new one
      const existingSessions = localStorage.getItem('workout-sessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.unshift(completedWorkout); // Add to beginning
      localStorage.setItem('workout-sessions', JSON.stringify(sessions));

      // Update daily calories and steps
      const currentCalories = localStorage.getItem('daily-calories');
      const currentSteps = localStorage.getItem('daily-steps');
      const newCalories = (currentCalories ? parseInt(currentCalories) : 0) + totalCalories;
      const newSteps = (currentSteps ? parseInt(currentSteps) : 0) + Math.floor(currentWorkout.duration * 2); // Rough estimate
      
      localStorage.setItem('daily-calories', newCalories.toString());
      localStorage.setItem('daily-steps', newSteps.toString());
    }
    
    setCurrentWorkout(null);
  };

  const addExercise = (exerciseName: string) => {
    setCurrentWorkout(prev => {
      if (!prev) return null;
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: exerciseName,
        sets: [],
        isMinimized: false
      };
      // Minimize all existing exercises
      const updatedExercises = prev.exercises.map(ex => ({ ...ex, isMinimized: true }));
      return {
        ...prev,
        exercises: [...updatedExercises, newExercise]
      };
    });
  };

  const addSet = (exerciseId: string, reps: number, weight?: number, calories?: number) => {
    setCurrentWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(exercise =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: [...exercise.sets, { 
                  reps, 
                  ...(weight !== undefined && { weight }),
                  ...(calories !== undefined && { calories })
                }]
              }
            : exercise
        )
      };
    });
  };

  const removeExercise = (exerciseId: string) => {
    setCurrentWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId)
      };
    });
  };

  const toggleExerciseMinimized = (exerciseId: string) => {
    setCurrentWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(exercise =>
          exercise.id === exerciseId
            ? { ...exercise, isMinimized: !exercise.isMinimized }
            : exercise
        )
      };
    });
  };

  return (
    <WorkoutContext.Provider value={{
      currentWorkout,
      startWorkout,
      pauseWorkout,
      resumeWorkout,
      endWorkout,
      addExercise,
      addSet,
      removeExercise,
      toggleExerciseMinimized
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
} 