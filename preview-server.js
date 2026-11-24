const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const { join } = require("node:path");

const host = "127.0.0.1";
const port = Number(process.argv[2] ?? 5500);
const assets = new Map([
    ["/site-navigation.js", "text/javascript"],
    ["/site-navigation.css", "text/css"],
]);

const server = createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { Allow: "GET, HEAD" }).end();
        return;
    }

    const { pathname, search } = new URL(request.url, "http://localhost");
    const contentType = assets.get(pathname) ?? "text/html";
    const route = pathname.replace(/\/$/, "").replace(/\.html$/, "");
    const filename = assets.has(pathname) ? pathname.slice(1) : (route.slice(1) || "index") + ".html";

    if (!assets.has(pathname) && !/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*(?:\.html|\/)?$/.test(pathname)) {
        response.writeHead(404).end("Page not found");
        return;
    }

    let content;
    try {
        content = await readFile(join(__dirname, filename));
    } catch (error) {
        const status = error.code === "ENOENT" || error.code === "EISDIR" ? 404 : 500;
        response.writeHead(status).end(status === 404 ? "Page not found" : "Could not read page");
        return;
    }

    const canonical = route === "/index" ? "/" : route || "/";
    if (!assets.has(pathname) && pathname !== canonical) {
        response.writeHead(308, { Location: canonical + search }).end();
        return;
    }

    response.writeHead(200, {
        "Content-Type": contentType + "; charset=utf-8",
        "Cache-Control": "no-cache",
    });
    response.end(request.method === "HEAD" ? undefined : content);
});

server.on("error", error => {
    if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is in use. Stop Live Server before running this preview on the same port.`);
    } else {
        console.error(error.message);
    }
    process.exitCode = 1;
});

server.listen(port, host, () => {
    console.log(`Pedestal preview running at http://${host}:${server.address().port}/`);
});
