PORT=5000

# Database Configuration
DB_USER=admin
DB_PASSWORD=test
DB_NAME=six-cities
DB_PORT=27017
DB_HOST=127.0.0.1

# Security and Authentication
JWT_SECRET=secret
SALT=secret

# File Storage
UPLOAD_DIRECTORY=uploads

To facilitate working on the project, Node.js and npm tools are used. All necessary configurations have been made. Make sure that the latest LTS release of Node.js is installed on your computer. The required version of Node.js is specified in the node field in the package.json file. Then, in the terminal, navigate to the project directory and run the following command once:

```bash
npm install
```


This command will start the process of installing the project dependencies from **npm**.

### Scripts

Several scripts are predefined in the `package.json`.

#### Compile the Project

```bash
npm run compile
```

Creates the `dist` directory and compiles the project.

#### Delete the Compiled Project

```bash
npm run clean
```


Deletes the `dist` directory. It is used before compilation.

#### Build the project

```bash
npm run build
```

Performs the project build: deletes the previously compiled project and recompiles it.

#### Check with Linter

```bash
npm run lint
```

Runs a static code analysis with the **ESLint** code linter.

The linter checks only the files inside the `src` directory.

**Note**, when running this command, errors are displayed in the terminal.

#### Run a TypeScript Module without Compilation

```bash
npm run ts -- <path>
```

The `ts-node` package allows you to run TypeScript code in Node.js without prior compilation. It is used only during development.

#### Run the project

```bash
npm start
```

During the project startup, the "Build Project" process will be executed, and the resulting code will be run.

## Project Structure

### Directory `src`

The source code of the project: components, modules, and so on. The structure of the `src` directory can be arbitrary.

### File `Readme.md`

Instructions on how to work with the educational repository.

### File `Contributing.md`

Guidelines and instructions for contributing to the educational repository.
