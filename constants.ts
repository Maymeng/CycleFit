import { CyclePhase, DailyRecord, UserGoal } from './types';

export const INITIAL_GOAL: UserGoal = {
  targetDate: '2025-12-31',
  targetWeight: 51.0,
  targetBodyFat: 27.0,
  startWeight: 55.85, // Based on Aug data
  startBodyFat: 29.0,
};

// Helper to parse the user's raw data format into our structured format
// Note: Simplified parsing logic for the provided dataset
export const INITIAL_RECORDS: DailyRecord[] = [
// --- August 2025 ---
  { date: '2025-08-06', cycleDay: 14, cyclePhase: CyclePhase.LUTEAL, suggestion: '易水肿', predictedWeight: 55.85, predictedBodyFat: 29.0, actualWeight: 55.85 },
  { date: '2025-08-07', cycleDay: 15, cyclePhase: CyclePhase.LUTEAL, suggestion: '易水肿', predictedWeight: 55.8, predictedBodyFat: 29.0, actualWeight: 55.75 },
  { date: '2025-08-08', cycleDay: 16, cyclePhase: CyclePhase.LUTEAL, suggestion: '易水肿', predictedWeight: 55.8, predictedBodyFat: 29.0, actualWeight: 56.35 },
  { date: '2025-08-11', cycleDay: 19, cyclePhase: CyclePhase.LUTEAL, suggestion: '易水肿', predictedWeight: 55.7, predictedBodyFat: 29.0, actualWeight: 55.7 },
  { date: '2025-08-23', cycleDay: 4, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '休息', predictedWeight: 55.4, predictedBodyFat: 29.0, actualWeight: 55.4 },
  { date: '2025-08-24', cycleDay: 5, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '休息', predictedWeight: 55.3, predictedBodyFat: 29.0, actualWeight: 55.25 },
  { date: '2025-08-25', cycleDay: 6, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '恢复训练', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 54.95 },
  { date: '2025-08-26', cycleDay: 7, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '恢复训练', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 55.05 },
  { date: '2025-08-29', cycleDay: 10, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '高效燃脂', predictedWeight: 54.9, predictedBodyFat: 29.0, actualWeight: 54.9 },
  { date: '2025-08-30', cycleDay: 11, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '高效燃脂', predictedWeight: 54.9, predictedBodyFat: 29.0, actualWeight: 54.9, note: '吃了大盘鸡', isCheatDay: true },
  { date: '2025-08-31', cycleDay: 12, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '高效燃脂', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 55.5 },

  // --- September 2025 ---
  { date: '2025-09-01', cycleDay: 13, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '高效燃脂', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 54.9 },
  { date: '2025-09-02', cycleDay: 14, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '高效燃脂', predictedWeight: 54.8, predictedBodyFat: 29.0, actualWeight: 54.7, note: '晚上吃了2韭菜盒子', isCheatDay: true },
  { date: '2025-09-03', cycleDay: 15, cyclePhase: CyclePhase.OVULATION, suggestion: '食欲增加', predictedWeight: 54.8, predictedBodyFat: 29.0, actualWeight: 55.2, note: '中午吃了炒米粉', isCheatDay: true },
  { date: '2025-09-04', cycleDay: 16, cyclePhase: CyclePhase.OVULATION, suggestion: '食欲增加', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 55.5 },
  { date: '2025-09-06', cycleDay: 18, cyclePhase: CyclePhase.OVULATION, suggestion: '维持运动', predictedWeight: 55.2, predictedBodyFat: 29.0, actualWeight: 55.2, note: 'barre课', completedWorkout: true },
  { date: '2025-09-07', cycleDay: 19, cyclePhase: CyclePhase.LUTEAL, suggestion: '控盐', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 55.0 },
  { date: '2025-09-08', cycleDay: 20, cyclePhase: CyclePhase.LUTEAL, suggestion: '控盐', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 54.9, note: '中午kc普拉提课，下午爬坡25分钟', completedWorkout: true },
  { date: '2025-09-09', cycleDay: 21, cyclePhase: CyclePhase.LUTEAL, suggestion: '控盐', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 55.0, note: 'GP普拉提课，晚上吃了葱油饼生菜鸡胸肉', completedWorkout: true, isCheatDay: true },
  { date: '2025-09-12', cycleDay: 24, cyclePhase: CyclePhase.LUTEAL, suggestion: '放松', predictedWeight: 54.8, predictedBodyFat: 29.0, actualWeight: 54.5 },
  { date: '2025-09-13', cycleDay: 25, cyclePhase: CyclePhase.LUTEAL, suggestion: '放松', predictedWeight: 54.8, predictedBodyFat: 29.0, actualWeight: 54.5, note: '登山课40分钟', completedWorkout: true },
  { date: '2025-09-14', cycleDay: 26, cyclePhase: CyclePhase.LUTEAL, suggestion: '放松', predictedWeight: 55.0, predictedBodyFat: 29.0, actualWeight: 55.0 },
  { date: '2025-09-15', cycleDay: 27, cyclePhase: CyclePhase.LUTEAL, suggestion: '放松', predictedWeight: 54.5, predictedBodyFat: 29.0, actualWeight: 54.5 },
  { date: '2025-09-16', cycleDay: 28, cyclePhase: CyclePhase.LUTEAL, suggestion: '放松', predictedWeight: 54.7, predictedBodyFat: 29.0, actualWeight: 54.7 },
  { date: '2025-09-17', cycleDay: 29, cyclePhase: CyclePhase.LUTEAL, suggestion: '放松', predictedWeight: 54.9, predictedBodyFat: 29.0, actualWeight: 54.9 },
  { date: '2025-09-18', cycleDay: 1, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '多休息', predictedWeight: 54.9, predictedBodyFat: 29.0, actualWeight: 54.9, note: '拍证件照' },
  { date: '2025-09-19', cycleDay: 2, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '多休息', predictedWeight: 54.5, predictedBodyFat: 29.0, actualWeight: 54.4 },
  { date: '2025-09-20', cycleDay: 3, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '轻运动', predictedWeight: 54.3, predictedBodyFat: 29.0, actualWeight: 54.1, note: '普拉提，中午吃火锅', completedWorkout: true, isCheatDay: true },
  { date: '2025-09-21', cycleDay: 4, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '轻运动', predictedWeight: 54.5, predictedBodyFat: 29.0, actualWeight: 54.7, note: '晚上吃炒米粉', isCheatDay: true },
  { date: '2025-09-22', cycleDay: 5, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '轻运动', predictedWeight: 54.9, predictedBodyFat: 29.0, actualWeight: 54.9, note: 'barre课', completedWorkout: true },
  { date: '2025-09-23', cycleDay: 6, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '加大强度', predictedWeight: 54.85, predictedBodyFat: 29.0, actualWeight: 54.85 },
  { date: '2025-09-24', cycleDay: 7, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '加大强度', predictedWeight: 54.7, predictedBodyFat: 29.0, actualWeight: 54.7 },
  { date: '2025-09-25', cycleDay: 8, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '加大强度', predictedWeight: 54.65, predictedBodyFat: 29.0, actualWeight: 54.65, note: '普拉提', completedWorkout: true },
  { date: '2025-09-26', cycleDay: 9, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '燃脂黄金期', predictedWeight: 54.7, predictedBodyFat: 28.9 },
  { date: '2025-09-27', cycleDay: 10, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '燃脂黄金期', predictedWeight: 54.9, predictedBodyFat: 29.3 },
  { date: '2025-09-28', cycleDay: 11, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '燃脂黄金期', predictedWeight: 54.3, predictedBodyFat: 29.0, note: '普拉提', completedWorkout: true },
  { date: '2025-09-29', cycleDay: 12, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '燃脂黄金期', predictedWeight: 54.6, predictedBodyFat: 28.9, note: '热瑜伽', completedWorkout: true },
  { date: '2025-09-30', cycleDay: 13, cyclePhase: CyclePhase.OVULATION, suggestion: '注意饮食', predictedWeight: 54.5, predictedBodyFat: 28.9, actualWeight: 54.5, actualBodyFat: 28.9 },

  // --- October 2025 ---
  { date: '2025-10-01', cycleDay: 14, cyclePhase: CyclePhase.OVULATION, suggestion: '注意饮食', predictedWeight: 54.5, predictedBodyFat: 28.9, actualWeight: 54.3, actualBodyFat: 28.8, note: '普拉提', completedWorkout: true },
  { date: '2025-10-02', cycleDay: 15, cyclePhase: CyclePhase.OVULATION, suggestion: '注意饮食', predictedWeight: 54.4, predictedBodyFat: 28.8, actualWeight: 55.1, actualBodyFat: 28.8 },
  { date: '2025-10-03', cycleDay: 16, cyclePhase: CyclePhase.OVULATION, suggestion: '注意饮食', predictedWeight: 54.4, predictedBodyFat: 28.8, actualWeight: 54.9, actualBodyFat: 29.2 },
  { date: '2025-10-04', cycleDay: 17, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.7, predictedBodyFat: 28.8, actualWeight: 54.45, actualBodyFat: 28.6 },
  { date: '2025-10-05', cycleDay: 18, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.7, predictedBodyFat: 28.7, actualWeight: 54.7, actualBodyFat: 28.7, note: '普拉提', completedWorkout: true },
  { date: '2025-10-06', cycleDay: 19, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.6, predictedBodyFat: 28.7, actualWeight: 54.3, actualBodyFat: 28.6 },
  { date: '2025-10-07', cycleDay: 20, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.6, predictedBodyFat: 28.7, actualWeight: 54.2, actualBodyFat: 28.8 },
  { date: '2025-10-08', cycleDay: 21, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.6, predictedBodyFat: 28.6, actualWeight: 54.2, actualBodyFat: 29.0 },
  { date: '2025-10-09', cycleDay: 22, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.5, predictedBodyFat: 28.6, actualWeight: 54.3, actualBodyFat: 28.6, note: '爬坡，普拉提', completedWorkout: true },
  { date: '2025-10-10', cycleDay: 23, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.5, predictedBodyFat: 28.6 },
  { date: '2025-10-11', cycleDay: 24, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.4, predictedBodyFat: 28.5, actualWeight: 53.7, actualBodyFat: 28.5, note: '登山课', completedWorkout: true },
  { date: '2025-10-12', cycleDay: 25, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.4, predictedBodyFat: 28.5, actualWeight: 53.9, actualBodyFat: 28.3, note: '普拉提，火锅', completedWorkout: true, isCheatDay: true },
  { date: '2025-10-13', cycleDay: 26, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.3, predictedBodyFat: 28.5, actualWeight: 54.6 },
  { date: '2025-10-14', cycleDay: 27, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.3, predictedBodyFat: 28.4, actualWeight: 54.2, actualBodyFat: 28.6 },
  { date: '2025-10-15', cycleDay: 28, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.2, predictedBodyFat: 28.4, actualWeight: 54.7, actualBodyFat: 28.5, note: '爬楼机，晚上吃米粉', completedWorkout: true, isCheatDay: true },
  { date: '2025-10-16', cycleDay: 29, cyclePhase: CyclePhase.LUTEAL, suggestion: '低GI饮食', predictedWeight: 54.1, predictedBodyFat: 28.4, actualWeight: 55.2, actualBodyFat: 28.6, note: '普拉提', completedWorkout: true },
  { date: '2025-10-17', cycleDay: 1, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '经期休息', predictedWeight: 54.1, predictedBodyFat: 28.4 },
  { date: '2025-10-18', cycleDay: 2, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '经期休息', predictedWeight: 53.6, predictedBodyFat: 28.3, actualWeight: 54.5, actualBodyFat: 28.7, note: '拳击，晚上喝酒', completedWorkout: true, isCheatDay: true },
  { date: '2025-10-19', cycleDay: 3, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '经期休息', predictedWeight: 53.6, predictedBodyFat: 28.3, actualWeight: 54.9, note: '拳击，zumba', completedWorkout: true },
  { date: '2025-10-20', cycleDay: 4, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '经期休息', predictedWeight: 53.5, predictedBodyFat: 28.3, actualWeight: 54.75, actualBodyFat: 28.6, note: '普拉提，拳击，Zumba', completedWorkout: true },
  { date: '2025-10-21', cycleDay: 5, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '经期休息', predictedWeight: 54.6, predictedBodyFat: 28.5, actualWeight: 54.3, actualBodyFat: 28.4, note: '拳击，Zumba', completedWorkout: true },
  { date: '2025-10-22', cycleDay: 6, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '开始恢复', predictedWeight: 54.3, predictedBodyFat: 28.4 },
  { date: '2025-10-23', cycleDay: 7, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '开始恢复', predictedWeight: 54.0, predictedBodyFat: 28.2, actualWeight: 55.0, actualBodyFat: 28.6, note: '普拉提，拳击', completedWorkout: true },
  { date: '2025-10-24', cycleDay: 8, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '黄金期', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 54.4, actualBodyFat: 28.9, note: '晚餐喝酒吃东西过生日', isCheatDay: true },
  { date: '2025-10-25', cycleDay: 9, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '黄金期', predictedWeight: 53.8, predictedBodyFat: 28.1, note: '普拉提，拳击', completedWorkout: true },
  { date: '2025-10-26', cycleDay: 10, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '黄金期', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 54.8, actualBodyFat: 28.7, note: '普拉提，Zumba，拳击', completedWorkout: true },
  { date: '2025-10-27', cycleDay: 11, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '黄金期', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 54.0, actualBodyFat: 28.3, note: '普拉提', completedWorkout: true },
  { date: '2025-10-28', cycleDay: 12, cyclePhase: CyclePhase.OVULATION, suggestion: '燃脂', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 54.6, actualBodyFat: 28.7, note: '普拉提', completedWorkout: true },
  { date: '2025-10-29', cycleDay: 13, cyclePhase: CyclePhase.OVULATION, suggestion: '燃脂', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 54.4, actualBodyFat: 28.5, note: '普拉提', completedWorkout: true },
  { date: '2025-10-30', cycleDay: 14, cyclePhase: CyclePhase.OVULATION, suggestion: '燃脂', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 54.2, actualBodyFat: 28.5, note: '普拉提', completedWorkout: true },
  { date: '2025-10-31', cycleDay: 15, cyclePhase: CyclePhase.OVULATION, suggestion: '燃脂', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 54.0, actualBodyFat: 28.0, note: '普拉提', completedWorkout: true },

  // --- November 2025 ---
  { date: '2025-11-01', cycleDay: 16, cyclePhase: CyclePhase.LUTEAL, suggestion: '情绪稳定期，维持训练频率', predictedWeight: 53.8, predictedBodyFat: 28.1 },
  { date: '2025-11-02', cycleDay: 17, cyclePhase: CyclePhase.LUTEAL, suggestion: '普拉提+轻有氧', predictedWeight: 53.8, predictedBodyFat: 28.1, note: '团建回来晚上吃了咖喱饭', isCheatDay: true },
  { date: '2025-11-03', cycleDay: 18, cyclePhase: CyclePhase.LUTEAL, suggestion: '睡眠充足，防止水肿', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 54.5, actualBodyFat: 28.4, note: 'barre', completedWorkout: true },
  { date: '2025-11-04', cycleDay: 19, cyclePhase: CyclePhase.LUTEAL, suggestion: '蛋白质充足，少盐少糖', predictedWeight: 53.8, predictedBodyFat: 28.1, actualWeight: 53.8, actualBodyFat: 28.2, note: '爬楼机，，普拉提', completedWorkout: true },
  { date: '2025-11-05', cycleDay: 20, cyclePhase: CyclePhase.LUTEAL, suggestion: '睡眠优先、泡脚排水', predictedWeight: 53.9, predictedBodyFat: 28.3, actualWeight: 53.9, actualBodyFat: 27.4, note: '普拉提', completedWorkout: true },
  { date: '2025-11-06', cycleDay: 21, cyclePhase: CyclePhase.LUTEAL, suggestion: '控盐+轻有氧', predictedWeight: 53.9, predictedBodyFat: 28.3, note: '普拉提', completedWorkout: true },
  { date: '2025-11-07', cycleDay: 22, cyclePhase: CyclePhase.LUTEAL, suggestion: '放松心情，防PMS', predictedWeight: 54.0, predictedBodyFat: 28.4 },
  { date: '2025-11-08', cycleDay: 23, cyclePhase: CyclePhase.LUTEAL, suggestion: '控糖、轻断食', predictedWeight: 54.1, predictedBodyFat: 28.4, actualWeight: 54.7, actualBodyFat: 28.6, note: '避暑，打拳', completedWorkout: true },
  { date: '2025-11-09', cycleDay: 24, cyclePhase: CyclePhase.LUTEAL, suggestion: '水肿高峰，正常波动', predictedWeight: 54.2, predictedBodyFat: 28.5, actualWeight: 54.1, actualBodyFat: 28.1, note: '登山课', completedWorkout: true },
  { date: '2025-11-10', cycleDay: 25, cyclePhase: CyclePhase.LUTEAL, suggestion: '少盐多水', predictedWeight: 54.3, predictedBodyFat: 28.5, note: 'barre', completedWorkout: true },
  { date: '2025-11-11', cycleDay: 26, cyclePhase: CyclePhase.LUTEAL, suggestion: '维持16+8饮食', predictedWeight: 54.3, predictedBodyFat: 28.5, actualWeight: 53.6, actualBodyFat: 28.1, note: '热普拉提', completedWorkout: true, completedFasting: true },
  { date: '2025-11-12', cycleDay: 1, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '减压放松', predictedWeight: 54.4, predictedBodyFat: 28.6, actualWeight: 53.6, actualBodyFat: 28.3 },
  { date: '2025-11-13', cycleDay: 2, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '轻普拉提 + 多水 + 补铁', predictedWeight: 54.5, predictedBodyFat: 28.6, actualWeight: 54.1, actualBodyFat: 28.3, note: '热普拉提', completedWorkout: true },
  { date: '2025-11-14', cycleDay: 3, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '欺骗餐日，放松享受但控量', predictedWeight: 54.3, predictedBodyFat: 28.5, actualWeight: 53.9, actualBodyFat: 27.1, isCheatDay: true, note: '普拉提，晚上吃了火锅', completedWorkout: true },
  { date: '2025-11-15', cycleDay: 4, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '多睡、少盐', predictedWeight: 54.3, predictedBodyFat: 28.5, actualWeight: 54.5, note: '有氧拳击，Zumba', completedWorkout: true },
  { date: '2025-11-16', cycleDay: 5, cyclePhase: CyclePhase.MENSTRUAL, suggestion: '经期末、轻拉伸', predictedWeight: 54.2, predictedBodyFat: 28.4, actualWeight: 54.0, actualBodyFat: 28.0, note: 'barre，晚上吃了火锅', completedWorkout: true, isCheatDay: true },
  { date: '2025-11-17', cycleDay: 6, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '恢复训练强度', predictedWeight: 54.1, predictedBodyFat: 28.3, actualWeight: 55.0, note: 'barre', completedWorkout: true },
  { date: '2025-11-18', cycleDay: 7, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '高蛋白 + 普拉提', predictedWeight: 54.0, predictedBodyFat: 28.3, actualWeight: 54.0, actualBodyFat: 28.2, note: '普拉提', completedWorkout: true },
  { date: '2025-11-19', cycleDay: 8, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '黄金燃脂期，HIIT / 拳击', predictedWeight: 53.9, predictedBodyFat: 28.2, actualWeight: 53.7, actualBodyFat: 27.9, note: '拉伸课', completedWorkout: true },
  { date: '2025-11-20', cycleDay: 9, cyclePhase: CyclePhase.FOLLICULAR, suggestion: '控糖 + 轻有氧', predictedWeight: 53.7, predictedBodyFat: 28.1, actualWeight: 53.7, actualBodyFat: 28.2, note: 'waxing，普拉提', completedWorkout: true },
  { date: '2025-11-21', cycleDay: 10, cyclePhase: CyclePhase.OVULATION, suggestion: '欺骗餐前 高强度训练', predictedWeight: 53.5, predictedBodyFat: 28.0, actualWeight: 53.8, actualBodyFat: 28.2, isCheatDay: true, note: '普拉提，晚上吃了东北菜', completedWorkout: true },
  { date: '2025-11-22', cycleDay: 11, cyclePhase: CyclePhase.OVULATION, suggestion: '代谢峰值，汗出透彻', predictedWeight: 53.3, predictedBodyFat: 27.9, actualWeight: 54.3, note: 'barre', completedWorkout: true },
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


export const PHASES_CONFIG = {
  [CyclePhase.MENSTRUAL]: {
    color: 'bg-rose-100',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    kFactor: 0
  },
  [CyclePhase.FOLLICULAR]: {
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    kFactor: -0.1
  },
  [CyclePhase.OVULATION]: {
    color: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    kFactor: -0.2
  },
  [CyclePhase.LUTEAL]: {
    color: 'bg-amber-100',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    kFactor: 0.2
  }
};

export const FASTING_HOURS = 16;