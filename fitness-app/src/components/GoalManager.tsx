'use client';

import { useState, useEffect, useRef } from 'react';

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

// Custom Calendar Component following Design.json specifications
interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
}

function CustomCalendar({ selectedDate, onDateSelect, minDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const today = new Date();
  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const minDateObj = minDate ? new Date(minDate) : today;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (date: Date) => {
    if (date < minDateObj) return;
    onDateSelect(date.toISOString().split('T')[0]);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDateObj && date.toDateString() === selectedDateObj.toDateString();
  };

  const isDisabled = (date: Date) => {
    return date < minDateObj;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div style={{
      background: '#2A2A2A',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid #3A3A3A'
    }}>
      {/* Calendar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => navigateMonth('prev')}
          style={{
            background: 'none',
            border: 'none',
            color: '#C4FF4A',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600'
          }}
        >
          ‹
        </button>
        <h3 style={{
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: '600',
          margin: 0
        }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          style={{
            background: 'none',
            border: 'none',
            color: '#C4FF4A',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600'
          }}
        >
          ›
        </button>
      </div>

      {/* Week Days Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        marginBottom: '8px'
      }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: '12px',
              fontWeight: '500',
              padding: '8px 0'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px'
      }}>
        {days.map((date, index) => (
          <div key={index}>
            {date ? (
              <button
                onClick={() => handleDateClick(date)}
                disabled={isDisabled(date)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isDisabled(date) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: isToday(date) ? '600' : '400',
                  background: isSelected(date) 
                    ? '#C4FF4A' 
                    : isToday(date) 
                      ? '#3A3A3A' 
                      : 'transparent',
                  color: isSelected(date) 
                    ? '#1A1A1A' 
                    : isDisabled(date) 
                      ? '#6B7280' 
                      : isToday(date) 
                        ? '#FFFFFF' 
                        : '#9CA3AF',
                  transition: 'all 0.2s ease',
                  opacity: isDisabled(date) ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled(date) && !isSelected(date)) {
                    e.currentTarget.style.background = '#3A3A3A';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled(date) && !isSelected(date)) {
                    e.currentTarget.style.background = isToday(date) ? '#3A3A3A' : 'transparent';
                    e.currentTarget.style.color = isToday(date) ? '#FFFFFF' : '#9CA3AF';
                  }
                }}
              >
                {date.getDate()}
              </button>
            ) : (
              <div style={{ width: '32px', height: '32px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GoalManager({ isOpen, onClose, onGoalAdded, existingGoals }: GoalManagerProps) {
  const [step, setStep] = useState(1);
  const [goalType, setGoalType] = useState<Goal['type']>('calories');
  const [customName, setCustomName] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Handle calendar animations
  const openCalendar = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowCalendar(true);
      setIsAnimating(false);
    }, 200);
  };

  const closeCalendar = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowCalendar(false);
      setIsAnimating(false);
    }, 200);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        closeCalendar();
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

  const goalTemplates = {
    calories: {
      name: 'Daily Calories Burned',
      unit: 'calories',
      placeholder: '500',
      description: 'Track daily calorie burn goal'
    },
    weight_loss: {
      name: 'Weight Loss',
      unit: 'kg',
      placeholder: '10',
      description: 'Target weight to lose'
    },
    weight_gain: {
      name: 'Weight Gain',
      unit: 'kg',
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
    setShowCalendar(false);
    setIsAnimating(false);
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

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
        maxHeight: '85vh',
        overflowY: step === 3 ? 'hidden' : 'auto',
        transition: 'all 0.3s ease'
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

        {/* Step 3: Set Target / Calendar View */}
        {step === 3 && (
          <div style={{ 
            position: 'relative', 
            height: showCalendar ? '480px' : '320px',
            transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
          }}>
            {/* Target Form View */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: showCalendar || isAnimating ? 0 : 1,
              transform: showCalendar || isAnimating ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: showCalendar || isAnimating ? 'none' : 'auto'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '6px' }}>
                  {customName}
                </h3>
                {description && (
                  <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '12px' }}>
                    {description}
                  </p>
                )}
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
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

              <div style={{ marginBottom: '18px' }}>
                <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Deadline (Optional)
                </label>
                
                <button
                  onClick={openCalendar}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1A1A1A',
                    border: '1px solid #3A3A3A',
                    borderRadius: '8px',
                    color: deadline ? '#FFFFFF' : '#9CA3AF',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C4FF4A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#3A3A3A';
                  }}
                >
                  <span>
                    {deadline ? formatDisplayDate(deadline) : 'Select deadline...'}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </button>

                {/* Clear deadline button */}
                {deadline && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeadline('');
                    }}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: '1px solid #3A3A3A',
                      borderRadius: '6px',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '4px 10px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#EC4899';
                      e.currentTarget.style.color = '#EC4899';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#3A3A3A';
                      e.currentTarget.style.color = '#9CA3AF';
                    }}
                  >
                    Clear deadline
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setStep(goalType === 'custom' ? 2 : 1)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#3A3A3A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4A4A4A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3A3A3A';
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleCreateGoal}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#C4FF4A',
                    color: '#1A1A1A',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#B8F23F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#C4FF4A';
                  }}
                >
                  Create Goal
                </button>
              </div>
            </div>

            {/* Calendar View */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: showCalendar ? 1 : 0,
              transform: showCalendar ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: showCalendar ? 'auto' : 'none'
            }}>
              {/* Calendar Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid #3A3A3A'
              }}>
                <button
                  onClick={closeCalendar}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C4FF4A',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: '600',
                    marginRight: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(196, 255, 74, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  ←
                </button>
                <div>
                  <h3 style={{ color: '#FFFFFF', fontSize: '16px', margin: 0, marginBottom: '2px' }}>
                    Select Deadline
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>
                    Choose a target date for "{customName}"
                  </p>
                </div>
              </div>

              {/* Calendar Component */}
              <div 
                ref={calendarRef}
                style={{
                  transform: showCalendar ? 'scale(1)' : 'scale(0.98)',
                  transition: 'transform 0.2s ease-out',
                  transformOrigin: 'center top'
                }}
              >
                <CustomCalendar
                  selectedDate={deadline}
                  onDateSelect={(date) => {
                    setDeadline(date);
                    closeCalendar();
                  }}
                  minDate={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Calendar Footer */}
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #3A3A3A',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  {deadline ? `Selected: ${formatDisplayDate(deadline)}` : 'No deadline selected'}
                </span>
                {deadline && (
                  <button
                    onClick={() => {
                      setDeadline('');
                      closeCalendar();
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #3A3A3A',
                      borderRadius: '6px',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '6px 12px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#EC4899';
                      e.currentTarget.style.color = '#EC4899';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#3A3A3A';
                      e.currentTarget.style.color = '#9CA3AF';
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 