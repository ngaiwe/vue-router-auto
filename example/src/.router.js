
  
import Vue from 'vue'
  
import Router from 'vue-router'
  
import demo from '@/page/demo/Index.vue'

import demo_test from '@/page/demo/test/Index.vue'

import helloworld from '@/page/helloworld/Index.vue'

import home from '@/page/home/Index.vue'
  
Vue.use(Router)
  
export default new Router({
    mode:'history',
    base:'/auto/',
    routes:[{
      path: '/demo/index',
      name: 'demo',
      component: demo,
      children: [{"name":"demo_children","path":"","childrenStatus":true,"relation":"demo"},{"name":"demo_children_testChildren","path":"testChildren","childrenStatus":true,"relation":"demo"}]
    },{
      path: '/demo/test/index',
      name: 'demo_test',
      component: demo_test,
      children: []
    },{
      path: '/helloworld/index',
      name: 'helloworld',
      component: helloworld,
      meta:{title:'测试demo'},access:[1,2,3],
      children: []
    },{
      path: '/home/index',
      name: 'home',
      component: home,
      children: []
    }]
})
  