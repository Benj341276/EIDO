const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo for changes
config.watchFolders = [workspaceRoot];

// Allow Metro to resolve modules from the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Required for pnpm monorepo + symlinked packages
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Prefer browser-compatible builds to avoid import.meta in non-module scripts
// (fixes Supabase/isows import.meta SyntaxError on web)
config.resolver.conditionNames = ['require', 'default', 'browser'];

module.exports = config;
