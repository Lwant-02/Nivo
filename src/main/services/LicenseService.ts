import type Database from 'better-sqlite3'
import { randomUUID, createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { getDatabase } from './database'

export const TEST_LICENSE_KEY = 'NIVO-TEST-2026'

const SECRET_SALT = 'nivo_secret_2026'

// export const TRIAL_DURATION_MS = 48 * 60 * 60 * 1000 // 48 hours
export const TRIAL_DURATION_MS = 2 * 60 * 1000 // 2 minutes

export interface AuthState {
  licenseKey: string | null
  isActivated: boolean
  instanceId: string | null
  trialStartedAt: number | null
  trialEndsAt: number | null
  isInTrial: boolean
  hasAccess: boolean
}

export interface ActivationResult {
  ok: boolean
  error?: string
}

export interface TrialResult {
  ok: boolean
  error?: string
  trialStartedAt?: number
  trialEndsAt?: number
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
          'INSERT INTO auth (id, license_key, validation_hash, instance_id, trial_started_at) VALUES (1, NULL, NULL, ?, NULL)'
        )
        .run(randomUUID())
    }
  }

  getAuth(): AuthState {
    const row = this.db
      .prepare(
        'SELECT license_key as licenseKey, validation_hash as validationHash, instance_id as instanceId, trial_started_at as trialStartedAt FROM auth WHERE id = 1'
      )
      .get() as
      | {
          licenseKey: string | null
          validationHash: string | null
          instanceId: string | null
          trialStartedAt: number | null
        }
      | undefined

    if (!row) {
      return {
        licenseKey: null,
        isActivated: false,
        instanceId: null,
        trialStartedAt: null,
        trialEndsAt: null,
        isInTrial: false,
        hasAccess: false
      }
    }

    const isActivated =
      !!row.licenseKey &&
      !!row.validationHash &&
      computeValidationHash(row.licenseKey, this.machineId) === row.validationHash

    const trialStartedAt = row.trialStartedAt ?? null
    const trialEndsAt = trialStartedAt !== null ? trialStartedAt + TRIAL_DURATION_MS : null
    const isInTrial = !isActivated && trialEndsAt !== null && Date.now() < trialEndsAt

    return {
      licenseKey: row.licenseKey,
      isActivated,
      instanceId: row.instanceId,
      trialStartedAt,
      trialEndsAt,
      isInTrial,
      hasAccess: isActivated || isInTrial
    }
  }

  isActivated(): boolean {
    return this.getAuth().isActivated
  }

  hasAccess(): boolean {
    return this.getAuth().hasAccess
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

  startTrial(): TrialResult {
    const current = this.getAuth()

    if (current.isActivated) {
      return { ok: false, error: 'License already activated' }
    }

    if (current.trialStartedAt !== null) {
      // Idempotent — return the existing trial window instead of resetting it.
      return {
        ok: true,
        trialStartedAt: current.trialStartedAt,
        trialEndsAt: current.trialEndsAt!
      }
    }

    const startedAt = Date.now()
    this.db.prepare('UPDATE auth SET trial_started_at = ? WHERE id = 1').run(startedAt)

    return {
      ok: true,
      trialStartedAt: startedAt,
      trialEndsAt: startedAt + TRIAL_DURATION_MS
    }
  }
}
