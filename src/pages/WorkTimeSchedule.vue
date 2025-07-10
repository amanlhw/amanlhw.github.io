<template>
  <PageLayout title="工时排布统计" :fullWidth="true">
    <div class="work-time-content">
      <div class="week-navigation">
        <div class="nav-button-container">
          <el-button type="text" icon="el-icon-arrow-left" @click="previousWeek">上一周</el-button>
        </div>
        <div class="week-display">
          <div class="week-title-container" @click="goToCurrentWeek">
            <span class="week-title">第{{ currentWeekNumber }}周</span>
            <i v-if="!isCurrentWeek" class="el-icon-refresh current-week-icon" title="回到本周"></i>
          </div>
          <span class="week-date-range">{{ weekRange }}</span>
        </div>
        <div class="nav-button-container">
          <el-button type="text" icon="el-icon-arrow-right" @click="nextWeek">下一周</el-button>
        </div>
      </div>

      <div class="week-grid">
        <div class="day-column" v-for="day in weekDays" :key="day.date">
          <div class="day-header"
            :class="{ 'today': isToday(day.date), 'weekend': isWeekend(day.name, day.date), 'workday-weekend': isWorkdayOnWeekend(day.name, day.date) }">
            <div class="day-header-top">
              <div class="day-name">
                {{ day.name }}
                <span v-if="isWeekend(day.name, day.date)" class="weekend-badge">
                  {{ getHolidayName(day.date) || '休' }}
                </span>
                <span v-if="isWorkdayOnWeekend(day.name, day.date)" class="workday-weekend-badge">
                  班
                </span>
                <span v-if="isToday(day.date)" class="today-weekend-badge">
                  今
                </span>
              </div>
              <div class="day-date">{{ day.date }}</div>
            </div>
          </div>

          <div class="day-hours"
            :class="{ 'weekend-hours': isWeekend(day.name, day.date) && !isWorkdayOnWeekend(day.name, day.date) }">
            <i class="el-icon-time"></i>
            <span class="current-hours">{{ getTotalHours(day.items) }}</span>
            <span class="hours-separator">/</span>
            <span class="target-hours">{{ (isWeekend(day.name, day.date) && !isWorkdayOnWeekend(day.name, day.date)) ?
              '0' : '8' }}</span>
          </div>

          <div class="work-items" @click="handleWorkItemsClick(day.date, $event)">
            <div class="work-item" v-for="(item, index) in day.items" :key="index"
              @click.stop="editWorkItem(day.date, index, item)">
              <div class="item-content">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-hours-row">
                  <span class="item-hours">{{ item.hours }}小时</span>
                  <div class="item-actions">
                    <i class="el-icon-edit action-icon edit-icon" @click.stop="editWorkItem(day.date, index, item)"
                      title="编辑"></i>
                    <i class="el-icon-delete action-icon delete-icon" @click.stop="deleteWorkItem(day.date, index)"
                      title="删除"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="empty-placeholder" v-if="day.items.length === 0">
              <i class="el-icon-plus"></i>
              <span>点击添加工时事项</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加/编辑事项对话框 -->
      <el-dialog :title="isEditing ? '编辑工时事项' : '添加工时事项'" :visible.sync="dialogVisible" width="600px"
        :before-close="handleDialogClose">
        <el-form :model="newItem" :rules="rules" ref="itemForm" label-width="80px">
          <el-form-item label="事项名称" prop="title">
            <el-input ref="titleInput" v-model="newItem.title" placeholder="请输入事项名称" maxlength="50" type="textarea"
              autosize></el-input>
          </el-form-item>
          <el-form-item label="工时" prop="hours">
            <el-input-number ref="hoursInput" v-model="newItem.hours" :min="0.1" :max="24" :step="1" :precision="1"
              placeholder="请输入工时"></el-input-number>
            <span class="hours-unit">小时</span>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="isEditing ? updateWorkItem() : addWorkItem()">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </PageLayout>
