<template>
  <div class="week-nav">
    <div class="nav-btn" @click="$emit('previous-week')">
      <el-button type="text" icon="el-icon-arrow-left">上一周</el-button>
    </div>
    <div class="week-display">
      <div class="week-title" @click="$emit('go-to-current-week')">
        <span class="title">第{{ currentWeekNumber }}周</span>
        <i v-if="!isCurrentWeek" class="el-icon-refresh current-icon" title="回到本周"></i>
      </div>
      <div class="week-stats">
        <span class="date-range">{{ weekRange }}</span>
        <div class="hours-summary">
          <span class="total">{{ weekTotalHours }}h</span>
          <span class="separator">/</span>
          <span class="target">{{ weekTargetHours }}h</span>
          <span v-if="parseFloat(weekRemainingHours) > 0" class="remaining">(还差{{ weekRemainingHours }}h)</span>
          <el-button type="primary" size="mini" icon="el-icon-document" class="report-btn-inline"
            @click="$emit('generate-week-report')">生成本周周报</el-button>
        </div>
      </div>
    </div>
    <div class="nav-btn" @click="$emit('next-week')">
      <el-button type="text" icon="el-icon-arrow-right">下一周</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeekNavigation',
  props: {
    currentWeekNumber: {
      type: [String, Number],
      default: ''
    },
    isCurrentWeek: {
      type: Boolean,
      default: false
    },
    weekRange: {
      type: String,
      default: ''
    },
    weekTotalHours: {
      type: [String, Number],
      default: 0
    },
    weekTargetHours: {
      type: [String, Number],
      default: 0
    },
    weekRemainingHours: {
      type: [String, Number],
      default: 0
    }
  },
  emits: ['previous-week', 'next-week', 'go-to-current-week', 'generate-week-report']
};
</script>

<style scoped>
.week-nav {
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
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.week-title {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-direction: row;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
}

.current-icon {
  font-size: 16px;
  color: #1976d2;
  transition: all 0.3s ease;
}

.current-icon:hover {
  color: #42a5f5;
  transform: scale(1.1);
}

.week-stats {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.date-range {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.hours-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.total {
  color: #999;
  font-weight: 400;
  font-size: 14px;
}

.separator {
  color: #ccc;
  font-weight: 400;
}

.target {
  color: #999;
  font-weight: 400;
  font-size: 14px;
}

.remaining {
  color: #ff0059;
  font-size: 13px;
  font-weight: 600;
  margin-left: 4px;
  background: #fff5f5;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #ffebee;
}

.report-btn-inline {
  margin-left: 12px;
  padding: 4px 12px;
  font-size: 12px;
}

.nav-btn {
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.nav-btn:hover {
  background-color: #f5f7fa;
}

.nav-btn .el-button {
  font-size: 14px;
  padding: 8px 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .week-nav {
    padding: 12px 16px;
    gap: 12px;
  }

  .week-display {
    flex-direction: column;
    gap: 4px;
  }

  .week-stats {
    flex-direction: column;
    gap: 2px;
  }

  .hours-summary {
    font-size: 12px;
    padding: 3px 6px;
    gap: 4px;
  }

  .total,
  .target {
    font-size: 12px;
  }

  .remaining {
    font-size: 12px;
    padding: 1px 4px;
    margin-left: 2px;
  }

  .nav-btn {
    padding: 0;
    transition: none;
  }

  .nav-btn:hover {
    background-color: unset;
  }

  .nav-btn .el-button {
    font-size: 14px;
    padding: 0;
  }

  .hours-summary {
    flex-wrap: wrap;
    gap: 8px;
  }

  .report-btn-inline {
    margin-left: 0;
    margin-top: 4px;
    width: 100%;
  }
}
</style>