/**
 * 节假日工具函数
 * 优先使用 chinese-workday（数据来自国务院公告，含调休，支持 2018+）
 * 2018 年之前的日期使用 chinese-days 回退
 */
import {
  isHoliday as cwIsHoliday,
  isWorkday as cwIsWorkday,
  getFestival as cwGetFestival
} from 'chinese-workday';
import {
  isHoliday as cdIsHoliday,
  getDayDetail as cdGetDayDetail,
  isWorkday as cdIsWorkday
} from 'chinese-days';

/** chinese-workday 支持的最小年份 */
const CW_MIN_YEAR = 2018;

/**
 * 判断日期是否在 chinese-workday 支持范围内
 * @param {string} dateStr - 日期字符串 YYYY-MM-DD
 * @returns {boolean}
 */
function useChineseWorkday(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const year = parseInt(dateStr.slice(0, 4), 10);
  return !isNaN(year) && year >= CW_MIN_YEAR;
}

/**
 * 判断是否为休息日（含法定节假日与周末）
 * @param {string} date - 日期字符串 YYYY-MM-DD
 * @returns {boolean} 是否为休息日
 */
export function isWeekend(date) {
  if (useChineseWorkday(date)) {
    return cwIsHoliday(date);
  }
  return cdIsHoliday(date);
}

/**
 * 判断是否为调休日（周末需要上班的补班日）
 * @param {string} dayName - 星期名称
 * @param {string} date - 日期字符串 YYYY-MM-DD
 * @returns {boolean} 是否为调休日
 */
export function isWorkdayOnWeekend(dayName, date) {
  const isSatOrSun = dayName === '周六' || dayName === '周日';
  if (!isSatOrSun) return false;
  if (useChineseWorkday(date)) {
    return cwIsWorkday(date);
  }
  return cdIsWorkday(date);
}

/**
 * 获取节假日名称（法定节假日显示名称，普通周末显示 null 以显示「休」）
 * @param {string} date - 日期字符串 YYYY-MM-DD
 * @returns {string|null} 节假日名称，非节假日或普通周末为 null
 */
export function getHolidayName(date) {
  if (useChineseWorkday(date)) {
    const name = cwGetFestival(date);
    if (name && typeof name === 'string' && name.trim()) {
      return name.trim();
    }
    return null;
  }

  const dayDetail = cdGetDayDetail(date);
  if (dayDetail && dayDetail.name) {
    const names = dayDetail.name.split(',');
    if (names.length > 1) {
      return names[1];
    }
    const name = names[0];
    if (name === 'Saturday' || name === 'Sunday') {
      return null;
    }
    return name;
  }
  return null;
}

export const holidayUtils = {
  isWeekend,
  isWorkdayOnWeekend,
  getHolidayName
};
