'use strict'

// `collectSigma` collects characters in *node* to a set called by sigma.
const collectSigma = (node, sigma = new Set) => {
  switch (node.type) {
    case `alt`:
    case `concat`:
      node.nodes.forEach(node => collectSigma(node, sigma))
      break
    case `positive-look-ahead`:
    case `negative-look-ahead`:
    case `positive-look-behind`:
    case `negative-look-behind`:
    case `optional`:
    case `many`:
    case `some`:
      collectSigma(node.node, sigma)
      break
    case `empty`:
    case `any`:
      // ignore
      break
    case `char`:
      sigma.add(node.value)
      break
  }

  return sigma
}

module.exports = collectSigma
