'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import GoalManager, { Goal } from '@/components/GoalManager';

interface MetricsData {
  calories: number[];
  steps: number[];
  workouts: number[];
}

interface ExerciseProgress {
  exerciseName: string;
  data: {
    date: string;
    maxWeight: number;
    maxReps: number;
    totalVolume: number; // weight * reps * sets
  }[];
}

interface WorkoutSession {
  id: string;
  name: string;
  bodyPart: string;
  date: string;
  duration: number;
  calories: number;
  status: string;
  notes: string;
  exercises: {
    id: string;
    name: string;
    sets: {
      reps: number;
      weight?: number;
      calories?: number;
    }[];
  }[];
}

// Helper function to process exercise progress data
const processExerciseProgress = (sessions: WorkoutSession[]): ExerciseProgress[] => {
  const exerciseMap = new Map<string, { date: string; maxWeight: number; maxReps: number; totalVolume: number; }[]>();
  
  sessions.forEach(session => {
    session.exercises.forEach(exercise => {
      if (exercise.sets.length > 0) {
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight || 0));
        const maxReps = Math.max(...exercise.sets.map(set => set.reps));
        const totalVolume = exercise.sets.reduce((total, set) => total + (set.reps * (set.weight || 0)), 0);
        
        if (!exerciseMap.has(exercise.name)) {
          exerciseMap.set(exercise.name, []);
        }
        
        exerciseMap.get(exercise.name)!.push({
          date: session.date,
          maxWeight,
          maxReps,
          totalVolume
        });
      }
    });
  });
  
  return Array.from(exerciseMap.entries()).map(([exerciseName, data]) => ({
    exerciseName,
    data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }));
};

