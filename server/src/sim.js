import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = process.env.CLIENT_SRC || path.join(here, '..', '..', 'client');

const stub = () => new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === 'length' ? 0 : (k === 'width' || k === 'height') ? 100 : stub(), set: () => true, apply: () => stub(), construct: () => stub() });
const rd = f => fs.readFileSync(path.join(CLIENT_DIR, f), 'utf8').replace(/<\/?script>/g, '').replace(/<\/body><\/html>/g, '');

export function createSim() {
  const sb = { console, Math, JSON, Date, Set, Map, Array, Object, Number, String, Float32Array, Uint8Array, Int16Array, Uint16Array, Uint32Array, Int32Array, Float64Array, parseInt, parseFloat, isFinite, isNaN,
    document: stub(), localStorage: { getItem: () => null, setItem() {} }, Image: function () { return stub() }, Audio: function () { return stub() },
    requestAnimationFrame() {}, setInterval() {}, setTimeout() {}, clearTimeout() {}, addEventListener() {}, navigator: {}, location: { protocol: 'http:', host: 'x', hostname: 'x' },
    innerWidth: 400, innerHeight: 800, devicePixelRatio: 2, performance: { now: () => 0 }, fetch: () => Promise.reject(new Error('no')), WebSocket: function () {}, AudioContext: undefined };
  sb.window = sb; vm.createContext(sb);
  const src = ['b.js', 'c.js', 'd.js', 'f.js', 'x.js', 'n.js', 's.js'].map(rd).join('\n');
  vm.runInContext(src, sb, { filename: 'game.js' });
  vm.runInContext(fs.readFileSync(path.join(here, 'glue.vm.js'), 'utf8'), sb, { filename: 'glue.js' });
  const info = vm.runInContext('SRV.init()', sb);
  const run = c => vm.runInContext(c, sb);
  const SRV = run('SRV');
  return {
    info, SRV, run,
    world: () => JSON.parse(JSON.stringify(SRV.world())),
    add: (id, name) => SRV.add(id, name),
    remove: id => SRV.remove(id),
    step: dt => SRV.step(dt),
    hit: (p, id, d) => SRV.hit(p, id, d),
    fx: (p, id, sp, d) => SRV.fx(p, id, sp, d),
    snapshot: p => JSON.parse(JSON.stringify(SRV.snapshot(p))),
    drain: () => JSON.parse(JSON.stringify(SRV.drain())),
  };
}
