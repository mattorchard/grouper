const http = require("http");

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "", baseUrl);
  const title = url.searchParams.get("title");
  if (!title) {
    return res.writeHead(url.pathname === "/" ? 201 : 404).end();
  }
  return res
    .writeHead(200)
    .end(`<head><title>${title}</title></head> <body>Hello World</body>`);
});

const hostname = "127.0.0.1";
const port = 3000;
const baseUrl = `http://${hostname}:${port}/`;

server.listen(port, hostname, () =>
  console.log(`Server running at ${baseUrl}`),
);
