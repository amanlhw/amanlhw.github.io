<template>
  <div class="data-dist">
    <div class="dist-header" @click="$emit('toggle-distribution')">
      <div class="dist-title">
        <i :class="distributionExpanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'" class="expand-icon"></i>
        <h3>已保存的周数据分布 (共{{ dataStats.totalWeeks }}周)</h3>
      </div>
      <div class="dist-actions" @click.stop="$emit('clear-all-data')">
        一键清理所有数据
      </div>
    </div>
    <div class="dist-content" v-if="distributionExpanded">
      <div class="week-grid">
        <div v-for="weekKey in dataStats.savedWeeks" :key="weekKey" class="week-item"
          @click="$emit('go-to-week', weekKey)" :title="getWeekTooltip(weekKey)">
          <!-- 悬浮操作按钮 -->
          <div class="item-actions">
            <i class="el-icon-location action-btn locate-btn" @click.stop="$emit('go-to-week', weekKey)"
              title="定位到此周"></i>
            <i class="el-icon-delete action-btn delete-btn" @click.stop="$emit('delete-week', weekKey)"
              title="删除此周数据"></i>
          </div>

          <div class="item-header">
            <div class="week-info">
              <div class="week-number">第{{ getWeekNumber(weekKey) }}周</div>
              <div class="date-range">{{ getWeekDateRange(weekKey) }}</div>
            </div>
          </div>
          <div class="item-stats">
            <span class="hours">{{ getWeekTotalHours(weekKey) }}h</span>
            <span class="separator">+</span>
            <span class="remaining">{{ getWeekRemainingHours(weekKey) }}h</span>
            <span class="equals">=</span>
            <span class="target">{{ getWeekTargetHours(weekKey) }}h</span>
          </div>
          <div class="item-days">
            <div v-for="day in getWeekDays(weekKey)" :key="day.date" class="day-item"
              :class="{ 'has-work': hasWorkOnDay(weekKey, day.date) }">
              <span class="day-name">{{ day.name }}</span>
              <span class="day-date">{{ formatDayDate(day.date) }}</span>
              <span v-if="hasWorkOnDay(weekKey, day.date)" class="work-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataDistribution',
  props: {
    distributionExpanded: {
      type: Boolean,
      default: false
    },
    dataStats: {
      type: Object,
      default: () => ({
        totalWeeks: 0,
        savedWeeks: []
      })
    },
    currentWeekKey: {
      type: String,
      default: ''
    },
    getWeekDateRange: {
      type: Function,
      required: true
    },
    getWeekTotalHours: {
      type: Function,
      required: true
    },
    getWeekRemainingHours: {
      type: Function,
      required: true
    },
    getWeekTargetHours: {
      type: Function,
      required: true
    },
    getWeekDays: {
      type: Function,
      required: true
    },
    hasWorkOnDay: {
      type: Function,
      required: true
    },
    formatDayDate: {
      type: Function,
      required: true
    },
    getWeekNumber: {
      type: Function,
      required: true
    }
  },
  emits: ['toggle-distribution', 'clear-all-data', 'go-to-week', 'delete-week'],
  methods: {
    getWeekTooltip(weekKey) {
      const firstDay = this.getWeekDays(weekKey)[0];
      const lastDay = this.getWeekDays(weekKey)[6];
      const totalHours = this.getWeekTotalHours(weekKey);
      const targetHours = this.getWeekTargetHours(weekKey);

      return `${ firstDay.date } ～ ${ lastDay.date }\n总工时: ${ totalHours }h / ${ targetHours }h`;
    }
  }
};
</script>

<style scoped>
/* 数据分布图样式 */
.data-dist {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(179, 198, 224, 0.2);
  padding: 12px;
}

.dist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.dist-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  font-size: 16px;
  color: #666;
  transition: transform 0.3s ease;
}

.dist-header:hover .expand-icon {
  color: #409EFF;
}

.dist-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.dist-actions {
  font-size: 12px;
  color: #F56C6C;
}

.dist-content {
  max-height: 400px;
  overflow-y: auto;
  transition: all 0.3s ease;
  padding-top: 6px;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.week-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 1px solid transparent;
}

.item-actions {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.week-item:hover .item-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.locate-btn {
  background: rgba(64, 158, 255, 0.9);
  color: #fff;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

.locate-btn:hover {
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(245, 108, 108, 0.9);
  color: #fff;
  border: 1px solid rgba(245, 108, 108, 0.3);
}

.delete-btn:hover {
  background: rgba(245, 108, 108, 0.9);
  transform: scale(1.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.week-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.week-number {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 6px;
}

.date-range {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.item-stats {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 12px;
}

.hours {
  color: #28a745;
  font-weight: 600;
  font-size: 14px;
}

.separator {
  color: #999;
  font-weight: 400;
}

.remaining {
  color: #ff0059;
  font-weight: 600;
  font-size: 14px;
}

.equals {
  color: #999;
  font-weight: 400;
}

.target {
  color: #666;
  font-weight: 500;
}

.item-days {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
  flex: 1;
}

.day-name {
  font-size: 10px;
  color: #666;
  font-weight: 500;
}

.day-date {
  font-size: 11px;
  color: #333;
  font-weight: 600;
}

.work-dot {
  width: 6px;
  height: 6px;
  background: #28a745;
  border-radius: 50%;
  margin-top: 2px;
}

.day-item.has-work .day-date {
  color: #28a745;
  font-weight: 700;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-dist {
    margin-top: 12px;
    padding: 16px;
  }

  .dist-header h3 {
    font-size: 14px;
  }

  .week-grid {
    grid-template-columns: repeat(1fr);
    gap: 12px;
  }

  .week-item {
    padding: 12px;
    min-height: 100px;
    gap: 8px;
  }

  .item-actions {
    top: 4px;
    right: 4px;
    gap: 6px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .week-number {
    font-size: 12px;
    padding: 3px 6px;
  }

  .date-range {
    font-size: 12px;
  }

  .item-stats {
    font-size: 11px;
    padding: 4px 6px;
    gap: 2px;
  }

  .hours,
  .remaining {
    font-size: 12px;
  }

  .item-days {
    gap: 2px;
  }

  .day-name {
    font-size: 9px;
  }

  .day-date {
    font-size: 10px;
  }

  .work-dot {
    width: 4px;
    height: 4px;
  }
}
</style>