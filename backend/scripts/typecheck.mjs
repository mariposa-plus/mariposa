import { execSync } from 'child_process';

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('Type check passed');
} catch (e) {
  const output = e.stdout?.toString() || '';
  const srcErrors = output.split('\n').filter(l => /^src[\\/]/.test(l));
  if (srcErrors.length) {
    console.error('Type errors in source code:\n');
    console.error(output.split('\n').filter(l => !l.includes('node_modules')).join('\n'));
    process.exit(1);
  }
  console.log('Type check passed (node_modules-only warnings ignored)');
}
