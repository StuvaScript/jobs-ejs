const fs = require("fs").promises;

compareEnvFiles();

async function compareEnvFiles() {
  let envVars = [];

  try {
    //* **`` Reads the .env.example file
    const data = await fs.readFile(".env.example", "utf8");

    //* **`` Reads each line and only pushes the key in the key/value pairs to the array
    data.split("\n").map((line) => {
      line.includes("=") && envVars.push(line.split("=")[0]);
    });

    //* **`` Loops thru the array of .env.example variables and checks to see if those variable exist in the .env file
    envVars.map((key) => {
      if (!process.env[key]) {
        throw new Error(`"${key}" environment variable is not defined`);
      }
    });
  } catch (err) {
    return console.error(err);
  }
}