</template>

<script>
import PageLayout from '@/components/PageLayout.vue';
import { isHoliday, getDayDetail, isWorkday } from 'chinese-days';

export default {
  name: 'WorkTimeSchedule',
  components: {
    PageLayout
  },
  data() {
    return {
      weekDays: [],
      currentWeekStart: null, // 当前显示周的开始日期
      isCurrentWeek: false, // 是否为当前周
      dialogVisible: false,
      isEditing: false, // 是否为编辑模式
      currentDay: '',
      currentEditIndex: -1, // 当前编辑的项目索引
      newItem: {
        title: '',
        hours: 1
      },
      rules: {
        title: [
          { required: true, message: '请输入事项名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        hours: [
          { required: true, message: '请输入工时', trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    weekRange() {
      if (this.weekDays.length === 0) return '';
      const firstDay = this.weekDays[0];
      const lastDay = this.weekDays[6];
      return `${ firstDay.date } ～ ${ lastDay.date }`;
    },
    currentWeekNumber() {
      if (!this.currentWeekStart) return '';
      const yearStart = new Date(this.currentWeekStart.getFullYear(), 0, 1);
      const days = Math.floor((this.currentWeekStart - yearStart) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((days + yearStart.getDay() + 1) / 7);
      return weekNumber;
    }
  },
  mounted() {
    this.initCurrentWeek();
    this.loadData();
  },
  methods: {
    // 初始化当前周
    initCurrentWeek() {
      const today = new Date();
      const currentDay = today.getDay(); // 0是周日，1是周一
      const monday = new Date(today);

      // 计算本周一的日期
      const dayDiff = currentDay === 0 ? 6 : currentDay - 1;
      monday.setDate(today.getDate() - dayDiff);

      this.currentWeekStart = monday;
      this.generateWeekDays(monday);
      this.updateIsCurrentWeek();
    },

    // 更新是否为当前周的状态
    updateIsCurrentWeek() {
      if (!this.currentWeekStart) {
        this.isCurrentWeek = false;
        return;
      }

      const today = new Date();
      const currentDay = today.getDay();
      const currentMonday = new Date(today);
      const dayDiff = currentDay === 0 ? 6 : currentDay - 1;
      currentMonday.setDate(today.getDate() - dayDiff);

      // 使用日期字符串比较，避免时区和时间部分的影响
      const currentMondayStr = this.formatDate(currentMonday);
      const currentWeekStartStr = this.formatDate(this.currentWeekStart);
      this.isCurrentWeek = currentMondayStr === currentWeekStartStr;
    },

    // 生成指定周的日期
    generateWeekDays(weekStart) {
      const weekDays = [];
      const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);

        weekDays.push({
          name: dayNames[i],
          date: this.formatDate(date),
          items: []
        });
      }

      this.weekDays = weekDays;
    },

    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${ year }-${ month }-${ day }`;
    },

    // 显示添加对话框
    showAddDialog(date) {
      this.currentDay = date;
      this.isEditing = false;
      this.currentEditIndex = -1;
      this.dialogVisible = true;
      this.newItem = {
        title: '',
        hours: 1
      };
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
        // 新增时聚焦到事项名称输入框
        this.$refs.titleInput && this.$refs.titleInput.focus();
      });
    },

    // 显示编辑对话框
    editWorkItem(date, index, item) {
      this.currentDay = date;
      this.isEditing = true;
      this.currentEditIndex = index;
      this.dialogVisible = true;
      this.newItem = {
        title: item.title,
        hours: item.hours
      };
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
        // 编辑时聚焦到工时输入框
        this.$refs.hoursInput && this.$refs.hoursInput.focus();
      });
    },

    // 关闭对话框
    handleDialogClose() {
      this.dialogVisible = false;
      this.isEditing = false;
      this.currentDay = '';
      this.currentEditIndex = -1;
      this.newItem = {
        title: '',
        hours: 1
      };
    },

    // 添加工时事项
    addWorkItem() {
      this.$refs.itemForm.validate((valid) => {
        if (valid) {
          const dayIndex = this.weekDays.findIndex(day => day.date === this.currentDay);
          if (dayIndex !== -1) {
            this.weekDays[dayIndex].items.push({
              title: this.newItem.title,
              hours: this.newItem.hours
            });
            this.saveData();
            this.handleDialogClose();
            this.$message.success('添加成功');
          }
        }
      });
    },

    // 更新工时事项
    updateWorkItem() {
      this.$refs.itemForm.validate((valid) => {
        if (valid) {
          const dayIndex = this.weekDays.findIndex(day => day.date === this.currentDay);
          if (dayIndex !== -1 && this.currentEditIndex !== -1) {
            this.weekDays[dayIndex].items[this.currentEditIndex] = {
              title: this.newItem.title,
              hours: this.newItem.hours
            };
            this.saveData();
            this.handleDialogClose();
            this.$message.success('更新成功');
          }
        }
      });
    },

    // 删除工时事项
    deleteWorkItem(date, index) {
      const dayIndex = this.weekDays.findIndex(day => day.date === date);
      if (dayIndex !== -1) {
        this.weekDays[dayIndex].items.splice(index, 1);
        this.saveData();
        this.$message.success('删除成功');
      }
    },

    // 保存数据到本地存储
    saveData() {
      const weekKey = this.getWeekKey();
      const data = {
        weekKey,
        weekDays: this.weekDays
      };
      localStorage.setItem('workTimeSchedule', JSON.stringify(data));
    },

    // 从本地存储加载数据
    loadData() {
      const savedData = localStorage.getItem('workTimeSchedule');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          const currentWeekKey = this.getWeekKey();

          // 如果是同一周的数据，则加载
          if (data.weekKey === currentWeekKey) {
            this.weekDays = data.weekDays;
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        }
      }
    },

    // 获取周标识
    getWeekKey() {
      if (this.weekDays.length === 0) return '';
      return this.weekDays[0].date;
    },

    // 切换到上一周
    previousWeek() {
      const newWeekStart = new Date(this.currentWeekStart);
      newWeekStart.setDate(this.currentWeekStart.getDate() - 7);
      this.currentWeekStart = newWeekStart;
      this.generateWeekDays(newWeekStart);
      this.loadData();
      this.updateIsCurrentWeek();
    },

    // 切换到下一周
    nextWeek() {
      const newWeekStart = new Date(this.currentWeekStart);
      newWeekStart.setDate(this.currentWeekStart.getDate() + 7);
      this.currentWeekStart = newWeekStart;
      this.generateWeekDays(newWeekStart);
      this.loadData();
      this.updateIsCurrentWeek();
    },

    // 回到本周
    goToCurrentWeek() {
      this.initCurrentWeek();
      this.loadData();
    },

    // 判断是否为休息日（使用chinese-days库）
    isWeekend(dayName, date) {
      // 使用chinese-days库判断是否为节假日
      return isHoliday(date);
    },

    // 判断是否为调休日（周末需要上班）
    isWorkdayOnWeekend(dayName, date) {
      // 如果是周六或周日，但需要上班，则为调休日
      return (dayName === '周六' || dayName === '周日') && isWorkday(date);
    },

    // 获取节假日名称
    getHolidayName(date) {
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
    },

    // 判断是否为今天
    isToday(date) {
      const today = new Date();
      const todayStr = this.formatDate(today);
      return date === todayStr;
    },

    // 计算总工时
    getTotalHours(items) {
      if (!items || items.length === 0) return 0;
      const total = items.reduce((sum, item) => sum + item.hours, 0);
      return total.toFixed(1);
    },

    // 处理工时事项区域点击
    handleWorkItemsClick(date, event) {
      // 如果点击的是空白区域（不是工时事项），则显示添加对话框
      if (event.target.classList.contains('work-items') ||
        event.target.classList.contains('empty-placeholder') ||
        event.target.closest('.empty-placeholder')) {
        this.showAddDialog(date);
      }
    }
  }
};
</script>

<style scoped>
.work-time-content {
  width: 100%;
  height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
}

.week-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.week-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.week-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.week-title {
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
}

.current-week-icon {
  font-size: 16px;
  color: #1976d2;
  transition: all 0.3s ease;
}

.current-week-icon:hover {
  color: #42a5f5;
  transform: scale(1.1);
}

.week-date-range {
  font-size: 14px;
  color: #666;
}

.nav-button-container {
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.nav-button-container:hover {
  background-color: #f5f7fa;
}

.nav-button-container .el-button {
  font-size: 14px;
  padding: 8px 12px;
}



.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  flex: 1;
  min-height: 0;
}

.day-column {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(179, 198, 224, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.day-header {
  text-align: center;
  margin: 8px;
  padding: 8px;
  background: #eeeeee;
  border-radius: 8px;
}

.day-header-top {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.day-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.weekend-badge {
  background: #28a745;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workday-weekend-badge {
  background: #ff6b6b;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.today-weekend-badge {
  background: #409EFF;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-date {
  font-size: 14px;
  color: #666;
}

.day-hours {
  margin: 0 10px 10px;
  font-size: 14px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.el-icon-time {
  margin-right: 6px;
}

.current-hours {
  color: #1976d2;
  font-weight: 600;
  font-size: 20px;
}

.hours-separator {
  color: #999;
}

.target-hours {
  color: #666;
  font-weight: 500;
}

.weekend-hours {
  opacity: 0.7;
}

.weekend-hours .current-hours {
  color: #28a745;
}

.weekend-hours .target-hours {
  color: #999;
}

.day-header.today {
  background: #f0f8ff;
}

.day-header.weekend {
  background: #f0fff0;
}

.day-header.today.weekend {
  background: linear-gradient(135deg, #f0f8ff 0%, #f0fff0 100%);
}

.day-header.workday-weekend {
  background: #fff5f5;
}

.day-header.today.workday-weekend {
  background: linear-gradient(135deg, #f0f8ff 0%, #fff5f5 100%);
}

.day-header.today .day-name {
  color: #1976d2;
  font-weight: 600;
}

.day-header.today .day-date {
  color: #1976d2;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #ccc;
  font-size: 14px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  margin: 8px;
  transition: all 0.3s ease;
}

.empty-placeholder i {
  font-size: 24px;
  margin-bottom: 8px;
}

.work-items {
  flex: 1;
  margin: 0 10px 10px;
  overflow-y: auto;
  min-height: 0;
  cursor: pointer;
  position: relative;
}

.work-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  word-break: break-all;
}

.item-hours-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.item-hours {
  font-size: 12px;
  color: #1976d2;
  font-weight: 600;
}

.item-actions {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

.action-icon {
  font-size: 14px;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.edit-icon {
  color: #409EFF;
}

.edit-icon:hover {
  background-color: #ecf5ff;
  color: #66b1ff;
}

.delete-icon {
  color: #F56C6C;
}

.delete-icon:hover {
  background-color: #fef0f0;
  color: #f78989;
}

.item-actions .el-button {
  color: #F56C6C;
}

.hours-unit {
  margin-left: 8px;
  color: #666;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .work-time-content {
    height: auto;
    min-height: 100vh;
  }

  .week-navigation {
    padding: 12px 16px;
    gap: 12px;
  }

  .week-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    flex: none;
  }

  .nav-button-container {
    padding: 0;
    transition: none;
  }

  .nav-button-container:hover {
    background-color: unset;
  }

  .nav-button-container .el-button {
    font-size: 14px;
    padding: 0;
  }

  .day-column {
    height: auto;
    min-height: 300px;
  }

  .work-items {
    max-height: 600px;
  }
}
</style>