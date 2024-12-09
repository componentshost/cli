import * as readline from "readline";
import { Command } from "commander";
import { read } from "read";
import fs from "fs";
import axios, { AxiosError } from "axios";
import path from "path";

export const login = new Command()
  .name("login")
  .description("Prompt for email and password to log in")
  .action(() => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Enter your email or username: ", async (email) => {
      if (email.length < 3) {
        console.error("Invalid email address or username.");
        rl.close();
        return;
      }

      try {
        const password = await new Promise(async (resolve, reject) => {
          try {
            const result = await read({
              prompt: "Enter your password: ",
              silent: true,
              replace: "*",
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });

        const response = await axios.post(
          "https://www.componentshost.com/api/cliauth",
          {
            email,
            password,
          },
        );

        const { accessToken } = response.data;

        if (!accessToken) {
          console.error("Failed to retrieve access token.");
          rl.close();
          return;
        }

        // Get the user directory
        const userDir = require("os").homedir();
        const filePath = path.join(userDir, ".componentshost");

        // Store the access token in the .componentshost file
        fs.writeFileSync(filePath, `ACCESS_TOKEN=${accessToken}`, {
          encoding: "utf8",
          flag: "w",
        });
        console.log(
          "Login successful. Access token stored in .componentshost file.",
        );
      } catch (error) {
        const e = error as AxiosError;
        console.error("Error during login:", e?.response?.data || e?.message);
      } finally {
        rl.close();
      }
    });
  });
