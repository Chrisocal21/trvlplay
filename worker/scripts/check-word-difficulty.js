#!/usr/bin/env node
// Flags puzzle words that fall outside the common-word list, and suggests a
// vocabulary tier (k12 / college / expert) for each puzzle based on how many
// words are flagged. This is a heuristic aid for a human reviewer, not a
// hard gate — proper nouns and names not yet in known-proper-nouns.json
// will show up as false positives; add real ones there as you find them.
//
// Usage:
//   node scripts/check-word-difficulty.js                 (scans every seed-*.sql file)
//   node scripts/check-word-difficulty.js --file=seed-august.sql
//   node scripts/check-word-difficulty.js --queue          (checks data/puzzle-queue.json)

const fs = require('fs')
const path = require('path')

const WORKER_DIR = path.join(__dirname, '..')
const DATA_DIR = path.join(WORKER_DIR, 'data')

const commonWords = new Set(JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'common-words.json'), 'utf8')))
const properNouns = new Set(JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'known-proper-nouns.json'), 'utf8')))

function stems(word) {
  const forms = [word]
  if (word.endsWith('ies') && word.length > 4) forms.push(word.slice(0, -3) + 'y')
  if (word.endsWith('es') && word.length > 3) forms.push(word.slice(0, -2))
  if (word.endsWith('s') && word.length > 3) forms.push(word.slice(0, -1))
  if (word.endsWith('ing') && word.length > 5) forms.push(word.slice(0, -3))
  if (word.endsWith('ed') && word.length > 4) forms.push(word.slice(0, -2))
  return forms
}

function isKnown(token) {
  if (/^\d+$/.test(token)) return true
  return stems(token).some(f => commonWords.has(f) || properNouns.has(f))
}

// Returns { flagged: string[], totalTokens: number } for one puzzle item like "RUBBER BAND"
function checkItem(item) {
  const tokens = item.toLowerCase().split(/[\s-]+/).filter(Boolean)
  const flagged = tokens.filter(t => !isKnown(t))
  return { flagged, totalTokens: tokens.length }
}

function suggestTier(flaggedCount, totalCount) {
  if (flaggedCount === 0) return 'k12'
  const ratio = flaggedCount / totalCount
  if (ratio <= 0.15) return 'college'
  return 'expert'
}

function checkPuzzle(puzzle) {
  const allItems = puzzle.groups.flatMap(g => g.items)
  let flaggedCount = 0
  let totalTokens = 0
  const flaggedWords = []
  for (const item of allItems) {
    const { flagged, totalTokens: n } = checkItem(item)
    totalTokens += n
    if (flagged.length) {
      flaggedCount += flagged.length
      flaggedWords.push({ item, flagged })
    }
  }
  return { suggestedTier: suggestTier(flaggedCount, totalTokens), flaggedWords, totalTokens }
}

// --- Parsing puzzles out of a seed-*.sql file ---
function parsePuzzlesFromSql(sqlText) {
  const puzzles = []
  const insertRe = /VALUES\s*\(\s*('([^']*)'|date\('now'[^)]*\)),\s*'(\w+)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\s*\)/g
  let m
  while ((m = insertRe.exec(sqlText))) {
    const dailyDate = m[2] ?? 'today'
    const difficulty = m[3]
    const groups = [
      { label: m[4], items: JSON.parse(m[5]) },
      { label: m[6], items: JSON.parse(m[7]) },
      { label: m[8], items: JSON.parse(m[9]) },
      { label: m[10], items: JSON.parse(m[11]) },
    ]
    puzzles.push({ dailyDate, difficulty, groups })
  }
  return puzzles
}

function main() {
  const args = process.argv.slice(2)
  const fileArg = args.find(a => a.startsWith('--file='))
  const useQueue = args.includes('--queue')

  let puzzles = []
  let sourceLabel = ''

  if (useQueue) {
    const queuePath = path.join(DATA_DIR, 'puzzle-queue.json')
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'))
    puzzles = queue.map(p => ({ dailyDate: `queue:${p.tier}`, difficulty: p.tier, groups: p.groups }))
    sourceLabel = 'data/puzzle-queue.json'
  } else if (fileArg) {
    const file = fileArg.split('=')[1]
    const filePath = path.isAbsolute(file) ? file : path.join(WORKER_DIR, file)
    puzzles = parsePuzzlesFromSql(fs.readFileSync(filePath, 'utf8'))
    sourceLabel = path.basename(filePath)
  } else {
    const seedFiles = fs.readdirSync(WORKER_DIR).filter(f => /^seed.*\.sql$/.test(f))
    for (const f of seedFiles) {
      puzzles.push(...parsePuzzlesFromSql(fs.readFileSync(path.join(WORKER_DIR, f), 'utf8')).map(p => ({ ...p, file: f })))
    }
    sourceLabel = `${seedFiles.length} seed file(s)`
  }

  console.log(`Checked ${puzzles.length} puzzle(s) from ${sourceLabel}\n`)

  let flaggedPuzzleCount = 0
  const mismatches = []

  for (const puzzle of puzzles) {
    const { suggestedTier, flaggedWords } = checkPuzzle(puzzle)
    const label = puzzle.file ? `${puzzle.file} ${puzzle.dailyDate}` : puzzle.dailyDate
    if (flaggedWords.length > 0) {
      flaggedPuzzleCount++
      console.log(`[${label}] tagged '${puzzle.difficulty}' -> suggested '${suggestedTier}'`)
      for (const { item, flagged } of flaggedWords) {
        console.log(`  "${item}" — unrecognized: ${flagged.join(', ')}`)
      }
      console.log('')
    }
    if (puzzle.difficulty === 'k12' && suggestedTier !== 'k12') {
      mismatches.push(label)
    }
  }

  console.log(`${flaggedPuzzleCount} of ${puzzles.length} puzzle(s) have at least one word not in the common-word list.`)
  if (mismatches.length) {
    console.log(`\nWARNING: these are tagged 'k12' but contain words the checker doesn't recognize as common — review them:`)
    mismatches.forEach(m => console.log(`  - ${m}`))
  }
  console.log(`\nIf a flagged word is actually a well-known name/place/thing (e.g. a superhero,`)
  console.log(`planet, or board game), add it to data/known-proper-nouns.json instead of rewriting the puzzle.`)
}

main()
