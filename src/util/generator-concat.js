'use strict'

// `concat` returns a new generator with the concatenation of *gens*.
function* concat(...gens) {
  for (const gen of gens) yield* gen
}

module.exports = concat
