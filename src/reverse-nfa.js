'use strict'

const {EPSILON} = require(`./consts`)
const symbolDescription = require(`./util/symbol-description`)

const reverseNFA = ({name, delta: delta1, start: start1, finish: finish1}) => {
  const start = Symbol(`${symbolDescription(name)}#reverse`)
  const delta = new Map
  const defDelta = (from, value, to) => {
    if (!delta.has(from)) delta.set(from, new Map)
    const values = delta.get(from)
    if (!values.has(value)) values.set(value, new Set)
    values.get(value).add(to)
  }

  for (const [f] of finish1)
    defDelta(start, EPSILON, f)

  for (const [to, trans1] of delta1) {
    for (const [c, froms1] of trans1) {
      for (const from of froms1)
        defDelta(from, c, to)
    }
  }

  // NOTE: It losses real `finish` information, but no problem for my experience purpose.
  const finish = new Map([[start1, new Set([name])]])

  return {name, delta, start, finish}
}

module.exports = reverseNFA
