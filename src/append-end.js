'use strict'

const symbolDescription = require(`./util/symbol-description`)

const appendEnd = (sigma, {name, delta, start, finish: finish1}) => {
  const f = Symbol(`${symbolDescription(name)}#end`)
  const end = Symbol(`end`)
  sigma.add(end)
  sigma.end = end

  const defDelta = (from, value, to) => {
    if (!delta.has(from)) delta.set(from, new Map)
    const values = delta.get(from)
    if (!values.has(value)) values.set(value, new Set)
    values.get(value).add(to)
  }
  for (const [f1] of finish1) {
    for (const c of sigma)
      defDelta(f1, c, f)
  }

  const finish = new Map([[f, new Set([name])]])

  return {name, delta, start, finish}
}

module.exports = appendEnd
