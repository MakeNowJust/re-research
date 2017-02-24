#!/usr/bin/env node

/* eslint-disable no-console */

'use strict'

const {execSync} = require(`child_process`)
const util = require(`util`)

const Parser = require(`./src/parser`)
const appendDotStar = require(`./src/append-dot-star`)
const concat = require(`./src/util/generator-concat`)
const crossNFA = require(`./src/cross-nfa`)
const extractCondition = require(`./src/extract-condition`)
const negativeDFA = require(`./src/negative-dfa`)
const newSymbolFactory = require(`./src/util/new-symbol`)
const removeUnreachable = require(`./src/remove-unreachable`)
const reverseNFA = require(`./src/reverse-nfa`)
const runNFA = require(`./src/run-nfa`)
const toDFA = require(`./src/to-dfa`)
const toDFAForRemain = require(`./src/to-dfa-for-remain`)
const toDOT = require(`./src/to-dot`)
const toNFA = require(`./src/to-nfa`)

util.inspect.defaultOptions.depth = null

const dot = (name, graph) => {
  console.log(`create output/${name}.png`)
  execSync(`dot -Tpng -ooutput/${name}.png`, {input: toDOT(graph)})
}

const text = `helloworld`
const pattern = `.((?!h).)+(?<=world)`

console.log(`text:`, text)
console.log(`pattern:`, pattern)

const rawRoot = new Parser(pattern).parse()
const sigma = new Set(text)
const {root, look} = extractCondition(rawRoot)
const nfa = toNFA(Symbol(`main`), sigma, root)

const aheadNFAtmp = look.ahead.size > 0 && Array.from(look.ahead)
  .map(([name, {node, positive}]) => ({nfa: reverseNFA(toNFA(name, sigma, node)), positive}))
const behindNFAtmp = look.behind.size > 0 && Array.from(look.behind)
  .map(([name, {node, positive}]) => ({nfa: toNFA(name, sigma, node), positive}))

dot(`nfa`, nfa)
const dfa = toDFAForRemain(newSymbolFactory(), sigma, look, nfa)
dot(`dfa`, dfa)

const newSymbolAhead = newSymbolFactory()
const aheadNFA = aheadNFAtmp && aheadNFAtmp
  .map(({nfa, positive}) => positive ? appendDotStar(sigma, nfa) : removeUnreachable(sigma, negativeDFA(toDFA(appendDotStar(sigma, nfa)))))
  .reduce((cross, nfa) => removeUnreachable(sigma, crossNFA(newSymbolAhead, sigma, cross, nfa)))
const aheadDFA = aheadNFA ? toDFA(aheadNFA) : null
const newSymbolBehind = newSymbolFactory()
const behindNFA = behindNFAtmp && behindNFAtmp
  .map(({nfa, positive}) => positive ? appendDotStar(sigma, nfa) : removeUnreachable(sigma, negativeDFA(toDFA(appendDotStar(sigma, nfa)))))
  .reduce((cross, nfa) => removeUnreachable(sigma, crossNFA(newSymbolBehind, sigma, cross, nfa)))
const behindDFA = behindNFA ? toDFA(behindNFA) : null

if (aheadDFA) dot(`ahead`, aheadDFA)
if (behindDFA) dot(`behind`, behindDFA)

const input = text.split(``).concat(sigma.end)

const aheads = aheadDFA ? runNFA(input.concat().reverse(), aheadDFA).reverse() : []
const behinds = behindDFA ? runNFA(input, behindDFA) : []

const newInput = input.map((c, i) => dfa.newChar(c, new Set(concat(aheads[i], behinds[i]))))

const result = runNFA(newInput, dfa)
console.log(result.filter(s => s.size > 0).length > 0 ? `match` : `not match`)
