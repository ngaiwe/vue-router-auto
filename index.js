/**
 * 自动创建router
 * 问题 
 * 1.监听文件夹变动从而再次编译 ✅
 * 2.将router.js写入缓存 问题遗留
 *  - 在hooks对的emit中操作compilation.assets ✅
 *  - assets中source为create创建文件 size为length ✅
 *  - 将文件router.js加入assets中 ✅
 *  - 如何将router.js匹配到app.js中？❓
 * 3.增加子目录Index路由 ✅
 * 4.修改main.js引入关系 ✅
 * 5.增加router配置和修改锁死前缀fx ✅
 * 6.增加路由配置项 ✅
 * 7.测试build ✅
 */

const glob = require("glob")
const fs = require('fs')
const chokidar = require('chokidar');
const recursiveRoutes = require("./lib/recursive_routes.js.js")

class CreateRouter {
  constructor(options = {}) {
    this.options = options
    this.root = process.cwd()
    this.page = `${this.root}/src/page`
    this.compiler = null
    this.pathNames = null
    this.watchPage()
  }
  // plugin入口
  apply(compiler) {
    this.compiler = compiler
    this.init()
    this.changeMain()
  }
  // 监听page下Index变化
  watchPage() {
    this.watcher = chokidar.watch(this.page, {
      ignored: !/.+Index.vue/,
      ignoreInitial: true, // 忽略add和unlink过程派发事件
      persistent: true // 是否在监听的时候继续进程
    });
    this.watcher
      .on('add', path => this._add(path))
      .on('unlink', path => this._delete(path))
      .on('change', path => {
        if (this.isTrue(path, 'router.js')) {
          this._changeRouter(path)
        } else {
          void null
        }
      })
  }
  // 初始化
  init() {
    let indexPathNames = this.getRoutePathNames(this.getFiles('Index.vue'))
    // 遍历router mate
    let metas = this.getRouteMetas(this.getFiles('router.js'))
    this.pathNames = this.dealMetasToIndexPathNames(indexPathNames, metas)
    this.writeRouter(this.pathNames)
  }
  // 增加文件
  _add(_path) {
    if (this.isTrue(_path, 'Index.vue')) {
      let currentPathName = this.getCurrentRoutePathName(_path)
      try {
        let routerPath = _path.split('/')
        routerPath.pop()
        routerPath.push('router.js')
        routerPath = routerPath.join('/')
        fs.accessSync(routerPath)
        let meta = this.getRouteMetas(routerPath, false)
        currentPathName = {
          ...currentPathName,
          meta: meta.meta
        }
      } catch (error) {
        void null
      }
      this.pathNames = [...this.pathNames, currentPathName]
      this.writeRouter(this.pathNames)
    } else if (this.isTrue(_path, 'router.js')) {
      this.pathNames = this.dealMetaToIndexPathNames(this.pathNames, _path)
      this.writeRouter(this.pathNames)
    } else {
      void null
    }
  }
  // 删除文件
  _delete(_path) {
    if (this.isTrue(_path, 'Index.vue')) {
      let currentPathName = this.getCurrentRoutePathName(_path)
      this.pathNames = this.pathNames.filter(pathName => pathName.name != currentPathName['name'])
      this.writeRouter(this.pathNames)
    } else if (this.isTrue(_path, 'router.js')) {
      let meta = this.getRouteMetas(_path, false)
      this.pathNames = this.pathNames.map(pathName => {
        if (pathName.name == meta.name) {
          return {
            name: pathName.name,
            path: pathName.path
          }
        } else {
          return pathName
        }
      })
      this.writeRouter(this.pathNames)
    } else {
      void null
    }
  }
  // 每个文件中router改变
  _changeRouter(_path) {
    this.pathNames = this.dealMetaToIndexPathNames(this.pathNames, _path)
    this.writeRouter(this.pathNames)
  }
  // 
  // 写入router.js文件
  writeRouter(pathNames) {
    let routes = pathNames.map(pathName => this.addRoutes(pathName))
    let router = recursiveRoutes(this.options, routes) // 生成模板
    fs.writeFileSync(`${this.root}/src/.router.js`, router) // 需要写入内存
  }
  // 向main中注册router
  changeMain() {
    let content = this.getMain().toString(),
      mains = content.split('from'),
      index = mains.findIndex(main => main.indexOf('router') === -1 ? false : true)
    if (content.indexOf('@/.router.js') == -1) {
      if (index == -1) {
        // 不存在
        mains[0] = `import router from '@/.router.js'\n${mains[0]}`
        let key = mains.findIndex(main => main.indexOf('render') === -1 ? false : true)
        let els = mains[key].split('\n')
        let elKey = els.findIndex(main => main.indexOf('el') == -1 ? false : true)
        els.splice(elKey + 1, 0, "  router,")
        mains.splice(key, 1, els.join('\n'))
      } else {
        let router = mains[index + 1].split('\n')
        router.shift()
        router.unshift(` '@/.router.js'`)
        router = router.join('\n')
        mains.splice(index + 1, 1, router)
      }
      fs.writeFileSync(`${this.root}/src/main.js`, mains.join('from'))
    } else {
      void null
    }
  }
  // 添加路由
  addRoutes(value) {
    let route = {
      name: `${value.name}`,
      path: `/${value.path}/index`,
      componentPath: `@/page/${value.path}/Index.vue`,
      meta: value.meta || ""
    }
    return route
  }
  // 获取main.js文件内容
  getMain() {
    let entrys = Object.entries(this.compiler.options.entry),
      main = entrys[0][1].split('/')
    return fs.readFileSync(`${this.root}/src/${main[main.length-1]}`)
  }
  // 查找匹配路由文件
  getFiles(type) {
    return glob.sync(`${this.page}/**/${type}`)
  }
  // 匹配路由参数
  getRoutePathNames(values) {
    let reg = new RegExp(`${this.page}/(.+)/.+`, 'i')
    return values.map(item => {
      let _path = reg.exec(item)[1]
      let _name = _path.split('/').join('_')
      return {
        name: _name,
        path: _path
      }
    })
  }
  // 匹配路由meta额外参数
  getRouteMetas(value, status = true) {
    if (status) {
      return value.map(item => this.dealRoute(item))
    } else {
      return this.dealRoute(value)
    }
  }
  // 匹配当前路由参数
  getCurrentRoutePathName(value) {
    let reg = new RegExp(`${this.page}/(.+)/.+`, 'i')
    let _path = reg.exec(value)[1]
    let _name = _path.split('/').join('_')
    return {
      path: _path,
      name: _name
    }
  }
  // 查看当前符合的标准文件
  isTrue(_path, value) {
    return _path.indexOf(value) === -1 ? false : true
  }
  // 处理meta
  dealRoute(value) {
    let reg = new RegExp(`${this.page}/(.+)/.+`, 'i'),
      _name = reg.exec(value)[1].split('/').join('_')
    try {
      fs.accessSync(value)
      let _meta = fs.readFileSync(value).toString(),
        first = _meta.indexOf('{'),
        last = _meta.lastIndexOf('}')
      _meta = _meta.slice(first + 1, last).split('\n').join('').split(' ').join('')
      return {
        name: _name,
        meta: _meta
      }
    } catch (error) {
      return {
        name: _name,
        meta: ''
      }
    }
  }
  // 处理metas合并Index路由
  dealMetasToIndexPathNames(indexPathNames, metas) {
    return indexPathNames.map(indexPathName => {
      let meta = metas.find(meta => meta.name == indexPathName.name)
      if (meta) {
        return {
          ...indexPathName,
          meta: meta.meta
        }
      } else {
        return indexPathName
      }
    })
  }
  // 处理单个meta合并到Index路由
  dealMetaToIndexPathNames(indexPathNames, _path) {
    let meta = this.getRouteMetas(_path, false)
    return indexPathNames.map(pathName => {
      if (pathName.name == meta.name) {
        return {
          ...pathName,
          meta: meta.meta
        }
      } else {
        return pathName
      }
    })
  }
}

module.exports = CreateRouter