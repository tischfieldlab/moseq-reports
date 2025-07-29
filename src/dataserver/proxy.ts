import { fork, ChildProcess } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';



export class DataServerProxy {
    private static instance: DataServerProxy;

    private child: ChildProcess | null = null;
    private address: string | null = null;

    private constructor() { }

    public static getInstance(): DataServerProxy {
        if (!DataServerProxy.instance) {
            DataServerProxy.instance = new DataServerProxy();
        }
        return DataServerProxy.instance;
    }

    public async start() {
        return new Promise<void>((resolve, reject) => {
            const dataserver_path = join(dirname(fileURLToPath(import.meta.url)), "dataserver.js");
            this.child = fork(dataserver_path);
            this.child.once('message', (msg: any) => {
                if (msg.type === 'address') {
                    this.address = msg.address;
                    resolve();
                }
            });
            this.child.once('error', (err) => {
                reject(err);
            });
            this.child.on('exit', (code) => {
                this.child = null;
                this.address = null;
            });
            this.child.send({ type: 'start' });
        });
    }
    public async shutdown() {
        return new Promise<void>((resolve, reject) => {
            if (this.child) {
                this.child.once('message', (msg: any) => {
                    if (msg.type === 'shutdown-complete') {
                        this.child = null;
                        this.address = null;
                        resolve();
                    }
                });
                this.child.once('error', (err) => {
                    reject(err);
                });
            } else {
                resolve();
            }
            this.child?.send({ type: 'shutdown' });
        });
    }
    public isServerRunning(): boolean {
        return this.child !== null && !this.child.killed;
    }
    public getAddress(): string | null {
        return this.address;
    }
}