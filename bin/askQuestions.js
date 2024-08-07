import { createFile } from "./utils.js";

const ansObj = {
  name: "",
  main: "",
  author: "",
  license: "", //ISC, MIT
  des: ""
};

async function callQuestions(rl) {
  async function question(ques, property) {
    return new Promise((resolve, reject) => {
      rl.question(ques, (ans) => {
        ansObj[property] = ans;
        resolve()
      })
    });
  }

  // const ques1 = () => {
  //   return new Promise((resolve, reject) => {
  //     rl.question("Name of the author: ", (name) => {
  //       ansObj.author = name;
  //       resolve()
  //     });
  //   })
  // }

  const ques2 = () => {
    return new Promise((resolve, reject) => {

      let recursiveQues = () => {
        rl.question("Enter main entry filename: ", (file) => {
          if(file.slice(-3) != ".js") {
            console.log("Please enter a .js file name: ");
            recursiveQues();
          } else {
            // entryFile = file;
            ansObj.main = file;
            createFile("./", file, "");
            resolve()
          }
        });
      }

      recursiveQues();
    })
  }

  const ques3 = () => {
    return new Promise((resolve, reject) => {
      rl.question("Enter the name of the project: ", (projectName) => {
        ansObj.name = projectName;
        resolve()
      })
    })
  }

  const ques4 = () => {
    return new Promise((resolve, reject) => {
      rl.question("Project license: ", (license) => {
        ansObj.license = license;
        rl.close()
        resolve();
      })
    })
  }

  await question("Name of the author: ", "author");
  // await ques1();
  await ques2();
  // await ques3();
  await question("Enter the name of the project: ", "name");
  // await ques4();
  await question("Project license: ", "license");
  await question("Short description: ", "des");

  return ansObj;
}

export { callQuestions };