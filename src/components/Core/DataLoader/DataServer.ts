import store from '@/store/root.store';
import http from 'http';
import {readFileContents} from '@/components/Core/DataLoader/DataLoader.lib';
import FileType from 'file-type';
import portscanner from 'portscanner';

const minSearchPort = 3000;
const maxSearchPort = 4000;
let server: http.Server|undefined;

export function GetAddress() {
    const addr = server?.address() as {address: string, port: number};
    return `localhost:${addr.port}`;
}

export async function CreateServer() {
    if (server === undefined) {
        await portscanner.findAPortNotInUse(minSearchPort, maxSearchPort).then((port) => {
            server = http.createServer((request, response) => {
                // Set CORS headers
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Access-Control-Request-Method', '*');
                response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
                response.setHeader('Access-Control-Allow-Headers', '*');
                if (request.method === 'OPTIONS') {
                    response.writeHead(200);
                    response.end();
                    return;
                }
                request.addListener('end', async () => {
                    const fpath = store.getters[`datasets/resolve`](decodeURI(request.url as string)) as string;
                    let buffer;
                    try {
                        buffer = await readFileContents(fpath);
                    } catch (err) {
                        return response.writeHead(404).end(JSON.stringify(err));
                    }
                    const fileType = await FileType.fromBuffer(buffer);
                    const size = buffer.length;
                    const range = request.headers.range;

                    if (range !== undefined) {
                        /** Extracting Start and End value from Range Header */
                        const [rStart, rEnd] = range.replace(/bytes=/, '').split('-');
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

                        // Handle unavailable range request
                        if (start >= size || end >= size) {
                            // Return the 416 Range Not Satisfiable.
                            response.writeHead(416, {
                                'Content-Range': `bytes */${size}`
                            });
                            return response.end();
                        }

                        /** Sending Partial Content With HTTP Code 206 */
                        response.writeHead(206, {
                            'Content-Range': `bytes ${start}-${end}/${size}`,
                            'Accept-Ranges': 'bytes',
                            'Content-Length': end - start + 1,
                            'Content-Type': fileType?.mime
                        });

                        response.end(buffer.slice(start, end+1))

                    } else {
                        readFileContents(fpath)
                            .then((data) => {
                                response.writeHead(200).end(data);
                            })
                            .catch((err) => {
                                response.writeHead(404).end(JSON.stringify(err));
                            });
                    }
                }).resume();
            }).listen(port);
        });
    }
}

export function ShutdownServer() {
    if (server) {
        server.close();
        server = undefined;
    }
}
