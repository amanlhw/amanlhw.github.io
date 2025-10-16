<template>
  <PageLayout title="数独游戏">
    <div class="sudoku-container">
      <div class="sudoku-content">
        <!-- 游戏控制面板 -->
        <div class="control-panel">
          <div class="control-main">
            <div class="difficulty-selector">
              <el-radio-group v-model="difficulty" size="small" @change="newGame">
                <el-radio-button label="easy">简单</el-radio-button>
                <el-radio-button label="medium">中等</el-radio-button>
                <el-radio-button label="hard">困难</el-radio-button>
              </el-radio-group>
            </div>

            <div class="game-controls">
              <el-button type="primary" size="small" @click="newGame" icon="el-icon-refresh">
                新游戏
              </el-button>
              <el-button size="small" @click="checkSolution" icon="el-icon-check">
                检查答案
              </el-button>
              <el-button size="small" @click="giveHint" icon="el-icon-info">
                提示
              </el-button>
              <el-button size="small" @click="clearAll" icon="el-icon-delete">
                清空
              </el-button>
            </div>
          </div>

          <div class="game-info">
            <div class="timer">
              <i class="el-icon-time"></i>
              <span>{{ formattedTime }}</span>
            </div>
            <div class="mistakes" v-if="mistakes > 0">
              <i class="el-icon-warning"></i>
              <span>错误: {{ mistakes }}</span>
            </div>
          </div>
        </div>

        <!-- 游戏提示 -->
        <div class="game-tips">
          <el-alert v-if="gameStatus === 'won'" title="恭喜你！" type="success" description="你已经成功完成了这个数独游戏！"
            :closable="false" show-icon />
          <el-alert v-else-if="showTip" :title="tipMessage" :type="tipType" :closable="true" @close="showTip = false" />
        </div>

        <!-- 数独棋盘 -->
        <div class="board-wrapper">
          <div class="sudoku-board">
            <div v-for="(row, rowIndex) in board" :key="rowIndex" class="sudoku-row">
              <div v-for="(cell, colIndex) in row" :key="colIndex" class="sudoku-cell" :class="{
                'initial': initialBoard[rowIndex][colIndex] !== 0,
                'selected': selectedRow === rowIndex && selectedCol === colIndex,
                'highlighted': isHighlighted(rowIndex, colIndex),
                'error': hasError(rowIndex, colIndex),
                'hint-cell': hintCell.row === rowIndex && hintCell.col === colIndex,
                'thick-right': (colIndex + 1) % 3 === 0 && colIndex < 8,
                'thick-bottom': (rowIndex + 1) % 3 === 0 && rowIndex < 8
              }" @click="selectCell(rowIndex, colIndex)">
                <span v-if="cell !== 0">{{ cell }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数字输入面板切换按钮 -->
        <div class="number-pad-toggle">
          <el-button size="small" @click="showNumberPad = !showNumberPad"
            :icon="showNumberPad ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
            {{ showNumberPad ? '隐藏' : '显示' }}数字键盘
          </el-button>
        </div>

        <!-- 数字输入面板 -->
        <transition name="slide-fade">
          <div v-show="showNumberPad" class="number-pad">
            <div v-for="num in 9" :key="num" class="number-btn" :class="{ 'disabled': !canPlaceNumber(num) }"
              @click="inputNumber(num)">
              {{ num }}
            </div>
            <div class="number-btn erase-btn" @click="eraseCell">
              <i class="el-icon-delete"></i>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </PageLayout>
</template>

<script>
import PageLayout from '@/components/PageLayout.vue';

export default {
  name: 'Sudoku',
  components: {
    PageLayout
  },
  data() {
    return {
      board: [],
      initialBoard: [],
      solution: [],
      selectedRow: -1,
      selectedCol: -1,
      difficulty: 'medium',
      gameStatus: 'playing', // playing, won
      mistakes: 0,
      timer: 0,
      timerInterval: null,
      showTip: false,
      tipMessage: '',
      tipType: 'info',
      hintCell: { row: -1, col: -1 },
      showNumberPad: false // 默认隐藏数字键盘
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${ minutes.toString().padStart(2, '0') }:${ seconds.toString().padStart(2, '0') }`;
    }
  },
  mounted() {
    this.newGame();
    // 添加键盘事件监听
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeDestroy() {
    this.stopTimer();
    // 移除键盘事件监听
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    // 生成新游戏
    newGame() {
      this.stopTimer();
      this.solution = this.generateSudoku();
      this.initialBoard = this.createPuzzle(this.solution);
      this.board = JSON.parse(JSON.stringify(this.initialBoard));
      this.selectedRow = -1;
      this.selectedCol = -1;
      this.gameStatus = 'playing';
      this.mistakes = 0;
      this.timer = 0;
      this.showTip = false;
      this.hintCell = { row: -1, col: -1 };
      this.startTimer();
    },

    // 生成完整的数独解
    generateSudoku() {
      const board = Array(9).fill(null).map(() => Array(9).fill(0));
      this.fillBoard(board);
      return board;
    },

    // 递归填充数独
    fillBoard(board) {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            // 随机打乱数字顺序
            this.shuffle(numbers);

            for (let num of numbers) {
              if (this.isValidPlacement(board, row, col, num)) {
                board[row][col] = num;

                if (this.fillBoard(board)) {
                  return true;
                }

                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    },

    // 检查放置是否有效
    isValidPlacement(board, row, col, num) {
      // 检查行
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }

      // 检查列
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }

      // 检查3x3宫格
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[startRow + i][startCol + j] === num) return false;
        }
      }

      return true;
    },

    // 创建谜题（移除一些数字）
    createPuzzle(solution) {
      const puzzle = JSON.parse(JSON.stringify(solution));
      let cellsToRemove;

      // 根据难度决定移除多少个数字
      switch (this.difficulty) {
        case 'easy':
          cellsToRemove = 35;
          break;
        case 'medium':
          cellsToRemove = 45;
          break;
        case 'hard':
          cellsToRemove = 55;
          break;
        default:
          cellsToRemove = 45;
      }

      let removed = 0;
      while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (puzzle[row][col] !== 0) {
          puzzle[row][col] = 0;
          removed++;
        }
      }

      return puzzle;
    },

    // 打乱数组
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },

    // 选择单元格
    selectCell(row, col) {
      // 只允许选中可编辑的格子
      if (this.initialBoard[row][col] === 0) {
        this.selectedRow = row;
        this.selectedCol = col;
        this.hintCell = { row: -1, col: -1 };
      }
    },

    // 判断单元格是否高亮
    isHighlighted(row, col) {
      if (this.selectedRow === -1 || this.selectedCol === -1) return false;

      // 高亮同行、同列、同宫格
      const sameRow = row === this.selectedRow;
      const sameCol = col === this.selectedCol;
      const sameBox = Math.floor(row / 3) === Math.floor(this.selectedRow / 3) &&
        Math.floor(col / 3) === Math.floor(this.selectedCol / 3);

      return sameRow || sameCol || sameBox;
    },

    // 判断是否有错误
    hasError(row, col) {
      if (this.board[row][col] === 0) return false;
      if (this.initialBoard[row][col] !== 0) return false;

      // 检查是否与解答不同
      return this.board[row][col] !== this.solution[row][col];
    },

    // 检查是否可以放置数字
    canPlaceNumber(num) {
      if (this.selectedRow === -1 || this.selectedCol === -1) return false;
      if (this.initialBoard[this.selectedRow][this.selectedCol] !== 0) return false;
      return true;
    },

    // 输入数字
    inputNumber(num) {
      if (!this.canPlaceNumber(num)) return;

      this.board[this.selectedRow][this.selectedCol] = num;
      this.hintCell = { row: -1, col: -1 };

      // 检查是否正确
      if (this.board[this.selectedRow][this.selectedCol] !== this.solution[this.selectedRow][this.selectedCol]) {
        this.mistakes++;
      }

      // 检查是否完成
      this.checkWin();
    },

    // 擦除单元格
    eraseCell() {
      if (this.selectedRow !== -1 && this.selectedCol !== -1) {
        if (this.initialBoard[this.selectedRow][this.selectedCol] === 0) {
          this.board[this.selectedRow][this.selectedCol] = 0;
          this.hintCell = { row: -1, col: -1 };
        }
      }
    },

    // 检查答案
    checkSolution() {
      let correct = true;
      let filled = true;

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (this.board[i][j] === 0) {
            filled = false;
          } else if (this.board[i][j] !== this.solution[i][j]) {
            correct = false;
          }
        }
      }

      if (!filled) {
        this.showMessage('还有空格未填写哦！', 'warning');
      } else if (!correct) {
        this.showMessage('有些地方填错了，请仔细检查！', 'error');
      } else {
        this.showMessage('完全正确！恭喜你！', 'success');
        this.gameStatus = 'won';
        this.stopTimer();
      }
    },

    // 给出提示
    giveHint() {
      // 找到第一个空格并填入正确答案
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (this.board[i][j] === 0 || this.board[i][j] !== this.solution[i][j]) {
            this.board[i][j] = this.solution[i][j];
            this.hintCell = { row: i, col: j };
            this.showMessage(`提示：第 ${ i + 1 } 行第 ${ j + 1 } 列应该填 ${ this.solution[i][j] }`, 'info');

            // 3秒后清除高亮
            setTimeout(() => {
              this.hintCell = { row: -1, col: -1 };
            }, 3000);

            this.checkWin();
            return;
          }
        }
      }

      this.showMessage('已经全部正确了！', 'success');
    },

    // 清空所有玩家输入
    clearAll() {
      this.$confirm('确定要清空所有填写的内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.board = JSON.parse(JSON.stringify(this.initialBoard));
        this.selectedRow = -1;
        this.selectedCol = -1;
        this.hintCell = { row: -1, col: -1 };
        this.showMessage('已清空所有内容', 'info');
      }).catch(() => { });
    },

    // 检查是否获胜
    checkWin() {
      let won = true;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (this.board[i][j] !== this.solution[i][j]) {
            won = false;
            break;
          }
        }
        if (!won) break;
      }

      if (won) {
        this.gameStatus = 'won';
        this.stopTimer();
        this.showMessage('恭喜你完成了数独游戏！', 'success');
      }
    },

    // 显示提示信息
    showMessage(message, type) {
      this.tipMessage = message;
      this.tipType = type;
      this.showTip = true;
    },

    // 开始计时
    startTimer() {
      this.timerInterval = setInterval(() => {
        this.timer++;
      }, 1000);
    },

    // 停止计时
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    // 处理键盘输入
    handleKeyPress(event) {
      // 如果没有选中格子，不处理
      if (this.selectedRow === -1 || this.selectedCol === -1) {
        return;
      }

      // 如果是初始格子，不处理
      if (this.initialBoard[this.selectedRow][this.selectedCol] !== 0) {
        return;
      }

      // 处理数字键 1-9
      if (event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const num = parseInt(event.key);
        this.inputNumber(num);
      }
      // 处理退格键、删除键或数字0，清空格子
      else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        event.preventDefault();
        this.eraseCell();
      }
      // 处理方向键，移动选中的格子
      else if (event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.moveSelection(event.key);
      }
    },

    // 移动选中的格子
    moveSelection(direction) {
      let newRow = this.selectedRow;
      let newCol = this.selectedCol;

      // 定义移动方向
      const moves = {
        'ArrowUp': { row: -1, col: 0 },
        'ArrowDown': { row: 1, col: 0 },
        'ArrowLeft': { row: 0, col: -1 },
        'ArrowRight': { row: 0, col: 1 }
      };

      const move = moves[direction];
      if (!move) return;

      // 尝试移动，跳过不可编辑的格子
      let attempts = 0;
      const maxAttempts = 9; // 最多尝试9次（一行或一列的最大格子数）

      while (attempts < maxAttempts) {
        newRow += move.row;
        newCol += move.col;

        // 检查是否超出边界
        if (newRow < 0 || newRow > 8 || newCol < 0 || newCol > 8) {
          return; // 到达边界，停止移动
        }

        // 如果找到可编辑的格子，选中它
        if (this.initialBoard[newRow][newCol] === 0) {
          this.selectedRow = newRow;
          this.selectedCol = newCol;
          this.hintCell = { row: -1, col: -1 };
          return;
        }

        attempts++;
      }
    }
  }
};
</script>

<style scoped>
.sudoku-container {
  background: #f5f5f5;
  padding: 20px;
}

.sudoku-content {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

/* 控制面板 */
.control-panel {
  background: white;
  border-radius: 4px;
  padding: 14px 10px 10px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.control-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px 32px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.difficulty-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.game-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.game-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.timer,
.mistakes {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #666;
}

.timer i,
.mistakes i {
  font-size: 18px;
}

.mistakes {
  color: #f56c6c;
}

/* 数独棋盘容器 */
.board-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* 数独棋盘 */
.sudoku-board {
  background: white;
  border-radius: 4px;
  padding: 12px;
  border: 2px solid #333;
  display: inline-block;
}

.sudoku-row {
  display: flex;
}

.sudoku-cell {
  width: 50px;
  height: 50px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  background: white;
}

.sudoku-cell.thick-right {
  border-right: 2px solid #333;
}

.sudoku-cell.thick-bottom {
  border-bottom: 2px solid #333;
}

.sudoku-cell.initial {
  background: #f5f5f5 !important;
  color: #333;
  cursor: not-allowed;
  font-weight: 700;
}

.sudoku-cell.selected {
  background: #a0cfff !important;
  color: #333;
}

.sudoku-cell.highlighted {
  background: #ecf5ff;
}

.sudoku-cell.error {
  background: #fef0f0;
  color: #f56c6c;
}

.sudoku-cell.hint-cell {
  background: #f0f9ff;
}

/* 数字键盘切换按钮 */
.number-pad-toggle {
  text-align: center;
  margin-bottom: 12px;
}

/* 数字输入面板 */
.number-pad {
  background: white;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

/* 展开/收起动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.number-btn {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409eff;
  color: white;
  font-size: 20px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #409eff;
}

.number-btn:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.number-btn:active {
  background: #3a8ee6;
}

.number-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-btn.disabled:hover {
  background: #409eff;
  border-color: #409eff;
}

.number-btn.erase-btn {
  background: #f56c6c;
  border-color: #f56c6c;
}

.number-btn.erase-btn:hover {
  background: #f78989;
  border-color: #f78989;
}

/* 游戏提示 */
.game-tips {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .sudoku-container {
    padding: 12px;
  }

  .control-panel {
    padding: 16px;
  }

  .control-main {
    gap: 20px;
  }

  .game-controls {
    gap: 4px;
  }

  .sudoku-board {
    padding: 8px;
  }

  .sudoku-cell {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .number-pad {
    padding: 16px;
    gap: 8px;
  }

  .number-btn {
    height: 44px;
    font-size: 18px;
  }
}

@media (max-width: 400px) {
  .sudoku-cell {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>
