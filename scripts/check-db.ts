import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const dbPath = join(homedir(), 'Library', 'Application Support', 'nivo', 'nivo.db')

if (!existsSync(dbPath)) {
  console.log(`No database at ${dbPath}`)
  console.log('Launch the app once (or activate a license) to initialize it.')
  process.exit(0)
}

// Shell out to the macOS sqlite3 CLI to avoid the better-sqlite3 native-module
// ABI mismatch (the binary is built against Electron's Node, not host Node).
function query(sql: string): unknown[] {
  const out = execFileSync('sqlite3', ['-json', dbPath, sql], { encoding: 'utf-8' }).trim()
  return out ? JSON.parse(out) : []
}

console.log(`\nDB: ${dbPath}\n`)

console.log('auth')
console.table(query('SELECT * FROM auth'))

console.log('\nsettings')
console.table(query('SELECT * FROM settings'))
