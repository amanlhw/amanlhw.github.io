<template>
  <div class="plate-generator">
    <div class="container">
      <h2>车牌号图片生成器</h2>
      <div class="input-row">
        <label for="plateInput">车牌号：</label>
        <input 
          type="text" 
          id="plateInput" 
          v-model="plateNumber"
          maxlength="8" 
          placeholder="如：粤B12345" 
        />
      </div>
      <el-button type="primary" @click="generatePlate">生成图片</el-button>
      <canvas ref="plateCanvas" width="320" height="80"></canvas>
      <div class="action-row">
        <el-button type="success" @click="downloadPlate">下载图片</el-button>
        <router-link to="/">
          <el-button>返回首页</el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlateGenerator',
  data() {
    return {
      plateNumber: ''
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

      const showPlate = this.plateNumber || '京A88888';
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
      link.download = `车牌号_${this.plateNumber || '京A88888'}.png`;
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

.plate-generator {
  background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  max-width: 420px;
  width: 100%;
  padding: 32px 28px 28px 28px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px #b3c6e0a0;
}

.container h2 {
  text-align: center;
  color: #1976d2;
  margin-bottom: 28px;
  letter-spacing: 2px;
}

.input-row {
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.input-row label {
  display: inline-block;
  width: 80px;
  font-size: 16px;
  color: #333;
  text-align: right;
}

.input-row input {
  width: 200px;
  padding: 8px 12px;
  border: 1.5px solid #b3c6e0;
  border-radius: 6px;
  font-size: 18px;
  transition: border 0.2s;
}

.input-row input:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}

#plateCanvas {
  display: block;
  margin: 32px auto 0;
  box-shadow: 0 2px 8px #b3c6e055;
}

.action-row {
  margin-top: 18px;
  text-align: center;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .container {
    padding: 20px 15px;
  }
  
  .input-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-row label {
    text-align: left;
    width: auto;
  }
  
  .input-row input {
    width: 100%;
  }
  
  .action-row {
    flex-direction: column;
  }
}
</style> 