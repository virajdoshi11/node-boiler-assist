# Node-Boiler-Assist

node-boiler-assist is a cli tool that helps create boilerplate code files used in most node.js CRUD applications 

# Installation

Either through cloning with git or by using [npm](http://npmjs.org) (the recommended way):
```bash
npm install node-boiler-assist
```

# Usage

There are just 2 commands which makes the tool so easy to use.

Create a project entirely from scratch and use the default libraries (you have an option to select the database):

```bash
assist create-node-app -y
```

The above command will create a default `package.json` (internally uses `npm init -y`) and will install packages - `express`, `ejs`, `dotenv`, `cors`, and `body-parser`
You will be able to choose from a list of databases to integrate in your app.
Right now  the available databases that you can conect with are - `MongoDB`, `Firebase`, `PostgreSQL`, `MySQL`, and `Redis`

You can also install what packages you want by simply listing them after the `create-node-app` command just like how you would do to install with `npm`:

```bash
assist create-node-app express dotenv -y
```

The above command will only install the packages `express` and `dotenv`.

The `-y` flag is used to generate a default `package.json`. Remove the `-y` flag to create a custom `package.json` file (internally uses `npm init`).