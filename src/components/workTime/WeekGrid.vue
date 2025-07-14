<template>
  <div class="week-grid">
    <div class="day-col" v-for="day in weekDays" :key="day.date">
      <div class="day-header"
        :class="{ 'today': isToday(day.date), 'weekend': isWeekend(day.name, day.date), 'workday-weekend': isWorkdayOnWeekend(day.name, day.date) }">
        <div class="header-top">
          <div class="day-name">
            {{ day.name }}
            <span v-if="isWeekend(day.name, day.date)" class="weekend-badge">
              {{ getHolidayName(day.date) || '休' }}
            </span>
            <span v-if="isWorkdayOnWeekend(day.name, day.date)" class="workday-badge">
              班
            </span>
            <span v-if="isToday(day.date)" class="today-badge">
              今
            </span>
          </div>
          <div class="day-date">{{ day.date }}</div>
        </div>
      </div>

      <div class="day-hours"
        :class="{ 'weekend-hours': isWeekend(day.name, day.date) && !isWorkdayOnWeekend(day.name, day.date) }">
        <i class="el-icon-time"></i>
        <span class="current">{{ getTotalHours(day.items) }}</span>
        <span class="separator">+</span>
        <span class="remaining">{{ getRemainingHours(day.items, day.name, day.date) }}</span>
        <span class="equals">=</span>
        <span class="target">{{ (isWeekend(day.name, day.date) && !isWorkdayOnWeekend(day.name, day.date)) ? '0' :
          '8.0' }}</span>
      </div>

      <div class="work-items" @click="handleWorkItemsClick(day.date, $event)">
        <div class="work-item" v-for="(item, index) in day.items" :key="index"
          @click.stop="$emit('edit-work-item', day.date, index, item)">
          <div class="item-content">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-row">
              <div class="item-hours">
                <span class="hours">{{ item.hours }}小时</span>
                <i v-if="item.link" class="el-icon-link link-icon" @click.stop="$emit('open-link', item.link)"
                  title="打开云效链接"></i>
              </div>
              <div class="item-actions">
                <i class="el-icon-edit action-btn edit-btn" @click.stop="$emit('edit-work-item', day.date, index, item)"
                  title="编辑"></i>
                <i class="el-icon-delete action-btn delete-btn" @click.stop="$emit('delete-work-item', day.date, index)"
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
</template>

<script>
export default {
  name: 'WeekGrid',
  props: {
    weekDays: {
      type: Array,
      default: () => []
    },
    isToday: {
      type: Function,
      required: true
    },
    isWeekend: {
      type: Function,
      required: true
    },
    isWorkdayOnWeekend: {
      type: Function,
      required: true
    },
    getHolidayName: {
      type: Function,
      required: true
    },
    getTotalHours: {
      type: Function,
      required: true
    },
    getRemainingHours: {
      type: Function,
      required: true
    }
  },
  emits: ['add-work-item', 'edit-work-item', 'delete-work-item', 'open-link'],
  methods: {
    handleWorkItemsClick(date, event) {
      // 如果点击的是空白区域（不是工时事项），则显示添加对话框
      if (event.target.classList.contains('work-items') ||
        event.target.classList.contains('empty-placeholder') ||
        event.target.closest('.empty-placeholder')) {
        this.$emit('add-work-item', date);
      }
    }
  }
};
</script>

<style scoped>
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
  margin-bottom: 12px;
  flex: 1;
  min-height: 0;
}

.day-col {
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

.header-top {
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

.workday-badge {
  background: #ff6b6b;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.today-badge {
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

.current {
  color: #5dd219;
  font-weight: 600;
  font-size: 16px;
}

.separator {
  color: #999;
}

.remaining {
  color: #ff0059;
  font-weight: 600;
  font-size: 20px;
}

.equals {
  color: #999;
  margin: 0 2px;
}

.target {
  color: #666;
  font-weight: 500;
}

.weekend-hours {
  opacity: 0.5;
}

.weekend-hours .current {
  color: #28a745;
}

.weekend-hours .target {
  color: #999;
}

.weekend-hours .remaining {
  color: #28a745;
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

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.item-hours {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hours {
  font-size: 12px;
  color: #1976d2;
  font-weight: 600;
}

.item-actions {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

.action-btn {
  font-size: 14px;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.edit-btn {
  color: #409EFF;
}

.edit-btn:hover {
  background-color: #ecf5ff;
  color: #66b1ff;
}

.delete-btn {
  color: #F56C6C;
}

.delete-btn:hover {
  background-color: #fef0f0;
  color: #f78989;
}

.link-icon {
  font-size: 14px;
  color: #409EFF;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.link-icon:hover {
  background-color: #ecf5ff;
  color: #66b1ff;
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .week-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    flex: none;
  }

  .day-col {
    height: auto;
    min-height: 300px;
  }

  .work-items {
    max-height: 600px;
  }
}
</style>