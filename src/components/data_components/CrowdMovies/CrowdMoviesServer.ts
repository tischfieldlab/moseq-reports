import store from '@/store/root.store';
import path from 'path';
import http from 'http';
import fs from 'fs';
import {readFileContents} from '@/components/Core/DataLoader/DataLoader.lib';

let server: http.Server;

export function CreateCrowdMovieServer(port = 8989) {
    if (!server) {
        server = http.createServer((request, response) => {
            request.addListener('end', () => {
                const fpath = store.getters[`datasets/resolve`](decodeURI(request.url as string));
                readFileContents(fpath)
                    .then((data) => {
                        response.writeHead(200).end(data);
                    })
                    .catch((err) => {
                        response.writeHead(404).end(JSON.stringify(err));
                    });
            }).resume();
        }).listen(port);
    }
}

export function ShutdownCrowdMovieServer() {
    if (server) {
        server.close();
    }
}
