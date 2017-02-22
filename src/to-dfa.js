'use strict'

const {EPSILON} = require(`./consts`)
const symbolListKeyFactory = require(`./util/symbol-list-key`)
const symbolDescription = require(`./util/symbol-description`)

// `toDFA` converts from NFA to DFA.
const toDFA = (newSymbol, {name, delta: delta1, start: start1, finish: finish1}) => {
  const symbolListKey = symbolListKeyFactory(newSymbol, symbolDescription(name))

  const delta = new Map
  const finish = new Map

  const follow = (q, visited, done, trans) => {
    if (visited.has(q)) return
    visited.add(q)

    if (finish1.has(q))
      for (const name of finish1.get(q)) done.add(name)


    for (const [c, tos1] of delta1.get(q) || new Map) {
      if (c === EPSILON) {
        for (const to of tos1) follow(to, visited, done, trans)
      } else {
        if (!trans.has(c)) trans.set(c, new Set)
        const tos = trans.get(c)
        for (const to of tos1) tos.add(to)
      }
    }
  }

  const cons = qs => {
    const key = symbolListKey(qs)
    if (delta.has(key)) return key
    const trans = new Map
    delta.set(key, trans)

    const visited = new Set
    const done = new Set
    for (const q of qs) follow(q, visited, done, trans)

    if (done.size > 0) finish.set(key, done)

    for (const [c, tos] of trans) trans.set(c, new Set([cons(tos)]))

    return key
  }

  const start = cons(new Set([start1]))
  return {name, delta, start, finish}
}

module.exports = toDFA
