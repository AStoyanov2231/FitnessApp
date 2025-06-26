'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkout } from '@/components/WorkoutContext';

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: number;
  calories: number;
  status: 'Completed' | 'In Progress' | 'Paused';
  notes?: string;
  bodyPart?: string;
  exercises?: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  sets: {
    reps: number;
    weight?: number;
    calories?: number;
  }[];
}

interface BodyPart {
  id: string;
  name: string;
  image: string;
  exercises: string[];
}

export default function WorkoutsPage() {
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [swipeState, setSwipeState] = useState<{[key: string]: { 
    offset: number; 
    showDelete: boolean; 
    startX?: number; 
    startY?: number; 
  }}>({});
  
  const { currentWorkout, startWorkout } = useWorkout();
  const router = useRouter();

  const bodyParts: BodyPart[] = [
    {
      id: 'chest',
      name: 'Chest',
      image: '/workout-chest.jpg',
      exercises: ['Push-ups', 'Bench Press', 'Chest Fly']
    },
    {
      id: 'back',
      name: 'Back',
      image: '/workout-back.jpg',
      exercises: ['Pull-ups', 'Rows', 'Lat Pulldown']
    },
    {
      id: 'legs',
      name: 'Legs',
      image: '/workout-legs.jpg',
      exercises: ['Squats', 'Lunges', 'Leg Press']
    },
    {
      id: 'arms',
      name: 'Arms',
      image: '/workout-arms.jpg',
      exercises: ['Bicep Curls', 'Tricep Dips', 'Hammer Curls']
    },
    {
      id: 'core',
      name: 'Core',
      image: '/workout-core.jpg',
      exercises: ['Planks', 'Crunches', 'Russian Twists']
    },
    {
      id: 'cardio',
      name: 'Cardio',
      image: '/workout-cardio.jpg',
      exercises: ['Running', 'Cycling', 'Jump Rope']
    }
  ];

  // Save workout sessions to localStorage whenever they change
  useEffect(() => {
    if (recentSessions.length > 0) {
      localStorage.setItem('workout-sessions', JSON.stringify(recentSessions));
    }
  }, [recentSessions]);

  const loadWorkoutData = () => {
    // Load workout sessions from localStorage or start with empty array
    const savedSessions = localStorage.getItem('workout-sessions');
    if (savedSessions) {
      setRecentSessions(JSON.parse(savedSessions));
    }
  };

  useEffect(() => {
    loadWorkoutData();
  }, []);

  // Refresh workout sessions when the component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const savedSessions = localStorage.getItem('workout-sessions');
        if (savedSessions) {
          setRecentSessions(JSON.parse(savedSessions));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Swipe functionality
  const handleTouchStart = (sessionId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeState(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        startX: touch.clientX,
        startY: touch.clientY,
        offset: prev[sessionId]?.offset || 0,
        showDelete: prev[sessionId]?.showDelete || false
      }
    }));
  };

  const handleTouchMove = (sessionId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const currentState = swipeState[sessionId];
    if (!currentState?.startX) return;

    const deltaX = touch.clientX - currentState.startX;
    const deltaY = touch.clientY - (currentState.startY || 0);

    // Only handle horizontal swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // Prevent vertical scrolling during horizontal swipe
    e.preventDefault();

    const newOffset = Math.max(-120, Math.min(0, deltaX + (currentState.offset || 0)));
    
    setSwipeState(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        offset: newOffset,
        showDelete: newOffset < -60
      }
    }));
  };

  const handleTouchEnd = (sessionId: string) => {
    const currentState = swipeState[sessionId];
    if (!currentState) return;

    const finalOffset = currentState.offset < -60 ? -120 : 0;
    
    setSwipeState(prev => ({
      ...prev,
      [sessionId]: {
        offset: finalOffset,
        showDelete: finalOffset === -120
      }
    }));
  };

  const handleDeleteSession = (sessionId: string) => {
    // Remove from state
    setRecentSessions(prev => prev.filter(session => session.id !== sessionId));
    
    // Remove from localStorage
    const existingSessions = localStorage.getItem('workout-sessions');
    if (existingSessions) {
      const sessions = JSON.parse(existingSessions);
      const updatedSessions = sessions.filter((session: WorkoutSession) => session.id !== sessionId);
      localStorage.setItem('workout-sessions', JSON.stringify(updatedSessions));
    }

    // Reset swipe state
    setSwipeState(prev => {
      const newState = { ...prev };
      delete newState[sessionId];
      return newState;
    });
  };

  const resetSwipe = (sessionId: string) => {
    setSwipeState(prev => ({
      ...prev,
      [sessionId]: {
        offset: 0,
        showDelete: false
      }
    }));
  };

  const handleStartWorkout = () => {
    if (selectedBodyPart) {
      const bodyPartName = bodyParts.find(bp => bp.id === selectedBodyPart)?.name || selectedBodyPart;
      startWorkout(bodyPartName);
      // Navigate to home to see the active workout
      router.push('/');
    } else {
      alert('Please select a body part to train first!');
    }
  };

  const topRecentSessions = recentSessions.slice(0, 3);

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>Workouts</h1>
      </div>

      {/* Current Workout Status */}
      {currentWorkout && (
        <div style={{
          background: 'linear-gradient(135deg, #C4FF4A 0%, #D4FF5A 100%)',
          color: '#1A1A1A',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '700' }}>
            🏋️ {currentWorkout.bodyPart} Workout in Progress
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Switch to Home to track your exercises and sets
          </p>
        </div>
      )}

      {/* Start Workout Section */}
      <div className="workout-section" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="section-title">Start Your Workout</h2>
          <button
            onClick={handleStartWorkout}
            disabled={!selectedBodyPart || !!currentWorkout}
            style={{
              background: (selectedBodyPart && !currentWorkout) ? 'linear-gradient(135deg, #C4FF4A 0%, #D4FF5A 100%)' : '#3A3A3A',
              color: (selectedBodyPart && !currentWorkout) ? '#1A1A1A' : '#9CA3AF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (selectedBodyPart && !currentWorkout) ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            🏃‍♂️ {currentWorkout ? 'Workout Active' : 'Start Workout'}
          </button>
        </div>

        {/* Body Part Selection */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          {bodyParts.map((bodyPart) => (
            <div
              key={bodyPart.id}
              onClick={() => !currentWorkout && setSelectedBodyPart(bodyPart.id)}
              style={{
                position: 'relative',
                height: '120px',
                borderRadius: '16px',
                background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${bodyPart.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: currentWorkout ? 'not-allowed' : 'pointer',
                border: selectedBodyPart === bodyPart.id ? '3px solid #C4FF4A' : '2px solid #C4FF4A',
                opacity: currentWorkout ? 0.5 : 1,
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}
            >
              {/* Fallback background color if image doesn't load */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#2A2A2A',
                zIndex: -1
              }} />
              
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                color: '#FFFFFF'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  marginBottom: '4px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                  {bodyPart.name}
                </h3>
              </div>
              
              {selectedBodyPart === bodyPart.id && !currentWorkout && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#C4FF4A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions Section */}
      {topRecentSessions.length > 0 && (
        <div className="workout-section" style={{ marginBottom: '32px' }}>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Recent Sessions</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {topRecentSessions.map((session: WorkoutSession) => {
              const currentSwipe = swipeState[session.id] || { offset: 0, showDelete: false };
              
              return (
                <div 
                  key={session.id} 
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    background: '#2A2A2A'
                  }}
                >
                  {/* Delete Background */}
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '120px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: currentSwipe.showDelete ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}>
                    <div 
                      onClick={() => handleDeleteSession(session.id)}
                      style={{
                        color: '#FFFFFF',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      🗑️
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div 
                    onTouchStart={(e) => handleTouchStart(session.id, e)}
                    onTouchMove={(e) => handleTouchMove(session.id, e)}
                    onTouchEnd={() => handleTouchEnd(session.id)}
                    onClick={(e) => {
                      if (currentSwipe.offset === 0) {
                        setSelectedSession(session);
                      } else {
                        e.preventDefault();
                        resetSwipe(session.id);
                      }
                    }}
                    style={{
                      background: '#2A2A2A',
                      borderRadius: '16px',
                      padding: '16px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: currentSwipe.offset === 0 ? 'transform 0.3s ease' : 'none',
                      transform: `translateX(${currentSwipe.offset}px)`,
                      touchAction: 'pan-y',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {session.name}
                        </h3>
                        <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '8px' }}>
                          {session.date} • {session.duration} min
                        </p>
                        {session.notes && (
                          <p style={{ color: '#6B7280', fontSize: '12px', fontStyle: 'italic' }}>
                            &ldquo;{session.notes}&rdquo;
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          background: 'linear-gradient(135deg, #C4FF4A 0%, #D4FF5A 100%)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{ color: '#1A1A1A', fontSize: '12px', fontWeight: '600' }}>
                            {session.calories} cal
                          </span>
                        </div>
                        <span style={{ 
                          color: '#C4FF4A',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Sessions Toggle */}
      <div className="workout-section" style={{ marginBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title">All Sessions</h2>
          <button
            onClick={() => setShowAllSessions(!showAllSessions)}
            style={{
              background: 'none',
              border: '1px solid #3A3A3A',
              color: '#C4FF4A',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {showAllSessions ? 'Show Less' : 'Show All'}
            <svg 
              width="16" 
              height="16" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              style={{ 
                transform: showAllSessions ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
        </div>

        {showAllSessions && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {recentSessions.map((session: WorkoutSession) => {
              const currentSwipe = swipeState[session.id] || { offset: 0, showDelete: false };
              
              return (
                <div 
                  key={session.id} 
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    background: '#2A2A2A'
                  }}
                >
                  {/* Delete Background */}
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '120px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: currentSwipe.showDelete ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}>
                    <div 
                      onClick={() => handleDeleteSession(session.id)}
                      style={{
                        color: '#FFFFFF',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      🗑️
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div 
                    onTouchStart={(e) => handleTouchStart(session.id, e)}
                    onTouchMove={(e) => handleTouchMove(session.id, e)}
                    onTouchEnd={() => handleTouchEnd(session.id)}
                    onClick={(e) => {
                      if (currentSwipe.offset === 0) {
                        setSelectedSession(session);
                      } else {
                        e.preventDefault();
                        resetSwipe(session.id);
                      }
                    }}
                    style={{
                      background: '#2A2A2A',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: currentSwipe.offset === 0 ? 'transform 0.3s ease' : 'none',
                      transform: `translateX(${currentSwipe.offset}px)`,
                      touchAction: 'pan-y',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '4px' }}>{session.name}</h4>
                        <p style={{ color: '#9CA3AF', fontSize: '12px' }}>
                          {session.date} • {session.duration} min • {session.calories} cal
                        </p>
                        {session.notes && (
                          <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>
                            &ldquo;{session.notes}&rdquo;
                          </p>
                        )}
                      </div>
                      <span style={{ 
                        color: session.status === 'Completed' ? '#C4FF4A' : session.status === 'In Progress' ? '#06B6D4' : '#EC4899',
                        fontSize: '14px' 
                      }}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workout Details Modal */}
      {selectedSession && (
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
        }} onClick={() => setSelectedSession(null)}>
          <div style={{
            background: '#2A2A2A',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '600' }}>
                {selectedSession.name}
              </h2>
              <button
                onClick={() => setSelectedSession(null)}
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

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>
                {selectedSession.date} • {selectedSession.duration} min
              </p>
              <div style={{ 
                background: 'linear-gradient(135deg, #C4FF4A 0%, #D4FF5A 100%)',
                borderRadius: '8px',
                padding: '8px 16px',
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                <span style={{ color: '#1A1A1A', fontSize: '16px', fontWeight: '600' }}>
                  {selectedSession.calories} calories burned
                </span>
              </div>
            </div>

            {selectedSession.exercises && selectedSession.exercises.length > 0 && (
              <div>
                <h3 style={{ color: '#C4FF4A', fontSize: '16px', marginBottom: '16px' }}>Exercises</h3>
                {selectedSession.exercises.map((exercise: Exercise, index: number) => (
                  <div key={index} style={{
                    background: '#1A1A1A',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '12px' }}>{exercise.name}</h4>
                    {exercise.sets.map((set: { reps: number; weight?: number; calories?: number }, setIndex: number) => (
                      <div key={setIndex} style={{
                        background: '#2A2A2A',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        marginBottom: '6px',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Set {setIndex + 1}</span>
                        <span style={{ color: '#C4FF4A', fontSize: '14px' }}>
                          {selectedSession.bodyPart?.toLowerCase() === 'cardio' 
                            ? `${set.reps} min × ${set.calories || 0} cal`
                            : `${set.reps} reps × ${set.weight || 0}kg`
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 