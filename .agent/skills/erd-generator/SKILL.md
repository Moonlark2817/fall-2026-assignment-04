---
name: erd-generator
description: Generates and validates Mermaid entity-relationship diagrams from domain requirements. Use this skill when asked to design an ERD, database data model, relational schema, or architecture diagram involving entities, attributes, keys, relationships, and cardinalities.
---

# ERD Generator

Generate a valid Mermaid entity-relationship diagram from the user's domain requirements and verify it using the local Mermaid CLI before presenting the result.

## Workflow

1. Parse the user's domain requirements.

2. Identify:
   - Entities
   - Attributes
   - Primary keys (PK)
   - Foreign keys (FK)
   - Relationships
   - Cardinalities

3. Resolve reasonable database design decisions from the user's requirements. Do not invent unnecessary entities or relationships.

4. Convert the resulting data model into valid Mermaid `erDiagram` syntax.

5. Write the Mermaid source directly to:

   `docs/architecture/schema.mmd`

6. Validate and render the ERD by executing the renderer from the repository root:

   `node .agent/skills/erd-generator/scripts/render_erd.js docs/architecture/schema.mmd`

7. Inspect the command output.

## Self-Correction Loop

If the renderer exits successfully and prints `SUCCESS`:

- Stop retrying.
- Confirm that `docs/architecture/erd.svg` was generated.
- Continue to the final response.

If the renderer exits with a non-zero status and prints `SYNTAX_ERROR`:

1. Read the Mermaid error trace.
2. Inspect `docs/architecture/schema.mmd`.
3. Correct the invalid Mermaid syntax.
4. Rewrite `docs/architecture/schema.mmd`.
5. Run the renderer again.

Retry this correction process up to 3 times.

Do not claim that the ERD was successfully validated unless the renderer exits with code 0 and prints `SUCCESS`.

If validation still fails after 3 retries, report the remaining error instead of claiming success.

## Mermaid ERD Rules

- Begin the diagram with `erDiagram`.
- Define each entity only once.
- Include primary keys using the `PK` marker.
- Include foreign keys using the `FK` marker.
- Use valid Mermaid ERD data types and attribute syntax.
- Use explicit relationship cardinalities.
- Use `||--o{` for one-to-many relationships when appropriate.
- Use `||--o|` for one-to-zero-or-one relationships when appropriate.
- Keep entity and attribute names consistent across definitions and relationships.
- Ensure foreign-key attributes correspond to the relationships shown in the diagram.

## Output Requirements

After successful validation:

1. Present the final raw Mermaid `erDiagram` block to the user.
2. State that the ERD passed local Mermaid validation.
3. Reference the Mermaid source path:

   `docs/architecture/schema.mmd`

4. Reference the generated SVG asset path:

   `docs/architecture/erd.svg`
