---
name: kysely-migration-generator
description: Generates type-safe Kysely database migrations from Mermaid ERD files. Use this skill when asked to translate an ERD, Mermaid data model, database diagram, or architecture schema into a Kysely TypeScript migration.
---

# Kysely Migration Generator

Translate a validated Mermaid ERD from `docs/architecture/` into a production-ready Kysely migration.

## Workflow

1. Read the requested Mermaid ERD, normally:

   `docs/architecture/schema.mmd`

2. Inspect existing migration files in:

   `src/db/migrations/`

   before generating a new migration.

3. Determine which tables already exist from previous migrations.

4. Parse the Mermaid ERD and identify:
   - Entities
   - Attributes
   - Primary keys
   - Foreign keys
   - Relationships
   - Cardinalities
   - Dependency order

5. Convert entity names to snake_case table names.

   Examples:
   - `USERS` -> `users`
   - `BOOK_AUTHORS` -> `book_authors`

6. Generate a new TypeScript migration at:

   `src/db/migrations/<timestamp>_<migration_name>.ts`

7. Validate the generated migration by running:

   `npm run build`

8. If the build fails because of the generated migration, inspect the TypeScript error, correct the migration, and run the build again.

## Existing Tables

Never recreate a table that is already created by an earlier migration.

If an ERD includes an existing entity for relationship context, preserve that table and only reference it from newly created tables.

For this repository, inspect `001_initial_schema.ts` before generation. The `users` table already exists and must not be recreated by a downstream migration.

## Entity to Table Mapping

Convert Mermaid entity names to lowercase snake_case table names.

Examples:

- `USERS` -> `users`
- `BOOKS` -> `books`
- `BOOK_AUTHORS` -> `book_authors`

Create tables in dependency order so referenced parent tables exist before child tables.

## Primary Keys

Map integer primary-key attributes to auto-generating PostgreSQL IDs.

For an ERD attribute such as:

`int id PK`

prefer:

`.addColumn('id', 'serial', (col) => col.primaryKey())`

Do not generate multiple auto-incrementing primary keys for one table.

## Foreign Keys

Map Mermaid attributes marked `FK` to Kysely foreign-key columns.

For integer foreign keys, use an integer column and reference the appropriate parent table and column.

Example:

`.addColumn('user_id', 'integer', (col) =>
  col.notNull().references('users.id').onDelete('cascade')
)`

Unless the ERD explicitly indicates that the relationship is optional, foreign-key columns representing required relationships should be `notNull()`.

Use `.onDelete('cascade')` for generated foreign-key references.

## Data Type Mapping

Use appropriate PostgreSQL/Kysely types.

Typical mappings:

- Mermaid `int` PK -> `serial`
- Mermaid `int` -> `integer`
- Mermaid `string` -> `varchar(255)`
- Mermaid `date` -> `date`
- Mermaid `timestamp` -> `timestamp`
- Mermaid `boolean` -> `boolean`

Preserve nullable attributes when the domain model marks them as optional.

## Cardinality Rules

### One-to-Many

For Mermaid relationships using:

`||--o{`

place the foreign key on the many side.

Example:

`GENRES ||--o{ BOOKS`

means `books` contains a `genre_id` foreign key referencing `genres.id`.

### One-to-One / Zero-or-One

For Mermaid relationships using:

`||--o|`

place the foreign key on the dependent table and add a unique constraint to enforce the one-to-one relationship.

Example:

`USERS ||--o| BORROWERS`

means `borrowers.user_id` references `users.id` and must be unique.

### Many-to-Many

Represent many-to-many relationships using the junction entity defined by the ERD.

For example, `BOOK_AUTHORS` should contain foreign keys referencing both `books` and `authors`.

When appropriate, add a unique constraint across the pair of foreign keys to prevent duplicate associations.

## Migration Structure

Every generated migration must import Kysely as needed and export both:

`up(db: Kysely<any>): Promise<void>`

and:

`down(db: Kysely<any>): Promise<void>`

The `up` function must create new tables in dependency order.

The `down` function must drop only the tables created by this migration and must drop them in reverse dependency order.

Never drop a pre-existing table such as `users` from the generated migration's `down` function.

## Output Requirements

After generating the migration:

1. State the generated migration file path.
2. Summarize the tables created.
3. Identify any existing tables that were intentionally preserved.
4. Report whether `npm run build` succeeds.
5. Do not claim successful database execution unless the migration has actually been executed successfully.