export default function MetricsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [activeChartBar, setActiveChartBar] = useState(0);
  const [selectedView, setSelectedView] = useState<'overview' | 'exercises'>('overview');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [metricsData, setMetricsData] = useState<{
    week: MetricsData;
    month: MetricsData;
  }>({
    week: { calories: [], steps: [], workouts: [] },
    month: { calories: [], steps: [], workouts: [] }
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);


  useEffect(() => {
    const loadMetricsData = () => {
      // Load metrics data from localStorage or start with empty arrays
      const savedMetrics = localStorage.getItem('fitness-metrics');
      if (savedMetrics) {
        setMetricsData(JSON.parse(savedMetrics));
      } else {
        // Initialize with empty data
        setMetricsData({
          week: {
            calories: new Array(7).fill(0),
            steps: new Array(7).fill(0),
            workouts: new Array(7).fill(0)
          },
          month: {
            calories: new Array(4).fill(0),
            steps: new Array(4).fill(0),
            workouts: new Array(4).fill(0)
          }
        });
      }

      // Load existing goals from localStorage or API
      const savedGoals = localStorage.getItem('fitness-goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }

      // Load workout sessions for exercise progress tracking
      const savedSessions = localStorage.getItem('workout-sessions');
      if (savedSessions) {
        const sessions: WorkoutSession[] = JSON.parse(savedSessions);
        
        // Process exercise progress data
        const progressData = processExerciseProgress(sessions);
        setExerciseProgress(progressData);
        
        // Set first exercise as selected if available
        if (progressData.length > 0) {
          setSelectedExercise(progressData[0].exerciseName);
        }
      }
    };

    loadMetricsData();
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('fitness-goals', JSON.stringify(goals));
  }, [goals]);

  // Save metrics data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fitness-metrics', JSON.stringify(metricsData));
  }, [metricsData]);

  const currentData = metricsData[selectedPeriod];
  const labels = selectedPeriod === 'week' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const averageCalories = currentData.calories.length > 0 
    ? Math.round(currentData.calories.reduce((a, b) => a + b, 0) / currentData.calories.length)
    : 0;
  const averageSteps = currentData.steps.length > 0
    ? Math.round(currentData.steps.reduce((a, b) => a + b, 0) / currentData.steps.length)
    : 0;
  const totalWorkouts = currentData.workouts.reduce((a, b) => a + b, 0);

  const handleChartBarClick = (index: number) => {
    setActiveChartBar(index);
    const day = labels[index];
    const calories = currentData.calories[index] || 0;
    const steps = currentData.steps[index] || 0;
    
    if (calories > 0 || steps > 0) {
      alert(`${day}: ${calories} calories, ${steps.toLocaleString()} steps`);
    } else {
      alert(`${day}: No data recorded`);
    }
  };

  const handleGoalAdded = (newGoal: Goal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      // Update localStorage
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      if (updatedGoals.length === 0) {
        localStorage.removeItem('fitness-goals');
      } else {
        localStorage.setItem('fitness-goals', JSON.stringify(updatedGoals));
      }
    }
  };

  const handleUpdateGoalProgress = (goalId: string, newProgress: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: newProgress }
        : goal
    ));
  };

  const calculateGoalProgress = (goal: Goal): number => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const formatGoalProgress = (goal: Goal): string => {
    const remaining = Math.max(goal.target - goal.current, 0);
    if (goal.current >= goal.target) {
      return 'Goal achieved! 🎉';
    }
    return `${goal.current} / ${goal.target} ${goal.unit} • ${remaining} to go`;
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>Metrics</h1>

      </div>

      {/* View Selector */}
      <div className="exercise-tabs" style={{ marginBottom: '16px' }}>
        <button
          className={`tab-btn ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${selectedView === 'exercises' ? 'active' : ''}`}
          onClick={() => setSelectedView('exercises')}
        >
          Exercise Progress
        </button>
      </div>

      {/* Period Selector - Only show for overview */}
      {selectedView === 'overview' && (
        <div className="exercise-tabs" style={{ marginBottom: '24px' }}>
          <button
            className={`tab-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button
            className={`tab-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
        </div>
      )}

      {/* Exercise Selector - Only show for exercise progress */}
      {selectedView === 'exercises' && exerciseProgress.length > 0 && (
        <div className="exercise-tabs" style={{ marginBottom: '24px' }}>
          {exerciseProgress.map((exercise) => (
            <button
              key={exercise.exerciseName}
              className={`tab-btn ${selectedExercise === exercise.exerciseName ? 'active' : ''}`}
              onClick={() => setSelectedExercise(exercise.exerciseName)}
            >
              {exercise.exerciseName}
            </button>
          ))}
        </div>
      )}

      {/* Overview View */}
      {selectedView === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="progress-grid" style={{ marginBottom: '24px' }}>
            <div className="progress-card">
              <div className="progress-number">{averageCalories.toLocaleString()}</div>
              <div className="progress-label">Avg Daily Calories</div>
            </div>
            <div className="progress-card">
              <div className="progress-number">{averageSteps.toLocaleString()}</div>
              <div className="progress-label">Avg Daily Steps</div>
            </div>
          </div>

          {/* Empty State for Charts */}
          {currentData.calories.every(val => val === 0) ? (
            <div className="chart-container">
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                <div className="goal-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                </div>
                <h3 style={{ color: '#FFFFFF', marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>No Data Yet</h3>
                <p style={{ fontSize: '14px', marginBottom: '16px', color: '#9CA3AF' }}>Start tracking your workouts to see your progress here!</p>
                <Link href="/workouts" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block', width: 'auto', padding: '8px 16px' }}>
                  Start a Workout
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Calories Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h3 className="chart-title">Calories Burned</h3>
                  <span className="chart-period">
                    {selectedPeriod === 'week' ? 'This Week' : 'This Month'}
                  </span>
                </div>
                <div className="chart">
                  {currentData.calories.map((value, index) => (
                    <div
                      key={index}
                      className={`chart-bar ${index === activeChartBar ? 'active' : ''}`}
                      style={{ 
                        height: Math.max(...currentData.calories) > 0 
                          ? `${(value / Math.max(...currentData.calories)) * 100}%`
                          : '20px'
                      }}
                      onClick={() => handleChartBarClick(index)}
                    />
                  ))}
                </div>
                <div className="chart-labels">
                  {labels.map((label, index) => (
                    <span key={index} className="chart-label">{label}</span>
                  ))}
                </div>
              </div>

              {/* Steps Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h3 className="chart-title">Steps</h3>
                  <span className="chart-period">
                    {selectedPeriod === 'week' ? 'This Week' : 'This Month'}
                  </span>
                </div>
                <div className="chart">
                  {currentData.steps.map((value, index) => (
                    <div
                      key={index}
                      className={`chart-bar ${index === activeChartBar ? 'active' : ''}`}
                      style={{ 
                        height: Math.max(...currentData.steps) > 0 
                          ? `${(value / Math.max(...currentData.steps)) * 100}%`
                          : '20px'
                      }}
                      onClick={() => handleChartBarClick(index)}
                    />
                  ))}
                </div>
                <div className="chart-labels">
                  {labels.map((label, index) => (
                    <span key={index} className="chart-label">{label}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Exercise Progress View */}
      {selectedView === 'exercises' && (
        <>
          {exerciseProgress.length === 0 ? (
            <div className="chart-container">
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                <div className="goal-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                    <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                    <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                  </svg>
                </div>
                <h3 style={{ color: '#FFFFFF', marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>No Exercise Data</h3>
                <p style={{ fontSize: '14px', marginBottom: '16px', color: '#9CA3AF' }}>
                  Complete workouts with exercises to see your progress here
                </p>
                <Link href="/workouts" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block', width: 'auto', padding: '8px 16px' }}>
                  Start a Workout
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Exercise Progress Charts */}
              {(() => {
                const currentExerciseData = exerciseProgress.find(ex => ex.exerciseName === selectedExercise);
                if (!currentExerciseData) return null;

                const maxWeight = Math.max(...currentExerciseData.data.map(d => d.maxWeight));
                const maxReps = Math.max(...currentExerciseData.data.map(d => d.maxReps));
                const maxVolume = Math.max(...currentExerciseData.data.map(d => d.totalVolume));

                return (
                  <>
                    {/* Progress Summary */}
                    <div className="progress-grid" style={{ marginBottom: '24px' }}>
                      <div className="progress-card">
                        <div className="progress-number">{maxWeight}kg</div>
                        <div className="progress-label">Max Weight</div>
                      </div>
                      <div className="progress-card">
                        <div className="progress-number">{maxReps}</div>
                        <div className="progress-label">Max Reps</div>
                      </div>
                    </div>

                    {/* Weight Progress Chart */}
                    <div className="chart-container">
                      <div className="chart-header">
                        <h3 className="chart-title">Weight Progress - {selectedExercise}</h3>
                        <span className="chart-period">Last {currentExerciseData.data.length} Sessions</span>
                      </div>
                      <div className="chart">
                        {currentExerciseData.data.map((dataPoint, index) => (
                          <div
                            key={index}
                            className="chart-bar"
                            style={{ 
                              height: maxWeight > 0 ? `${(dataPoint.maxWeight / maxWeight) * 100}%` : '20px',
                              background: '#C4FF4A'
                            }}
                            title={`${dataPoint.date}: ${dataPoint.maxWeight}kg`}
                          />
                        ))}
                      </div>
                      <div className="chart-labels">
                        {currentExerciseData.data.map((dataPoint, index) => (
                          <span key={index} className="chart-label">
                            {new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Reps Progress Chart */}
                    <div className="chart-container">
                      <div className="chart-header">
                        <h3 className="chart-title">Reps Progress - {selectedExercise}</h3>
                        <span className="chart-period">Last {currentExerciseData.data.length} Sessions</span>
                      </div>
                      <div className="chart">
                        {currentExerciseData.data.map((dataPoint, index) => (
                          <div
                            key={index}
                            className="chart-bar"
                            style={{ 
                              height: maxReps > 0 ? `${(dataPoint.maxReps / maxReps) * 100}%` : '20px',
                              background: '#8B5CF6'
                            }}
                            title={`${dataPoint.date}: ${dataPoint.maxReps} reps`}
                          />
                        ))}
                      </div>
                      <div className="chart-labels">
                        {currentExerciseData.data.map((dataPoint, index) => (
                          <span key={index} className="chart-label">
                            {new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Volume Progress Chart */}
                    <div className="chart-container">
                      <div className="chart-header">
                        <h3 className="chart-title">Total Volume - {selectedExercise}</h3>
                        <span className="chart-period">Last {currentExerciseData.data.length} Sessions</span>
                      </div>
                      <div className="chart">
                        {currentExerciseData.data.map((dataPoint, index) => (
                          <div
                            key={index}
                            className="chart-bar"
                            style={{ 
                              height: maxVolume > 0 ? `${(dataPoint.totalVolume / maxVolume) * 100}%` : '20px',
                              background: '#EC4899'
                            }}
                            title={`${dataPoint.date}: ${dataPoint.totalVolume}kg total`}
                          />
                        ))}
                      </div>
                      <div className="chart-labels">
                        {currentExerciseData.data.map((dataPoint, index) => (
                          <span key={index} className="chart-label">
                            {new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </>
      )}

      {/* Goals Progress */}
      <div className="goals-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title">Your Goals</h2>
          <button
            onClick={() => setIsGoalManagerOpen(true)}
            style={{
              background: '#C4FF4A',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Set Goal
          </button>
        </div>
        
        {goals.length === 0 ? (
          <div className="goal-card">
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
              <div className="goal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>No Goals Set</h3>
              <p>Set your first goal to start tracking your progress!</p>
              <button
                onClick={() => setIsGoalManagerOpen(true)}
                className="btn-primary"
                style={{ marginTop: '16px', display: 'inline-block', width: 'auto', padding: '8px 16px' }}
              >
                Set Your First Goal
              </button>
            </div>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <span className="goal-title">{goal.name}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="goal-target">{goal.target} {goal.unit}</span>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EC4899',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '16px'
                    }}
                    title="Delete goal"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${calculateGoalProgress(goal)}%` }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <p style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  {formatGoalProgress(goal)}
                </p>
                {goal.current < goal.target && (
                  <button
                    onClick={() => {
                      const newProgress = prompt(`Update progress for "${goal.name}" (current: ${goal.current} ${goal.unit}):`);
                      if (newProgress !== null && !isNaN(Number(newProgress))) {
                        handleUpdateGoalProgress(goal.id, Number(newProgress));
                      }
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #3A3A3A',
                      color: '#C4FF4A',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '4px'
                    }}
                  >
                    Update
                  </button>
                )}
              </div>
              {goal.description && (
                <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
                  {goal.description}
                </p>
              )}
              {goal.deadline && (
                <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '4px' }}>
                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <div className="workout-section">
        <h2 className="section-title">This {selectedPeriod === 'week' ? 'Week' : 'Month'}</h2>
        <div className="goal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#9CA3AF' }}>Total Workouts</span>
            <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{totalWorkouts}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#9CA3AF' }}>Total Calories</span>
            <span style={{ color: '#FFFFFF', fontWeight: '600' }}>
              {currentData.calories.reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9CA3AF' }}>Total Steps</span>
            <span style={{ color: '#FFFFFF', fontWeight: '600' }}>
              {currentData.steps.reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>
        </div>
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