import { useState, useEffect } from 'react';
import { Target, TrendingUp, Edit2, Dumbbell, Heart, RotateCcw, Plus, Minus } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function ActivityTracker() {
  const [goal, setGoal] = useState(50);
  const [gymCount, setGymCount] = useState(0);
  const [cardioCount, setCardioCount] = useState(0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal.toString());
  const [isLoading, setIsLoading] = useState(true);

  const count = gymCount + cardioCount;
  const progress = goal > 0 ? Math.min((count / goal) * 100, 100) : 0;
  const isComplete = count >= goal;

  // Load data from backend on mount
  useEffect(() => {
    loadActivityData();
  }, []);

  // Save data to backend whenever counts or goal changes
  useEffect(() => {
    if (!isLoading) {
      saveActivityData();
    }
  }, [gymCount, cardioCount, goal]);

  const loadActivityData = async () => {
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-7c33a2a7/activity`;
      console.log('Loading activity data from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load activity data. Status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to load activity data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Loaded activity data:', data);
      setGoal(data.goal);
      setGymCount(data.gymCount);
      setCardioCount(data.cardioCount);
      setTempGoal(data.goal.toString());
    } catch (error) {
      console.error('Error loading activity data:', error);
      // Continue with default values if loading fails
    } finally {
      setIsLoading(false);
    }
  };

  const saveActivityData = async () => {
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-7c33a2a7/activity`;
      console.log('Saving activity data to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal,
          gymCount,
          cardioCount,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save activity data. Status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to save activity data: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Saved activity data:', result);
    } catch (error) {
      console.error('Error saving activity data:', error);
    }
  };

  const handleGymIncrement = () => {
    setGymCount(prev => prev + 1);
  };

  const handleGymDecrement = () => {
    setGymCount(prev => Math.max(0, prev - 1));
  };

  const handleCardioIncrement = () => {
    setCardioCount(prev => prev + 1);
  };

  const handleCardioDecrement = () => {
    setCardioCount(prev => Math.max(0, prev - 1));
  };

  const handleResetCounts = () => {
    setGymCount(0);
    setCardioCount(0);
    setShowResetConfirm(false);
  };

  const handleSaveGoal = () => {
    const newGoal = parseInt(tempGoal);
    if (newGoal > 0) {
      setGoal(newGoal);
      setIsEditingGoal(false);
    }
  };

  const handleCancelGoal = () => {
    setTempGoal(goal.toString());
    setIsEditingGoal(false);
  };

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col max-w-md mx-auto bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
            <TrendingUp className="size-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Activity Tracker</h1>
        </div>
        <p className="text-white/80 ml-14">Track your daily exercise goals</p>
      </div>

      {/* Goal Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-white" />
            <span className="text-white font-semibold">Exercise Goal</span>
          </div>
          {!isEditingGoal && (
            <button
              onClick={() => {
                setIsEditingGoal(true);
                setTempGoal(goal.toString());
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Edit2 className="size-4 text-white/80" />
            </button>
          )}
        </div>

        {isEditingGoal ? (
          <div className="space-y-3">
            <input
              type="number"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              className="w-full px-4 py-3 text-2xl font-bold text-center bg-white/20 backdrop-blur-lg border-2 border-white/30 text-white placeholder-white/50 rounded-xl focus:outline-none focus:border-white/50"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancelGoal}
                className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-lg text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                className="flex-1 px-4 py-2 bg-white/30 backdrop-blur-lg text-white rounded-xl font-semibold hover:bg-white/40 transition-colors border border-white/30"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text-4xl font-bold text-white text-center">
            {goal} <span className="text-xl text-white/70">exercises</span>
          </div>
        )}
      </div>

      {/* Progress Circle */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col items-center">
        <div className="relative size-64 mb-6">
          {/* Background Circle */}
          <svg className="size-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="112"
              stroke="currentColor"
              strokeWidth="16"
              fill="none"
              className="text-white/20"
            />
            {/* Progress Circle */}
            <circle
              cx="128"
              cy="128"
              r="112"
              stroke="currentColor"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 112}`}
              strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
              className={`transition-all duration-500 ${
                isComplete ? 'text-green-400' : 'text-white'
              }`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-6xl font-bold mb-1 ${
              isComplete ? 'text-green-400' : 'text-white'
            }`}>
              {count}
            </div>
            <div className="text-white/70 font-medium">of {goal}</div>
            <div className={`text-2xl font-bold mt-2 ${
              isComplete ? 'text-green-400' : 'text-white'
            }`}>
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="bg-green-400/20 backdrop-blur-lg border-2 border-green-400/50 rounded-xl px-6 py-3 mb-4">
            <p className="text-white font-semibold text-center">
              🎉 Goal Achieved!
            </p>
          </div>
        )}
      </div>

      {/* Activity Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Gym Counter */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-orange-500/20 backdrop-blur-lg rounded-2xl border border-orange-400/30">
              <Dumbbell className="size-8 text-orange-300" />
            </div>
            <div className="text-white font-semibold">Gym</div>
            <div className="text-4xl font-bold text-white mb-3">{gymCount}</div>
            <div className="flex gap-2 w-full">
              <button
                onClick={handleGymDecrement}
                disabled={gymCount === 0}
                className="flex-1 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 transition-all active:scale-95 transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:active:scale-100"
              >
                <Minus className="size-5 text-white mx-auto" />
              </button>
              <button
                onClick={handleGymIncrement}
                className="flex-1 p-3 bg-orange-500/30 backdrop-blur-lg border border-orange-400/40 rounded-xl hover:bg-orange-500/40 transition-all active:scale-95 transform"
              >
                <Plus className="size-5 text-white mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Cardio Counter */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-400/30">
              <Heart className="size-8 text-red-300" />
            </div>
            <div className="text-white font-semibold">Cardio</div>
            <div className="text-4xl font-bold text-white mb-3">{cardioCount}</div>
            <div className="flex gap-2 w-full">
              <button
                onClick={handleCardioDecrement}
                disabled={cardioCount === 0}
                className="flex-1 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 transition-all active:scale-95 transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:active:scale-100"
              >
                <Minus className="size-5 text-white mx-auto" />
              </button>
              <button
                onClick={handleCardioIncrement}
                className="flex-1 p-3 bg-red-500/30 backdrop-blur-lg border border-red-400/40 rounded-xl hover:bg-red-500/40 transition-all active:scale-95 transform"
              >
                <Plus className="size-5 text-white mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-6">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl px-6 py-4 font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="size-5" />
          Reset Counts
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Counts?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset both Gym and Cardio counts to zero?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCounts}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}