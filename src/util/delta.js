'use strict'

const deltaFactory = (delta = new Map) => {
  const defDelta = (from, value, to) => {
    if (!delta.has(from)) delta.set(from, new Map)
    const values = delta.get(from)
    if (!values.has(value)) values.set(value, new Set)
    values.get(value).add(to)
  }

  return {delta, defDelta}
}

module.exports = deltaFactory
