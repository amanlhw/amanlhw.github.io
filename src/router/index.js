import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../pages/Home.vue';
import SqlFormat from '../pages/SqlFormat.vue';
import PlateGenerator from '../pages/PlateGenerator.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/sql-format',
    name: 'SqlFormat',
    component: SqlFormat
  },
  {
    path: '/plate-generator',
    name: 'PlateGenerator',
    component: PlateGenerator
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

export default router; 