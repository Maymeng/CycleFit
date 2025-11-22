import React, { useState } from 'react';
import { X, Plus, Minus, Calendar } from 'lucide-react';
import { UserGoal } from '../types';
import { Card } from './ui/Card';

interface GoalEditModalProps {
  currentGoal: UserGoal;
  onClose: () => void;
  onSave: (goal: UserGoal) => void;
}

export const GoalEditModal: React.FC<GoalEditModalProps> = ({ currentGoal, onClose, onSave }) => {
  const [targetDate, setTargetDate] = useState(currentGoal.targetDate);
  const [targetWeight, setTargetWeight] = useState(currentGoal.targetWeight);
  const [targetBodyFat, setTargetBodyFat] = useState(currentGoal.targetBodyFat);

  const handleSave = () => {
    onSave({
      ...currentGoal,
      targetDate,
      targetWeight,
      targetBodyFat
    });
    onClose();
  };

  const adjustValue = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, delta: number) => {
    setter(parseFloat((value + delta).toFixed(1)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Edit Goals</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          
          {/* Target Date */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Target Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-none font-bold text-gray-800 focus:ring-2 focus:ring-black outline-none"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Target Weight */}
          <Card className="border-none shadow-none bg-transparent p-0">
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Weight (kg)</label>
              <span className="text-2xl font-bold text-gray-900">{targetWeight.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                 onClick={() => adjustValue(setTargetWeight, targetWeight, -0.1)}
                 className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all text-gray-600"
              >
                <Minus size={20} />
              </button>
              <input 
                type="range" 
                min="40" 
                max="80" 
                step="0.1" 
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
               <button 
                 onClick={() => adjustValue(setTargetWeight, targetWeight, 0.1)}
                 className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all text-gray-600"
              >
                <Plus size={20} />
              </button>
            </div>
          </Card>

          {/* Target Body Fat */}
          <Card className="border-none shadow-none bg-transparent p-0">
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Body Fat (%)</label>
              <span className="text-2xl font-bold text-gray-900">{targetBodyFat.toFixed(1)}</span>
            </div>
             <div className="flex items-center gap-4">
              <button 
                 onClick={() => adjustValue(setTargetBodyFat, targetBodyFat, -0.1)}
                 className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all text-gray-600"
              >
                <Minus size={20} />
              </button>
              <input 
                type="range" 
                min="10" 
                max="40" 
                step="0.1" 
                value={targetBodyFat}
                onChange={(e) => setTargetBodyFat(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <button 
                 onClick={() => adjustValue(setTargetBodyFat, targetBodyFat, 0.1)}
                 className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all text-gray-600"
              >
                <Plus size={20} />
              </button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
           <button 
             onClick={handleSave}
             className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
           >
             Confirm
           </button>
        </div>
      </div>
    </div>
  );
};