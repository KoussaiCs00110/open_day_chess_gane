import words from '../data/profanity.json' with { type: 'json' };
import { CONFIG } from '../config.js';
export const normalizeName = text => text.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').toLowerCase();
export function validateName(value) {
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name || [...name].length > CONFIG.maxName) return { valid: false, reason: 'nameRequired' };
  const normalized = normalizeName(name).replace(/[013457]/g, x => ({0:'o',1:'i',3:'e',4:'a',5:'s',7:'t'})[x]);
  const compact = normalized.replace(/[^a-z\u0600-\u06ff]/g, '');
  if (Object.values(words).flat().some(word => compact.includes(normalizeName(word)))) return { valid: false, reason: 'nameFiltered' };
  return { valid: true, name };
}
