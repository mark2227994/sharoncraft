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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            Wellness Tracker
          </h1>
          <p className="text-slate-600">
            Track your time. Protect your health. Stay balanced.
          </p>
        </div>

        {/* Main Time Display */}
        <div className={`rounded-2xl p-8 mb-6 border-2 transition-all ${warningColors[warningLevel]}`}>
          <div className="text-center">
            <p className={`text-sm font-semibold mb-2 ${warningTextColors[warningLevel]}`}>
              Time on Website Today
            </p>
            <p className="text-5xl font-bold text-slate-800 font-mono mb-4">
              {formatTime(timeToday)}
            </p>

            {/* Timer Controls */}
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> Start
                  </>
                )}
              </button>

              <button
                onClick={resetDay}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-slate-300 hover:bg-slate-400 text-slate-800 transition"
              >
                <RotateCcw className="w-5 h-5" /> Reset
              </button>
            </div>

            {/* Warning Message */}
            {recommendations.length > 0 && (
              <div className={`text-lg font-semibold ${warningTextColors[warningLevel]}`}>
                {recommendations[recommendations.length - 1]?.message}
              </div>
            )}
          </div>
        </div>

        {/* Breaks & Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Breaks Taken</p>
                <p className="text-3xl font-bold text-green-600">{breaksTaken}</p>
              </div>
              <Activity className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Last Break</p>
                <p className="text-xl font-bold text-blue-600">
                  {lastBreak ? `${Math.round((Date.now() - lastBreak) / 60000)} min ago` : 'None yet'}
                </p>
              </div>
              <Brain className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold mb-1">Health Status</p>
                <p className={`text-xl font-bold ${warningTextColors[warningLevel]}`}>
                  {warningLevel === 'good' && '✅ Looking Good'}
                  {warningLevel === 'warning' && '⚠️ Time Out Soon'}
                  {warningLevel === 'alert' && '🚨 Take Break'}
                  {warningLevel === 'critical' && '💔 STOP NOW'}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Take a Break Button */}
        <div className="bg-white rounded-lg p-6 mb-6 border-2 border-slate-200">
          <button
            onClick={recordBreak}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
          >
            ✅ I'm Taking a Break Now
          </button>
          <p className="text-slate-600 text-sm mt-2 text-center">
            Click when you step away to rest
          </p>
        </div>

        {/* Activity Recommendations */}
        <div className="bg-white rounded-lg p-6 mb-6 border-2 border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            What to Do During Your Break?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {activities.slice(0, 6).map((activity, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                <p className="font-semibold text-slate-800">{activity.name}</p>
                <p className="text-sm text-slate-600 mb-1">{activity.time}</p>
                <p className="text-xs text-slate-500">{activity.description}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {activities.slice(6).map((activity, idx) => (
              <div
                key={idx + 6}
                className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                <p className="font-semibold text-slate-800">{activity.name}</p>
                <p className="text-sm text-slate-600 mb-1">{activity.time}</p>
                <p className="text-xs text-slate-500">{activity.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-2">Random suggestion:</p>
            <button
              onClick={() => {
                const activity = getRandomActivity();
                alert(`Why not try: ${activity.name}?\n\n${activity.description} (${activity.time})`);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
            >
              Get Random Activity
            </button>
          </div>
        </div>

        {/* Mental Health Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Mental Health Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <span className="text-2xl">👀</span>
              <div>
                <p className="font-semibold text-slate-800">Eye Rest</p>
                <p className="text-slate-600">Every 20 min, look away for 20 seconds</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💧</span>
              <div>
                <p className="font-semibold text-slate-800">Stay Hydrated</p>
                <p className="text-slate-600">Drink water every hour</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🌳</span>
              <div>
                <p className="font-semibold text-slate-800">Get Outside</p>
                <p className="text-slate-600">15-30 min in fresh air helps reset</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">😴</span>
              <div>
                <p className="font-semibold text-slate-800">Sleep Well</p>
                <p className="text-slate-600">No website work 1 hour before bed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-semibold text-slate-800">Social Time</p>
                <p className="text-slate-600">Talk to friends & family daily</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold text-slate-800">Set Limits</p>
                <p className="text-slate-600">Max 2-3 hours/day on website work</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 italic">
            "Your health is your wealth. A burned-out entrepreneur can't build a business. 💚"
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Remember: Progress &gt; Perfection. Your customers want real products, not pixel-perfect design.
          </p>
        </div>
      </div>
    </div>
  );
}
