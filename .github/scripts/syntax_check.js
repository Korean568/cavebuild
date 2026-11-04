// 문법만 검사하고 실행하지 않음 (new vm.Script · new Function 은 컴파일만 함)
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(process.argv[2], 'utf8');
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m, n = 0, bad = 0, all = '';
while ((m = re.exec(html))) {
  n++;
  try { new vm.Script(m[1]); } catch (e) { bad++; console.log('BAD script', n, e.message); }
  if (m[1].length > 10000) all += m[1] + '\n';
}
try { new Function('CB', fs.readFileSync(process.argv[3], 'utf8')); } catch (e) { bad++; console.log('BAD mod', e.message); }
if (process.argv[4]) fs.writeFileSync(process.argv[4], all);
if (bad) process.exit(1);
console.log('OK', n, 'scripts');
