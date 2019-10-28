const {
  deleteObjectKey
} = require('./utils.js')

function dealChildren(routes) {
  return routes.map(route => recursion(route))
}

// 递归调用查看是否含有children
function recursion(route) {
  if (route.children && Boolean(route.children.length)) {
    // 存在子路由
    let children = JSON.parse(route.children),
      newChild = null
    children = children.map(child => {
      newChild = Object.entries(deleteObjectKey(child, ['childrenStatus', 'relation', 'componentPath', 'key'])).map(item => {
        if (item[0] === 'children' && Boolean(item[1])) {
          console.log(recursion(child))
          return `\n${item[0]}: ${recursion(child)['children']}`
        } else {
          return `\n${item[0]}: '${item[1]}'`
        }
      })
      newChild.push(`\ncompoment: _ => import('${child.componentPath}')`)
      return `{${newChild}}`
    })
    return {
      ...route,
      children: `[${children}]`
    }
  } else {
    // 不存在子路由
    return deleteObjectKey(route, ['children'])
  }
}

module.exports = dealChildren