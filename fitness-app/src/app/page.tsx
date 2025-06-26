'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GoalManager, { Goal } from '@/components/GoalManager';
import { useWorkout } from '@/components/WorkoutContext';

interface WorkoutSession {
  id: string;
  name: string;
  duration: number;
  isActive: boolean;
  startTime?: string;
  calories?: number;
}

export default function HomePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [dailySteps, setDailySteps] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Workout tracking states
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [newReps, setNewReps] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newCalories, setNewCalories] = useState('');
  
  const { 
    currentWorkout, 
    pauseWorkout, 
    resumeWorkout, 
    endWorkout, 
    addExercise, 
    addSet, 
    removeExercise,
    toggleExerciseMinimized
  } = useWorkout();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (goals.length > 0 || goals.length === 0) {
      localStorage.setItem('fitness-goals', JSON.stringify(goals));
    }
  }, [goals]);

  // Save daily stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('daily-calories', dailyCalories.toString());
  }, [dailyCalories]);

  useEffect(() => {
    localStorage.setItem('daily-steps', dailySteps.toString());
  }, [dailySteps]);

  useEffect(() => {
    const loadData = () => {
      // Load goals from localStorage or start with empty array
      const savedGoals = localStorage.getItem('fitness-goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
      
      // Load daily stats from localStorage or start with 0
      const savedCalories = localStorage.getItem('daily-calories');
      const savedSteps = localStorage.getItem('daily-steps');
      setDailyCalories(savedCalories ? parseInt(savedCalories) : 0);
      setDailySteps(savedSteps ? parseInt(savedSteps) : 0);
    };

    loadData();
  }, []);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleGoalAdded = (newGoal: Goal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  const refreshDailyStats = () => {
    const savedCalories = localStorage.getItem('daily-calories');
    const savedSteps = localStorage.getItem('daily-steps');
    setDailyCalories(savedCalories ? parseInt(savedCalories) : 0);
    setDailySteps(savedSteps ? parseInt(savedSteps) : 0);
  };

  // Function to reset daily stats (useful for testing or daily reset)
  const resetDailyStats = () => {
    setDailyCalories(0);
    setDailySteps(0);
    localStorage.setItem('daily-calories', '0');
    localStorage.setItem('daily-steps', '0');
  };

  // Refresh daily stats when the component becomes visible (e.g., after completing a workout)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshDailyStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on window focus
    window.addEventListener('focus', refreshDailyStats);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshDailyStats);
    };
  }, []);

  const handleAddExercise = () => {
    if (newExerciseName.trim()) {
      addExercise(newExerciseName.trim());
      setNewExerciseName('');
    }
  };

  const handleAddSet = () => {
    if (!selectedExerciseId || !currentWorkout) return;
    
    const isCardio = currentWorkout.bodyPart.toLowerCase() === 'cardio';
    
    if (isCardio && newReps && newCalories) {
      addSet(selectedExerciseId, parseInt(newReps), undefined, parseInt(newCalories));
      setNewReps('');
      setNewCalories('');
      setSelectedExerciseId(null);
    } else if (!isCardio && newReps && newWeight) {
      addSet(selectedExerciseId, parseInt(newReps), parseFloat(newWeight));
      setNewReps('');
      setNewWeight('');
      setSelectedExerciseId(null);
    }
  };

  // Get recent goals to show on home page
  const recentGoals = goals.slice(0, 3);

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
            {getTimeGreeting()}!
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

      </div>

      {/* Current Workout Session */}
      {currentWorkout ? (
        <div className="session-card" style={{ marginBottom: '24px' }}>
          <div className="session-header">
            <div>
              <h3>{currentWorkout.bodyPart} Workout</h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                {currentWorkout.isPaused ? 'Paused' : 'Active'} • {currentWorkout.exercises.length} exercises
              </p>
            </div>
            <div className="session-timer">
              {formatTime(currentWorkout.duration)}
            </div>
          </div>
          <div className="session-controls">
            <button 
              onClick={endWorkout} 
              style={{
                background: 'linear-gradient(135deg, #C4FF4A 0%, #D4FF5A 100%)',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Complete Workout
            </button>
          </div>

          {/* Add Exercise Section */}
          <div style={{ marginTop: '20px', padding: '16px', background: '#1A1A1A', borderRadius: '12px' }}>
            <h4 style={{ color: '#C4FF4A', marginBottom: '12px', fontSize: '16px' }}>Add Exercise</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Exercise name (e.g., Push-ups)"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddExercise()}
                style={{
                  flex: 1,
                  background: '#2A2A2A',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleAddExercise}
                disabled={!newExerciseName.trim()}
                style={{
                  background: newExerciseName.trim() ? '#C4FF4A' : '#3A3A3A',
                  color: newExerciseName.trim() ? '#1A1A1A' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: newExerciseName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Exercises List */}
          {currentWorkout.exercises.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#FFFFFF', marginBottom: '12px', fontSize: '16px' }}>Exercises</h4>
              {currentWorkout.exercises.map((exercise) => {
                const isCardio = currentWorkout.bodyPart.toLowerCase() === 'cardio';
                const isMinimized = exercise.isMinimized;
                
                return (
                  <div key={exercise.id} style={{
                    background: '#2A2A2A',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMinimized ? 0 : '8px' }}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                        onClick={() => toggleExerciseMinimized(exercise.id)}
                      >
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                          {isMinimized ? '▶' : '▼'}
                        </span>
                        <h5 style={{ color: '#FFFFFF', fontSize: '16px' }}>{exercise.name}</h5>
                        {isMinimized && exercise.sets.length > 0 && (
                          <span style={{ color: '#C4FF4A', fontSize: '14px' }}>
                            {exercise.sets.length} sets
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EC4899',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  
                    {!isMinimized && (
                      <>
                        {/* Sets Display */}
                        {exercise.sets.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '8px' }}>Sets:</p>
                            {exercise.sets.map((set, index) => (
                              <div key={index} style={{
                                background: '#1A1A1A',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                marginBottom: '4px',
                                display: 'flex',
                                justifyContent: 'space-between'
                              }}>
                                <span style={{ color: '#FFFFFF', fontSize: '14px' }}>Set {index + 1}</span>
                                <span style={{ color: '#C4FF4A', fontSize: '14px' }}>
                                  {isCardio 
                                    ? `${set.reps} min × ${set.calories || 0} cal`
                                    : `${set.reps} reps × ${set.weight || 0}kg`
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Empty State for New Exercise */}
                        {exercise.sets.length === 0 && selectedExerciseId !== exercise.id && (
                          <div style={{
                            background: '#1A1A1A',
                            borderRadius: '8px',
                            padding: '16px',
                            textAlign: 'center',
                            marginBottom: '12px',
                            border: '2px dashed #3A3A3A'
                          }}>
                            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>
                              No sets added yet
                            </p>
                            <button
                              onClick={() => setSelectedExerciseId(exercise.id)}
                              style={{
                                background: 'linear-gradient(135deg, #C4FF4A 0%, #D4FF5A 100%)',
                                color: '#1A1A1A',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Add First Set
                            </button>
                          </div>
                        )}

                        {/* Add Set Section */}
                        {selectedExerciseId === exercise.id ? (
                          <div style={{ marginBottom: '12px' }}>
                            <p style={{ color: '#C4FF4A', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                              Add Set {exercise.sets.length + 1}
                            </p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ color: '#9CA3AF', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                  {isCardio ? "Minutes" : "Reps"}
                                </label>
                                <input
                                  type="number"
                                  placeholder={isCardio ? "e.g., 30" : "e.g., 12"}
                                  value={newReps}
                                  onChange={(e) => setNewReps(e.target.value)}
                                  style={{
                                    width: '100%',
                                    background: '#1A1A1A',
                                    border: '1px solid #3A3A3A',
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    color: '#FFFFFF',
                                    fontSize: '14px'
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ color: '#9CA3AF', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                  {isCardio ? "Calories" : "Weight (kg)"}
                                </label>
                                <input
                                  type="number"
                                  step={isCardio ? "1" : "0.5"}
                                  placeholder={isCardio ? "e.g., 200" : "e.g., 60"}
                                  value={isCardio ? newCalories : newWeight}
                                  onChange={(e) => isCardio ? setNewCalories(e.target.value) : setNewWeight(e.target.value)}
                                  style={{
                                    width: '100%',
                                    background: '#1A1A1A',
                                    border: '1px solid #3A3A3A',
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    color: '#FFFFFF',
                                    fontSize: '14px'
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                              <button
                                onClick={handleAddSet}
                                disabled={isCardio ? (!newReps || !newCalories) : (!newReps || !newWeight)}
                                style={{
                                  flex: 1,
                                  background: (isCardio ? (newReps && newCalories) : (newReps && newWeight)) ? 'linear-gradient(135deg, #C4FF4A 0%, #D4FF5A 100%)' : '#3A3A3A',
                                  color: (isCardio ? (newReps && newCalories) : (newReps && newWeight)) ? '#1A1A1A' : '#9CA3AF',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '10px 16px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: (isCardio ? (newReps && newCalories) : (newReps && newWeight)) ? 'pointer' : 'not-allowed'
                                }}
                              >
                                Add Set
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedExerciseId(null);
                                  setNewReps('');
                                  setNewWeight('');
                                  setNewCalories('');
                                }}
                                style={{
                                  background: 'none',
                                  border: '1px solid #3A3A3A',
                                  color: '#9CA3AF',
                                  borderRadius: '8px',
                                  padding: '10px 16px',
                                  fontSize: '14px',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : exercise.sets.length > 0 ? (
                          <button
                            onClick={() => setSelectedExerciseId(exercise.id)}
                            style={{
                              background: 'none',
                              border: '1px solid #C4FF4A',
                              color: '#C4FF4A',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              width: '100%',
                              marginTop: '8px'
                            }}
                          >
                            + Add Another Set
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="session-card">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏱️</div>
            <h3 style={{ marginBottom: '24px' }}>No Active Session</h3>
            <Link href="/workouts" className="btn-primary">
              Start Workout
            </Link>
          </div>
        </div>
      )}

      {/* Daily Progress */}
      <div className="progress-grid">
        <div className="progress-card">
          <div className="progress-icon">🔥</div>
          <div className="progress-number">{dailyCalories}</div>
          <div className="progress-label">Calories</div>
        </div>
        <div className="progress-card">
          <div className="progress-icon">👣</div>
          <div className="progress-number">{dailySteps.toLocaleString()}</div>
          <div className="progress-label">Steps</div>
        </div>
      </div>

      {/* Goals Overview */}
      <div className="goals-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title">Your Goals</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsGoalManagerOpen(true)}
              style={{
                background: '#C4FF4A',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Set Goal
            </button>
            <Link 
              href="/metrics"
              style={{
                background: 'none',
                border: '1px solid #3A3A3A',
                color: '#9CA3AF',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              View All
            </Link>
          </div>
        </div>

        {recentGoals.length === 0 ? (
          <div className="goal-card">
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9CA3AF' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
              <h3 style={{ color: '#FFFFFF', marginBottom: '8px', fontSize: '16px' }}>No Goals Yet</h3>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                Set goals to track your progress
              </p>
              <button
                onClick={() => setIsGoalManagerOpen(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Create Your First Goal
              </button>
            </div>
          </div>
        ) : (
          recentGoals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <span className="goal-title">{goal.name}</span>
                  <span className="goal-target">{goal.target} {goal.unit}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '8px' }}>
                  {goal.current} / {goal.target} {goal.unit} • {Math.max(goal.target - goal.current, 0)} to go
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Goal Manager Modal */}
      <GoalManager
        isOpen={isGoalManagerOpen}
        onClose={() => setIsGoalManagerOpen(false)}
        onGoalAdded={handleGoalAdded}
        existingGoals={goals}
      />
    </div>
  );
}
