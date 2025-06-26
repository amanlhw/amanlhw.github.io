<template>
  <div class="page-layout">
    <!-- 顶部区域 -->
    <div class="header">
      <div class="header-content">
        <h1 class="page-title">{{ title }}</h1>
        <router-link to="/" class="back-button" v-if="!hideBackButton">
          <el-button type="text">
            <i class="el-icon-arrow-left"></i>
            返回首页
          </el-button>
        </router-link>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageLayout',
  props: {
    title: {
      type: String,
      required: true
    },
    hideBackButton: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
  display: flex;
  flex-direction: column;
}

.header {
  min-height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  color: #1976d2;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.back-button {
  text-decoration: none;
}

.back-button .el-button {
  padding: 0;
}

.content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .page-title {
    font-size: 20px;
    text-align: center;
  }

  .back-button {
    align-self: center;
  }

  .content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 10px 12px;
  }

  .page-title {
    font-size: 18px;
  }

  .content {
    padding: 12px;
  }
}
</style>