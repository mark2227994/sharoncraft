const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const defaultHost = process.env.DEV_HOST || "127.0.0.1";
const defaultPort = Number.parseInt(process.env.DEV_PORT || "5500", 10);
const args = process.argv.slice(2);

let host = defaultHost;
let port = Number.isNaN(defaultPort) ? 5500 : defaultPort;
let shouldOpen = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === "--open") {
    shouldOpen = true;
    continue;
  }

  if (arg === "--host" && args[index + 1]) {
    host = args[index + 1];
    index += 1;
    continue;
  }

  if (arg === "--port" && args[index + 1]) {
    const parsedPort = Number.parseInt(args[index + 1], 10);
    if (!Number.isNaN(parsedPort)) {
      port = parsedPort;
    }
    index += 1;
  }
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".toml": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

function openBrowser(url) {
  const platform = process.platform;

  if (platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    return;
  }

  if (platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    return;
  }

  spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
}

function sendResponse(response, statusCode, body, contentType) {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  response.end(body);
}

function resolveRequestPath(requestUrl) {
  const normalizedUrl = new URL(requestUrl, `http://${host}:${port}`);
  const pathname = decodeURIComponent(normalizedUrl.pathname);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(rootDir, `.${requestedPath}`);
  const relativePath = path.relative(rootDir, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url || "/");

  if (!filePath) {
    sendResponse(response, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (!statError && stats.isDirectory()) {
      const directoryIndex = path.join(filePath, "index.html");
      fs.readFile(directoryIndex, (directoryError, directoryData) => {
        if (directoryError) {
          sendResponse(response, 404, "Not found", "text/plain; charset=utf-8");
          return;
        }

        sendResponse(response, 200, directoryData, mimeTypes[".html"]);
      });
      return;
    }

    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        const notFoundPage = path.join(rootDir, "404.html");
        fs.readFile(notFoundPage, (notFoundError, notFoundData) => {
          if (notFoundError) {
            sendResponse(response, 404, "Not found", "text/plain; charset=utf-8");
            return;
          }

          sendResponse(response, 404, notFoundData, mimeTypes[".html"]);
        });
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[extension] || "application/octet-stream";
      sendResponse(response, 200, data, contentType);
    });
  });
});

server.listen(port, host, () => {
  const url = `http://${host}:${port}`;
  console.log(`SharonCraft dev server running at ${url}`);
  console.log("Serving files from repo root.");

  if (shouldOpen) {
    openBrowser(url);
  }
});
