# vue auto plugin

## 描述
#### 这是一款自动化基于webpack打包vue的一款自动化路由工具，解决大型项目多路由管理问题

## 效果
![](https://user-gold-cdn.xitu.io/2019/9/29/16d7c6065291abeb?w=700&h=519&f=gif&s=3597674)

## 引用
```
const RouterAuto = require('router-auto')

module.exports = {
	entry: '...',
	output: {},
	module: {},
	plugin:[
		new RouterAuto()
	]
}
```

## 项目结构
#### 需要在src目录下创建page目录，page目录作为页面目录，在page目录下创建任何目录，且目录名作为路由path和name，Index.vue作为页面入口，router.js作为额外配置选项meta等 实例如下

- package.json 等等文件与目录
- src 项目目录
	- page 页面目录
		- helloworld 
			- Index.vue 页面入口
			- hello.vue 业务组件
			- router.js 额外配置
		- demo
			- test
				- Index.vue 页面入口
				- test.vue 业务组件
			- Index.vue 页面入口

> 上面的目录结构生成的路由结构为

```
import Vue from 'vue'
import Router from 'vue-router'
  
Vue.use(Router)
  
export default new Router({
    mode:'history',
    base:'/auto/',
    routes:[{
      path: '/helloworld/index',
      name: 'helloworld',
      component: _ => import('@/page/helloworld/Index.vue')
    },{
      path: '/demo/index',
      name: 'demo',
      component: _ => import('@/page/demo/Index.vue')
    },{
      path: '/demo/test/index',
      name: 'demo_test',
      component: _ => import('@/page/demo/test/Index.vue')
    }]
})
```

## 打包流程
#### 首先根据目录结构在src下生产一个.router.js文件作为路由入口，并且会根据main.js文件内容插入.router.js的引用,只有当page文件夹内创建xxx目录且创建Index.vue文件时才会创建路由，当在xxx目录内创建router.js时会将额外配置加入.router.js中

## 路由拦截和权限控制
#### 当需要对路由做拦截或者权限时，请在main.js中对router做拦截操作，在将router注入到vue实例

## 初始化参数配置new RouterAuto(options = {})

| 参数 | 说明 | 类型 | 默认值 | 必填项
| --- | --- | --- | --- | --- |
| contentBase | page上层目录 | String | process.cwd()/src | 否
| mode | router中mode | String | history | 否 |
| base | router中base | String | /auto/ | 否 |
| watcher | 是否启用热更新(请在dev环境启用) | Boolean | false | 否 |
| changeMain | 是否启动修改main文件 | Boolean | false | 否 |
| tag | 引入文件标识符,请勿使用$符号 | String | @ | 否 |

## router额外配置
> xxx目录下的router.js文件配置

> 列入: hellowrold目录下router.js文件

``` 
export default {
  meta: {
    title: 'helloworld'
  },
  access: [1,2,3]
}
```
> 生成的.router.js文件

```
import Vue from 'vue' 
import Router from 'vue-router' 
  
Vue.use(Router)
  
export default new Router({
    mode:'history',
    base:'/auto/',
    routes:[{
      path: '/helloworld/index',
      name: 'helloworld',
      component: _ => import('@/page/helloworld/Index.vue'),
      meta:{title:'helloworld'},access:[1,2,3]
    }]
})
```

## 有任何问题请提issues或发送本人邮箱ngaiwe@126.com
 - [博客](http://ngaiwe.com)
 - [项目地址](https://github.com/ngaiwe/vue-router-auto)
