function recursiveRoutes(options, routes, tab, times) {
  console.log(routes)
  let tabFirst = tab.repeat(times),
    tabChildren = tab.repeat(times + 1),
    {
      base,
      mode
    } = options
  let paths = routes.map(route => {
    return `\nimport ${route.name} from '${route.componentPath}'`
  })
  routes = routes.map(route => {
    let meta = route.meta ? `\n${tabChildren}${route.meta},` : ''
    return `{\n${tabChildren}path: '${route.path}',` +
      `\n${tabChildren}name: '${route.name}',` +
      `\n${tabChildren}component: ${route.name},` +
      `${meta}` +
      `\n${tabChildren}children: ${route.children}` +
      `\n${tabFirst}}`
  })
  return `
  \nimport Vue from 'vue'
  \nimport Router from 'vue-router'
  ${paths.join('\n')}
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


module.exports = (options, routes, tab = '  ', times = 2) => recursiveRoutes(options, routes, tab, times)