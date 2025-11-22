import React from 'react';
import { UserGoal } from '../types';
import { Card } from './ui/Card';

interface SettingsProps {
  goal: UserGoal;
  onUpdateGoal: (goal: UserGoal) => void;
}

export const Settings: React.FC<SettingsProps> = ({ goal, onUpdateGoal }) => {
  return (
    <div className="p-4 space-y-6 pt-8">
      <h2 className="text-2xl font-bold">My Goal</h2>
      
      <Card>
        <div className="space-y-4">
          <div>
             <label className="text-xs uppercase text-gray-400 font-bold tracking-wider">Target Date</label>
             <input 
               type="date" 
               value={goal.targetDate}
               onChange={(e) => onUpdateGoal({...goal, targetDate: e.target.value})}
               className="w-full mt-2 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs uppercase text-gray-400 font-bold tracking-wider">Target Weight</label>
               <div className="flex items-center mt-2 bg-gray-50 rounded-xl px-3">
                  <input 
                    type="number" 
                    value={goal.targetWeight}
                    onChange={(e) => onUpdateGoal({...goal, targetWeight: parseFloat(e.target.value)})}
                    className="w-full p-3 bg-transparent border-none focus:ring-0"
                  />
                  <span className="text-gray-500 text-sm">kg</span>
               </div>
            </div>
             <div>
               <label className="text-xs uppercase text-gray-400 font-bold tracking-wider">Target Body Fat</label>
               <div className="flex items-center mt-2 bg-gray-50 rounded-xl px-3">
                  <input 
                    type="number" 
                    value={goal.targetBodyFat}
                    onChange={(e) => onUpdateGoal({...goal, targetBodyFat: parseFloat(e.target.value)})}
                    className="w-full p-3 bg-transparent border-none focus:ring-0"
                  />
                  <span className="text-gray-500 text-sm">%</span>
               </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="text-center text-gray-400 text-xs mt-10">
         Algorithm v1.2 • Cycle Synced
      </div>
    </div>
  );
};