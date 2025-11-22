import React, { useState } from 'react';
import { INITIAL_GOAL, INITIAL_RECORDS } from './constants';
import { DailyRecord, UserGoal, CyclePhase } from './types';
import { getTodayPrediction } from './services/logic';
import { Dashboard } from './components/Dashboard';
import { Navigation } from './components/Navigation';
import { CheckIn } from './components/CheckIn';
import { Insights } from './components/Insights';
import { GoalEditModal } from './components/GoalEditModal';

// Mock date to simulate "Today" based on the data provided (using 2025-11-22 as 'today' for demo context)
const DEMO_TODAY = '2025-11-22'; 

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights'>('dashboard');
  const [records, setRecords] = useState<DailyRecord[]>(INITIAL_RECORDS);
  const [goal, setGoal] = useState<UserGoal>(INITIAL_GOAL);
  
  // Modals
  const [checkInDate, setCheckInDate] = useState<string | null>(null); // If null, modal is closed
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // State to hold manual overrides for today's cycle info before it is saved as a permanent record
  const [todayCycleOverride, setTodayCycleOverride] = useState<{phase: CyclePhase, day: number} | null>(null);

  // 16:8 Timer State
  const [fastingState, setFastingState] = useState<{isFasting: boolean; startTime: number | null}>({
    isFasting: true,
    startTime: Date.now() - 1000 * 60 * 60 * 14 // Simulating 14 hours into fast
  });

  const todayDate = DEMO_TODAY; 
  
  const getOrGenerateToday = () => {
    const existing = records.find(r => r.date === todayDate);
    
    // Base prediction
    let record = existing;
    if (!record) {
      const { predictedWeight, predictedFat } = getTodayPrediction(records, todayDate, goal);
      record = {
        date: todayDate,
        cycleDay: 11,
        cyclePhase: CyclePhase.OVULATION,
        suggestion: "代谢峰值，汗出透彻",
        predictedWeight,
        predictedBodyFat: predictedFat
      } as DailyRecord;
    }

    // Apply Override if exists (Simulating "Real-time" update)
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
    // Remove existing record for this date if it exists
    const otherRecords = records.filter(r => r.date !== date);
    
    // Find if there was an existing record to preserve predictions/cycle info, or create new
    const existingRecord = records.find(r => r.date === date);
    
    let baseRecord = existingRecord;
    
    // If no record exists for this date (e.g. logging for a past date that wasn't generated), 
    // we might need to generate basic prediction info or just save the actuals.
    // For simplicity here, if it's "today", we use todayRecord. If it's another date and no record, we default fields.
    if (!baseRecord) {
       if (date === todayDate) {
         baseRecord = todayRecord;
       } else {
         // Fallback for past dates without prediction data
         baseRecord = {
           date: date,
           cycleDay: 1, // Default or calculated
           cyclePhase: CyclePhase.FOLLICULAR, // Default
           suggestion: '',
           predictedWeight: 0,
           predictedBodyFat: 0
         };
       }
    }

    const newRecord: DailyRecord = {
      ...baseRecord,
      date: date, // Ensure date is correct
      actualWeight: data.weight,
      actualBodyFat: data.fat,
      note: data.note,
      completedWorkout: data.workout,
      completedFasting: data.fasting,
      isCheatDay: data.cheat
    };

    setRecords([...otherRecords, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const handleDeleteRecord = (date: string) => {
    setRecords(prev => prev.filter(r => r.date !== date));
  };

  const handleCycleUpdate = (phase: CyclePhase, day: number) => {
    setTodayCycleOverride({ phase, day });
    // In a real app, this might trigger a re-calculation of predictions for future dates
  };

  const toggleFasting = () => {
    const now = Date.now();
    
    // Logic: If we are stopping a fast (Transitioning from Fasting -> Eating)
    if (fastingState.isFasting && fastingState.startTime) {
      const elapsedHours = (now - fastingState.startTime) / (1000 * 60 * 60);
      
      // Auto-update check-in if fast was longer than 16 hours
      if (elapsedHours >= 16) {
        setRecords(prevRecords => {
          // Check if today already has a record
          const existingIndex = prevRecords.findIndex(r => r.date === todayDate);
          
          if (existingIndex >= 0) {
            // Update existing
            const updated = [...prevRecords];
            updated[existingIndex] = { ...updated[existingIndex], completedFasting: true };
            return updated;
          } else {
            // Create new based on 'todayRecord' template but persistent
            return [...prevRecords, { ...todayRecord, completedFasting: true }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          }
        });
      }
    }

    setFastingState(prev => ({
      isFasting: !prev.isFasting,
      startTime: now // Reset timer for the new phase (whether eating or fasting)
    }));
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
      </div>

      <Navigation 
        activeTab={activeTab as any} 
        setActiveTab={setActiveTab as any} 
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