# moseq-reports
### Interactive interrogation of Moseq models.
In short, moseq reports exists to democratize moseq data. Computational biologists often produce data which is difficult to parse without the proper tools or context making, increasing barriers to access for others to simply pick up and use. Moseq reports allows wet-lab researchers to easily understand moseq models without having to reference outside sources or learn programming languages and manage complex software environments. This program reports data in a form which can be quickly understood by researchers while also providing a set of robust tools to reformat that data in such a way that would be most beneficial to their research.



[![Build Moseq-Reports](https://github.com/tischfieldlab/moseq-reports/actions/workflows/build.yaml/badge.svg)](https://github.com/tischfieldlab/moseq-reports/actions/workflows/build.yaml)
[![Build Moseq-Reports](https://github.com/tischfieldlab/moseq-reports/actions/workflows/build.yaml/badge.svg)](https://github.com/tischfieldlab/moseq-reports/actions/workflows/build.yaml)
![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/tischfieldlab/moseq-reports/latest/total)
![Static Badge](https://img.shields.io/badge/https%3A%2F%2Ftischfieldlab.github.io%2Fmoseq-reports%2F?style=flat&label=moseq-reports%20docs)
[![GitHub stars](https://img.shields.io/github/stars/tischfieldlab/moseq-reports?color=fa6470)](https://github.com/tischfieldlab/moseq-reports)



## Features

📦 Out of the box - no environment setup, no wrangling of dependencies  
💪 Easy, no-code, GUI interface for visualizing your moseq data  
🎯 Export publication-quality renderings of your visualizations  
🌱 Over 15 pre-built, customizable, visualizations to choose from  
🔩 Feel the power of interactivity during exploratory data analysis  


## Quick Setup for end-users

Download and install the [latest release](https://github.com/tischfieldlab/moseq-reports/releases).

Consult the [documentation](https://tischfieldlab.github.io/moseq-reports/).

Have a problem or found a bug? Please [post an issue](https://github.com/tischfieldlab/moseq-reports/issues).

## Quick Setup for Development

### Prerequisites
In order to run this repository locally, you must ensure you have the correct versions of both Node and yarn installed on your machine.

The supported versions are:

- Node: `22.14.0`
- NPM: `v10.9.2`
- Yarn: `v1.22.22`

If you need to install yarn, please run 

```sh
npm install -g yarn
```

To clone and setup the project for development:
```sh
# clone the project
git clone https://github.com/tischfieldlab/moseq-reports.git

# enter the project directory
cd moseq-reports

# install dependency
yarn

# develop
yarn dev
```
### Commands
To interact with the application, please refer to the `package.json` file to see the full list of supported scripts. Below is a list of the useful commands that you will run and build the app on your machine.

#### Installing the Dependencies
```sh
yarn
```

#### Running the App for Development
To run the application for development, type the following command:

```sh
yarn dev
```

#### Build the App for production
To build the application, type the following command:

```sh
yarn build
```

#### Running the Docs for Development
To run the docs for development, type the following command:

```sh
yarn docs:dev
```

#### Build the App
To build the docs for production, type the following command:

```sh
yarn docs:build
```

