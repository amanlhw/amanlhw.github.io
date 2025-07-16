/**
 * 工时工具函数
 */
import { storageUtils } from './storageUtils';

/**
 * 计算总工时
 * @param {Array} items - 工时事项数组
 * @returns {string} 总工时字符串
 */
export function getTotalHours(items) {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.hours, 0);
  return total.toFixed(1);
}

/**
 * 计算未填写工时
 * @param {Array} items - 工时事项数组
 * @param {string} dayName - 星期名称
 * @param {string} date - 日期字符串
 * @param {Function} isWeekend - 判断是否为休息日的函数
 * @param {Function} isWorkdayOnWeekend - 判断是否为调休日的函数
 * @returns {string} 剩余工时字符串
 */
export function getRemainingHours(items, dayName, date, isWeekend, isWorkdayOnWeekend) {
  const targetHours = (isWeekend(dayName, date) && !isWorkdayOnWeekend(dayName, date)) ? 0 : 8;
  const currentHours = getTotalHours(items);
  const remaining = Math.max(0, targetHours - parseFloat(currentHours));
  return remaining.toFixed(1);
}

/**
 * 计算周总工时
 * @param {Array} weekDays - 周日期数组
 * @returns {string} 周总工时字符串
 */
export function calculateWeekTotalHours(weekDays) {
  if (weekDays.length === 0) return 0;
  const total = weekDays.reduce((sum, day) => {
    return sum + parseFloat(getTotalHours(day.items));
  }, 0);
  return total.toFixed(1);
}

/**
 * 计算周目标工时
 * @param {Array} weekDays - 周日期数组
 * @param {Function} isWeekend - 判断是否为休息日的函数
 * @param {Function} isWorkdayOnWeekend - 判断是否为调休日的函数
 * @returns {number} 周目标工时
 */
export function calculateWeekTargetHours(weekDays, isWeekend, isWorkdayOnWeekend) {
  if (weekDays.length === 0) return 0;
  const target = weekDays.reduce((sum, day) => {
    const isWeekendDay = isWeekend(day.name, day.date);
    const isWorkdayWeekend = isWorkdayOnWeekend(day.name, day.date);
    return sum + ((isWeekendDay && !isWorkdayWeekend) ? 0 : 8);
  }, 0);
  return target;
}

/**
 * 计算周剩余工时
 * @param {string} weekTotalHours - 周总工时
 * @param {number} weekTargetHours - 周目标工时
 * @returns {string} 周剩余工时字符串
 */
export function calculateWeekRemainingHours(weekTotalHours, weekTargetHours) {
  const remaining = weekTargetHours - parseFloat(weekTotalHours);
  return Math.max(0, remaining).toFixed(1);
}

/**
 * 解析云效链接标题
 * @param {string} link - 云效链接
 * @returns {string|null} 解析出的标题
 */
export function parseYunxiaoLink(link) {
  if (!link) return null;

  try {
    const url = link.trim();

    // 方法1：从URL的hash部分提取标题（#后面的内容）
    const hashMatch = url.match(/#\s*《(.+?)》/);
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1].trim();
    }

    // 方法2：从URL的hash部分提取标题（#后面的内容，不带书名号）
    const hashMatch2 = url.match(/#\s*(.+)/);
    if (hashMatch2 && hashMatch2[1]) {
      return hashMatch2[1].trim();
    }

    // 方法3：从URL路径中提取任务编号
    const taskMatch = url.match(/\/task\/([A-Z]+-\d+)/);
    if (taskMatch && taskMatch[1]) {
      return taskMatch[1];
    }

    // 方法4：如果都没有匹配到，使用URL的最后部分
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart !== 'task') {
      return lastPart;
    }

    return null;
  } catch (error) {
    console.error('解析云效链接失败:', error);
    return null;
  }
}

/**
 * 验证云效链接是否有效
 * @param {string} link - 云效链接
 * @returns {boolean} 是否为有效的云效链接
 */
