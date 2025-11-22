
import React, { useState, useEffect } from 'react';
import { Mic, X, Plus, Minus, Check, Calendar } from 'lucide-react';
import { Card } from './ui/Card';
import { DailyRecord } from '../types';

interface CheckInProps {
  initialDate: string;
  records: DailyRecord[];
  onClose: () => void;
  onSave: (date: string, data: { weight: number; fat: number; note: string; workout: boolean; fasting: boolean; cheat: boolean }) => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ initialDate, records, onClose, onSave }) => {
  const [date, setDate] = useState(initialDate);
  
  // Form State
  const [weight, setWeight] = useState(0);
  const [fat, setFat] = useState(0);
  const [note, setNote] = useState('');
  const [workout, setWorkout] = useState(false);
  const [fasting, setFasting] = useState(true);
  const [cheat, setCheat] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Load data when date changes
  useEffect(() => {
    const record = records.find(r => r.date === date);
    if (record) {
      setWeight(record.actualWeight || record.predictedWeight || 55.0);
      setFat(record.actualBodyFat || record.predictedBodyFat || 28.0);
      setNote(record.note || '');
      setWorkout(record.completedWorkout || false);
      setFasting(record.completedFasting !== undefined ? record.completedFasting : true);
      setCheat(record.isCheatDay || false);
    } else {
      // Default values if no record exists for this date
      const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const prev = sorted.filter(r => r.date < date).pop();
      
      setWeight(prev?.actualWeight || prev?.predictedWeight || 55.0);
      setFat(prev?.actualBodyFat || prev?.predictedBodyFat || 28.0);
      setNote('');
      setWorkout(false);
      setFasting(true);
      setCheat(false);
    }
  }, [date, records]);

  const toggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setNote(prev => prev + (prev ? ' ' : '') + "Pre-dinner yoga and salad.");
        setIsListening(false);
      }, 1500);
    }
  };

  const handleSave = () => {
    onSave(date, { weight, fat, note, workout, fasting, cheat });
    onClose();
  };

  const adjustValue = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, delta: number) => {
    setter(parseFloat((value + delta).toFixed(1)));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
      {/* Main Container: Max width constrained and centered */}
      <div className="w-full max-w-md bg-gray-50 h-full flex flex-col relative shadow-2xl">
        
        {/* Header - Fixed at Top of Modal */}
        <div 
          className="flex-none px-4 pb-4 flex justify-between items-center bg-white shadow-sm z-10"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 46px)' }}
        >
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">Daily Check-in</h2>
          <button onClick={handleSave} className="p-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors">
            Save
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {/* Date Selection */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 pl-12 bg-white rounded-xl border border-gray-100 font-bold text-gray-800 focus:ring-2 focus:ring-black outline-none shadow-sm"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Weight Control */}
          <Card>
            <div className="flex justify-between mb-4">
              <label className="text-sm font-medium text-gray-500">Weight (kg)</label>
              <span className="text-3xl font-bold text-gray-900">{weight.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => adjustValue(setWeight, weight, -0.1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-transform"
              >
                <Minus size={18} />
              </button>
              <input 
                type="range" 
                min="45" 
                max="65" 
                step="0.1" 
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <button 
                onClick={() => adjustValue(setWeight, weight, 0.1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-transform"
              >
                <Plus size={18} />
              </button>
            </div>
          </Card>

          {/* Body Fat Control */}
          <Card>
            <div className="flex justify-between mb-4">
              <label className="text-sm font-medium text-gray-500">Body Fat (%)</label>
              <span className="text-3xl font-bold text-gray-900">{fat.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => adjustValue(setFat, fat, -0.1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-transform"
              >
                <Minus size={18} />
              </button>
              <input 
                type="range" 
                min="15" 
                max="35" 
                step="0.1" 
                value={fat}
                onChange={(e) => setFat(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <button 
                onClick={() => adjustValue(setFat, fat, 0.1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-transform"
              >
                <Plus size={18} />
              </button>
            </div>
          </Card>

          {/* Toggles - Checkbox Style */}
          <div className="space-y-3">
            <div 
              className={`p-4 rounded-xl flex justify-between items-center cursor-pointer border transition-all ${fasting ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
              onClick={() => setFasting(!fasting)}
            >
              <span className="font-medium text-gray-700">16+8 Fasting</span>
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${fasting ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                {fasting && <Check size={16} className="text-white" />}
              </div>
            </div>

            <div 
              className={`p-4 rounded-xl flex justify-between items-center cursor-pointer border transition-all ${workout ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
              onClick={() => setWorkout(!workout)}
            >
              <span className="font-medium text-gray-700">Workout Completed</span>
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${workout ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                {workout && <Check size={16} className="text-white" />}
              </div>
            </div>

            <div 
              className={`p-4 rounded-xl flex justify-between items-center cursor-pointer border transition-all ${cheat ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}
              onClick={() => setCheat(!cheat)}
            >
              <span className="font-medium text-gray-700">Cheat Day / Big Meal</span>
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${cheat ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white'}`}>
                {cheat && <Check size={16} className="text-white" />}
              </div>
            </div>
          </div>

          {/* Notes */}
          <Card className="relative">
            <label className="text-sm font-medium text-gray-500 block mb-2">Notes (Food/Mood)</label>
            <textarea 
              className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-700 resize-none"
              placeholder="Ate some curry, did Pilates..."
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button 
              onClick={toggleVoice}
              className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500'}`}
            >
              <Mic size={20} />
            </button>
          </Card>
        </div>
        
        {/* Footer - Sticky at bottom of flex container */}
        <div className="flex-none p-4 bg-white border-t border-gray-100 pb-safe">
           <button 
             onClick={handleSave}
             className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
           >
             Save Progress
           </button>
        </div>
      </div>
    </div>
  );
};
