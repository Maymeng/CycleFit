import React from 'react';
import { UserGoal } from '../types';
import { Card } from './ui/Card';
import { Trash2 } from 'lucide-react';

interface SettingsProps {
  goal: UserGoal;
  onUpdateGoal: (goal: UserGoal) => void;
  onReset: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ goal, onUpdateGoal, onReset }) => {
  return (
    <div className="p-4 space-y-6 pt-8 pb-24">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Your Goals</h3>
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold mb-1 block">Target Date</label>
              <input 
                type="date" 
                value={goal.targetDate}
                onChange={(e) => onUpdateGoal({...goal, targetDate: e.target.value})}
                className="w-full p-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold mb-1 block">Target Weight</label>
                <div className="flex items-center bg-gray-50 rounded-xl px-3">
                    <input 
                      type="number" 
                      value={goal.targetWeight}
                      onChange={(e) => onUpdateGoal({...goal, targetWeight: parseFloat(e.target.value)})}
                      className="w-full p-3 bg-transparent font-bold text-lg outline-none"
                    />
                    <span className="text-gray-500 text-sm">kg</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold mb-1 block">Target Fat</label>
                <div className="flex items-center bg-gray-50 rounded-xl px-3">
                    <input 
                      type="number" 
                      value={goal.targetBodyFat}
                      onChange={(e) => onUpdateGoal({...goal, targetBodyFat: parseFloat(e.target.value)})}
                      className="w-full p-3 bg-transparent font-bold text-lg outline-none"
                    />
                    <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Data Management</h3>
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Trash2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Reset Application</p>
              <p className="text-xs text-gray-500">Clear all local data and restart.</p>
            </div>
          </div>
          <button 
            onClick={onReset}
            className="w-full py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
          >
            Reset All Data
          </button>
        </Card>
      </section>

      <div className="text-center text-xs text-gray-300 pt-8">
        CycleFit v1.2.0 • Local Storage Enabled
      </div>
    </div>
  );
};