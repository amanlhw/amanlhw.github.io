<template>
  <PageLayout title="SQL字段转换">
    <el-row :gutter="32" class="sql-format-content">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="input-section" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-edit"></i>
              输入SQL字段定义
            </span>
          </div>

          <el-input v-model="sqlInput" type="textarea" :rows="15" placeholder="请输入SQL字段定义..." resize="none"
            class="sql-input" />

          <div class="button-group">
            <el-button type="primary" @click="convertSql" icon="el-icon-refresh">
              转换
            </el-button>
            <el-button @click="clearAll" icon="el-icon-delete">
              清空
            </el-button>
            <el-button @click="loadTestData" icon="el-icon-document">
              测试数据
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="output-section" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-document"></i>
              转换结果
            </span>
          </div>

          <el-input v-model="showSql" type="textarea" :rows="15" placeholder="转换结果将显示在这里..." readonly resize="none"
            class="sql-output" />

          <div class="button-group">
            <el-button type="success" @click="copyResult" icon="el-icon-document-copy">
              复制结果
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </PageLayout>
</template>

<script>
import PageLayout from '@/components/PageLayout.vue';

export default {
  name: 'SqlFormat',
  components: {
    PageLayout
  },
  data() {
    return {
      sqlInput: '',
      showSql: ''
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
        const result = this.parseSqlFields(this.sqlInput);
        this.showSql = result.join('\n');
        this.$message.success('转换完成！');
      } catch (error) {
        this.$message.error('转换失败，请检查输入格式');
        console.error('转换错误:', error);
      }
    },

    // 解析SQL字段定义
    parseSqlFields(sqlInput) {
      // 清理输入，移除多余的空白字符
      const cleanedInput = sqlInput.trim();

      // 分割字段定义，支持多种分隔符
      const fieldDefinitions = this.splitFieldDefinitions(cleanedInput);

      return fieldDefinitions
        .filter(field => field.trim())
        .map(field => this.parseSingleField(field))
        .filter(result => result); // 过滤掉解析失败的字段
    },

    // 分割字段定义
    splitFieldDefinitions(input) {
      // 移除最后一个逗号（如果存在）
      const trimmedInput = input.replace(/,\s*$/, '');

      // 使用更精确的分割方式，避免在引号内分割
      const fields = [];
      let currentField = '';
      let inQuotes = false;
      let quoteChar = '';

      for (let i = 0; i < trimmedInput.length; i++) {
        const char = trimmedInput[i];

        if ((char === "'" || char === '"') && (i === 0 || trimmedInput[i - 1] !== '\\')) {
          if (!inQuotes) {
            inQuotes = true;
            quoteChar = char;
          } else if (char === quoteChar) {
            inQuotes = false;
          }
        }

        if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }

      if (currentField.trim()) {
        fields.push(currentField.trim());
      }

      return fields;
    },

    // 解析单个字段定义
    parseSingleField(fieldDefinition) {
      try {
        // 提取字段名（反引号包围的内容）
        const fieldNameMatch = fieldDefinition.match(/`([^`]+)`/);
        if (!fieldNameMatch) {
          console.warn('无法解析字段名:', fieldDefinition);
          return null;
        }

        const fieldName = fieldNameMatch[1];
        const camelCaseName = this.strToCam(fieldName);

        // 提取数据类型
        const typeMatch = fieldDefinition.match(/`\s*(\w+)/i);
        const dataType = typeMatch ? typeMatch[1].toLowerCase() : '';

        // 判断是否为数字类型
        const numberTypes = ['bigint', 'int', 'tinyint', 'smallint', 'mediumint', 'decimal', 'float', 'double'];
        const finalType = numberTypes.includes(dataType) ? 'number' : 'string';

        // 检查是否必填
        const isRequired = fieldDefinition.includes('NOT NULL');

        // 提取默认值
        const defaultValueMatch = fieldDefinition.match(/DEFAULT\s+['"`]?([^'"`,\s]+)['"`]?/i);
        const defaultValue = defaultValueMatch ? defaultValueMatch[1] : null;

        // 提取注释
        const commentMatch = fieldDefinition.match(/COMMENT\s+['"`]([^'"`]+)['"`]/i);
        const comment = commentMatch ? commentMatch[1] : '';

        // 构建注释信息
        const commentParts = [];
        if (comment) commentParts.push(comment);
        if (isRequired) commentParts.push('【必填】');
        if (defaultValue !== null) commentParts.push(`【默认为：${ defaultValue }】`);

        const fullComment = commentParts.length > 0 ? `  // ${ commentParts.join(' ') }` : '';

        // 构建最终结果
        const requiredMark = isRequired ? '' : '?';
        return `${ camelCaseName }${ requiredMark }: ${ finalType };${ fullComment }`;

      } catch (error) {
        console.warn('解析字段失败:', fieldDefinition, error);
        return null;
      }
    },

    // 转驼峰命名（优化版本）
    strToCam(str) {
      if (!str || typeof str !== 'string') return '';

      return str
        .toLowerCase()
        .split('_')
        .map((word, index) => {
          if (index === 0) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
    },

    // 复制结果
    copyResult() {
      if (!this.showSql.trim()) {
        this.$message.warning('没有可复制的内容');
        return;
      }

      navigator.clipboard.writeText(this.showSql).then(() => {
        this.$message.success('复制成功！');
      }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = this.showSql;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.$message.success('复制成功！');
      });
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
.sql-format-content {
  height: 100%;
}

.input-section,
.output-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
}

.sql-input,
.sql-output {
  flex: 1;
  margin-bottom: 16px;
}

.sql-output>>>.el-textarea__inner {
  background-color: #f8f9fa;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sql-format-content {
    height: auto;
  }

  .input-section,
  .output-section {
    min-height: 400px;
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {

  .input-section,
  .output-section {
    min-height: 350px;
    margin-bottom: 20px;
  }

  .button-group {
    justify-content: center;
  }
}

@media (max-width: 480px) {

  .input-section,
  .output-section {
    min-height: 300px;
    margin-bottom: 16px;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .el-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>