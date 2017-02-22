'use strict'

const {EPSILON} = require(`./consts`)
const symbolDescription = require(`./util/symbol-description`)
const symbolToIdFactory = require(`./util/symbol-to-id`)

// toDOT convert NFA to DOT format graph.
const toDOT = ({delta, start, finish}, symbolToId = symbolToIdFactory()) => {
  const nodes = []
  const edges = []

  const visited = new Set()

  const step = set => {
    const next = new Set()

    for (const from of set) {
      if (visited.has(from)) continue
      visited.add(from)

      for (const [value, tos] of delta.get(from) || []) {
        for (const to of tos) {
          const label = value === EPSILON ? `ε` :
            typeof value === `symbol` ? symbolDescription(value) : `'${value}'`
          edges.push(`${JSON.stringify(symbolToId(from))} -> ${JSON.stringify(symbolToId(to))} [label=${JSON.stringify(label)}];`)
          next.add(to)
        }
      }
    }

    if (next.size !== 0) step(next)
  }

  step(new Set([start]))
  step(new Set(delta.keys())) // for unreachable edges from start node

  nodes.push(`${JSON.stringify(symbolToId(start))} [style=filled, fillcolor=yellow];`)
  for (const [f, done] of finish)
    nodes.push(`${JSON.stringify(symbolToId(f))} [shape=doublecircle, label=${JSON.stringify(`${symbolToId(f)}\n${Array.from(done).map(symbolDescription).join(`,`)}`)}];`)

  const dot = `
digraph automaton {
  rankdir = LR;
  ${nodes.join(`\n  `)}
  ${edges.join(`\n  `)}
}`.slice(1)

  return dot
}

module.exports = toDOT
