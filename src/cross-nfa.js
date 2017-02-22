'use strict'

const {EPSILON} = require(`./consts`)
const symbolListKeyFactory = require(`./util/symbol-list-key`)
const symbolDescription = require(`./util/symbol-description`)
const concat = require(`./util/generator-concat`)

const crossNFA = (newSymbol, sigma, nfa1, nfa2) => {
  const {name: name1, delta: delta1, start: start1, finish: finish1} = nfa1
  const {name: name2, delta: delta2, start: start2, finish: finish2} = nfa2

  const description = `${symbolDescription(name1)}*${symbolDescription(name2)}`
  const name = Symbol(description)

  const symbolListKey = symbolListKeyFactory(newSymbol, description)
  const fail1 = newSymbol(`fail`)
  const fail2 = newSymbol(`fail`)

  const qSet1 = new Set(concat(delta1.keys(), finish1.keys(), [fail1]))
  const qSet2 = new Set(concat(delta2.keys(), finish2.keys(), [fail2]))

  const start = symbolListKey([start1, start2])

  const finish = new Map
  for (const [f1, done] of finish1) {
    for (const q2 of qSet2) {
      const f = symbolListKey([f1, q2])
      finish.set(f, new Set(done))
    }
  }
  for (const q1 of qSet1) {
    for (const [f2, done] of finish2) {
      const f = symbolListKey([q1, f2])
      if (!finish.has(f)) finish.set(f, new Set)
      for (const name of done) finish.get(f).add(name)
    }
  }

  const delta = new Map
  const defDelta = (from, c, tos1, tos2) => {
    if (!tos1 && !tos2) return

    const tos = []
    for (const to1 of tos1 || [fail1]) {
      for (const to2 of tos2 || [fail2])
        tos.push(symbolListKey([to1, to2]))

    }
    delta.get(from).set(c, tos)
  }

  for (const from1 of qSet1) {
    for (const from2 of qSet2) {
      const trans1 = delta1.get(from1) || new Map
      const trans2 = delta2.get(from2) || new Map

      const from = symbolListKey([from1, from2])
      delta.set(from, new Map)
      for (const c of sigma) defDelta(from, c, trans1.get(c), trans2.get(c))
      defDelta(from, EPSILON, trans1.get(EPSILON), trans2.get(EPSILON))
    }
  }

  return {name, delta, start, finish}
}

module.exports = crossNFA
