const DEFAULT_MODULE_VISIBILITY = {
  hero: true,
  stats: true,
  cases: true,
  activities: true,
  designers: true,
  capabilities: true,
  reviews: true,
  standards: true,
  contact: true,
};

const REQUIRED_MODULES = ['hero', 'contact'];

function normalizeModuleVisibility(raw) {
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
  }
  if (!parsed || typeof parsed !== 'object') parsed = {};

  const out = { ...DEFAULT_MODULE_VISIBILITY, ...parsed };
  for (const id of REQUIRED_MODULES) {
    out[id] = true;
  }
  return out;
}

function serializeModuleVisibility(raw) {
  return JSON.stringify(normalizeModuleVisibility(raw));
}

module.exports = {
  DEFAULT_MODULE_VISIBILITY,
  REQUIRED_MODULES,
  normalizeModuleVisibility,
  serializeModuleVisibility,
};
