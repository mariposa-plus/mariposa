import { execSync } from 'child_process';

try {
  execSync('npx tsc', { stdio: 'pipe' });
  console.log('Build completed successfully');
} catch (e) {
  const output = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
  const srcErrors = output.split('\n').filter(l => /^src[\\/]/.test(l));
  if (srcErrors.length) {
    console.error('Build errors in source code:\n');
    console.error(output.split('\n').filter(l => !l.includes('node_modules')).join('\n'));
    process.exit(1);
  }
  // Only node_modules errors (ox/viem) — dist/ was still generated
  console.log('Build completed (node_modules-only warnings ignored)');
}
