## Prerequisites
In order to run this repository locally, you must ensure you have the correct versions of both Node and yarn installed on your machine.

The supported versions are:

- Node: `v16.17.0`
- NPM: `v8.15.0`
- Yarn: `v1.22.19`

If you need to install yarn, please run 

```sh
npm install -g yarn
```

## Commands
To interact with the application, please refer to the `package.json` file to see the full list of supported scripts. Below is a list of the useful commands that you will run and build the app on your machine.

### Installing the Dependencies
```sh
yarn
```

### Running the App
To run the application, type the following command:

```sh
yarn dev
```

### Build the App
To build the application, type the following command:

```sh
yarn build
```

## File Structure
The application is split into two major parts:

1. The main process
2. The renderer process

### Main Process
The main process is in charge of plumbing the window events to the OS layer, bootstrapping the application, and handling the application lifecycle.

Additionally, the main process is responsible for bootstrapping the Chromium window and subsequent renderer processes that the UI is written in.

It is located in the `src/electron` folder. For more information on the structure of the main process, please refer to the [wiki](https://www.electronjs.org/docs/latest).

### Renderer Process
The renderer process is responsible for rendering the UI and handling the interaction with the application. This is where the Vue application is located and all subsequent UI logic is handled.

It is located in the `src/renderer` folder. For more information on the structure of the renderer process, please refer to the [wiki](https://www.electronjs.org/docs/latest).