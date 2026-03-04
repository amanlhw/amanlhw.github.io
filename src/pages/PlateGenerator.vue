<template>
  <PageLayout title="车牌号图片生成器">
    <div class="plate-generator-content">
      <el-card class="input-section" shadow="hover">
        <div slot="header" class="card-header">
          <i class="el-icon-edit"></i>
          <span>输入车牌号</span>
        </div>

        <el-form :model="formData" label-width="100px" size="medium">
          <el-form-item label="车牌类型">
            <el-radio-group v-model="plateType">
              <el-radio label="blue">蓝色白字</el-radio>
              <el-radio label="green">绿底黑字</el-radio>
              <el-radio label="black">黑底白字</el-radio>
              <el-radio label="yellow">黄底黑字</el-radio>
              <el-radio label="white">白底黑字</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="车牌号码">
            <el-input
              v-model="plateNumber"
              :placeholder="plateType === 'green' ? '8位新能源，如：京AD12345、京AF12345' : '7位车牌，如：京A12345、沪A0023领'"
              clearable
              maxlength="8"
              show-word-limit
              @keyup.enter.native="generatePlate"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="medium"
              icon="el-icon-picture"
              :disabled="!normalizedPlate"
              @click="generatePlate"
            >
              生成图片
            </el-button>
          </el-form-item>
        </el-form>

        <p class="hint">
          支持汉字：京津冀晋蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼渝川贵云藏陕甘青宁新港澳使领学警<br>
          支持字母数字：A-Z、0-9。普通牌 7 位（第二位与第三位之间为圆点）；<strong>绿底为新能源牌 8 位</strong>（如京AD/京AF+5位）
        </p>
      </el-card>

      <!-- 预览区域：GA36-2007 比例 scale=2 → 880×280 -->
      <el-card class="preview-section" shadow="hover">
        <div slot="header" class="card-header">
          <i class="el-icon-view"></i>
          <span>车牌预览</span>
        </div>

        <div class="canvas-container">
          <canvas
            ref="plateCanvas"
            :width="canvasWidth"
            :height="canvasHeight"
          />
          <el-button
            type="success"
            size="medium"
            icon="el-icon-download"
            :disabled="!normalizedPlate"
            @click="downloadPlate"
          >
            下载PNG图片
          </el-button>
        </div>
      </el-card>
    </div>
  </PageLayout>
</template>

<script>
import PageLayout from '@/components/PageLayout.vue';

// GA36-2007 小汽车号牌：440mm×140mm；GA36-2018 小型新能源：480mm×140mm
const SCALE = 2;
const SIGN_WIDTH = 440;
const SIGN_WIDTH_NE = 480; // 新能源牌更宽以容纳 8 位
const SIGN_HEIGHT = 140;
const CANVAS_HEIGHT = SIGN_HEIGHT * SCALE;

// 字符格：45×90，间距12，首字左边距15.5，第2与第3位间小圆点10×10
const SYMBOL_WIDTH = 45 * SCALE;
const SYMBOL_HEIGHT = 90 * SCALE;
const SYMBOL_GAP = 12 * SCALE;
const SYMBOL_LEFT = 15.5 * SCALE;
const DOT_SIZE = 10 * SCALE;
const SIGN_RADIUS = 10 * SCALE;
const SIGN_LOOP_MARGIN = 1.5 * SCALE;
const SIGN_BORDER_WIDTH = 3 * SCALE;
// 四角标记：宽 23(15+8) 高 8，圆角 4；左上/右上/右下/左下的 left/right/top/bottom
const MARK_W = (15 + 8) * SCALE;
const MARK_H = (2 * 4) * SCALE; // 2*mark_radius = 8
const MARK_R = 4 * SCALE;
const MARK_MARGIN_H = (100 - 4) * SCALE;
const MARK_MARGIN_V = (12.5 - 4) * SCALE;

/** 支持的汉字（与参考站一致） */
const PLATE_WORDS = '京津冀晋蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼渝川贵云藏陕甘青宁新港澳使领学警';
/** 支持的字母与数字 */
const PLATE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

/** 雪碧图单格尺寸（与参考站 CSS background-position 一致） */
const SPRITE_CELL_W = 90;
const SPRITE_CELL_H = 180;

/** 五种底色的样式 */
const PLATE_STYLES = {
  blue: { bg: '#001B7A', text: '#fff', border: '#fff', dot: '#fff' },
  green: { bg: '#008000', text: '#000', border: '#000', dot: '#000' }, // GA36-2018 小型新能源绿牌标准色
  black: { bg: '#000000', text: '#fff', border: '#fff', dot: '#fff' },
  yellow: { bg: '#FFBE00', text: '#000', border: '#000', dot: '#000' },
  white: { bg: '#FFFFFF', text: '#000', border: '#000', dot: '#000' }
};

/**
 * 计算字符位 + 圆点的 x 坐标（每个格中心）
 * 布局：s0 [gap] s1 [gap] [dot] [gap] s2 ... s(n-1)；charCount 为 7（普通）或 8（新能源）
 */
