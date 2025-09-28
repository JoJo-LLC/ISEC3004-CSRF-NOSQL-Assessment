// user.js
// Helper utilities for sanitising incoming user objects and detecting forbidden Mongo keys.
// Save this file as: nosql-demo/3-register/user.js

/**
 * Return a new object containing only allowed fields.
 * - Accepts strings or numbers (coerces numbers to strings for username/password)
 * - Ignores other types (arrays, objects, functions)
 * - If `raw` is not an object returns null
 *
 * @param {Object} raw
 * @param {Array<string>} allowed
 * @returns {Object|null}
 */
function sanitizeFields(raw = {}, allowed = ['username', 'password']) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const out = {};
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(raw, key)) continue;
    const val = raw[key];

    // Accept strings and numbers; coerce numbers -> string.
    if (typeof val === 'string') {
      out[key] = val;
    } else if (typeof val === 'number') {
      out[key] = String(val);
    }
    // deliberately ignore arrays/objects/functions to avoid accidental injection
  }

  // If no allowed fields present, return null to indicate nothing valid found
  return Object.keys(out).length ? out : null;
}

/**
 * Recursively checks whether an object (or nested object) contains forbidden keys.
 * Forbidden keys:
 *  - startsWith '$'
 *  - contains a dot '.'
 *
 * Protects against prototype pollution and iterates safely.
 *
 * @param {*} obj
 * @returns {boolean} true if forbidden key found
 */
function hasForbiddenKeys(obj) {
  // primitives can't contain keys
  if (obj === null || typeof obj !== 'object') return false;

  // handle arrays: check each element recursively
  if (Array.isArray(obj)) {
    for (const el of obj) {
      if (hasForbiddenKeys(el)) return true;
    }
    return false;
  }

  // plain object
  for (const k of Object.keys(obj)) {
    if (typeof k === 'string' && (k.startsWith('$') || k.includes('.'))) return true;

    const v = obj[k];
    // avoid recursing into objects that are not plain objects (like Dates) — still check them
    if (v && typeof v === 'object') {
      if (hasForbiddenKeys(v)) return true;
    }
  }
  return false;
}

/**
 * Deeply produce a "safe copy" of an object that strips forbidden keys.
 * - Removes properties whose key starts with '$' or contains '.'
 * - Recurses into nested objects and arrays
 * - Returns a new object/array (does not mutate the original)
 *
 * Use this only when you want to accept structured input but ensure no operators slip through.
 *
 * @param {*} input
 * @returns {*} sanitized copy
 */
function deepStripForbidden(input) {
  if (input === null || typeof input !== 'object') return input;

  if (Array.isArray(input)) {
    return input.map(deepStripForbidden);
  }

  const out = {};
  for (const k of Object.keys(input)) {
    if (typeof k === 'string' && (k.startsWith('$') || k.includes('.'))) {
      // skip forbidden key
      continue;
    }
    const v = input[k];
    out[k] = deepStripForbidden(v);
  }
  return out;
}

module.exports = {
  sanitizeFields,
  hasForbiddenKeys,
  deepStripForbidden,
};