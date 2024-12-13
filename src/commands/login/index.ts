import { Command } from "commander";
import ora from "ora";
import axios, { AxiosError } from "axios";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export const login = new Command()
  .name("login")
  .description("Follow the link to authenticate with ComponentsHost.")
  .action(async () => {
    const spinner = ora("Authenticating with ComponentsHost...").start(); // Start loader animation
    try {
      const url =
        process.env.NODE_ENV == "development"
          ? "http://localhost:3000"
          : "https://www.componentshost.com";
      // Make the POST request using axios
      const response = await axios.post(`${url}/api/cli/login`, {
        reqType: "request",
      });
      spinner.succeed("Authentication Session created successful!"); // Stop loader with success
      const { id } = response.data;

      const spinner2 = ora(
        `Please visit \x1b[4m${url}/cli/login/${id}\x1b[0m to authenticate. \n\n`,
      ).start();
      const interval = setInterval(async () => {
        try {
          const checkResponse = await axios.post(`${url}/api/cli/login`, {
            id,
            reqType: "checking",
          });
          if (checkResponse.data.status === "success") {
            const { user, token } = checkResponse.data;
            const configDir = path.join(os.homedir(), ".componentshost");
            const configFile = path.join(configDir, "config");
            // Ensure the directory exists
            if (!fs.existsSync(configDir)) {
              fs.mkdirSync(configDir);
            }

            // Write the token to the config file
            fs.writeFileSync(
              configFile,
              `TOKEN=${token}\nID=${user?.id}\nname='${user?.name}'`,
              "utf8",
            );
            spinner2.succeed("Authentication confirmed!");
            clearInterval(interval); // Stop sending requests
          } else if (checkResponse.data.success == "err") {
            spinner2.fail(checkResponse.data?.message);
            spinner.clear();
            spinner.stop();
            spinner2.stop();
            clearInterval(interval); // Stop sending requests
          }
        } catch (checkError) {
          const err = checkError as AxiosError;
          spinner2.fail("Error during authentication check.");
          console.error("Check Error:", err?.message);
          clearInterval(interval); // Stop sending requests on error
        }
      }, 4000);
    } catch (error) {
      const err = error as AxiosError;
      spinner.fail("Authentication failed."); // Stop loader with failure
      // Handle error
      console.error("Error:", err?.message);
    }
  });