<template>
  <PageLayout title="车牌号图片生成器">
    <div class="plate-generator-content">
      <el-card class="input-section" shadow="hover">
        <div slot="header" class="card-header">
          <i class="el-icon-edit"></i>
          <span>输入车牌号</span>
        </div>

        <el-form :model="formData" label-width="100px" size="medium">
          <el-form-item label="车牌号码">
            <el-input v-model="plateNumber" placeholder="请输入车牌号，如：京A12345" clearable
              @keyup.enter.native="generatePlate"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="medium" icon="el-icon-picture" @click="generatePlate"
              :disabled="!plateNumber.trim()">
              生成图片
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 预览区域 -->
      <el-card class="preview-section" shadow="hover">
        <div slot="header" class="card-header">
          <i class="el-icon-view"></i>
          <span>车牌预览</span>
        </div>

        <div class="canvas-container">
          <canvas ref="plateCanvas" width="320" height="80"></canvas>
          <el-button type="success" size="medium" icon="el-icon-download" @click="downloadPlate"
            :disabled="!plateNumber.trim()">
            下载PNG图片
          </el-button>
        </div>
      </el-card>
    </div>
  </PageLayout>
</template>

<script>
import PageLayout from '@/components/PageLayout.vue';

export default {
  name: 'PlateGenerator',
  components: {
    PageLayout
  },
  data() {
    return {
      plateNumber: '京A12345',
      formData: {
        plateNumber: ''
      }
    };
  },
  mounted() {
    this.generatePlate();
  },
  methods: {
    generatePlate() {
      const canvas = this.$refs.plateCanvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1976d2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;

      const radius = 10;
      const margin = 5;
      const x = margin;
      const y = margin;
      const width = canvas.width - margin * 2;
      const height = canvas.height - margin * 2;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(120, canvas.height / 2, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const showPlate = this.plateNumber || '京A12345';
      const province = showPlate.slice(0, 1);
      const letter = showPlate.slice(1, 2);
      const numbers = showPlate.slice(2);

      ctx.font = 'bold 36px "Arial Narrow", "Microsoft YaHei", "黑体", Arial, sans-serif';

      ctx.fillStyle = '#000000';
      ctx.fillText(province, 20 + 1.5, canvas.height / 2 + 4 + 1.5);
      ctx.fillStyle = '#E0E0E0';
      ctx.fillText(province, 20 - 0.5, canvas.height / 2 + 4 - 0.5);
      ctx.fillStyle = '#fff';
      ctx.fillText(province, 20, canvas.height / 2 + 4);

      ctx.font = 'bold 40px "Arial Narrow", "Microsoft YaHei", "黑体", Arial, sans-serif';

      ctx.fillStyle = '#000000';
      ctx.fillText(letter, 65 + 1.5, canvas.height / 2 + 4 + 1.5);
      ctx.fillStyle = '#E0E0E0';
      ctx.fillText(letter, 65 - 0.5, canvas.height / 2 + 4 - 0.5);
      ctx.fillStyle = '#fff';
      ctx.fillText(letter, 65, canvas.height / 2 + 4);

      let charX = 140;
      let charSpacing = 30;

      if (numbers.length === 5) {
        charSpacing = 30;
      } else if (numbers.length === 6) {
        charSpacing = 30;
      }

      for (let i = 0; i < numbers.length; i++) {
        ctx.fillStyle = '#000000';
        ctx.fillText(numbers[i], charX + 1.5, canvas.height / 2 + 4 + 1.5);
        ctx.fillStyle = '#E0E0E0';
        ctx.fillText(numbers[i], charX - 0.5, canvas.height / 2 + 4 - 0.5);
        ctx.fillStyle = '#fff';
        ctx.fillText(numbers[i], charX, canvas.height / 2 + 4);
        charX += charSpacing;
      }
    },

    downloadPlate() {
      const canvas = this.$refs.plateCanvas;
      const link = document.createElement('a');
      link.download = `车牌号_${ this.plateNumber || '京A88888' }.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  },
  watch: {
    plateNumber() {
      this.$nextTick(() => {
        this.generatePlate();
      });
    }
  }
};
</script>

<style scoped>
.plate-generator-content {
  margin: 0 auto;
  padding: 20px;
}

.input-section,
.preview-section,
.action-section {
  margin-bottom: 20px;
  border-radius: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.card-header i {
  color: #1976d2;
}

.canvas-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

#plateCanvas {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plate-generator-content {
    padding: 16px;
    margin: 0 8px;
  }
}

@media (max-width: 480px) {
  .plate-generator-content {
    padding: 12px;
  }
}
</style>