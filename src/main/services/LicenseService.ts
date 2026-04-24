import type Database from 'better-sqlite3'
import { randomUUID, createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { getDatabase } from './database'

export const TEST_LICENSE_KEY = 'LUME-TEST-2026'

const SECRET_SALT = 'lume_secret_2026'

export interface AuthState {
  licenseKey: string | null
  isActivated: boolean
  instanceId: string | null
}

export interface ActivationResult {
  ok: boolean
  error?: string
}

// IOPlatformUUID is stable per physical Mac; copying the DB to another machine
// produces a different machineId → stored hash no longer verifies.
function readMachineId(): string {
  try {
    const out = execSync(
      "ioreg -rd1 -c IOPlatformExpertDevice | awk -F'\"' '/IOPlatformUUID/ {print $4}'",
      { encoding: 'utf-8' }
    ).trim()
    if (out) return out
  } catch {
    // fall through
  }
  return 'unknown-machine'
}

function computeValidationHash(licenseKey: string, machineId: string): string {
  return createHash('sha256').update(`${licenseKey}|${machineId}|${SECRET_SALT}`).digest('hex')
}

export class LicenseService {
  private db: Database.Database
  private machineId: string

  constructor() {
    this.db = getDatabase()
    this.machineId = readMachineId()

    const exists = this.db.prepare('SELECT 1 FROM auth WHERE id = 1').get()
    if (!exists) {
      this.db
        .prepare(
          'INSERT INTO auth (id, license_key, validation_hash, instance_id) VALUES (1, NULL, NULL, ?)'
        )
        .run(randomUUID())
    }
  }

  getAuth(): AuthState {
    const row = this.db
      .prepare(
        'SELECT license_key as licenseKey, validation_hash as validationHash, instance_id as instanceId FROM auth WHERE id = 1'
      )
      .get() as
      | { licenseKey: string | null; validationHash: string | null; instanceId: string | null }
      | undefined

    if (!row) return { licenseKey: null, isActivated: false, instanceId: null }

    const isActivated =
      !!row.licenseKey &&
      !!row.validationHash &&
      computeValidationHash(row.licenseKey, this.machineId) === row.validationHash

    return {
      licenseKey: row.licenseKey,
      isActivated,
      instanceId: row.instanceId
    }
  }

  isActivated(): boolean {
    return this.getAuth().isActivated
  }

  activate(key: string): ActivationResult {
    const trimmed = (key || '').trim()

    if (trimmed !== TEST_LICENSE_KEY) {
      return { ok: false, error: 'Invalid license key' }
    }

    const hash = computeValidationHash(trimmed, this.machineId)

    this.db
      .prepare('UPDATE auth SET license_key = ?, validation_hash = ? WHERE id = 1')
      .run(trimmed, hash)

    return { ok: true }
  }
}
