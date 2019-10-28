import Vue from 'vue'

import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/auto/',
  routes: [{
    path: '/demo/index',
    name: 'demo',
    component: _ => import('@/page/demo/Index.vue'),
    children: [{
      name: 'demo_children',
      path: '',
      compoment: _ => import('@/page/demo/children/Index.vue')
    }, {
      name: 'demo_children_testChildren',
      path: 'testChildren',
      compoment: _ => import('@/page/demo/children/testChildren/Index.vue')
    }]
  }, {
    path: '/demo/test/index',
    name: 'demo_test',
    component: _ => import('@/page/demo/test/Index.vue'),
  }, {
    path: '/helloworld/index',
    name: 'helloworld',
    component: _ => import('@/page/helloworld/Index.vue'),
    meta: {
      title: '测试demo'
    },
    access: [1, 2, 3],
  }, {
    path: '/home/index',
    name: 'home',
    component: _ => import('@/page/home/Index.vue'),
  }, {
    path: '/demo/children/testChildren/children/index',
    name: 'demo_children_testChildren_children',
    component: _ => import('@/page/demo/children/testChildren/children/Index.vue'),
  }]
})