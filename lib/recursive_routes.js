const {
  tabFirst,
  tabChildren
} = require('./utils')
const dealChildren = require('./children.js')

function recursiveRoutes(options, routes) {
  let {
    base,
    mode
  } = options
  routes = dealChildren(routes).map(route => {
    let meta = route.meta ? `\n${tabChildren}${route.meta},` : ''
    let children = route.children ? `\n${tabChildren}children: ${route.children}` : ''
    return `{\n${tabChildren}path: '${route.path}',` +
      `\n${tabChildren}name: '${route.name}',` +
      `\n${tabChildren}component: _ => import('${route.componentPath}'),` +
      `${meta}` +
      `${children}` +
      `\n${tabFirst}}`
  })
  return `
  \nimport Vue from 'vue'
  \nimport Router from 'vue-router'
  \nVue.use(Router)
  \nexport default new Router({
    mode:'${dealValue(mode, 'history')}',
    base:'${dealValue(base, '/auto/')}',
    routes:[${routes.join(',')}]\n})
  `
}

// 处理值不存在
function dealValue(value, defaultValue) {
  return value ? value : defaultValue
}


module.exports = (options, routes) => recursiveRoutes(options, routes)