export function isValidYunxiaoLink(link) {
  if (!link || typeof link !== 'string') return false;
  const url = link.trim();
  if (!url) return false;
  try {
    // 检查是否为有效的URL格式
    const urlObj = new URL(url);
    // 检查是否为云效域名
    const yunxiaoDomains = [
      'yunxiao.alibaba-inc.com',
      'yunxiao.aliyun.com',
      'devops.aliyun.com'
    ];
    return yunxiaoDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (error) {
    // 如果不是有效的URL格式，返回false
    return false;
  }
}

/**
 * 获取周的日期范围
 * @param {string} weekKey - 周标识
 * @returns {string} 周日期范围字符串
 */
export function getWeekDateRange(weekKey) {
  const allData = storageUtils.getAllSavedData();
  const weekData = allData[weekKey];
  if (!weekData || !weekData.weekDays || weekData.weekDays.length === 0) return '';

  const firstDay = weekData.weekDays[0];
  const lastDay = weekData.weekDays[6];
  return `${ firstDay.date } ～ ${ lastDay.date }`;
}

/**
 * 获取周的总工时
 * @param {string} weekKey - 周标识
 * @returns {string} 周总工时字符串
 */
export function getWeekTotalHours(weekKey) {
  const allData = storageUtils.getAllSavedData();
  const weekData = allData[weekKey];
  if (!weekData || !weekData.weekDays) return 0;

  const total = weekData.weekDays.reduce((sum, day) => {
    return sum + (day.items ? day.items.reduce((daySum, item) => daySum + item.hours, 0) : 0);
  }, 0);
  return total.toFixed(1);
}

/**
 * 获取周的目标工时
 * @param {string} weekKey - 周标识
 * @param {Function} isWeekend - 判断是否为休息日的函数
 * @param {Function} isWorkdayOnWeekend - 判断是否为调休日的函数
 * @returns {number} 周目标工时
 */
export function getWeekTargetHours(weekKey, isWeekend, isWorkdayOnWeekend) {
  const allData = storageUtils.getAllSavedData();
  const weekData = allData[weekKey];
  if (!weekData || !weekData.weekDays) return 0;

  const target = weekData.weekDays.reduce((sum, day) => {
    const isWeekendDay = isWeekend(day.name, day.date);
    const isWorkdayWeekend = isWorkdayOnWeekend(day.name, day.date);
    return sum + ((isWeekendDay && !isWorkdayWeekend) ? 0 : 8);
  }, 0);
  return target;
}

/**
 * 获取周的剩余工时
 * @param {string} weekKey - 周标识
 * @returns {string} 周剩余工时字符串
 */
export function getWeekRemainingHours(weekKey) {
  const totalHours = parseFloat(getWeekTotalHours(weekKey));
  const targetHours = getWeekTargetHours(weekKey);
  const remaining = Math.max(0, targetHours - totalHours);
  return remaining.toFixed(1);
}

/**
 * 获取周的日期数据
 * @param {string} weekKey - 周标识
 * @returns {Array} 周日期数组
 */
export function getWeekDays(weekKey) {
  const allData = storageUtils.getAllSavedData();
  const weekData = allData[weekKey];
  if (!weekData || !weekData.weekDays) return [];
  return weekData.weekDays;
}

/**
 * 检查指定日期是否有工时
 * @param {string} weekKey - 周标识
 * @param {string} date - 日期字符串
 * @returns {boolean} 是否有工时
 */
export function hasWorkOnDay(weekKey, date) {
  const allData = storageUtils.getAllSavedData();
  const weekData = allData[weekKey];
  if (!weekData || !weekData.weekDays) return false;

  const day = weekData.weekDays.find(d => d.date === date);
  return day && day.items && day.items.length > 0;
}

// 导出工具对象
export const workTimeUtils = {
  getTotalHours,
  getRemainingHours,
  calculateWeekTotalHours,
  calculateWeekTargetHours,
  calculateWeekRemainingHours,
  parseYunxiaoLink,
  isValidYunxiaoLink,
  getWeekDateRange,
  getWeekTotalHours,
  getWeekTargetHours,
  getWeekRemainingHours,
  getWeekDays,
  hasWorkOnDay
}; 