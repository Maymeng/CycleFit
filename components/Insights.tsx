
import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { DailyRecord, UserGoal } from '../types';
import { Card } from './ui/Card';
import { ChevronLeft, ChevronRight, List, BarChart, Trash2 } from 'lucide-react';
import { PHASES_CONFIG } from '../constants';
import { generateProjectedRecords } from '../services/logic';

interface InsightsProps {
  data: DailyRecord[];
  goal: UserGoal;
  onEditRecord: (date: string) => void;
  onDeleteRecord: (date: string) => void;
}

type MetricType = 'weight' | 'fat';
type ViewType = 'chart' | 'table';

export const Insights: React.FC<InsightsProps> = ({ data, goal, onEditRecord, onDeleteRecord }) => {
  // State for Chart controls
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date('2025-11-01')); 
  const [metric, setMetric] = useState<MetricType>('weight');
  const [viewMode, setViewMode] = useState<ViewType>('chart');
  const [showAllLogs, setShowAllLogs] = useState(false);

  // State for Heatmap controls
  const [heatmapYear, setHeatmapYear] = useState(2025);

  // Tooltip State
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    data?: DailyRecord;
    x: number; 
    y: number;
    rectWidth: number;
  } | null>(null);

  // 1. Generate a complete dataset: History + Future Projections
  const allRecords = useMemo(() => {
    // Generate predictions starting from the last actual record
    const projections = generateProjectedRecords(data, goal);
    
    // Create a map for easy lookup, preferring actual data
    const map = new Map<string, DailyRecord>();
    
    // First populate with projections (so they are defaults)
    projections.forEach(p => map.set(p.date, p));
    
    // Then overwrite with actual history where it exists
    data.forEach(d => map.set(d.date, d));
    
    return Array.from(map.values());
  }, [data, goal]);


  // 2. Prepare Data for Chart (Always 1st to end of month)
  const chartData = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get last day of month
    
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
       const dayStr = String(d).padStart(2, '0');
       const monthStr = String(month + 1).padStart(2, '0');
       const fullDateStr = `${year}-${monthStr}-${dayStr}`;
       
       const record = allRecords.find(r => r.date === fullDateStr);
       
       // Dynamic selection based on Metric
       let actualVal: number | null | undefined = null;
       let predictedVal: number | null | undefined = null;

       if (metric === 'weight') {
         actualVal = record?.actualWeight;
         predictedVal = record?.predictedWeight;
       } else {
         actualVal = record?.actualBodyFat;
         predictedVal = record?.predictedBodyFat;
       }

       result.push({
         name: String(d), // X-Axis: 1, 2, 3...
         actual: actualVal, 
         predicted: predictedVal, 
         cyclePhase: record?.cyclePhase,
         note: record?.note,
         fullDate: fullDateStr
       });
    }
    return result;
  }, [currentMonthDate, allRecords, metric]);


  // 3. Prepare Data for Heatmap (Full Year)
  const heatmapDays = useMemo(() => {
    const days = [];
    const start = new Date(heatmapYear, 0, 1);
    const end = new Date(heatmapYear, 11, 31);
    
    const recordMap = new Map(allRecords.map(r => [r.date, r]));
    
    const current = new Date(start);
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      days.push({
        date: dateStr,
        record: recordMap.get(dateStr)
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [heatmapYear, allRecords]);


  const handleMonthChange = (direction: -1 | 1) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonthDate(newDate);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const allLogs = useMemo(() => {
    // Only show actual logs in the list, not future projections
    return [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const handleHeatmapEnter = (e: React.MouseEvent, dayItem: { date: string, record?: DailyRecord }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay({
      date: dayItem.date,
      data: dayItem.record,
      x: rect.left,
      y: rect.bottom,
      rectWidth: rect.width
    });
  };

  // Helper to determine text color in tooltip
  const getValueColor = (actual: number | undefined, predicted: number) => {
    if (actual === undefined || actual === null) return 'text-white';
    if (actual <= predicted) return 'font-bold text-green-400 text-sm'; // Success
    return 'font-bold text-orange-400 text-sm'; // Fail
  };

  // Helper for tooltip positioning
  const getTooltipStyle = () => {
    if (!hoveredDay) return {};
    const tooltipWidth = 192; // w-48 is 12rem = 192px
    
    // Center tooltip below element
    let left = hoveredDay.x + (hoveredDay.rectWidth / 2) - (tooltipWidth / 2);
    
    // Clamp to screen edges
    const padding = 10;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    return {
      left: `${left}px`,
      top: `${hoveredDay.y - 20}px` //  below the square
    };
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-6">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      <h2 className="text-xl font-bold text-gray-800">Trends & Insights</h2>
      
      {/* Chart Card */}
      <Card>
        <div className="flex flex-col gap-4 mb-4">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <button onClick={() => handleMonthChange(-1)} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-lg">{formatMonth(currentMonthDate)}</span>
            <button onClick={() => handleMonthChange(1)} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Toggles */}
          <div className="flex justify-between items-center">
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setMetric('weight')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${metric === 'weight' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
                >
                  Weight
                </button>
                <button 
                  onClick={() => setMetric('fat')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${metric === 'fat' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
                >
                  Fat %
                </button>
             </div>
             <button 
               onClick={() => setViewMode(prev => prev === 'chart' ? 'table' : 'chart')}
               className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
             >
               {viewMode === 'chart' ? <List size={20} /> : <BarChart size={20} />}
             </button>
          </div>
        </div>

        <div className="h-64 w-full">
          {viewMode === 'chart' ? (
            <ResponsiveContainer width="100%" height="100%">
              {/* Add key={metric} to force full re-render when metric changes to ensure Y-axis updates */}
              <LineChart key={metric} data={chartData} margin={{ right: 10, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{fontSize: 10, fill: '#9CA3AF'}} 
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tick={{fontSize: 10, fill: '#9CA3AF'}}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  labelStyle={{color: '#6B7280', fontSize: '12px'}}
                  formatter={(value: number) => [`${value} ${metric === 'weight' ? 'kg' : '%'}`, metric === 'weight' ? (value === chartData.find(d => d.actual === value)?.actual ? 'Actual' : 'Predicted') : (value === chartData.find(d => d.actual === value)?.actual ? 'Actual' : 'Predicted')]}
                />
                {/* Projected Line (Dashed) - Shows for future dates too */}
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#9CA3AF" 
                  strokeDasharray="4 4" 
                  strokeWidth={2} 
                  dot={false}
                  connectNulls={true} 
                  name="Predicted"
                />
                {/* Actual Line (Solid) - Shows gaps for missing days */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke={metric === 'weight' ? '#10B981' : '#3B82F6'} 
                  strokeWidth={3} 
                  dot={{r: 3, fill: metric === 'weight' ? '#10B981' : '#3B82F6', strokeWidth: 0}} 
                  activeDot={{r: 6}}
                  connectNulls={false}
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full overflow-y-auto custom-scrollbar pr-1">
               {/* Simple Table View */}
               <table className="w-full text-sm text-left border-collapse">
                 <thead className="text-xs text-gray-400 uppercase bg-gray-50 sticky top-0 z-10">
                   <tr>
                     <th className="px-2 py-2 rounded-tl-lg">Date</th>
                     <th className="px-2 py-2">Actual ({metric === 'weight' ? 'kg' : '%'})</th>
                     <th className="px-2 py-2 rounded-tr-lg">Pred ({metric === 'weight' ? 'kg' : '%'})</th>
                   </tr>
                 </thead>
                 <tbody>
                   {chartData.map((d, i) => (
                     <tr key={i} className="border-b border-gray-50 last:border-none">
                       <td className="px-2 py-2 font-mono text-gray-500">{d.fullDate}</td>
                       <td className="px-2 py-2 font-bold text-gray-900">
                         {d.actual !== null && d.actual !== undefined ? d.actual : '-'}
                       </td>
                       <td className="px-2 py-2 text-gray-400">
                         {d.predicted !== null && d.predicted !== undefined ? d.predicted : '-'}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}
        </div>
      </Card>

      {/* Heatmap */}
      <Card className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-500">Consistency Heatmap</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setHeatmapYear(prev => prev - 1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={16}/></button>
            <span className="text-xs font-bold font-mono">{heatmapYear}</span>
            <button onClick={() => setHeatmapYear(prev => prev + 1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={16}/></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-0.5 mb-4 justify-center sm:justify-start">
           {heatmapDays.map((item, i) => {
             const day = item.record;
             const hasActual = typeof day?.actualWeight === 'number';
             const isSuccess = hasActual && day!.actualWeight! <= day!.predictedWeight;
             const isWorkout = day?.completedWorkout;
             
             let colorClass = 'bg-gray-100'; 
             if (isSuccess) colorClass = 'bg-green-500';
             else if (isWorkout) colorClass = 'bg-green-300';
             else if (hasActual) colorClass = 'bg-gray-300';

             return (
               <div 
                 key={i}
                 onMouseEnter={(e) => handleHeatmapEnter(e, item)}
                 onMouseLeave={() => setHoveredDay(null)}
                 className={`w-2.5 h-2.5 rounded-[1px] ${colorClass} transition-colors hover:opacity-80`}
               />
             );
           })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 border-t border-gray-50 text-[10px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[1px] bg-green-500"></div>
            <span>Goal Met</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[1px] bg-green-300"></div>
            <span>Workout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[1px] bg-gray-300"></div>
            <span>Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[1px] bg-gray-100 border border-gray-200"></div>
            <span>Empty</span>
          </div>
        </div>
      </Card>

      {/* Tooltip for Heatmap */}
      {hoveredDay && (
        <div 
          className="fixed z-50 bg-black/90 backdrop-blur text-white text-xs p-3 rounded-lg pointer-events-none shadow-xl border border-gray-700 w-48 animate-fade-in"
          style={getTooltipStyle()}
        >
          <div className="font-bold border-b border-gray-700 pb-2 mb-2 text-center">{hoveredDay.date}</div>
          {hoveredDay.data ? (
            <div className="space-y-3">
               {/* Weight Row */}
               <div>
                 <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Weight</div>
                 <div className="flex justify-between items-end">
                   <span className="text-gray-400">Pred: {hoveredDay.data.predictedWeight}</span>
                   <span className={getValueColor(hoveredDay.data.actualWeight, hoveredDay.data.predictedWeight)}>
                     {hoveredDay.data.actualWeight ? hoveredDay.data.actualWeight + ' kg' : '-'}
                   </span>
                 </div>
               </div>

               {/* Fat Row */}
               <div>
                 <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Body Fat</div>
                 <div className="flex justify-between items-end">
                   <span className="text-gray-400">Pred: {hoveredDay.data.predictedBodyFat}%</span>
                   <span className={getValueColor(hoveredDay.data.actualBodyFat, hoveredDay.data.predictedBodyFat)}>
                     {hoveredDay.data.actualBodyFat ? hoveredDay.data.actualBodyFat + '%' : '-'}
                   </span>
                 </div>
               </div>

               {/* Notes */}
               {(hoveredDay.data.note || hoveredDay.data.suggestion) && (
                 <div className="pt-2 border-t border-gray-700 text-gray-400 italic leading-tight">
                   {hoveredDay.data.note || hoveredDay.data.suggestion}
                 </div>
               )}
            </div>
          ) : (
             <div className="text-gray-500 text-center">No data</div>
          )}
        </div>
      )}

      {/* Log List */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-500 mb-4">History</h3>
        <div className="space-y-3">
          {(showAllLogs ? allLogs : allLogs.slice(0, 5)).map((log, idx) => (
            <div 
              key={idx} 
              onClick={() => onEditRecord(log.date)}
              className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all cursor-pointer active:scale-[0.99]"
            >
               <div className="flex-1 min-w-0 mr-4">
                 <div className="text-sm font-bold text-gray-900 mb-1">{log.date}</div>
                 <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded font-medium ${PHASES_CONFIG[log.cyclePhase]?.color} ${PHASES_CONFIG[log.cyclePhase]?.textColor}`}>
                      {log.cyclePhase} D{log.cycleDay}
                    </span>
                    {log.note && (
                      <span className="text-xs text-gray-400 truncate">
                        {log.note}
                      </span>
                    )}
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{log.actualWeight !== undefined && log.actualWeight !== null ? log.actualWeight : '-'} <span className="text-[10px] font-normal text-gray-400">kg</span></div>
                    <div className="text-xs text-gray-400">{log.actualBodyFat !== undefined && log.actualBodyFat !== null ? log.actualBodyFat : '-'}%</div>
                  </div>
                  {/* Delete Button prevents bubbling */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onDeleteRecord(log.date);
                    }} 
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16}/>
                  </button>
               </div>
            </div>
          ))}
        </div>
        {!showAllLogs && allLogs.length > 5 && (
          <button onClick={() => setShowAllLogs(true)} className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">View All</button>
        )}
      </Card>
    </div>
  );
};
