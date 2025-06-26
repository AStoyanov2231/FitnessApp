'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import GoalManager, { Goal } from '@/components/GoalManager';

interface MetricsData {
  calories: number[];
  steps: number[];
  workouts: number[];
}

export default function MetricsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [activeChartBar, setActiveChartBar] = useState(0);
  const [metricsData, setMetricsData] = useState<{
    week: MetricsData;
    month: MetricsData;
  }>({
    week: { calories: [], steps: [], workouts: [] },
    month: { calories: [], steps: [], workouts: [] }
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);

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

      {/* Period Selector */}
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>No Data Yet</h3>
            <p>Start tracking your workouts to see your progress here!</p>
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
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