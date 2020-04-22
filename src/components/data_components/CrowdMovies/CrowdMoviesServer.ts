import store from '@/store/root.store';
import path from 'path';
import http from 'http';
import fs from 'fs';

let server: http.Server;

export function CreateCrowdMovieServer(port = 8989) {
    if (!server) {
        server = http.createServer((request, response) => {
            request.addListener('end', () => {
                const currentPath = (store.state as any).datasets.path;
                if (currentPath === undefined || request.url === undefined) {
                    response.writeHead(404).end('No data loaded.');
                    return;
                } else {
                    const fpath = path.join(currentPath, decodeURI(request.url));
                    fs.readFile(fpath, (err, data) => {
                        if (err) {
                            response.writeHead(404).end(JSON.stringify(err));
                            return;
                        }
                        response.writeHead(200).end(data);
                    });
                }
            }).resume();
        }).listen(port);
    }
}

export function ShutdownCrowdMovieServer() {
    if (server) {
        server.close();
    }
}
