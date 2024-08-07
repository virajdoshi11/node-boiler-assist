#!/usr/bin/env node

// add webpack
import ejs from 'ejs';
import { exec, execSync } from 'node:child_process'
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
const argv = yargs(hideBin(process.argv));
const cwd = process.cwd();

import { createFile, createFolder, installPackages } from './utils.js';

// const usage = "\nUsage: create-node-project <lang_name> sentence or words to be translated";
// const options = argv
// .usage(usage)
// .option("l", {alias: "languages", describe: "List all languages supported", type: "boolean", demandOption: false})
// .help(true).argv

const questions = [{
  type: 'list',
  name: 'option',
  message: 'Choose an option:',
  choices: [
    'MongoDB (mongoose)',
    'Firebase',
    'PostgreSQL (pg)',
    'MySQL',
    'Redis'
  ],
}];

const dbMap = {
  "MongoDB (mongoose)": 'mongoose',
  "Firebase": 'firebase-admin',
  "PostgreSQL (pg)": 'pg',
  "MySQL": 'mysql',
  "Redis": 'redis'
}

function renderTemplate(filePath, outputPath, name, data) {
  ejs.renderFile(filePath, data, {}, (err, str) => {
    if(err) console.log(err);
    else createFile(outputPath, name, str);
  });
}

argv.command({
  command: 'create-node-app',
  describe: 'Creates a basic node project with usual files',
  builder: {
    y: {
      describe: "Use default values to build the package.json",
      demandOption: false
    }
  },
  handler: async (argv) => {
    let packages = [];
    let dependencies = '';
    let db;
    // const execa = util.promisify(exec);

    async function setup(jsonFile) {
      // no libraries are given, add default libraries
      // TODO: First look for an existing package.json file, if the file doesn't exist then create the file
      if (argv._.length == 1) {
        console.log(chalk.yellow("Note: Predefined libraries will be added to the package.json"));
        
        console.log(chalk.yellow("Please select the database you'd like to connect to your application: "));
        await inquirer.prompt(questions).then((answers) => {
          console.log(chalk.green(`The package ${dbMap[answers.option]} will be downloaded`));
          packages.push(dbMap[answers.option]);
          db = answers.option;
        }).catch(err => {
          console.log("There was an error");
        });

        let dbTemp;
        if(db == "MongoDB (mongoose)") {
          dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_mongoose.ejs'))
        } else if(db == "Firebase") {
          dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_firebase.ejs'))
        } else if(db == "PostgreSQL (pg)") {
          dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_postgre.ejs'))
        } else if(db == "MySQL") {
          dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_mysql.ejs'))
        } else {
          dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_redis.ejs'))
        }

        packages.push("express", "ejs", "dotenv", "cors", "body-parser");
        dependencies = await installPackages(packages);
        renderTemplate(path.join(__dirname, "templates/_index.ejs"), "", jsonFile.main || "index.js", {path: "/public/index.html", db: db, dbTemp: dbTemp});
      } else if(argv._.length > 1) {
        //get all the arguments after the first ('create-node-app') argument to get all packages
        packages = argv._.slice(1);
        dependencies = await installPackages(packages);
        createFile("", jsonFile.main || "index.js", "//This is the server file");
      }
      createFolder("", "public");
      renderTemplate(path.join(__dirname, "templates/_indexhtml.ejs"), "./public/", "index.html", jsonFile);
      renderTemplate(path.join(__dirname, "templates/_styles.ejs"), "./public/", "styles.css", "");
      renderTemplate(path.join(__dirname, "templates/_app.ejs"), "./public/", "app.js", "");
    }
    let jsonFile;

    if(argv.y) {
      // (await execa("npm init -y")).stdout;
      execSync('npm init -y', {stdio: 'pipe'})
    } else {
      try {
        const data = fs.readFileSync(path.join(cwd, 'package.json'));
        if(data == '') {
          execSync('npm init', {stdio: 'inherit'});
        }
      } catch (err) {
        console.log("The file does not exists, creating it");
        execSync('npm init', {stdio: 'inherit'});
      }
    }
    console.log("The package.json file has been created");
    jsonFile = JSON.parse(fs.readFileSync(path.join(cwd, "./package.json")))
    setup(jsonFile);

    createFile('', ".env", "");
    createFile('', '.gitignore', "node_modules\n.env");
  }
}).argv

// if(argv.argv._[0] == null){
//   showHelp();
// }

// Wrote to /Users/nikhildoshi/Desktop/College/testNode/package.json:
// 
// 
// {
//   "name": "testnode",
//   "version": "1.0.0",
//   "description": "",
//   "main": "index.js",
//   "scripts": {
//     "test": "echo \"Error: no test specified\" && exit 1"
//   },
//   "keywords": [],
//   "author": "",
//   "license": "ISC"
// }

// npm init is an interactive command that requires user input. When you run npm init programmatically, it doesn't work as expected because it's not designed to be used that way.
// When you run npm init manually in the terminal, it prompts you to enter information such as package name, version, description, etc. However, when you run it programmatically using execa, it doesn't have a way to prompt the user for input, so it just hangs indefinitely.
// To fix this issue, you can use npm init -y instead of npm init. The -y flag tells npm init to use default values for all prompts, so it doesn't require user input.
// However, you mentioned that you want to run npm init without the -y flag when the user doesn't provide the -y flag. In this case, you can use child_process.execSync instead of execa, which allows you to run the command synchronously and interactively.