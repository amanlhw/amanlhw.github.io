/**
 * 日期工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${ year }-${ month }-${ day }`;
}

/**
 * 格式化日期显示（只显示月/日）
 * @param {string} date - 日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export function formatDayDate(date) {
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${ month }/${ day }`;
}

/**
 * 获取当前周的开始日期（周一）
 * @returns {Date} 当前周的开始日期
 */
export function getCurrentWeekStart() {
  const today = new Date();
  const currentDay = today.getDay(); // 0是周日，1是周一
  const monday = new Date(today);

  // 计算本周一的日期
  const dayDiff = currentDay === 0 ? 6 : currentDay - 1;
  monday.setDate(today.getDate() - dayDiff);

  return monday;
}

/**
 * 判断是否为当前周
 * @param {Date} weekStart - 周开始日期
 * @returns {boolean} 是否为当前周
 */
export function isCurrentWeek(weekStart) {
  if (!weekStart) return false;

  const today = new Date();
  const currentDay = today.getDay();
  const currentMonday = new Date(today);
  const dayDiff = currentDay === 0 ? 6 : currentDay - 1;
  currentMonday.setDate(today.getDate() - dayDiff);

  // 使用日期字符串比较，避免时区和时间部分的影响
  const currentMondayStr = formatDate(currentMonday);
  const currentWeekStartStr = formatDate(weekStart);
  return currentMondayStr === currentWeekStartStr;
}

/**
 * 生成指定周的日期数组
 * @param {Date} weekStart - 周开始日期
 * @returns {Array} 周日期数组
 */
export function generateWeekDays(weekStart) {
  const weekDays = [];
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    weekDays.push({
      name: dayNames[i],
      date: formatDate(date),
      items: []
    });
  }

  return weekDays;
}

/**
 * 获取周号
 * @param {Date} weekStart - 周开始日期
 * @returns {number} 周号
 */
export function getWeekNumber(weekStart) {
  if (!weekStart) return '';
  const yearStart = new Date(weekStart.getFullYear(), 0, 1);
  const days = Math.floor((weekStart - yearStart) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + yearStart.getDay() + 1) / 7);
  return weekNumber;
}

/**
 * 获取周范围字符串
 * @param {Array} weekDays - 周日期数组
 * @returns {string} 周范围字符串
 */
export function getWeekRange(weekDays) {
  if (weekDays.length === 0) return '';
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  return `${ firstDay.date } ～ ${ lastDay.date }`;
}

/**
 * 判断是否为今天
 * @param {string} date - 日期字符串
 * @returns {boolean} 是否为今天
 */
export function isToday(date) {
  const today = new Date();
  const todayStr = formatDate(today);
  return date === todayStr;
}

// 导出工具对象
export const dateUtils = {
  formatDate,
  formatDayDate,
  getCurrentWeekStart,
  isCurrentWeek,
  generateWeekDays,
  getWeekNumber,
  getWeekRange,
  isToday
}; 