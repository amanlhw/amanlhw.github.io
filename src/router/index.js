import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../pages/Home.vue';
import SqlFormat from '../pages/SqlFormat.vue';
import PlateGenerator from '../pages/PlateGenerator.vue';
import WebEmbed from '../pages/WebEmbed.vue';
import WorkTimeSchedule from '../pages/WorkTimeSchedule.vue';
import Sudoku from '../pages/Sudoku.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '叮咚的工具箱'
    }
  },
  {
    path: '/sql-format',
    name: 'SqlFormat',
    component: SqlFormat,
    meta: {
      title: 'SQL格式化 - 叮咚的工具箱'
    }
  },
  {
    path: '/plate-generator',
    name: 'PlateGenerator',
    component: PlateGenerator,
    meta: {
      title: '车牌号生成 - 叮咚的工具箱'
    }
  },
  {
    path: '/web-embed/:url/:title/:desc?',
    name: 'WebEmbed',
    component: WebEmbed,
    meta: {
      title: '外部网站 - 叮咚的工具箱'
    }
  },
  {
    path: '/work-time-schedule',
    name: 'WorkTimeSchedule',
    component: WorkTimeSchedule,
    meta: {
      title: '工时排布统计 - 叮咚的工具箱'
    }
  },
  {
    path: '/sudoku',
    name: 'Sudoku',
    component: Sudoku,
    meta: {
      title: '数独游戏 - 叮咚的工具箱'
    }
  },
  // 404 重定向到首页
  {
    path: '*',
    redirect: '/'
  }
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
});

// 全局路由守卫，动态更新页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = '叮咚的工具箱';
  }
  next();
});

export default router; 