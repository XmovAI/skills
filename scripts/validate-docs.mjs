import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = path.join(root, 'skills/xingyun-sdk');
const read = (file) => fs.readFileSync(file, 'utf8');
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const entry = read(path.join(skill, 'SKILL.md'));
assert.match(entry, /^---\nname: xingyun-sdk\ndescription: .+\n/);
const indexed = [...entry.matchAll(/`((?:e2esdk-docs|sdk-docs)\/[^`]+\.md)`/g)].map((match) => match[1]);
assert(indexed.length > 0, 'The skill must index its bundled documents');
for (const file of indexed) assert(fs.statSync(path.join(skill, file)).isFile(), `Missing indexed document: ${file}`);

let links = 0;
for (const file of [...walk(skill).filter((file) => file.endsWith('.md')), path.join(root, 'README.md'), path.join(root, 'AGENTS.md')]) {
  const source = read(file).replace(/```[^\n]*\n[\s\S]*?```/g, '');
  for (const match of source.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))\)/g)) {
    const target = match[1] ?? match[2];
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    assert(!/^(?:file:|\/)/.test(target), `Non-portable link in ${file}: ${target}`);
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target.split('#')[0]));
    assert(fs.existsSync(resolved), `Broken link in ${file}: ${target}`);
    links++;
  }
}

const manifests = tracked.filter((file) => file.endsWith('/plugin.json') || ['plugin.json', 'gemini-extension.json'].includes(file));
for (const file of manifests) {
  const manifest = JSON.parse(read(path.join(root, file)));
  assert.equal(manifest.name, 'xingyun-skills', file);
  assert.equal(manifest.skills, './skills/', file);
  assert(fs.statSync(path.resolve(root, manifest.skills)).isDirectory());
}
const marketplace = JSON.parse(read(path.join(root, '.agents/plugins/marketplace.json')));
assert.equal(marketplace.name, 'xingyun-skills');
assert(marketplace.plugins.some((plugin) => plugin.name === 'xingyun-skills' && plugin.source.source === 'local' && plugin.source.path === './'));
const pkg = JSON.parse(read(path.join(root, 'package.json')));
console.log(`PASS: ${new Set(indexed).size} indexed documents, ${links} local links, ${manifests.length} plugin manifests + Codex marketplace`);

const baseIndex = process.argv.indexOf('--baseline');
if (baseIndex !== -1) {
  const ref = process.argv[baseIndex + 1];
  assert(ref && !ref.startsWith('-'), 'Provide a Git baseline ref');
  const commit = execFileSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], { cwd: root, encoding: 'utf8' }).trim();
  const before = (file) => execFileSync('git', ['show', `${commit}:${file}`], { cwd: root, encoding: 'utf8' });
  const installationFiles = [...manifests, '.agents/plugins/marketplace.json', '.opencode/INSTALL.md'];
  for (const file of installationFiles) assert.equal(read(path.join(root, file)), before(file), `Installation entry changed: ${file}`);
  const installation = (text) => text.slice(text.indexOf('## 安装指南'), text.indexOf('## 许可'));
  assert.equal(installation(read(path.join(root, 'README.md'))), installation(before('README.md')), 'README installation instructions changed');
  const oldPackage = JSON.parse(before('package.json'));
  for (const [key, value] of Object.entries(oldPackage)) {
    if (!['scripts', 'devDependencies'].includes(key)) assert.deepEqual(pkg[key], value, `Package identity changed: ${key}`);
  }
  console.log(`PASS: ${installationFiles.length} installation files and README installation section unchanged from ${ref}`);
}
