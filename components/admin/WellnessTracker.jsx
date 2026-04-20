'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Activity, Brain, AlertCircle, CheckCircle } from 'lucide-react';

export default function WellnessTracker() {
  const [timeToday, setTimeToday] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [dailyLog, setDailyLog] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [breaksTaken, setBreaksTaken] = useState(0);
  const [lastBreak, setLastBreak] = useState(null);

  // Activity suggestions
  const activities = [
    { name: '🧘 Meditation', time: '10 min', description: 'Calm your mind' },
    { name: '🚶 Walk Outside', time: '20 min', description: 'Get fresh air' },
    { name: '♟️ Play Chess', time: '15-30 min', description: 'Strategic thinking' },
    { name: '🏃 Exercise', time: '30 min', description: 'Boost energy' },
    { name: '📞 Call Friend', time: '15 min', description: 'Social connection' },
    { name: '🎵 Listen Music', time: '20 min', description: 'Relax & refresh' },
    { name: '☕ Tea/Coffee Break', time: '10 min', description: 'Simple pause' },
    { name: '🌳 Nature Time', time: '30 min', description: 'Ground yourself' },
    { name: '📚 Read', time: '20 min', description: 'Mental escape' },
    { name: '✏️ Journaling', time: '15 min', description: 'Process thoughts' },
  ];

  // Load data from localStorage on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('wellnessTrackerToday');
    const storedDate = localStorage.getItem('wellnessTrackerDate');

    if (storedDate === today && stored) {
      const data = JSON.parse(stored);
      setTimeToday(data.timeToday || 0);
      setDailyLog(data.dailyLog || []);
      setBreaksTaken(data.breaksTaken || 0);
      setLastBreak(data.lastBreak || null);
    } else {
      // Reset for new day
      setTimeToday(0);
      setDailyLog([]);
      setBreaksTaken(0);
      setLastBreak(null);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(
      'wellnessTrackerToday',
      JSON.stringify({ timeToday, dailyLog, breaksTaken, lastBreak })
    );
    localStorage.setItem('wellnessTrackerDate', today);
  }, [timeToday, dailyLog, breaksTaken, lastBreak]);

  // Update recommendations based on time
  useEffect(() => {
    const newRecommendations = [];

    if (timeToday > 0 && timeToday < 60) {
      newRecommendations.push({
        type: 'good',
        message: '✅ Great start! Staying focused.',
        emoji: '💚',
      });
    }

    if (timeToday >= 60 && timeToday < 120) {
      newRecommendations.push({
        type: 'warning',
        message: '⚠️ 1+ hour already. Take a break soon!',
        emoji: '🟡',
      });
    }

    if (timeToday >= 120 && timeToday < 180) {
      newRecommendations.push({
        type: 'alert',
        message: '🚨 2+ hours! Your brain needs a rest. Step away now.',
        emoji: '🔴',
      });
    }

    if (timeToday >= 180) {
      newRecommendations.push({
        type: 'critical',
        message: '🆘 3+ hours! This is affecting your health. STOP NOW.',
        emoji: '💔',
      });
    }

    if (breaksTaken === 0 && timeToday > 45) {
      newRecommendations.push({
        type: 'alert',
        message: 'No breaks yet? Your eyes & mind need rest.',
        emoji: '👁️',
      });
    }

    const timeSinceLastBreak = lastBreak ? Math.round((Date.now() - lastBreak) / 60000) : timeToday;
    if (timeSinceLastBreak > 60 && breaksTaken > 0) {
      newRecommendations.push({
        type: 'alert',
        message: `${timeSinceLastBreak} min since last break. Take one now!`,
        emoji: '⏰',
      });
    }

    setRecommendations(newRecommendations);
  }, [timeToday, breaksTaken, lastBreak]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeToday((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const recordBreak = () => {
    setBreaksTaken(breaksTaken + 1);
    setLastBreak(Date.now());
    setDailyLog([...dailyLog, { type: 'break', time: new Date(), duration: 0 }]);
    // Small reward message
    setTimeout(() => {
      alert('💚 Great! Taking care of yourself. Rest well!');
    }, 100);
  };

  const resetDay = () => {
    if (confirm('Reset today\'s tracking? This will clear all data for today.')) {
      setTimeToday(0);
      setDailyLog([]);
      setBreaksTaken(0);
      setLastBreak(null);
    }
  };

  const getRandomActivity = () => {
    return activities[Math.floor(Math.random() * activities.length)];
  };

  const warningLevel = timeToday >= 180 ? 'critical' : timeToday >= 120 ? 'alert' : timeToday >= 60 ? 'warning' : 'good';

  const warningColors = {
    good: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    alert: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200',
  };

  const warningTextColors = {
    good: 'text-green-700',
    warning: 'text-yellow-700',
    alert: 'text-orange-700',
    critical: 'text-red-700',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Brain style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              Wellness Tracker
            </h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, marginTop: '8px' }}>
            Track your time. Protect your health. Stay balanced.
          </p>
        </div>

        {/* Main Time Display */}
        <div style={{ 
          borderRadius: '16px', 
          padding: '32px', 
          marginBottom: '24px', 
          border: '2px solid',
          borderColor: warningLevel === 'critical' ? '#fecaca' : warningLevel === 'alert' ? '#fed7aa' : warningLevel === 'warning' ? '#fef08a' : '#dcfce7',
          backgroundColor: warningLevel === 'critical' ? '#fef2f2' : warningLevel === 'alert' ? '#fffbeb' : warningLevel === 'warning' ? '#fffef0' : '#f0fdf4'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: warningLevel === 'critical' ? '#dc2626' : warningLevel === 'alert' ? '#ea580c' : warningLevel === 'warning' ? '#ca8a04' : '#16a34a'
            }}>
              Time on Website Today
            </p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e293b', fontFamily: 'monospace', marginBottom: '24px' }}>
              {formatTime(timeToday)}
            </p>

            {/* Timer Controls */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                onClick={toggleTimer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isRunning ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  transition: 'background-color 0.2s'
                }}
              >
                {isRunning ? (
                  <>
                    <Pause style={{ width: '20px', height: '20px' }} /> Pause
                  </>
                ) : (
                  <>
                    <Play style={{ width: '20px', height: '20px' }} /> Start
                  </>
                )}
              </button>

              <button
                onClick={resetDay}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#cbd5e1',
                  color: '#1e293b',
                  transition: 'background-color 0.2s'
                }}
              >
                <RotateCcw style={{ width: '20px', height: '20px' }} /> Reset
              </button>
            </div>

            {/* Warning Message */}
            {recommendations.length > 0 && (
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                color: warningLevel === 'critical' ? '#dc2626' : warningLevel === 'alert' ? '#ea580c' : warningLevel === 'warning' ? '#ca8a04' : '#16a34a'
              }}>
                {recommendations[recommendations.length - 1]?.message}
              </div>
            )}
          </div>
        </div>

        {/* Breaks & Health Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', border: '2px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Breaks Taken</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>{breaksTaken}</p>
              </div>
              <Activity style={{ width: '40px', height: '40px', color: '#16a34a', opacity: 0.5 }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', border: '2px solid #bfdbfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Last Break</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
                  {lastBreak ? `${Math.round((Date.now() - lastBreak) / 60000)} min ago` : 'None yet'}
                </p>
              </div>
              <Brain style={{ width: '40px', height: '40px', color: '#2563eb', opacity: 0.5 }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', border: '2px solid #d8b4fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Health Status</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: warningLevel === 'critical' ? '#dc2626' : warningLevel === 'alert' ? '#ea580c' : warningLevel === 'warning' ? '#ca8a04' : '#16a34a', margin: 0 }}>
                  {warningLevel === 'good' && '✅ Looking Good'}
                  {warningLevel === 'warning' && '⚠️ Time Out Soon'}
                  {warningLevel === 'alert' && '🚨 Take Break'}
                  {warningLevel === 'critical' && '💔 STOP NOW'}
                </p>
              </div>
              <AlertCircle style={{ width: '40px', height: '40px', color: '#9333ea', opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Take a Break Button */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '24px', border: '2px solid #e2e8f0' }}>
          <button
            onClick={recordBreak}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #22c55e, #10b981)',
              color: 'white',
              fontWeight: 'bold',
              padding: '16px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'opacity 0.2s'
            }}
          >
            ✅ I'm Taking a Break Now
          </button>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
            Click when you step away to rest
          </p>
        </div>

        {/* Activity Recommendations */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '24px', border: '2px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            What to Do During Your Break?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {activities.map((activity, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{activity.name}</p>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px', margin: '4px 0' }}>{activity.time}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{activity.description}</p>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px' }}>Random suggestion:</p>
            <button
              onClick={() => {
                const activity = getRandomActivity();
                alert(`Why not try: ${activity.name}?\n\n${activity.description} (${activity.time})`);
              }}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: '600',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Get Random Activity
            </button>
          </div>
        </div>

        {/* Mental Health Tips */}
        <div style={{ background: 'linear-gradient(to right, #faf5ff, #fdf2f8)', borderRadius: '8px', padding: '24px', border: '2px solid #e9d5ff' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain style={{ width: '24px', height: '24px', color: '#9333ea' }} />
            Mental Health Tips
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>👀</span>
              <div>
                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>Eye Rest</p>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Every 20 min, look away for 20 seconds</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>💧</span>
              <div>
                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>Stay Hydrated</p>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Drink water every hour</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🌳</span>
              <div>
                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>Get Outside</p>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>15-30 min in fresh air helps reset</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>😴</span>
              <div>
                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>Sleep Well</p>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>No website work 1 hour before bed</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>👥</span>
              <div>
                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>Social Time</p>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Talk to friends & family daily</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🎯</span>
              <div>
                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>Set Limits</p>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Max 2-3 hours/day on website work</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontStyle: 'italic', margin: '0 0 16px 0', fontSize: '16px' }}>
            "Your health is your wealth. A burned-out entrepreneur can't build a business. 💚"
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Remember: Progress &gt; Perfection. Your customers want real products, not pixel-perfect design.
          </p>
        </div>
      </div>
    </div>
  );
}
