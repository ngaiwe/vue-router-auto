const tab = '  '
const times = 2
const tabFirst = tab.repeat(times)
const tabChildren = tab.repeat(times + 1)

// 去除对象中的键值对
function deleteObjectKey(objs, keys = []) {
  let newObj = new Object(),
    objArrays = Object.entries(objs).filter(obj => keys.findIndex(key => key === obj[0]) === -1)
    objArrays.forEach(objArray => {
      newObj[objArray[0]] = objArray[1]
    }) 
    return newObj
}

module.exports = {
  deleteObjectKey,
  tabFirst,
  tabChildren 
}