function getSymbolPositions(charCount) {
  const n = charCount || 7;
  const xs = [];
  let x = SYMBOL_LEFT;
  for (let i = 0; i < n; i++) {
    xs.push(x + SYMBOL_WIDTH / 2);
    x += SYMBOL_WIDTH;
    if (i === 0) x += SYMBOL_GAP;
    else if (i === 1) x += DOT_SIZE + SYMBOL_GAP;
    else if (i < n - 1) x += SYMBOL_GAP;
  }
  return xs;
}

/** 圆点中心 x（在 s1 与 s2 之间） */
function getDotCenterX() {
  return SYMBOL_LEFT + 2 * SYMBOL_WIDTH + 2 * SYMBOL_GAP + DOT_SIZE / 2;
}

/**
 * 字母/数字在 letter 雪碧图中的 background-position → (sx, sy)
 * 参考站：index 0-9 第一行，10-19 第二行(-180)，20-25 第三行(-360)，26+ 第四行(-540)，数字 7/8/0/9 有 fix
 */
function getLetterSpritePos(index) {
  let sx, sy;
  if (index <= 9) {
    sx = index * 90;
    sy = 0;
  } else if (index <= 19) {
    sx = (index - 10) * 90;
    sy = 180;
  } else if (index <= 25) {
    sx = (index - 20) * 90;
    sy = 360;
  } else {
    let fix = 0;
    const c = PLATE_LETTERS[index];
    if (c === '7' || c === '8' || c === '0') fix = 1;
    if (c === '9') fix = 2;
    sx = (index - 26) * 90 + fix;
    sy = 540;
  }
  return { sx, sy };
}

/**
 * 汉字在 word 雪碧图中的 background-position → (sx, sy)
 */
function getWordSpritePos(index) {
  let sx, sy;
  if (index <= 8) {
    sx = index * 90;
    sy = 0;
  } else if (index <= 17) {
    sx = (index - 9) * 90;
    sy = 180;
  } else if (index <= 26) {
    sx = (index - 18) * 90;
    sy = 360;
  } else {
    sx = (index - 27) * 90;
    sy = 540;
  }
  return { sx, sy };
}

