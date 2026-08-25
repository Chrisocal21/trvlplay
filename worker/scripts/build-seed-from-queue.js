#!/usr/bin/env node
// Drains data/puzzle-queue.json into a dated seed-*.sql file, one row per
// calendar day, continuing right after the last date already claimed by an
// existing seed-*.sql file. Consumed entries are removed from the queue.
//
// This is the "add more puzzles to the queue" pipeline:
//   1. Append new puzzle objects to data/puzzle-queue.json (by hand, or have
//      Claude draft a batch — keep tier as 'k12' unless it's genuinely meant
//      to be a harder opt-in puzzle).
//   2. Run: node scripts/check-word-difficulty.js --queue   (sanity check)
//   3. Run: node scripts/build-seed-from-queue.js
//   4. Review the generated seed-<month>.sql, then load it:
//      wrangler d1 execute trvlplay-db --remote --file=seed-<month>.sql
//
// Usage:
//   node scripts/build-seed-from-queue.js
//   node scripts/build-seed-from-queue.js --start=2026-09-01
//   node scripts/build-seed-from-queue.js --tier=k12 --days=30

const fs = require('fs')
const path = require('path')

const WORKER_DIR = path.join(__dirname, '..')
const DATA_DIR = path.join(WORKER_DIR, 'data')
const QUEUE_PATH = path.join(DATA_DIR, 'puzzle-queue.json')

function parseArgs() {
  const args = {}
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--(\w+)=(.+)$/)
    if (m) args[m[1]] = m[2]
  }
  return args
}

// Finds the latest daily_date across every seed-*.sql file in worker/
function findLastSeededDate() {
  const seedFiles = fs.readdirSync(WORKER_DIR).filter(f => /^seed.*\.sql$/.test(f))
  let last = null
  const dateRe = /'(\d{4}-\d{2}-\d{2})'/g
  for (const f of seedFiles) {
    const text = fs.readFileSync(path.join(WORKER_DIR, f), 'utf8')
    let m
    while ((m = dateRe.exec(text))) {
      if (!last || m[1] > last) last = m[1]
    }
  }
  return last
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function monthName(dateStr) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }).toLowerCase()
}

function sqlEscape(str) {
  return str.replace(/'/g, "''")
}

function buildInsert(dailyDate, tier, groups) {
  const g = groups.map(grp => `  '${sqlEscape(grp.label)}', '${sqlEscape(JSON.stringify(grp.items))}'`)
  return `INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)\nVALUES (\n  '${dailyDate}', '${tier}',\n${g.join(',\n')}\n);`
}

function main() {
  const args = parseArgs()
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'))

  const startDate = args.start || addDays(findLastSeededDate() ?? new Date().toISOString().slice(0, 10), 1)
  const tierFilter = args.tier || null
  const maxDays = args.days ? parseInt(args.days, 10) : Infinity

  const eligible = queue.filter(p => !tierFilter || p.tier === tierFilter)
  const toConsume = eligible.slice(0, maxDays)

  if (toConsume.length === 0) {
    console.log('No matching entries in the queue. Nothing to build.')
    return
  }

  const inserts = []
  let date = startDate
  for (const entry of toConsume) {
    inserts.push(buildInsert(date, entry.tier, entry.groups))
    date = addDays(date, 1)
  }

  const outFile = args.out || path.join(WORKER_DIR, `seed-${monthName(startDate)}.sql`)
  const header = `-- TrvlPlay Seed -- ${monthName(startDate)} (generated from data/puzzle-queue.json)\n-- Run: wrangler d1 execute trvlplay-db --remote --file=${path.basename(outFile)}\n\n`
  const body = header + inserts.join('\n\n') + '\n'

  const existing = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') + '\n' : ''
  fs.writeFileSync(outFile, existing + body)

  // Remove consumed entries from the queue
  const consumedSet = new Set(toConsume)
  const remaining = queue.filter(p => !consumedSet.has(p))
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(remaining, null, 2) + '\n')

  console.log(`Wrote ${toConsume.length} puzzle(s) (${startDate} .. ${addDays(date, -1)}) to ${path.basename(outFile)}`)
  console.log(`${remaining.length} puzzle(s) left in the queue.`)
  console.log(`\nNext: review ${path.basename(outFile)}, then run:`)
  console.log(`  wrangler d1 execute trvlplay-db --remote --file=${path.basename(outFile)}`)
}

main()
