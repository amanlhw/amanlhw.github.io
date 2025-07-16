<template>
  <PageLayout title="工时排布统计" :fullWidth="true">
    <div class="work-time-content">
      <!-- 周导航组件 -->
      <WeekNavigation :currentWeekNumber="currentWeekNumber" :isCurrentWeek="isCurrentWeek" :weekRange="weekRange"
        :weekTotalHours="weekTotalHours" :weekTargetHours="weekTargetHours" :weekRemainingHours="weekRemainingHours"
        @previous-week="previousWeek" @next-week="nextWeek" @go-to-current-week="goToCurrentWeek" />

      <!-- 周网格组件 -->
      <WeekGrid :weekDays="weekDays" :isToday="isToday" :isWeekend="isWeekend" :isWorkdayOnWeekend="isWorkdayOnWeekend"
        :getHolidayName="getHolidayName" :getTotalHours="getTotalHours" :getRemainingHours="getRemainingHours"
        @add-work-item="showAddDialog" @edit-work-item="editWorkItem" @delete-work-item="deleteWorkItem"
        @open-link="openLink" />

      <!-- 添加/编辑事项对话框 -->
      <WorkItemDialog ref="workItemDialog" :visible="dialogVisible" :isEditing="isEditing" :newItem="newItem"
        :rules="rules" @close="handleDialogClose" @save="isEditing ? updateWorkItem() : addWorkItem()"
        @set-quick-hours="setQuickHours" @parse-link="parseLink" />

      <!-- 数据分布图 -->
      <DataDistribution v-if="getDataStats().totalWeeks > 0" :distributionExpanded="distributionExpanded"
        :dataStats="getDataStats()" :currentWeekKey="getWeekKey()" :getWeekDateRange="getWeekDateRange"
        :getWeekTotalHours="getWeekTotalHours" :getWeekRemainingHours="getWeekRemainingHours"
        :getWeekTargetHours="getWeekTargetHours" :getWeekDays="getWeekDays" :hasWorkOnDay="hasWorkOnDay"
        :formatDayDate="formatDayDate" :getWeekNumber="getWeekNumber" @toggle-distribution="toggleDistribution"
        @clear-all-data="clearAllData" @go-to-week="goToWeek" @delete-week="deleteWeek" />
    </div>
  </PageLayout>
</template>

<script>
import PageLayout from '@/components/PageLayout.vue';
import WeekNavigation from '@/components/workTime/WeekNavigation.vue';
import WeekGrid from '@/components/workTime/WeekGrid.vue';
import WorkItemDialog from '@/components/workTime/WorkItemDialog.vue';
import DataDistribution from '@/components/workTime/DataDistribution.vue';
import { dateUtils } from '@/utils/dateUtils';
import { workTimeUtils } from '@/utils/workTimeUtils';
import { storageUtils } from '@/utils/storageUtils';
import { holidayUtils } from '@/utils/holidayUtils';

