<template>
  <div class="home">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <el-container class="main-container">
      <!-- 头部区域 -->
      <el-header class="header-section">
        <div class="header-content">
          <div class="logo-section">
            <i class="el-icon-tools logo-icon"></i>
            <h1 class="main-title">叮咚的工具箱</h1>
          </div>
          <p class="subtitle">让开发更高效，让工作更轻松</p>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-section">
        <div class="tools-container">
          <el-row :gutter="30" justify="center">
            <el-col 
              :xs="24" 
              :sm="12" 
              :md="8" 
              :lg="6" 
              v-for="item in toolList" 
              :key="item.id"
              class="tool-col"
            >
              <router-link :to="item.route" class="tool-link">
                <el-card 
                  class="tool-card" 
                  shadow="hover"
                  :body-style="{ padding: '0px' }"
                >
                  <div class="card-content">
                    <div class="icon-wrapper">
                      <i :class="item.icon" class="tool-icon"></i>
                    </div>
                    <div class="tool-info">
                      <h3 class="tool-title">{{ item.title }}</h3>
                      <p class="tool-description">{{ item.description }}</p>
                    </div>
                    <div class="card-overlay">
                      <el-button type="primary" round>
                        <i class="el-icon-arrow-right"></i>
                        立即使用
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </router-link>
            </el-col>
          </el-row>
        </div>

        <!-- 底部信息 -->
        <div class="footer-info">
          <el-divider content-position="center">
            <span class="divider-text">
              <i class="el-icon-star-on"></i>
              更多工具开发中
              <i class="el-icon-star-on"></i>
            </span>
          </el-divider>
          <p class="footer-text">持续更新中，敬请期待...</p>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      toolList: [
        { 
          id: 1, 
          route: '/sql-format', 
          title: 'SQL格式化', 
          description: '将SQL字段定义转换为TypeScript接口',
          icon: 'el-icon-document-copy'
        },
        { 
          id: 2, 
          route: '/plate-generator', 
          title: '车牌号生成', 
          description: '快速生成随机车牌号码',
          icon: 'el-icon-truck'
        }
      ],
    };
  }
};
</script>

<style lang="less" scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  .background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      animation: float 6s ease-in-out infinite;
    }
    .circle-1 {
      width: 200px;
      height: 200px;
      top: 8%;
      left: 8%;
      animation-delay: 0s;
    }
    .circle-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 10%;
      animation-delay: 2s;
    }
    .circle-3 {
      width: 100px;
      height: 100px;
      bottom: 18%;
      left: 18%;
      animation-delay: 4s;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
  }

  .main-container {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    padding-top: 40px;
    padding-bottom: 40px;
    box-sizing: border-box;
  }

  .header-section {
    background: transparent;
    padding: 40px 0 0 0;
    text-align: center;
    height:auto !important;
    .header-content {
      max-width: 800px;
      margin: 0 auto;
      .logo-section {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        .logo-icon {
          font-size: 48px;
          color: #fff;
          margin-right: 20px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        .main-title {
          color: #fff;
          font-size: 48px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          letter-spacing: 2px;
        }
      }
      .subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 18px;
        margin: 0;
        font-weight: 300;
        letter-spacing: 1px;
      }
    }
  }

  .main-section {
    padding: 40px 20px 0 20px;
    background: transparent;
    .tools-container {
      max-width: 1200px;
      margin: 0 auto;
      .tool-col {
        margin-bottom: 30px;
      }
      .tool-link {
        text-decoration: none;
        color: inherit;
        display: block;
        &:hover {
          text-decoration: none;
        }
        .tool-card {
          height: 280px;
          border-radius: 16px;
          border: none;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          &:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            .card-overlay {
              opacity: 1;
            }
          }
          .card-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px 20px;
            position: relative;
            .icon-wrapper {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
              box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
              .tool-icon {
                font-size: 36px;
                color: #fff;
              }
            }
            .tool-info {
              text-align: center;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              .tool-title {
                color: #333;
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 10px 0;
                letter-spacing: 1px;
              }
              .tool-description {
                color: #666;
                font-size: 14px;
                margin: 0;
                line-height: 1.5;
                max-width: 200px;
              }
            }
            .card-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(102, 126, 234, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: all 0.3s ease;
              border-radius: 16px;
            }
          }
        }
      }
    }
    .footer-info {
      margin-top: 60px;
      text-align: center;
      .divider-text {
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
        font-weight: 500;
        i {
          margin: 0 10px;
          color: #ffd700;
        }
      }
      .footer-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        margin: 20px 0 0 0;
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .main-title {
      font-size: 36px;
    }
    .logo-icon {
      font-size: 36px;
      margin-right: 15px;
    }
    .subtitle {
      font-size: 16px;
    }
    .tool-card {
      height: 240px;
    }
    .icon-wrapper {
      width: 60px;
      height: 60px;
    }
    .tool-icon {
      font-size: 28px;
    }
    .tool-title {
      font-size: 20px;
    }
  }
  @media (max-width: 480px) {
    .header-section {
      padding: 30px 0;
    }
    .main-title {
      font-size: 28px;
    }
    .logo-icon {
      font-size: 28px;
      margin-right: 10px;
    }
    .subtitle {
      font-size: 14px;
    }
    .main-section {
      padding: 20px 10px 0 10px;
    }
  }
}
</style> 