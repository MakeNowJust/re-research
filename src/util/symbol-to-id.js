'use strict'

const symbolToIdFactory = (id = 0) => {
  const symbolToIdMap = new Map
  return symbol => {
    if (!symbolToIdMap.has(symbol)) symbolToIdMap.set(symbol, id++)
    return symbolToIdMap.get(symbol)
  }
}

module.exports = symbolToIdFactory