export default {
  name: 'WorkTimeSchedule',
  components: {
    PageLayout,
    WeekNavigation,
    WeekGrid,
    WorkItemDialog,
    DataDistribution
  },
  data() {
    return {
      weekDays: [],
      currentWeekStart: null,
      isCurrentWeek: false,
      dialogVisible: false,
      isEditing: false,
      currentDay: '',
      currentEditIndex: -1,
      distributionExpanded: false,
      newItem: {
        title: '',
        hours: 1,
        link: ''
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
      return dateUtils.getWeekRange(this.weekDays);
    },
    currentWeekNumber() {
      return dateUtils.getWeekNumber(this.currentWeekStart);
    },
    weekTotalHours() {
      return workTimeUtils.calculateWeekTotalHours(this.weekDays);
    },
    weekTargetHours() {
      return workTimeUtils.calculateWeekTargetHours(this.weekDays, this.isWeekend, this.isWorkdayOnWeekend);
    },
    weekRemainingHours() {
      return workTimeUtils.calculateWeekRemainingHours(this.weekTotalHours, this.weekTargetHours);
    }
  },
  mounted() {
    this.initCurrentWeek();
    this.loadData();
    this.cleanOldData();
  },
  methods: {
    // 初始化相关方法
    initCurrentWeek() {
      this.currentWeekStart = dateUtils.getCurrentWeekStart();
      this.generateWeekDays(this.currentWeekStart);
      this.updateIsCurrentWeek();
    },

    updateIsCurrentWeek() {
      this.isCurrentWeek = dateUtils.isCurrentWeek(this.currentWeekStart);
    },

    generateWeekDays(weekStart) {
      this.weekDays = dateUtils.generateWeekDays(weekStart);
    },

    // 周导航相关方法
    previousWeek() {
      this.navigateWeek(-7);
    },

    nextWeek() {
      this.navigateWeek(7);
    },

    navigateWeek(days) {
      const newWeekStart = new Date(this.currentWeekStart);
      newWeekStart.setDate(this.currentWeekStart.getDate() + days);
      this.currentWeekStart = newWeekStart;
      this.generateWeekDays(newWeekStart);
      this.loadData();
      this.updateIsCurrentWeek();
    },

    goToCurrentWeek() {
      this.initCurrentWeek();
      this.loadData();
    },

    goToWeek(weekKey) {
      const date = new Date(weekKey);
      this.currentWeekStart = date;
      this.generateWeekDays(date);
      this.loadData();
      this.updateIsCurrentWeek();
    },

    // 工时事项相关方法
    showAddDialog(date) {
      this.currentDay = date;
      this.isEditing = false;
      this.currentEditIndex = -1;
      this.dialogVisible = true;
      this.resetNewItem();
      this.$nextTick(() => {
        this.$refs.workItemDialog && this.$refs.workItemDialog.$refs.itemForm && this.$refs.workItemDialog.$refs.itemForm.clearValidate();
        this.$refs.workItemDialog && this.$refs.workItemDialog.$refs.titleInput && this.$refs.workItemDialog.$refs.titleInput.focus();
      });
    },

    editWorkItem(date, index, item) {
      this.currentDay = date;
      this.isEditing = true;
      this.currentEditIndex = index;
      this.dialogVisible = true;
      this.newItem = {
        title: item.title,
        hours: item.hours,
        link: item.link || ''
      };
      this.$nextTick(() => {
        this.$refs.workItemDialog && this.$refs.workItemDialog.$refs.itemForm && this.$refs.workItemDialog.$refs.itemForm.clearValidate();
        this.$refs.workItemDialog && this.$refs.workItemDialog.$refs.hoursInput && this.$refs.workItemDialog.$refs.hoursInput.focus();
      });
    },

    handleDialogClose() {
      this.dialogVisible = false;
      this.isEditing = false;
      this.currentDay = '';
      this.currentEditIndex = -1;
      this.resetNewItem();
    },

    resetNewItem() {
      this.newItem = {
        title: '',
        hours: 1,
        link: ''
      };
    },

    addWorkItem() {
      this.$refs.workItemDialog.$refs.itemForm.validate((valid) => {
        if (valid) {
          // 校验云效链接
          if (!workTimeUtils.isValidYunxiaoLink(this.newItem.link)) {
            this.newItem.link = '';
          }
          const dayIndex = this.weekDays.findIndex(day => day.date === this.currentDay);
          if (dayIndex !== -1) {
            // 使用 Vue.set 确保响应式更新
            this.$set(this.weekDays[dayIndex], 'items', [...this.weekDays[dayIndex].items, { ...this.newItem }]);
            this.saveData();
            this.handleDialogClose();
            this.$message.success('添加成功');
          }
        }
      });
    },

    updateWorkItem() {
      this.$refs.workItemDialog.$refs.itemForm.validate((valid) => {
        if (valid) {
          // 校验云效链接
          if (!workTimeUtils.isValidYunxiaoLink(this.newItem.link)) {
            this.newItem.link = '';
          }
          const dayIndex = this.weekDays.findIndex(day => day.date === this.currentDay);
          if (dayIndex !== -1 && this.currentEditIndex !== -1) {
            // 使用 Vue.set 确保响应式更新
            this.$set(this.weekDays[dayIndex].items, this.currentEditIndex, { ...this.newItem });
            this.saveData();
            this.handleDialogClose();
            this.$message.success('更新成功');
          }
        }
      });
    },

    deleteWorkItem(date, index) {
      const dayIndex = this.weekDays.findIndex(day => day.date === date);
      if (dayIndex !== -1) {
        // 使用 Vue.set 确保响应式更新
        const newItems = [...this.weekDays[dayIndex].items];
        newItems.splice(index, 1);
        this.$set(this.weekDays[dayIndex], 'items', newItems);
        this.saveData();
        this.$message.success('删除成功');
      }
    },

    // 工具方法
    setQuickHours(hours) {
      this.newItem.hours = hours;
    },

    openLink(link) {
      if (link) {
        window.open(link, '_blank');
      }
    },

    parseLink() {
      if (!this.newItem.link) {
        this.$message.warning('请先输入云效链接');
        return;
      }

      try {
        const title = workTimeUtils.parseYunxiaoLink(this.newItem.link);
        if (title) {
          this.newItem.title = title;
          this.$message.success('已解析链接标题：' + title);
          this.$nextTick(() => {
            this.$refs.workItemDialog && this.$refs.workItemDialog.$refs.itemForm && this.$refs.workItemDialog.$refs.itemForm.validateField('title');
          });
        } else {
          this.$message.warning('无法解析链接，请手动输入事项名称');
        }
      } catch (error) {
        this.$message.error('解析链接失败：' + error.message);
      }
    },

    // 数据存储相关方法
    saveData() {
      const weekKey = this.getWeekKey();
      if (!weekKey) return;

      const allData = storageUtils.getAllSavedData();
      const hasData = this.weekDays.some(day => day.items && day.items.length > 0);

      if (hasData) {
        allData[weekKey] = {
          weekKey,
          weekDays: this.weekDays
        };
      } else {
        delete allData[weekKey];
      }

      storageUtils.saveAllData(allData);
      this.cleanOldData();
    },

    loadData() {
      const allData = storageUtils.getAllSavedData();
      const currentWeekKey = this.getWeekKey();

      if (currentWeekKey && allData[currentWeekKey]) {
        // 确保响应式更新
        this.weekDays = [...allData[currentWeekKey].weekDays];
      }
    },

    cleanOldData() {
      storageUtils.cleanOldData();
    },

    getWeekKey() {
      return dateUtils.formatDate(this.currentWeekStart);
    },

    getDataStats() {
      const allData = storageUtils.getAllSavedData();
      const weekKeys = Object.keys(allData);
      return {
        totalWeeks: weekKeys.length,
        savedWeeks: weekKeys.sort()
      };
    },

    // 数据分布图相关方法
    toggleDistribution() {
      this.distributionExpanded = !this.distributionExpanded;
    },

    deleteWeek(weekKey) {
      this.$confirm('确定要删除这个周的数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const allData = storageUtils.getAllSavedData();
        delete allData[weekKey];
        storageUtils.saveAllData(allData);
        this.$message.success('删除成功');
      }).catch(() => {
        // 用户取消删除
      });
    },

    clearAllData() {
      this.$confirm('确定要删除所有已保存的周数据吗？此操作不可恢复！', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('workTimeSchedule');
        this.$message.success('所有数据已清理');
        this.loadData();
      }).catch(() => {
        // 用户取消删除
      });
    },

    // 数据分布图工具方法
    getWeekNumber(weekKey) {
      const date = new Date(weekKey);
      return dateUtils.getWeekNumber(date);
    },

    getWeekDateRange(weekKey) {
      return workTimeUtils.getWeekDateRange(weekKey);
    },

    getWeekTotalHours(weekKey) {
      return workTimeUtils.getWeekTotalHours(weekKey);
    },

    getWeekRemainingHours(weekKey) {
      const totalHours = parseFloat(this.getWeekTotalHours(weekKey));
      const targetHours = this.getWeekTargetHours(weekKey);
      const remaining = Math.max(0, targetHours - totalHours);
      return remaining.toFixed(1);
    },

    getWeekTargetHours(weekKey) {
      return workTimeUtils.getWeekTargetHours(weekKey, this.isWeekend, this.isWorkdayOnWeekend);
    },

    getWeekDays(weekKey) {
      return workTimeUtils.getWeekDays(weekKey);
    },

    hasWorkOnDay(weekKey, date) {
      return workTimeUtils.hasWorkOnDay(weekKey, date);
    },

    formatDayDate(date) {
      return dateUtils.formatDayDate(date);
    },

    // 日期和节假日相关方法
    isToday(date) {
      return dateUtils.isToday(date);
    },

    isWeekend(dayName, date) {
      return holidayUtils.isWeekend(date);
    },

    isWorkdayOnWeekend(dayName, date) {
      return holidayUtils.isWorkdayOnWeekend(dayName, date);
    },

    getHolidayName(date) {
      return holidayUtils.getHolidayName(date);
    },

    getTotalHours(items) {
      return workTimeUtils.getTotalHours(items);
    },

    getRemainingHours(items, dayName, date) {
      return workTimeUtils.getRemainingHours(items, dayName, date, this.isWeekend, this.isWorkdayOnWeekend);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .work-time-content {
    height: auto;
    min-height: 100vh;
  }
}
</style>