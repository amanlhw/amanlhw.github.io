<template>
  <el-dialog :title="isEditing ? '编辑工时事项' : '添加工时事项'" :visible.sync="dialogVisible" width="600px"
    :before-close="handleClose">
    <el-form :model="newItem" :rules="rules" ref="itemForm" label-width="80px">
      <el-form-item label="事项名称" prop="title">
        <el-input ref="titleInput" v-model="newItem.title" placeholder="请输入事项名称" maxlength="50" type="textarea"
          autosize></el-input>
      </el-form-item>
      <el-form-item label="工时" prop="hours">
        <el-input-number ref="hoursInput" v-model="newItem.hours" :min="0.1" :max="24" :step="1" :precision="1"
          placeholder="请输入工时"></el-input-number>
        <span class="unit">小时</span>
        <div class="quick-options">
          <el-button size="mini" type="text" @click="$emit('set-quick-hours', 2)">2小时</el-button>
          <el-button size="mini" type="text" @click="$emit('set-quick-hours', 4)">4小时</el-button>
          <el-button size="mini" type="text" @click="$emit('set-quick-hours', 8)">8小时</el-button>
        </div>
      </el-form-item>
      <el-form-item label="云效链接">
        <div class="link-container">
          <el-input v-model="newItem.link" placeholder="请输入云效任务链接（可选）" clearable></el-input>
          <el-button @click="$emit('parse-link')" :disabled="!newItem.link" type="primary" size="small">解析</el-button>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="$emit('save')">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'WorkItemDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    newItem: {
      type: Object,
      default: () => ({
        title: '',
        hours: 1,
        link: ''
      })
    },
    rules: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'save', 'set-quick-hours', 'parse-link'],
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit('close');
        }
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.unit {
  margin-left: 8px;
  color: #666;
}

.quick-options {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.quick-options .el-button {
  padding: 4px 8px;
  font-size: 12px;
  color: #409EFF;
  border: 1px solid #d9ecff;
  background-color: #f0f9ff;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.quick-options .el-button:hover {
  color: #66b1ff;
  background-color: #ecf5ff;
  border-color: #b3d8ff;
}

.dialog-footer {
  text-align: right;
}

/* 链接输入框容器样式 */
.link-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.link-container .el-input {
  flex: 1;
}

.link-container .el-button {
  flex-shrink: 0;
  white-space: nowrap;
  height: 38px;
  padding: 0 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
  }

  :deep(.el-dialog__body .el-form .el-form-item) {
    display: flex;
    flex-direction: column;
  }

  :deep(.el-dialog__body .el-form .el-form-item .el-form-item__label) {
    text-align: left;
  }

  :deep(.el-dialog__body .el-form .el-form-item .el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>