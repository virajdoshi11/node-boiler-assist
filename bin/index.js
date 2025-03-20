#!/usr/bin/env node

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

const questions = [{
  type: 'list',
  name: 'option',
  message: 'Choose a database:',
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
  "MySQL": 'mysql2',
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
      describe: "Using default values to build the package.json",
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
      createFolder("", "public");
      if (argv._.length == 1) {
        console.log(chalk.yellow("Note: Predefined libraries will be added to the package.json"));
        
        console.log(chalk.yellow("Please select the database you'd like to connect to your application: "));
        await inquirer.prompt(questions).then((answers) => {
          console.log(chalk.green(`The package ${dbMap[answers.option]} will be downloaded`));
          packages.push(dbMap[answers.option]);
          db = answers.option;
        }).catch(err => {
          console.log("There was an error loading the database:", err);
        });

        createFolder("", "utils")
        switch (db) {
          case "MongoDB (mongoose)":
            // dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_mongoose.ejs'))
            renderTemplate(path.join(__dirname, "templates/_mongoose.js"), "./utils/", "connectDB.js")
            break;
          case "Firebase":
            // dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_firebase.ejs'))
            renderTemplate(path.join(__dirname, "templates/_firebase.js"), "./utils/", "connectDB.js")
            break;
          case "PostgreSQL (pg)":
            // dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_postgre.ejs'))
            renderTemplate(path.join(__dirname, "templates/_postgre.js"), "./utils/", "connectDB.js")
            break;
          case "MySQL":
            // dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_mysql.ejs'))
            renderTemplate(path.join(__dirname, "templates/_mysql.js"), "./utils/", "connectDB.js")
            break;
          default:
            // dbTemp = await ejs.renderFile(path.join(__dirname, 'templates/_redis.ejs'))
            renderTemplate(path.join(__dirname, "templates/_redis.js"), "./utils/", "connectDB.js")
            break;
        }

        packages.push("express", "ejs", "dotenv", "cors", "body-parser");
        dependencies = await installPackages(packages);
        renderTemplate(path.join(__dirname, "templates/_index.ejs"), "", jsonFile.main || "index.js", {path: "public/index.html", db: db});
        createFolder("", "views");
        createFolder("views/", "partials")
        renderTemplate(path.join(__dirname, "templates/_index.html"), "./views/", "index.ejs", "")
        renderTemplate(path.join(__dirname, "templates/_header.ejs"), "./views/partials/", "header.ejs", {jsonFile: jsonFile})
      } else if(argv._.length > 1) {
        //get all the arguments after the first ('create-node-app') argument to get all packages
        packages = argv._.slice(1);
        dependencies = await installPackages(packages);
        createFile("", jsonFile.main || "index.js", "//This is the entry point of your app");
        
        //if the user used "-y" then this folder should not be created since ejs will be used
        createFolder("public/", "html");
        renderTemplate(path.join(__dirname, "templates/_indexhtml.ejs"), "./public/html/", "index.html", jsonFile);
      }
      createFolder("public/", "css");
      createFolder("public/", "js");
      createFolder("public/", "images");
      createFolder("public/", "fonts");
      
      renderTemplate(path.join(__dirname, "templates/_styles.css"), "./public/css/", "styles.css", "");
      renderTemplate(path.join(__dirname, "templates/_app.js"), "./public/js/", "app.js", "");
    }

    let jsonFile;
    let packageJSON;

    try {
      //get the package.json file (if exists)
      //ignore the '-y' flag if package.json already exists
      packageJSON = fs.readFileSync(path.join(cwd, 'package.json'));
    } catch(err) {
      console.log(chalk.yellow("No package.json file detected, creating a new package.json file"));
      if(argv.y) {
        execSync('npm init -y', {stdio: 'pipe'});
      } else {
        execSync('npm init', {stdio: 'inherit'});
      }
      console.log(chalk.green("The package.json file has been created"));
      packageJSON = fs.readFileSync(path.join(cwd, 'package.json'))
    }

    packageJSON = JSON.parse(packageJSON)

    packageJSON.type = "module";
    packageJSON.scripts["start"] = `node ${packageJSON.main}`
    
    await setup(packageJSON);

    // createFile('', ".env", "");
    renderTemplate(path.join(__dirname, "templates/_env.ejs"), "./", ".env", {db: db});
    createFile('', '.gitignore', "node_modules\n.env");
  }
}).argv

// if(argv.argv._[0] == null){
//   showHelp();
// }

// npm init is an interactive command that requires user input. When you run npm init programmatically, it doesn't work as expected because it's not designed to be used that way.
// When you run npm init manually in the terminal, it prompts you to enter information such as package name, version, description, etc. However, when you run it programmatically using execa, it doesn't have a way to prompt the user for input, so it just hangs indefinitely.
// To fix this issue, you can use npm init -y instead of npm init. The -y flag tells npm init to use default values for all prompts, so it doesn't require user input.
// However, you mentioned that you want to run npm init without the -y flag when the user doesn't provide the -y flag. In this case, you can use child_process.execSync instead of execa, which allows you to run the command synchronously and interactively.