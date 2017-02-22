'use strict'

// extractCondition extracts conditions (i.e. look-ahead/behind) from *root* node.
//
// If a condition is nested then throws an error, because nested look-ahead/behind is not supported.
//
// NOTE: This function changes *root* properties' value.
const extractCondition = root => {
  const id = {ahead: 0, behind: 0}
  const newSym = type => Symbol(`${type}#${id[type]++}`)

  const look = {ahead: new Map, behind: new Map}

  const loop = (node, inCondition) => {
    switch (node.type) {
      case `alt`:
      case `concat`:
        return {
          type: node.type,
          nodes: node.nodes.map(node => loop(node, inCondition))
        }
      case `optional`:
      case `many`:
      case `some`:
        return {
          type: node.type,
          node: loop(node.node, inCondition)
        }
      case `empty`:
      case `any`:
      case `char`:
        // ignore
        return node

      case `positive-look-ahead`:
      case `negative-look-ahead`:
      case `positive-look-behind`:
      case `negative-look-behind`: {
        if (inCondition)
          throw new Error(`nested look-ahead/behind is not supported`)

        const [prediction, , somewhere] = node.type.split(`-`)
        const value = newSym(somewhere)

        look[somewhere].set(value, {
          positive: prediction === `positive`,
          node: loop(node.node, true)
        })

        return {type: `char`, value}
      }
    }
  }


  return {root: loop(root, false), look}
}

module.exports = extractCondition
