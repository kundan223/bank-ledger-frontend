// Run the real TypeScript client in Node without changing its browser interface.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
module.exports = function loadApi(fetchImplementation) {
  const storage = new Map();
  const events = [];
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const exports = {};
    modules.set(file, exports);
    const compiled = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(compiled, {
      exports, require: name => load(name.replace('@/', '') + '.ts'),
      fetch: fetchImplementation, Response, Headers, Event,
      window: { dispatchEvent: event => events.push(event.type) },
      localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    }, { filename: file });
    return exports;
  }
  return { api: load('lib/api.ts'), money: load('lib/money.ts'), storage, events };
};
