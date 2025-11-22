import React, { useState, useEffect } from 'react';
import { INITIAL_GOAL, INITIAL_RECORDS } from './constants';
import { DailyRecord, UserGoal, CyclePhase } from './types';
import { getTodayPrediction, recalculateFuturePredictions } from './services/logic';
import { Dashboard } from './components/Dashboard';
import { Navigation } from './components/Navigation';
import { CheckIn } from './components/CheckIn';
import { Insights } from './components/Insights';
import { GoalEditModal } from './components/GoalEditModal';

// Mock date to simulate "Today" for demo purposes. 
// In a real app, you would use new Date().toISOString().split('T')[0]
const DEMO_TODAY = '2025-11-22'; 
const STORAGE_KEY_RECORDS = 'cyclefit_records_v1';
const STORAGE_KEY_GOAL = 'cyclefit_goal_v1';
const STORAGE_KEY_FASTING = 'cyclefit_fasting_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'settings'>('dashboard');
  
  // Initialize State with LocalStorage Check
  const [records, setRecords] = useState<DailyRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [goal, setGoal] = useState<UserGoal>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GOAL);
    return saved ? JSON.parse(saved) : INITIAL_GOAL;
  });

  const [fastingState, setFastingState] = useState<{isFasting: boolean; startTime: number | null}>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FASTING);
    if (saved) return JSON.parse(saved);
    return {
      isFasting: true,
      startTime: Date.now() - 1000 * 60 * 60 * 14 // Default simulation
    };
  });
  
  // Modals
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const [todayCycleOverride, setTodayCycleOverride] = useState<{phase: CyclePhase, day: number} | null>(null);

  const todayDate = DEMO_TODAY; 

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GOAL, JSON.stringify(goal));
  }, [goal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FASTING, JSON.stringify(fastingState));
  }, [fastingState]);


  // --- Logic ---
  const getOrGenerateToday = () => {
    const existing = records.find(r => r.date === todayDate);
    
    let record = existing;
    if (!record) {
      // Generate a prediction for today if it doesn't exist
      const { predictedWeight, predictedFat } = getTodayPrediction(records, todayDate, goal);
      record = {
        date: todayDate,
        cycleDay: 11, // Default fallback, likely overridden by logic
        cyclePhase: CyclePhase.OVULATION,
        suggestion: "代谢峰值，汗出透彻",
        predictedWeight,
        predictedBodyFat: predictedFat
      } as DailyRecord;
    }

    // Apply temporary visual override if user changed cycle in UI but hasn't saved yet
    if (todayCycleOverride) {
      return {
        ...record,
        cyclePhase: todayCycleOverride.phase,
        cycleDay: todayCycleOverride.day
      };
    }

    return record;
  };

  const todayRecord = getOrGenerateToday();

  const handleSaveCheckIn = (date: string, data: { weight: number; fat: number; note: string; workout: boolean; fasting: boolean; cheat: boolean }) => {
    // 1. Find existing or create new
    const existingRecord = records.find(r => r.date === date);
    
    let baseRecord = existingRecord;
    if (!baseRecord) {
       // Create from scratch or today template
       if (date === todayDate) {
         baseRecord = todayRecord;
       } else {
         baseRecord = {
           date: date,
           cycleDay: 1, 
           cyclePhase: CyclePhase.FOLLICULAR,
           suggestion: '',
           predictedWeight: 0,
           predictedBodyFat: 0
         };
       }
    }

    const newRecord: DailyRecord = {
      ...baseRecord,
      date: date,
      actualWeight: data.weight,
      actualBodyFat: data.fat,
      note: data.note,
      completedWorkout: data.workout,
      completedFasting: data.fasting,
      isCheatDay: data.cheat
    };

    // 2. Update Array
    const otherRecords = records.filter(r => r.date !== date);
    const updatedRecords = [...otherRecords, newRecord];

    // 3. Recalculate FUTURE predictions based on this new data point
    // This ensures if I change last week's weight, tomorrow's prediction updates
    const smartRecords = recalculateFuturePredictions(updatedRecords, goal);

    setRecords(smartRecords);
  };

  const handleDeleteRecord = (date: string) => {
    const newRecords = records.filter(r => r.date !== date);
    setRecords(recalculateFuturePredictions(newRecords, goal));
  };

  const handleCycleUpdate = (phase: CyclePhase, day: number) => {
    setTodayCycleOverride({ phase, day });
  };

  const toggleFasting = () => {
    const now = Date.now();
    if (fastingState.isFasting && fastingState.startTime) {
      const elapsedHours = (now - fastingState.startTime) / (1000 * 60 * 60);
      if (elapsedHours >= 16) {
        setRecords(prevRecords => {
          const existingIndex = prevRecords.findIndex(r => r.date === todayDate);
          if (existingIndex >= 0) {
            const updated = [...prevRecords];
            updated[existingIndex] = { ...updated[existingIndex], completedFasting: true };
            return updated;
          } else {
            return [...prevRecords, { ...todayRecord, completedFasting: true }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          }
        });
      }
    }
    setFastingState(prev => ({
      isFasting: !prev.isFasting,
      startTime: now 
    }));
  };

  // Reset for Demo
  const handleResetData = () => {
    if(confirm("Are you sure you want to reset all data to default? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 text-gray-900 font-sans relative overflow-hidden">
      
      <div className="pt-2">
        {activeTab === 'dashboard' && (
          <Dashboard 
            todayRecord={todayRecord}
            goal={goal}
            fastingState={fastingState}
            toggleFasting={toggleFasting}
            onOpenCheckIn={() => setCheckInDate(todayDate)}
            onNavigateToGoal={() => setShowGoalModal(true)}
            onUpdateCycle={handleCycleUpdate}
          />
        )}
        
        {activeTab === 'insights' && (
          <Insights 
            data={records} 
            onEditRecord={(date) => setCheckInDate(date)}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'settings' && (
           <div className="p-8 space-y-8">
             <h2 className="text-2xl font-bold">App Settings</h2>
             <div className="bg-white rounded-xl p-4 shadow-sm">
               <p className="text-sm text-gray-500 mb-4">Data Management</p>
               <button 
                 onClick={handleResetData}
                 className="w-full py-3 text-red-600 font-bold border border-red-100 rounded-lg hover:bg-red-50"
               >
                 Reset All Data
               </button>
             </div>
             <div className="text-center text-xs text-gray-400">
               CycleFit v1.0.2 <br/>
               Data stored locally on device.
             </div>
           </div>
        )}
      </div>

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAdd={() => setCheckInDate(todayDate)}
      />

      {checkInDate && (
        <CheckIn 
          initialDate={checkInDate}
          records={records}
          onClose={() => setCheckInDate(null)}
          onSave={handleSaveCheckIn}
        />
      )}

      {showGoalModal && (
        <GoalEditModal 
          currentGoal={goal}
          onClose={() => setShowGoalModal(false)}
          onSave={setGoal}
        />
      )}
    </div>
  );
}
