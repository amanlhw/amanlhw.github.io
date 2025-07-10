<template>
  <PageLayout title="叮咚的工具箱" :hideBackButton="true">
    <div class="home-content">
      <div class="welcome-section">
        <h2>欢迎使用叮咚的工具箱</h2>
        <p>这里提供了一些实用的开发工具，希望能帮助您提高工作效率</p>
      </div>

      <div class="tools-grid">
        <router-link :to="getToolLink(item)" class="tool-card" v-for="item in toolList" :key="item.id">
          <div class="tool-icon">
            <i :class="item.icon"></i>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">
              {{ item.title }}
              <i v-if="item.type === 'external'" class="el-icon-link external-indicator"></i>
            </h3>
            <p class="tool-description">{{ item.description }}</p>
          </div>
        </router-link>
      </div>

      <div class="footer-section">
        <p>Copyright © 2025 叮咚的工具箱</p>
      </div>
    </div>
  </PageLayout>
</template>

<script>
import PageLayout from '@/components/PageLayout.vue';

export default {
  name: 'Home',
  components: {
    PageLayout
  },
  data() {
    return {
      toolList: [
        {
          id: 1,
          type: 'internal',
          route: '/sql-format',
          title: 'SQL字段转换',
          description: '将SQL字段定义转换为TypeScript接口',
          icon: 'el-icon-document-copy'
        },
        {
          id: 2,
          type: 'internal',
          route: '/plate-generator',
          title: '车牌号生成器',
          description: '快速生成车牌号图片',
          icon: 'el-icon-truck'
        },
        {
          id: 3,
          type: 'internal',
          route: '/work-time-schedule',
          title: '工时排布统计',
          description: '记录和管理每周工时安排',
          icon: 'el-icon-time'
        },
        {
          id: 4,
          type: 'external',
          url: 'https://sunzsh.github.io/json/',
          title: 'JSON格式化',
          description: '在线JSON格式化工具',
          icon: 'el-icon-document'
        },
        {
          id: 5,
          type: 'external',
          url: 'https://tool.lu',
          title: '在线工具集',
          description: '程序员在线工具集合',
          icon: 'el-icon-folder'
        },
        {
          id: 6,
          type: 'external',
          url: 'https://www.bejson.com',
          title: 'BeJSON工具',
          description: 'JSON在线解析及格式化验证',
          icon: 'el-icon-edit-outline'
        },
        {
          id: 7,
          type: 'external',
          url: 'https://www.json.cn',
          title: 'JSON格式化',
          description: '在线JSON格式化工具',
          icon: 'el-icon-document'
        }
      ],
    };
  },
  methods: {
    getToolLink(item) {
      if (item.type === 'external') {
        // 构建外部网站嵌入链接
        const url = encodeURIComponent(item.url);
        const title = encodeURIComponent(item.title);
        const desc = encodeURIComponent(item.description || '');
        return `/web-embed/${ url }/${ title }/${ desc }`;
      }
      return item.route;
    }
  }
};
</script>

<style scoped>
.home-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 48px;
  padding: 40px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(179, 198, 224, 0.2);
}

.welcome-section h2 {
  color: #1976d2;
  font-size: 32px;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.welcome-section p {
  color: #666;
  font-size: 16px;
  margin: 0;
  line-height: 1.6;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.tool-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 32px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 24px rgba(179, 198, 224, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 2px solid transparent;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(179, 198, 224, 0.3);
  border-color: #1976d2;
}

.tool-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-icon i {
  font-size: 28px;
  color: #fff;
}

.tool-info {
  flex: 1;
}

.tool-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.external-indicator {
  font-size: 14px;
  color: #1976d2;
  opacity: 0.8;
}

.tool-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.footer-section {
  text-align: center;
  padding: 24px 0;
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-content {
    padding: 0 16px;
  }

  .welcome-section {
    padding: 32px 16px;
    margin-bottom: 32px;
  }

  .welcome-section h2 {
    font-size: 28px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 32px;
  }

  .tool-card {
    padding: 24px 20px;
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .tool-icon {
    width: 50px;
    height: 50px;
  }

  .tool-icon i {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .welcome-section h2 {
    font-size: 24px;
  }

  .welcome-section p {
    font-size: 14px;
  }

  .tool-card {
    padding: 20px 16px;
  }

  .tool-title {
    justify-content: center;
    font-size: 18px;
  }
}
</style>