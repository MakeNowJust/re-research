'use strict'

// `mapGetOrSetDefault` gets the value of *keys* against *map*.
// If *keys* is missing, sets *def* as *keys*' value then returns *def*.
const mapGetOrSetDefault = (map, def, ...keys) => keys.reduce((map, key, i) => {
  if (!map.has(key)) {
    map.set(key, i === keys.length - 1 ? def : new Map)
  }
  return map.get(key)
}, map)

module.exports = mapGetOrSetDefault
