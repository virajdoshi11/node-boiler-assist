import fs from 'fs';
import path from 'path';
import { exec } from 'node:child_process'
import util from 'util';
// import { stderr, stdout } from 'process';

const cwd = process.cwd();

const usage = "\nUsage: tran <lang_name> sentence to be translated";

function showHelp() {                                                            
    console.log(usage);  
    console.log('\nOptions:\r')  
    console.log('\t--version\t      ' + 'Show version number.' + '\t\t' + '[boolean]\r')  
    console.log('    -l, --languages\t' + '      ' + 'List all languages.' + '\t\t' + '[boolean]\r')  
    console.log('\t--help\t\t      ' + 'Show help.' + '\t\t\t' + '[boolean]\n')  
}

function createFolder(filePath, folderName, callback=() => {}) {
  fs.mkdirSync(path.join(cwd, filePath + folderName), (err) => {
    // if(rl.input.isPaused()) {
      if (err) {
        if (err.code === 'EEXIST') {
          console.log(`Folder ${folderName} already exists`);
        } else {
          console.error("There was an error creating the folder:", err)
        }
      } else {
        console.log(`folder ${folderName} is created`);
        callback();
      }
    // }
  })
}

function createFile(filePath, fileName, fileContent, callback=() => {}) {
  fs.writeFileSync(path.join(cwd, filePath, fileName), fileContent, (err) => {
    if (err) {
      console.error('Error creating file:', err);
    } else {
      // console.log(`File '${fileName}' created successfully!`);
      callback();
    }
  })
}

const execa = util.promisify(exec)
let dependecies = '';

async function installPackages(pkgList) {
  let command = `npm install ${pkgList.join(" ")}`;
  await execa(command);
  // console.log();
}

// https://stackoverflow.com/questions/56620487/force-javascript-node-to-wait-on-exec
async function getPackages(pkgList) {
  // pkgList.push("express", "mongoose", "dotenv", "cors", "body-parser");
  // console.log("pkgList is:", pkgList);

  for(let i = 0; i < pkgList.length; i++) {
    let command = `npm view ${pkgList[i]} version`;
    if(pkgList.length == 1) {
      dependecies += `"${pkgList[i]}": "^${(await execa(command)).stdout.trim()}"`
    } else {
      if(i == pkgList.length -1) {
        dependecies += `\t\t"${pkgList[i]}": "^${(await execa(command)).stdout.trim()}"`;
      } else if(i == 0) {
        dependecies += `"${pkgList[i]}": "^${(await execa(command)).stdout.trim()}",\n`;
      } else {
        dependecies += `\t\t"${pkgList[i]}": "^${(await execa(command)).stdout.trim()}",\n`;
      }
    }
  }

  return dependecies;
}

export { showHelp, createFolder, createFile, getPackages, installPackages }