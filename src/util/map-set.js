'use strict'

// `mapSet` sets the *value* to *keys* against *map*.
const mapSet = (map, keys, value) => {
  for (const key of keys.slice(-2)) {
    if (!map.has(key)) map.set(key, new Map)
    map = map.get(key)
  }
  map.set(keys[keys.length - 1], value)
}

module.exports = mapSet
