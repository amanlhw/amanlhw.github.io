<template>
  <div class="sql-format">
    <div id="lhw-body-box">
      <div class="lhw-top-box">
        <h3>SQL字段转换</h3>
        <textarea 
          id="sqlInput" 
          v-model="sqlInput" 
          placeholder="请输入SQL字段定义..."
        ></textarea>
        <div class="button-group">
          <el-button type="primary" @click="convertSql">转换</el-button>
          <el-button @click="clearAll">清空</el-button>
          <el-button @click="loadTestData">测试数据</el-button>
        </div>
      </div>
      
      <div class="lhw-bottom-box">
        <h3>转换结果</h3>
        <textarea 
          id="showSql" 
          v-model="showSql" 
          readonly 
          placeholder="转换结果将显示在这里..."
        ></textarea>
        <div class="button-group">
          <el-button type="success" @click="copyResult">复制结果</el-button>
          <router-link to="/">
            <el-button>返回首页</el-button>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div id="lhw-alert-box" :class="alertClass">
      <div class="alert-content">
        <span>复制成功！</span>
        <span class="delete" @click="hideAlert">×</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SqlFormat',
  data() {
    return {
      sqlInput: '',
      showSql: '',
      alertClass: 'alert-hide',
      alertTimer: null
    };
  },
  methods: {
    // 转换SQL
    convertSql() {
      if (!this.sqlInput.trim()) {
        this.$message.warning('请输入SQL字段定义');
        return;
      }

      try {
        const value = this.sqlInput;
        const valData = value.toString().substring(0, value.lastIndexOf(',')).split("',");
        
        const result = valData
          .filter(item => item !== '')
          .map(item => {
            const cleanItem = item.replace(/(^\s*)|(\s*$)/g, "") + '\'';
            const prefixMatch = cleanItem.match(/(?<=\`).+?(?=\`)/);
            const thePrefix = this.strToCam(prefixMatch ? prefixMatch[0] : '');
            const typeMatch = cleanItem.match(/(?<=`\s).*?(?=\()/gi);
            const type = typeMatch ? typeMatch[0] : '';
            const isNull = cleanItem.indexOf('NOT NULL');
            const defaultValueMatch = cleanItem.match(/(?<=DEFAULT \').+?(?=\')/);
            const theDefaultValue = defaultValueMatch ? defaultValueMatch[0] : undefined;
            const describeMatch = cleanItem.match(/(?<=COMMENT \').+(?=\')/);
            const describe = describeMatch ? describeMatch[0] : '';
            
            let finalType = ['bigint', 'int', 'tinyint'].includes(type) ? 'number' : 'string';
            
            return `${thePrefix}?: ${finalType};  // ${describe} ${isNull !== -1 ? '【必填】' : ''} ${theDefaultValue === undefined ? '' : '【默认为：' + theDefaultValue + '】'} `;
          });

        this.showSql = result.join('\n').replace(/,/g, "");
        this.$message.success('转换完成！');
      } catch (error) {
        this.$message.error('转换失败，请检查输入格式');
        console.error('转换错误:', error);
      }
    },

    // 转驼峰命名
    strToCam(str) {
      if (!str) return '';
      const arr = str.split('_');
      for (let i = 1; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substr(1, arr[i].length - 1);
      }
      return arr.join('');
    },

    // 复制结果
    copyResult() {
      if (!this.showSql.trim()) {
        this.$message.warning('没有可复制的内容');
        return;
      }

      navigator.clipboard.writeText(this.showSql).then(() => {
        this.showAlert();
      }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = this.showSql;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showAlert();
      });
    },

    // 显示提示
    showAlert() {
      if (this.alertTimer) {
        clearTimeout(this.alertTimer);
      }
      
      this.alertClass = 'alert-show';
      this.alertTimer = setTimeout(() => {
        this.alertClass = 'alert-hide';
      }, 3000);
    },

    // 隐藏提示
    hideAlert() {
      if (this.alertTimer) {
        clearTimeout(this.alertTimer);
      }
      this.alertClass = 'alert-hide';
    },

    // 清空所有
    clearAll() {
      this.sqlInput = '';
      this.showSql = '';
    },

    // 加载测试数据
    loadTestData() {
      this.sqlInput = `
        \`id\` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
        \`company_id\` bigint(20) NOT NULL COMMENT '客户公司编码',
        \`bill_no\` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '单据号',
        \`contract_status\` tinyint(4) NOT NULL DEFAULT '10' COMMENT '合同状态(10=正常 20=已过期 30=提前中止)',
        \`display_type\` tinyint(4) NOT NULL DEFAULT '0' COMMENT '显示品牌/品类控制字段(0=品牌 1=品类)',
        \`supplier_no\` varchar(20) NOT NULL COMMENT '供应商编号',
        \`stock_qty\` decimal(12,3) NOT NULL DEFAULT '0.000' COMMENT '库存数量',
        \`before_qty\` decimal(12,3) NOT NULL DEFAULT '0.000' COMMENT '调整前数量',
        \`adjustment_qty\` decimal(12,3) NOT NULL DEFAULT '0.000' COMMENT '调整数量',
        \`settlement_method\` tinyint(4) NOT NULL COMMENT '结算方式 1=半月结 2=月结 3=季结 ',
        \`currency\` tinyint(4) NOT NULL COMMENT '币种(1=人民币 2=港币 3=美元)',
        \`effective_date\` date NOT NULL COMMENT '生效日期',
        \`status\` varchar(20) NOT NULL DEFAULT '10' COMMENT '状态(10=正常 20=审核)',
        \`remarks\` varchar(100) DEFAULT NULL COMMENT '备注',
        \`creator\` varchar(20) NOT NULL COMMENT '创建人',
        \`create_time\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间(不可人为调整)',
        \`modifier\` varchar(20) DEFAULT NULL COMMENT '修改人',
        \`modify_time\` datetime DEFAULT NULL COMMENT '修改时间',
        \`update_time\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
        \`del_tag\` varchar(2) DEFAULT '0' COMMENT '归档删除标识(0=正常归档，删除后数据同步下游 1=归档删除，删除后数据不同步下游',
        \`partion_no\` varchar(20) NOT NULL COMMENT '分库特征码',
      `;
      this.showSql = '';
    }
  }
};
</script>

<style scoped>

.sql-format {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
}

#lhw-body-box {
  width: 80%;
  height: 80%;
  padding: 24px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: white;
}

.lhw-top-box,
.lhw-bottom-box {
  height: 50%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lhw-top-box h3,
.lhw-bottom-box h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

#sqlInput,
#showSql {
  height: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  border: #ddd 1px solid;
  transition: all 0.30s ease-in-out;
  resize: none;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

#sqlInput:hover,
#sqlInput:focus {
  border: #409EFF 1px solid;
}

#showSql:hover {
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 滚动条样式 */
.sql-format::-webkit-scrollbar,
#sqlInput::-webkit-scrollbar,
#showSql::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sql-format::-webkit-scrollbar-thumb,
#sqlInput::-webkit-scrollbar-thumb,
#showSql::-webkit-scrollbar-thumb {
  background-color: #d4d3d3bb;
  border-radius: 1em;
}

.sql-format::-webkit-scrollbar-track,
#sqlInput::-webkit-scrollbar-track,
#showSql::-webkit-scrollbar-track {
  background-color: #ffffffbd;
  border-radius: 1em;
}

/* 提示框样式 */
#lhw-alert-box {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  transition: all 0.3s ease;
}

.alert-hide {
  opacity: 0;
  transform: translateX(100%);
  pointer-events: none;
}

.alert-show {
  opacity: 1;
  transform: translateX(0);
}

.alert-content {
  background: #67c23a;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.delete {
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.delete:hover {
  opacity: 0.8;
}
</style> 