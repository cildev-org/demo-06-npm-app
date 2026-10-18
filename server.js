// Lab app of the npm scenarios: POST /extract unpacks an uploaded zip into
// /data/uploads with adm-zip's extractAllTo (CVE-2018-1002204, zip-slip,
// before 0.4.11). adm-zip is require()d directly but, in j-transitive, is
// hoisted in under a parent; /version reports the resolved one.
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");
const admVersion = require("adm-zip/package.json").version;

const DEST = "/data/uploads";
fs.mkdirSync(DEST, { recursive: true });

function body(req, cb) {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => cb(Buffer.concat(chunks)));
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/version") {
    res.end(admVersion);
    return;
  }
  if (u.pathname === "/extract" && req.method === "POST") {
    body(req, (buf) => {
      const tmp = path.join(os.tmpdir(), "up-" + Date.now() + ".zip");
      fs.writeFileSync(tmp, buf);
      try {
        new AdmZip(tmp).extractAllTo(DEST, true); // zip-slip sink
        res.statusCode = 200;
        res.end("ok");
      } catch (e) {
        res.statusCode = 400;
        res.end("err: " + e.message);
      } finally {
        try {
          fs.unlinkSync(tmp);
        } catch (_) {}
      }
    });
    return;
  }
  if (u.pathname === "/file") {
    const name = u.searchParams.get("name") || "";
    if (name.includes("..")) {
      // the HTTP layer is safe; only a zip entry can escape DEST
      res.statusCode = 400;
      res.end("bad");
      return;
    }
    try {
      res.end(fs.readFileSync(path.join("/data", name)));
    } catch (e) {
      res.statusCode = 404;
      res.end("missing");
    }
    return;
  }
  res.statusCode = 404;
  res.end("no");
});
server.listen(8080, () => console.log("up"));