export default {
  name: 'PlateGenerator',
  components: { PageLayout },
  data() {
    return {
      plateNumber: '京A12345',
      plateType: 'blue',
      formData: {},
      letterImg: null,
      wordImg: null,
      letter2Img: null,
      word2Img: null
    };
  },
  computed: {
    /** 是否为新能源（绿底）车牌：8 位，如京AD12345 */
    isNewEnergy() {
      return this.plateType === 'green';
    },
    /** 画布宽：新能源 480×scale，普通 440×scale */
    canvasWidth() {
      return (this.isNewEnergy ? SIGN_WIDTH_NE : SIGN_WIDTH) * SCALE;
    },
    canvasHeight() {
      return CANVAS_HEIGHT;
    },
    /** 标准化：新能源 8 位，普通 7 位；仅保留支持的汉字+字母数字 */
    normalizedPlate() {
      const raw = (this.plateNumber || '').trim().toUpperCase();
      if (!raw) return '';
      const maxLen = this.isNewEnergy ? 8 : 7;
      let out = '';
      for (const c of raw) {
        if (PLATE_WORDS.includes(c) || PLATE_LETTERS.includes(c)) {
          out += c;
          if (out.length >= maxLen) break;
        }
      }
      return out;
    }
  },
  mounted() {
    this.loadSprites();
  },
  methods: {
    /** 加载参考站雪碧图（与 longwosion/carplate 一致） */
    loadSprites() {
      const base = process.env.BASE_URL || '/';
      const urls = [
        { key: 'letterImg', url: `${base}plate/letter.png` },
        { key: 'wordImg', url: `${base}plate/word.png` },
        { key: 'letter2Img', url: `${base}plate/letter2.png` },
        { key: 'word2Img', url: `${base}plate/word2.png` }
      ];
      let loaded = 0;
      urls.forEach(({ key, url }) => {
        const img = new Image();
        img.onload = () => {
          this[key] = img;
          loaded += 1;
          if (loaded === 4) this.$nextTick(() => this.generatePlate());
        };
        img.onerror = () => {
          loaded += 1;
          if (loaded === 4) this.$nextTick(() => this.generatePlate());
        };
        img.src = url;
      });
    },
    /** 绘制圆角矩形路径（不填充不描边，仅 path） */
    roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    },

    /** 绘制带描边的圆角内框 */
    drawSignLoop(ctx, style) {
      const x = SIGN_LOOP_MARGIN;
      const y = SIGN_LOOP_MARGIN;
      const w = this.canvasWidth - 2 * SIGN_LOOP_MARGIN;
      const h = this.canvasHeight - 2 * SIGN_LOOP_MARGIN;
      ctx.strokeStyle = style.border;
      ctx.lineWidth = SIGN_BORDER_WIDTH;
      this.roundRect(ctx, x, y, w, h, SIGN_RADIUS);
      ctx.stroke();
    },

    /** 绘制四角标记（与参考站一致：小横条圆角矩形）mark1 left:96 top:8.5 → scale2 左(192,17) */
    drawMarks(ctx, style) {
      const fill = style.dot;
      const w = MARK_W;
      const h = MARK_H;
      const r = MARK_R;
      const drawOne = (x, y) => {
        this.roundRect(ctx, x, y, w, h, r);
        ctx.fillStyle = fill;
        ctx.fill();
        if (style.bg === '#FFFFFF') {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      };
      drawOne(MARK_MARGIN_H, MARK_MARGIN_V); // 左上
      drawOne(this.canvasWidth - MARK_MARGIN_H - w, MARK_MARGIN_V); // 右上
      drawOne(this.canvasWidth - MARK_MARGIN_H - w, this.canvasHeight - MARK_MARGIN_V - h); // 右下
      drawOne(MARK_MARGIN_H, this.canvasHeight - MARK_MARGIN_V - h); // 左下
    },

    /** 绘制中间小圆点 */
    drawDot(ctx, style) {
      const cx = getDotCenterX();
      const cy = this.canvasHeight / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, DOT_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = style.dot;
      ctx.fill();
    },

    /**
     * 用参考站雪碧图在 Canvas 上绘制单字符（与 longwosion/carplate 一致）
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLImageElement} img - letter/word 或 letter2/word2
     * @param {number} sx - 雪碧图 x
     * @param {number} sy - 雪碧图 y
     * @param {number} centerX - 字符中心 x
     * @param {number} centerY - 字符中心 y
     */
    drawCharFromSprite(ctx, img, sx, sy, centerX, centerY) {
      const dx = centerX - SYMBOL_WIDTH / 2;
      const dy = centerY - SYMBOL_HEIGHT / 2;
      ctx.drawImage(
        img,
        sx, sy, SPRITE_CELL_W, SPRITE_CELL_H,
        dx, dy, SYMBOL_WIDTH, SYMBOL_HEIGHT
      );
    },

    /** 雪碧图未加载时回退：用文字绘制 */
    drawCharFallback(ctx, char, centerX, centerY, fontSize, style) {
      const isLightBg = style.text === '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${fontSize}px "Microsoft YaHei", "黑体", sans-serif`;
      const offset = 1.5;
      if (isLightBg) {
        ctx.fillStyle = '#333';
        ctx.fillText(char, centerX + offset, centerY + offset);
        ctx.fillStyle = '#ccc';
        ctx.fillText(char, centerX - offset / 2, centerY - offset / 2);
      } else {
        ctx.fillStyle = '#000';
        ctx.fillText(char, centerX + offset, centerY + offset);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(char, centerX - offset / 2, centerY - offset / 2);
      }
      ctx.fillStyle = style.text;
      ctx.fillText(char, centerX, centerY);
    },

    generatePlate() {
      const canvas = this.$refs.plateCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const code = this.normalizedPlate;
      const style = PLATE_STYLES[this.plateType] || PLATE_STYLES.blue;
      const w = this.canvasWidth;
      const h = this.canvasHeight;
      const charCount = this.isNewEnergy ? 8 : 7;

      ctx.clearRect(0, 0, w, h);

      // 背景
      ctx.fillStyle = style.bg;
      this.roundRect(ctx, 0, 0, w, h, SIGN_RADIUS);
      ctx.fill();

      // 内框白边
      this.drawSignLoop(ctx, style);
      // 四角标记
      this.drawMarks(ctx, style);
      // 中间圆点（始终绘制）
      this.drawDot(ctx, style);

      if (!code) return;

      const positions = getSymbolPositions(charCount);
      const centerY = h / 2;
      const useLightSprites = style.text === '#000'; // 黄底/白底/绿底用 letter2/word2
      const letterImg = useLightSprites ? this.letter2Img : this.letterImg;
      const wordImg = useLightSprites ? this.word2Img : this.wordImg;
      const spritesReady = letterImg && wordImg && letterImg.complete && wordImg.complete;

      for (let i = 0; i < code.length && i < charCount; i++) {
        const c = code[i];
        const isWord = PLATE_WORDS.includes(c);
        if (spritesReady) {
          const img = isWord ? wordImg : letterImg;
          const index = isWord ? PLATE_WORDS.indexOf(c) : PLATE_LETTERS.indexOf(c);
          if (index < 0) continue;
          const pos = isWord ? getWordSpritePos(index) : getLetterSpritePos(index);
          this.drawCharFromSprite(ctx, img, pos.sx, pos.sy, positions[i], centerY);
        } else {
          const fontSize = isWord ? 72 : 68;
          this.drawCharFallback(ctx, c, positions[i], centerY, fontSize, style);
        }
      }
    },

    downloadPlate() {
      const canvas = this.$refs.plateCanvas;
      const name = this.normalizedPlate || '京A88888';
      const link = document.createElement('a');
      link.download = `车牌号_${name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  },
  watch: {
    plateNumber() {
      this.$nextTick(() => this.generatePlate());
    },
    plateType() {
      this.$nextTick(() => this.generatePlate());
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
.preview-section {
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

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.canvas-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.canvas-container canvas {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}

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
