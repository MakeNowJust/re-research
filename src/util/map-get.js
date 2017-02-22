'use strict'

// `mapGet` gets the value of *keys* against *map*.
const mapGet = (map, ...keys) => keys.reduce((map, key) => map && map.get(key), map)

module.exports = mapGet
