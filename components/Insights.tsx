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
import { DailyRecord } from '../types';
import { Card } from './ui/Card';
import { ChevronLeft, ChevronRight, List, BarChart, Trash2 } from 'lucide-react';
import { PHASES_CONFIG } from '../constants';

interface InsightsProps {
  data: DailyRecord[];
  onEditRecord: (date: string) => void;
  onDeleteRecord: (date: string) => void;
}

type MetricType = 'weight' | 'fat';
type ViewType = 'chart' | 'table';

export const Insights: React.FC<InsightsProps> = ({ data, onEditRecord, onDeleteRecord }) => {
  // State for Chart controls
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date('2025-11-01')); // Default to Nov 2025 for demo
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
  } | null>(null);

  // Filter Chart Data by Month
  const monthlyData = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    
    return data.filter(d => {
      const date = new Date(d.date);
      return date.getFullYear() === year && date.getMonth() === month;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, currentMonthDate]);

  // Chart specific Data format
  const chartData = monthlyData.map(d => ({
    name: d.date.split('-')[2], // Day
    actual: metric === 'weight' ? d.actualWeight : d.actualBodyFat,
    predicted: metric === 'weight' ? d.predictedWeight : d.predictedBodyFat,
    phase: d.cyclePhase,
    cycleDay: d.cycleDay,
    fullDate: d.date,
    note: d.note
  }));

  // Generate Heatmap Year Data
  const heatmapDays = useMemo(() => {
    const days = [];
    // Start from Jan 1 of the selected year
    const start = new Date(heatmapYear, 0, 1);
    const end = new Date(heatmapYear, 11, 31);
    
    // Create a lookup map for existing records
    const recordMap = new Map(data.map(r => [r.date, r]));
    
    // Iterate through every day of the year
    const current = new Date(start);
    while (current <= end) {
      // Format YYYY-MM-DD manually to avoid timezone issues
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      days.push({
        date: dateStr,
        record: recordMap.get(dateStr)
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [heatmapYear, data]);

  const handleMonthChange = (direction: -1 | 1) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonthDate(newDate);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const allLogs = useMemo(() => {
    // Show all data descending for logs
    return [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const handleHeatmapEnter = (e: React.MouseEvent, dayItem: { date: string, record?: DailyRecord }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay({
      date: dayItem.date,
      data: dayItem.record,
      // Center horizontally
      x: rect.left + rect.width / 2,
      // Position AT THE BOTTOM of the element (so tooltip appears below)
      y: rect.bottom
    });
  };

  const handleHeatmapLeave = () => {
    setHoveredDay(null);
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-6">
      <h2 className="text-xl font-bold text-gray-800">Trends & Insights</h2>
      
      {/* 1. Main Chart Card with Controls */}
      <Card>
        {/* Controls Header */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Month Nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => handleMonthChange(-1)} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-lg">{formatMonth(currentMonthDate)}</span>
            <button onClick={() => handleMonthChange(1)} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Metric & View Toggles */}
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

        {/* Content Area */}
        <div className="h-64 w-full">
          {viewMode === 'chart' ? (
            chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    labelStyle={{color: '#6B7280', fontSize: '12px'}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#9CA3AF" 
                    strokeDasharray="5 5" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke={metric === 'weight' ? '#10B981' : '#F59E0B'} 
                    strokeWidth={3} 
                    dot={{r: 3, fill: metric === 'weight' ? '#10B981' : '#F59E0B', strokeWidth: 0}} 
                    activeDot={{r: 6}}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No data for this month
              </div>
            )
          ) : (
            /* Detailed Table View */
            <div 
              className="h-full overflow-x-auto overflow-y-auto -mx-5 px-5 custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E1 transparent'
              }}
            >
              <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                  height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background-color: #CBD5E1;
                  border-radius: 20px;
                }
              `}</style>
              <table className="w-full text-sm text-left min-w-[500px]">
                 <thead className="text-xs text-gray-400 uppercase bg-gray-50 sticky top-0 z-10">
                   <tr>
                     <th className="px-3 py-3 rounded-tl-lg">Date</th>
                     <th className="px-3 py-3">Cycle</th>
                     <th className="px-3 py-3">Pred (Kg/%)</th>
                     <th className="px-3 py-3">Actual (Kg/%)</th>
                     <th className="px-3 py-3 rounded-tr-lg">Note</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {monthlyData.map((d, i) => (
                     <tr key={i} className="hover:bg-gray-50/50">
                       <td className="px-3 py-3 font-medium text-gray-700 whitespace-nowrap">
                          {d.date.slice(5).replace('-','/')}
                       </td>
                       <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {d.cyclePhase.split(' ')[0]} <span className="font-mono">D{d.cycleDay}</span>
                       </td>
                       <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {d.predictedWeight} / {d.predictedBodyFat}%
                       </td>
                       <td className="px-3 py-3 whitespace-nowrap">
                         {d.actualWeight ? (
                           <span className="font-bold text-gray-800">{d.actualWeight} <span className="text-gray-400 font-normal text-xs">/ {d.actualBodyFat}%</span></span>
                         ) : (
                           <span className="text-gray-300 text-xs">-</span>
                         )}
                       </td>
                       <td className="px-3 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                          {d.note || '-'}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
              {monthlyData.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No records found for this month</div>}
            </div>
          )}
        </div>
      </Card>

      {/* Heatmap */}
      <Card className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-500">Consistency Heatmap</h3>
          {/* Year Navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setHeatmapYear(prev => prev - 1)}
              className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold font-mono">{heatmapYear}</span>
            <button 
              onClick={() => setHeatmapYear(prev => prev + 1)}
              className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-0.5 mb-4">
           {heatmapDays.map((item, i) => {
             const day = item.record;
             const isSuccess = day?.actualWeight && day.actualWeight <= day.predictedWeight;
             const isWorkout = day?.completedWorkout;
             const hasData = !!day?.actualWeight;
             
             let colorClass = 'bg-gray-100'; // Default empty
             if (isSuccess) colorClass = 'bg-green-500';
             else if (isWorkout) colorClass = 'bg-green-300';
             else if (hasData) colorClass = 'bg-gray-300';

             return (
               <div 
                 key={i}
                 onMouseEnter={(e) => handleHeatmapEnter(e, item)}
                 onMouseLeave={handleHeatmapLeave}
                 className={`w-2.5 h-2.5 rounded-[1px] cursor-default transition-opacity hover:opacity-80 ${colorClass}`}
               />
             );
           })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] text-gray-500">
          <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-[1px] bg-green-500"></div>
             <span>Target Met</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-[1px] bg-green-300"></div>
             <span>Workout Done</span>
          </div>
           <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-[1px] bg-gray-300"></div>
             <span>Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-[1px] bg-gray-100"></div>
             <span>Empty</span>
          </div>
        </div>
      </Card>

      {/* Custom Fast Tooltip */}
      {hoveredDay && (() => {
        // Calculate tooltip positioning to stay on screen and align arrow
        const TOOLTIP_WIDTH = 224; // w-56 is 14rem = 224px
        const HALF_TOOLTIP = TOOLTIP_WIDTH / 2;
        const SCREEN_PADDING = 10;
        
        // Clamp tooltip within screen bounds
        const tooltipLeft = Math.min(
          window.innerWidth - TOOLTIP_WIDTH - SCREEN_PADDING, 
          Math.max(SCREEN_PADDING, hoveredDay.x - HALF_TOOLTIP)
        );

        // Calculate arrow position relative to tooltip container
        // This ensures the arrow points to hoveredDay.x regardless of tooltip shift
        const arrowRelativeX = hoveredDay.x - tooltipLeft;

        return (
          <div 
            className="fixed z-50 bg-black/90 backdrop-blur text-white text-xs p-3 rounded-lg pointer-events-none shadow-xl border border-gray-700 w-56 animate-fade-in"
            style={{
              left: `${tooltipLeft}px`,
              top: `${hoveredDay.y}px` // Close gap: 0px below square
            }}
          >
            {/* Triangle Arrow Pointing Up */}
            <div 
              className="absolute top-[-6px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-black/90"
              style={{
                left: `${arrowRelativeX}px`,
                transform: 'translateX(-50%)'
              }}
            ></div>

            <div className="font-bold border-b border-gray-700 pb-2 mb-2 text-center text-sm">{hoveredDay.date}</div>
            
            {hoveredDay.data ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Phase</span>
                  <span className="font-medium bg-gray-800 px-1.5 py-0.5 rounded text-[10px] border border-gray-700">
                    {hoveredDay.data.cyclePhase.split(' ')[0]} D{hoveredDay.data.cycleDay}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                   <div>
                     <p className="text-gray-400 mb-0.5">Predicted</p>
                     <p className="font-mono">{hoveredDay.data.predictedWeight}kg</p>
                     <p className="font-mono text-gray-500">{hoveredDay.data.predictedBodyFat}% Fat</p>
                   </div>
                   <div className="text-right">
                     <p className="text-gray-400 mb-0.5">Actual</p>
                     {hoveredDay.data.actualWeight ? (
                       <>
                          <p className={`font-mono font-bold ${hoveredDay.data.actualWeight <= hoveredDay.data.predictedWeight ? 'text-green-400' : 'text-amber-400'}`}>
                            {hoveredDay.data.actualWeight}kg
                          </p>
                          <p className="font-mono text-gray-500">{hoveredDay.data.actualBodyFat ?? '-'}% Fat</p>
                       </>
                     ) : (
                       <p className="text-gray-600">-</p>
                     )}
                   </div>
                </div>

                <div className="border-t border-gray-700 pt-2">
                  <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1 block">Note</span>
                  <p className="text-gray-300 italic leading-snug">
                    {hoveredDay.data.note || 'No notes logged.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic text-center py-2">No data recorded for this day.</div>
            )}
          </div>
        );
      })()}

      {/* History Log */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-500">History Log</h3>
        </div>
        
        <div className="space-y-3">
          {(showAllLogs ? allLogs : allLogs.slice(0, 5)).map((log, idx) => (
            <div 
              key={idx} 
              onClick={() => onEditRecord(log.date)}
              className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer relative pr-10"
            >
              {/* Delete Button */}
              <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   if (window.confirm('Delete this record?')) {
                     onDeleteRecord(log.date);
                   }
                 }}
                 className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
              >
                <Trash2 size={16} />
              </button>

              {/* Row 1: Date */}
              <div className="flex justify-between items-start mb-2">
                 <span className="text-sm font-bold text-gray-900">{log.date}</span>
                 <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">{log.actualWeight || '-'} <span className="text-xs text-gray-400 font-normal">kg</span></span>
                 </div>
              </div>

              {/* Row 2: Cycle Pill + Note | Fat */}
              <div className="flex justify-between items-end">
                 <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${PHASES_CONFIG[log.cyclePhase].color} ${PHASES_CONFIG[log.cyclePhase].textColor}`}>
                       {log.cyclePhase.split(' ')[0]} D{log.cycleDay}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{log.note || ''}</span>
                 </div>
                 <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{log.actualBodyFat ? `${log.actualBodyFat}% Fat` : '-'}</span>
              </div>
            </div>
          ))}
        </div>

        {!showAllLogs && allLogs.length > 5 && (
          <button 
            onClick={() => setShowAllLogs(true)}
            className="w-full mt-4 text-center text-xs font-semibold text-gray-500 hover:text-black py-2 transition-colors"
          >
            View More
          </button>
        )}
      </Card>
    </div>
  );
};