import store from "@render/store/root.store";
import http, { createServer } from "http";
import { readFileContents } from "@render/components/Core/DataLoader/DataLoader.lib";
import * as FileType from "file-type";
import portscanner from "portscanner";

const minSearchPort = 3000;
const maxSearchPort = 4000;
let server: http.Server | undefined;

export function GetAddress() {
  if (!server) {
    console.warn("GetAddress called, but server is undefined.");
    return "Server not running.";
  }

  const addr = server.address() as { address: string; port: number };
  console.log("GetAddress in DataServer:", addr);
  return `localhost:${addr.port}`;
}

export async function CreateServer() {
  console.log("CreateServer invoked");
  if (server !== undefined) {
    console.log("Server already exists:", GetAddress());
    return Promise.reject(`Server is already running on '${GetAddress()}'`);
  }

  console.log("Searching for an available port...");
  return portscanner.findAPortNotInUse(minSearchPort, maxSearchPort)
    .then((port) => {
      console.log("Port found:", port);
      return new Promise<void>((resolve, reject) => {
        console.log("Creating server...");

        server = http.createServer((request, response) => {
          console.log("Request received:", request.url);

          // Set CORS headers
          response.setHeader("Access-Control-Allow-Origin", "*");
          response.setHeader("Access-Control-Request-Method", "*");
          response.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
          response.setHeader("Access-Control-Allow-Headers", "*");

          if (request.method === "OPTIONS") {
            response.writeHead(200);
            response.end();
            return;
          }

          request.addListener("end", async () => {
            try {
              const fpath = store.getters[`datasets/resolve`](decodeURI(request.url as string)) as string;
              console.log("Resolved file path:", fpath);

              const buffer = await readFileContents(fpath);
              const fileType = await FileType.fileTypeFromBuffer(buffer);

              const size = buffer.length;
              const range = request.headers.range;

              if (range) {
                console.log("Range request received:", range);
                const [rStart, rEnd] = range.replace(/bytes=/, "").split("-");
                let start = parseInt(rStart, 10);
                let end = rEnd ? parseInt(rEnd, 10) : size - 1;

                if (!isNaN(start) && isNaN(end)) {
                  start = start;
                  end = size - 1;
                }
                if (isNaN(start) && !isNaN(end)) {
                  start = size - end;
                  end = size - 1;
                }

                if (start >= size || end >= size) {
                  console.warn("Range not satisfiable:", { start, end, size });
                  response.writeHead(416, {
                    "Content-Range": `bytes */${size}`,
                  });
                  return response.end();
                }

                response.writeHead(206, {
                  "Content-Range": `bytes ${start}-${end}/${size}`,
                  "Accept-Ranges": "bytes",
                  "Content-Length": end - start + 1,
                  "Content-Type": fileType?.mime || "application/octet-stream",
                });
                response.end(buffer.slice(start, end + 1));
              } else {
                console.log("Full content request for:", fpath);
                response.writeHead(200, { "Content-Type": fileType?.mime || "application/octet-stream" });
                response.end(buffer);
              }
            } catch (err) {
              console.error("Error in request handler:", err);
              response.writeHead(404).end(JSON.stringify(err));
            }
          }).resume();
        });

        server.on("listening", () => {
          console.log("Server is now listening on port", port);
          resolve();
        });

        server.on("error", (err) => {
          console.error("Server encountered an error:", err);
          reject(err);
        });

        server.listen(port);
      });
    })
    .catch((err) => {
      console.error("Error finding available port or initializing server:", err);
    });
}

export function ShutdownServer() {
  if (server) {
    console.log("Shutting down server...");
    server.close(() => {
      console.log("Server successfully shut down.");
      server = undefined;
    });
  } else {
    console.warn("ShutdownServer called, but no server is running.");
  }
}
