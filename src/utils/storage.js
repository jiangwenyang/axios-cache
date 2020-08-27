// 设置缓存
function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// 获取缓存
function getStorage(key) {
  let data = localStorage.getItem(key)
  return JSON.parse(data)
}

// 移除缓存
function removeStorage(key) {
  localStorage.removeItem(key)
}

// 清除本地缓存
function clearStorage() {
  localStorage.clear()
}

export { clearStorage, setStorage, getStorage, removeStorage }
