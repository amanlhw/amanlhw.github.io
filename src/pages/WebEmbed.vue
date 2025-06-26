<template>
  <PageLayout :title="pageTitle" :showBackButton="true">
    <div class="web-embed-container">
      <div class="embed-header">
        <div class="header-content">
          <h2>{{ pageTitle }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>
        <div class="header-actions">
          <a :href="url" target="_blank" class="external-link">
            <i class="el-icon-link"></i>
            在新窗口中打开
          </a>
          <a @click="openFullscreen" class="external-link">
            <i class="el-icon-full-screen"></i>
            放大网页
          </a>
        </div>
      </div>

      <div class="iframe-container" :class="{ 'fullscreen-mode': showFullscreen }">
        <iframe :src="url" :title="pageTitle" frameborder="0" allowfullscreen class="embedded-iframe"
          :class="{ 'fullscreen-iframe': showFullscreen }"></iframe>
        <button v-if="showFullscreen" @click="closeFullscreen" class="floating-close-btn">
          <i class="el-icon-close"></i>
        </button>
      </div>
    </div>
  </PageLayout>
</template>

<script>
import PageLayout from '@/components/PageLayout.vue';

export default {
  name: 'WebEmbed',
  components: {
    PageLayout
  },
  data() {
    return {
      url: '',
      pageTitle: '',
      description: '',
      showFullscreen: false
    };
  },
  created() {
    // 从路由参数获取配置信息
    const { url, title, desc } = this.$route.params;
    this.url = decodeURIComponent(url || '');
    this.pageTitle = decodeURIComponent(title || '外部网站');
    this.description = decodeURIComponent(desc || '');
  },
  mounted() {
    // 验证URL格式
    if (!this.url || !this.isValidUrl(this.url)) {
      this.$message.error('无效的URL地址');
      this.$router.push('/');
      return;
    }
  },
  beforeDestroy() {
    document.body.classList.remove('fullscreen-active');
    document.documentElement.classList.remove('fullscreen-active');
  },
  methods: {
    isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    },
    openFullscreen() {
      this.showFullscreen = true;
      document.body.classList.add('fullscreen-active');
      document.documentElement.classList.add('fullscreen-active');
    },
    closeFullscreen() {
      this.showFullscreen = false;
      // 用 requestAnimationFrame 延迟一帧再移除，确保过渡完成
      requestAnimationFrame(() => {
        document.body.classList.remove('fullscreen-active');
        document.documentElement.classList.remove('fullscreen-active');
      });
    }
  }
};
</script>

<style scoped>
.web-embed-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.embed-header {
  text-align: left;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(179, 198, 224, 0.15);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-content {
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 8px;
  margin: 0;
  padding: 0;
}

.embed-header h2 {
  color: #1976d2;
  font-size: 24px;
  margin: 0;
  font-weight: 600;
}

.embed-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.iframe-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(179, 198, 224, 0.2);
  margin-bottom: 24px;
  position: relative;
  will-change: transform, opacity;
}

.iframe-container.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  transform: scale(1);
  opacity: 1;
}

/* 防止全屏模式下页面出现滚动条 */
.web-embed-container.fullscreen-active {
  overflow: hidden;
}

/* 防止body在全屏模式下出现滚动条 */
html.fullscreen-active,
body.fullscreen-active {
  overflow: hidden !important;
  position: fixed !important;
  width: 100vw !important;
  height: 100vh !important;
}

.embedded-iframe {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  border: none;
  display: block;
}

.embedded-iframe.fullscreen-iframe {
  height: 100vh;
  min-height: 100vh;
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1976d2;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.external-link:hover {
  background: rgba(25, 118, 210, 0.1);
  color: #1565c0;
}

.external-link i {
  font-size: 16px;
}

.floating-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 1000;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: slideInRight 0.4s ease-out 0.1s both;
}

.floating-close-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .web-embed-container {
    padding: 0 16px;
  }

  .embed-header {
    padding: 20px 16px;
    margin-bottom: 20px;
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .header-content {
    text-align: center;
  }

  .embed-header h2 {
    font-size: 20px;
  }

  .header-actions {
    gap: 12px;
  }

  .embedded-iframe {
    height: 60vh;
    min-height: 400px;
  }

  .floating-close-btn {
    top: 12px;
    right: 12px;
  }
}

@media (max-width: 480px) {
  .embed-header h2 {
    font-size: 18px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .embedded-iframe {
    height: 50vh;
    min-height: 300px;
  }

  .floating-close-btn {
    top: 10px;
    right: 10px;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(20px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>