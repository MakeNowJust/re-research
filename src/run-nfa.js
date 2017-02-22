'use strict'

const {EPSILON} = require(`./consts`)
const mapGet = require(`./util/map-get`)

// runNFA runs NFA matching.
const runNFA = (string, {delta, start, finish}) => {
  const step = (q, offset, nexts) => {
    for (const q2 of mapGet(delta, q, string[offset]) || [])
      nexts.push({q: q2, offset: offset + 1})
    for (const q2 of mapGet(delta, q, EPSILON) || [])
      nexts.push({q: q2, offset})
  }

  const result = []
  let threads = [{q: start, offset: 0}]
  while (threads.length > 0) {
    const nexts = []
    for (const {q, offset} of threads) {
      result[offset] = result[offset] || new Set
      if (finish.has(q))
        for (const name of finish.get(q)) result[offset].add(name)
      step(q, offset, nexts)
    }
    threads = nexts
  }

  return result
}

module.exports = runNFA
