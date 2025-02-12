// In this file, you can do anything you need to do to bootstrap the dataserver.
// I would recommend having this be the entry point that calls into the express server,
// and then have a directory structure that fits the express standards of controllers
// routes, and data access.

import express, { Application, Request, Response } from "express";
import http from "http";
import portscanner from "portscanner";
import * as FileType from "file-type";
import { readFileContents,readDataBundle  } from "./DataLoader/DataLoader.lib";
import LoadData  from "./DataLoader/DataLoader";
import { Operation } from "./DataLoader/DataLoader.types";

const minSearchPort = 3000;
const maxSearchPort = 4000;

export class DataServer {
  private app: Application;
  private server: http.Server | null = null;
  private port: number | null = null;
  private currentFilename: string | null = null;

  constructor() {
    this.app = express();
    this.configureRoutes();
  }

  /**
   * Configure the Express server routes.
   */
  private configureRoutes() {
    this.app.use(express.json());
    this.app.use(express.text({ type: "*/*" }));
    //this.app.use(express.json());
    this.app.use((req: Request, res: Response, next: Function) => {
       // Set CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Request-Method", "*");
      res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
      res.setHeader("Access-Control-Allow-Headers", "*");
      next();
    });
    this.app.post("/api/load-file", async(req: Request, res: Response) => {
      try {
        //console.log(req)
        const { filename } = req.body;
        this.currentFilename = filename;
        console.log("File received:", filename);
        const data = await readDataBundle(filename);
        res.status(200).json(data);
      } catch (error) {
        console.error("Error receiving dataset:", error);
        res.status(500).json({ message: "Failed to receive dataset." });
      }
  });
  this.app.get("*/crowd_movies/*", async (req: Request, res: Response) =>{
    try{
    //console.log("request got",req)
    const url = decodeURI(req.url as string);
    const fpath = `${this.currentFilename}/${url}`;
    console.log("Resolved file path:", fpath)
    const buffer = await readFileContents(fpath);
    const fileType = await FileType.fileTypeFromBuffer(buffer);

    const size = buffer.length;
    const range = req.headers.range;

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
        res.writeHead(416, {
          "Content-Range": `bytes */${size}`,
        });
        return res.end();
      }

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": fileType?.mime || "application/octet-stream",
      });
      res.end(buffer.slice(start, end + 1));
    } else {
      console.log("Full content request for:", fpath);
      res.writeHead(200, { "Content-Type": fileType?.mime || "application/octet-stream" });
      res.end(buffer);
    }
  }catch (err) {
      console.error("Error in request handler:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  this.app.get('*/fetch-samples', async (req, res) => {
    try {
      // Extract any necessary parameters from the request, e.g., path, operations
      const { path, operations, debug } = req.query;
      // Call the LoadData function with the required arguments
      const data = await LoadData(path as string, JSON.parse(operations as string), debug === 'true');
      res.json(data);
    } catch (error) {
      console.error('Error in /fetch-data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });
  this.app.get("/load-usagedata/", async (req, res) => {
    try {
      // Extract query parameters from the request
      const { path, operations, debug } = req.query;
  
      if (!path || !operations) {
        return res.status(400).json({ error: "Missing required query parameters" });
      }
  
      // Decode and parse the query parameters
      const decodedPath = decodeURIComponent(path as string); // Decode the path
      const parsedOperations = typeof operations === "string" ? JSON.parse(decodeURIComponent(operations)) : operations;
      // Call your LoadData function
      const data = await LoadData(decodedPath, parsedOperations, debug === true);
  
      // Send the response as JSON
      res.json(data);
    } catch (error) {
      console.error("Error handling /load-usagedata request:", error);
      res.status(500).json({ error: "An error occurred while processing the request" });
    }
  });
  
  

  }

  /**
   * Find an available port and start the server.
   */
  public async start(): Promise<void> {
    if (this.server) {
      console.warn("DataServer is already running.");
      throw new Error("DataServer is already running.");
    }

    try {
      this.port = await portscanner.findAPortNotInUse(minSearchPort, maxSearchPort);
      this.server = this.app.listen(this.port, () => {
        console.log(`DataServer started on port ${this.port}`);
      });
    } catch (error) {
      console.error("Failed to start DataServer:", error);
      throw new Error("Failed to start DataServer.");
    }
  }

  /**
   * Shut down the server if it is running.
   */
  public async shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            console.error("Error shutting down DataServer:", err);
            return reject(err);
          }

          console.log("DataServer successfully shut down.");
          this.server = null;
          this.port = null;
          resolve();
        });
      } else {
        console.warn("Shutdown called, but DataServer is not running.");
        resolve();
      }
    });
  }

  /**
   * Check if the server is running.
   */
  public isServerRunning(): boolean {
    return !!this.server;
  }

  /**
   * Get the address of the running server.
   */
  public getAddress(): string {
    if (this.server && this.port) {
      return `http://localhost:${this.port}`;
    }
    return "Server not running.";
  }
  //public getfilepath(): string {
    //return this.currentFilename;
  //}
}



