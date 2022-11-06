// In this file, you can do anything you need to do to bootstrap the dataserver.
// I would recommend having this be the entry point that calls into the express server,
// and then have a directory structure that fits the express standards of controllers
// routes, and data access.

export class DataServer {
  private server: any; // Should be the express server when you implement it.

  constructor() {
    // This is where you would bootstrap and configure the express server.
  }

  public init() {
    console.log("DataServer init");
  }

  public shutdown() {
    console.log("DataServer shutdown");
  }
}
