import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parse, compileScript, compileTemplate } from 'vue/compiler-sfc';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = path.join(root, 'skills/xingyun-sdk');
const baseline = JSON.parse(fs.readFileSync(path.join(skill, 'references/sdk-baseline.json'), 'utf8'));
const installed = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/@xmov/avatar/package.json'), 'utf8'));
assert.equal(installed.version, baseline.version, 'Install the pinned SDK using npm ci --ignore-scripts');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
// Files live below this repository so TypeScript resolves the real npm package,
// without paths mappings, ambient SDK stubs, or imports of private SDK files.
const temp = fs.mkdtempSync(path.join(root, 'node_modules/.xingyun-doc-check-'));
const sources = new Map();
let count = 0;
let htmlScripts = 0;
try {
  fs.writeFileSync(path.join(temp, 'package.json'), '{"type":"module"}');
  for (const file of walk(skill).filter((file) => file.endsWith('.md'))) {
    const text = fs.readFileSync(file, 'utf8');
    const marked = [...text.matchAll(/<!-- validate:(ts|tsx|vue|html) -->\s*```([^\n]*)\n([\s\S]*?)```/g)];
    assert.equal(marked.length, [...text.matchAll(/<!-- validate:/g)].length, `Malformed validation marker: ${file}`);
    for (const match of marked) {
      const kind = match[1];
      assert.equal(match[2].trim(), kind, `Marker/fence mismatch: ${file}`);
      let code = match[3];
      const label = `${path.relative(root, file)}:${text.slice(0, match.index).split('\n').length}`;
      count++;
      if (kind === 'html') {
        for (const script of code.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
          if (/\bsrc=/.test(script[1])) continue;
          assert(!/\bimport\s.*from\s*["']@xmov\//.test(script[2]), `Browser HTML contains a bare npm import: ${label}`);
          new vm.Script(script[2], { filename: label }); // Compile only; never execute SDK connections.
          htmlScripts++;
        }
        continue;
      }
      if (kind === 'vue') {
        const { descriptor, errors } = parse(code, { filename: `${count}.vue` });
        assert.deepEqual(errors, [], label);
        const compiled = compileScript(descriptor, { id: `doc-${count}` });
        const template = compileTemplate({ source: descriptor.template?.content ?? '', filename: `${count}.vue`, id: `doc-${count}` });
        assert.deepEqual(template.errors, [], label);
        code = compiled.content;
      }
      const target = path.join(temp, `example-${count}.${kind === 'tsx' ? 'tsx' : 'ts'}`);
      fs.writeFileSync(target, code);
      sources.set(target, label);
    }
  }
  assert(count >= 8, 'Expected the maintained integration and API examples to be marked');
  assert(htmlScripts > 0, 'Expected at least one browser script');
  const negative = path.join(root, 'tests/sdk-contract.mts');
  for (const [mode, moduleResolution] of [['Bundler', ts.ModuleResolutionKind.Bundler], ['Node', ts.ModuleResolutionKind.Node10]]) {
    const program = ts.createProgram([...sources.keys(), negative], {
      strict: true, noEmit: true, skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      types: ['react'],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length) {
      for (const diagnostic of diagnostics) {
        const filename = diagnostic.file?.fileName;
        const line = diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line;
        console.error(`${mode}: ${sources.get(filename) ?? filename ?? 'config'} (snippet line ${(line ?? 0) + 1}) TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
      }
      process.exitCode = 1;
    } else {
      console.log(`PASS (${mode}): ${count} marked examples (${htmlScripts} browser scripts), Vue/React compilation, and 2.4.1 public API regression checks`);
    }
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
