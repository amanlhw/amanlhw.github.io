/**
 * 节假日工具函数
 */
import { isHoliday, getDayDetail, isWorkday } from 'chinese-days';

/**
 * 判断是否为休息日（使用chinese-days库）
 * @param {string} date - 日期字符串
 * @returns {boolean} 是否为休息日
 */
export function isWeekend(date) {
  return isHoliday(date);
}

/**
 * 判断是否为调休日（周末需要上班）
 * @param {string} dayName - 星期名称
 * @param {string} date - 日期字符串
 * @returns {boolean} 是否为调休日
 */
export function isWorkdayOnWeekend(dayName, date) {
  // 如果是周六或周日，但需要上班，则为调休日
  return (dayName === '周六' || dayName === '周日') && isWorkday(date);
}

/**
 * 获取节假日名称
 * @param {string} date - 日期字符串
 * @returns {string|null} 节假日名称
 */
export function getHolidayName(date) {
  const dayDetail = getDayDetail(date);
  if (dayDetail && dayDetail.name) {
    // 从name字段中提取中文节日名称
    const names = dayDetail.name.split(',');

    // 如果是法定节假日，返回中文名称（通常是第二个元素）
    if (names.length > 1) {
      return names[1];
    }

    // 如果是普通周末，检查是否为英文名称
    const name = names[0];
    if (name === 'Saturday' || name === 'Sunday') {
      return null; // 返回null，这样会显示默认的"休"
    }

    return name;
  }
  return null;
}

// 导出工具对象
export const holidayUtils = {
  isWeekend,
  isWorkdayOnWeekend,
  getHolidayName
}; 