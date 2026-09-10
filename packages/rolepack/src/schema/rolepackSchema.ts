export const ROLEPACK_SCHEMA_V2 = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://aiemployee.example/schemas/rolepack.v2.schema.json",
  "title": "AI Employee RolePack v2 (500-role catalog compatible)",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema_version",
    "id",
    "role_key",
    "display_name",
    "department",
    "archetypes",
    "mission",
    "inputs",
    "outputs",
    "capabilities",
    "tools",
    "permissions",
    "autonomy",
    "risk",
    "approval_policy",
    "events",
    "workflow",
    "kpis",
    "acceptance_tests",
    "version",
    "lifecycle",
    "metadata"
  ],
  "properties": {
    "schema_version": { "type": "string" },
    "id": { "type": "integer", "minimum": 1 },
    "role_key": { "type": "string", "pattern": "^[a-z][a-z0-9_]{1,119}$" },
    "display_name": { "type": "string", "minLength": 2 },
    "department": { "type": "string" },
    "archetypes": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string", "enum": ["ANA", "MON", "EXE", "WRI", "REV", "PLN", "FOR", "COA", "SUP", "MAN"] }
    },
    "mission": { "type": "string", "minLength": 10 },
    "inputs": { "type": "array" },
    "outputs": { "type": "array" },
    "capabilities": { "type": "array" },
    "tools": {
      "type": "object",
      "required": ["required", "optional"],
      "properties": {
        "required": { "type": "array" },
        "optional": { "type": "array" }
      }
    },
    "permissions": { "type": "array" },
    "autonomy": {
      "type": "object",
      "required": ["default", "maximum"],
      "properties": {
        "default": { "type": "string" },
        "maximum": { "type": "string" }
      }
    },
    "risk": {
      "type": "object",
      "required": ["level", "controls"],
      "properties": {
        "level": { "type": "string" },
        "controls": { "type": "array" }
      }
    },
    "approval_policy": { "type": "string" },
    "events": {
      "type": "object",
      "required": ["triggers", "emits"],
      "properties": {
        "triggers": { "type": "array" },
        "emits": { "type": "array" }
      }
    },
    "workflow": {
      "type": "object",
      "required": ["primary"],
      "properties": {
        "primary": { "type": "string" }
      }
    },
    "kpis": { "type": "array" },
    "acceptance_tests": { "type": "array" },
    "version": { "type": "string" },
    "lifecycle": { "type": "string" },
    "metadata": { "type": "object" }
  }
};
