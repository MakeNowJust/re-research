'use strict'

const symbolDescription = require(`./util/symbol-description`)
const deltaFactory = require(`./util/delta`)

const appendEnd = (sigma, {name, delta, start, finish: finish1}) => {
  const f = Symbol(`${symbolDescription(name)}#end`)
  const end = Symbol(`end`)
  sigma.add(end)
  sigma.end = end

  const {defDelta} = deltaFactory(delta)

  for (const [f1] of finish1) {
    for (const c of sigma)
      defDelta(f1, c, f)
  }

  const finish = new Map([[f, new Set([name])]])

  return {name, delta, start, finish}
}

module.exports = appendEnd
