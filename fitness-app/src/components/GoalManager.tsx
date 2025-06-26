'use client';

import { useState } from 'react';

export interface Goal {
  id: string;
  name: string;
  type: 'calories' | 'weight_loss' | 'weight_gain' | 'workouts_per_week' | 'custom';
  target: number;
  unit: string;
  current: number;
  description?: string;
  createdAt: string;
  deadline?: string;
}

interface GoalManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalAdded: (goal: Goal) => void;
  existingGoals: Goal[];
}

export default function GoalManager({ isOpen, onClose, onGoalAdded, existingGoals }: GoalManagerProps) {
  const [step, setStep] = useState(1);
  const [goalType, setGoalType] = useState<Goal['type']>('calories');
  const [customName, setCustomName] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const goalTemplates = {
    calories: {
      name: 'Daily Calories Burned',
      unit: 'calories',
      placeholder: '500',
      description: 'Track daily calorie burn goal'
    },
    weight_loss: {
      name: 'Weight Loss',
      unit: 'lbs',
      placeholder: '10',
      description: 'Target weight to lose'
    },
    weight_gain: {
      name: 'Weight Gain',
      unit: 'lbs',
      placeholder: '5',
      description: 'Target weight to gain'
    },
    workouts_per_week: {
      name: 'Weekly Workouts',
      unit: 'workouts',
      placeholder: '5',
      description: 'Number of workouts per week'
    },
    custom: {
      name: 'Custom Goal',
      unit: '',
      placeholder: '30',
      description: 'Create your own goal'
    }
  };

  const resetForm = () => {
    setStep(1);
    setGoalType('calories');
    setCustomName('');
    setTarget('');
    setUnit('');
    setDescription('');
    setDeadline('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      if (goalType === 'custom') {
        setStep(2);
      } else {
        const template = goalTemplates[goalType];
        setCustomName(template.name);
        setUnit(template.unit);
        setDescription(template.description);
        setStep(3);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleCreateGoal = () => {
    if (!customName.trim() || !target.trim() || !unit.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const targetNum = parseFloat(target);
    if (isNaN(targetNum) || targetNum <= 0) {
      alert('Please enter a valid target number');
      return;
    }

    // Check for duplicate goals
    const isDuplicate = existingGoals.some(goal => 
      goal.name.toLowerCase() === customName.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert('A goal with this name already exists');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: customName.trim(),
      type: goalType,
      target: targetNum,
      unit: unit.trim(),
      current: 0,
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
      deadline: deadline || undefined
    };

    onGoalAdded(newGoal);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#2A2A2A',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '600' }}>
            {step === 1 ? 'Choose Goal Type' : step === 2 ? 'Custom Goal Details' : 'Set Target'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            ×
          </button>
        </div>

        {/* Step 1: Goal Type Selection */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              {Object.entries(goalTemplates).map(([type, template]) => (
                <button
                  key={type}
                  onClick={() => setGoalType(type as Goal['type'])}
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginBottom: '12px',
                    background: goalType === type ? '#C4FF4A' : '#3A3A3A',
                    color: goalType === type ? '#1A1A1A' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Custom Goal Details */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Goal Name *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Treadmill Running Time"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1A1A1A',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Unit *
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., minutes, miles, reps"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1A1A1A',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1A1A1A',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#3A3A3A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Set Target */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '8px' }}>
                {customName}
              </h3>
              {description && (
                <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px' }}>
                  {description}
                </p>
              )}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Target Amount *
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder={goalTemplates[goalType].placeholder}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#1A1A1A',
                    border: '1px solid #3A3A3A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
                <span style={{ color: '#9CA3AF', fontSize: '14px', minWidth: 'fit-content' }}>
                  {unit}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1A1A1A',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(goalType === 'custom' ? 2 : 1)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#3A3A3A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleCreateGoal}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Create Goal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 