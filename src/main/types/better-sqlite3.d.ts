declare module 'better-sqlite3' {
  namespace Database {
    interface Statement {
      run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint }
      get(...params: unknown[]): unknown
      all(...params: unknown[]): unknown[]
    }

    interface Database {
      prepare(source: string): Statement
      exec(source: string): this
      pragma(source: string, options?: { simple?: boolean }): unknown
      close(): void
    }
  }

  interface DatabaseConstructor {
    new (filename: string, options?: Record<string, unknown>): Database.Database
    (filename: string, options?: Record<string, unknown>): Database.Database
  }

  const Database: DatabaseConstructor
  export = Database
}
