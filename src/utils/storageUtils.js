/**
 * 存储工具函数
 */

const STORAGE_KEY = 'workTimeSchedule';

/**
 * 获取所有已保存的数据
 * @returns {Object} 所有已保存的数据
 */
export function getAllSavedData() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      // 如果是旧格式（单个周的数据），转换为新格式
      if (data.weekKey && data.weekDays) {
        return { [data.weekKey]: data };
      }
      // 如果是新格式（多周数据），直接返回
      if (typeof data === 'object') {
        return data;
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  }
  return {};
}

/**
 * 保存所有数据
 * @param {Object} allData - 所有数据
 */
export function saveAllData(allData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

/**
 * 删除指定周的数据
 * @param {string} weekKey - 周标识
 */
export function deleteWeekData(weekKey) {
  const allData = getAllSavedData();
  delete allData[weekKey];
  saveAllData(allData);
}

/**
 * 清空所有数据
 */
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

// 导出工具对象
export const storageUtils = {
  getAllSavedData,
  saveAllData,
  deleteWeekData,
  clearAllData
}; 