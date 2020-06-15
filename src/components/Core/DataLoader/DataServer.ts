import store from '@/store/root.store';
import http from 'http';
import {readFileContents} from '@/components/Core/DataLoader/DataLoader.lib';
import FileType from 'file-type';

let server: http.Server|undefined;

export function CreateServer(port = 8989) {
    if (server === undefined) {
        server = http.createServer((request, response) => {
            request.addListener('end', async () => {
                const fpath = store.getters[`datasets/resolve`](decodeURI(request.url as string)) as string;
                const buffer = await readFileContents(fpath);
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
    }
}

export function ShutdownServer() {
    if (server) {
        server.close();
        server = undefined;
    }
}