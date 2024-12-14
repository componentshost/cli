import { existsSync, promises as fs } from "fs"
import path from "path"
import { logger } from "../../utils/logger"
import { spawn } from "child_process";
import { DEPRECATED_MESSAGE } from "../../utils/deprecated"
import { Command } from "commander"
import ora from "ora"
import { z } from "zod"
import { checkPackage } from "@/src/utils/check-package";

const addOptionsSchema = z.object({
    components: z.array(z.string().regex(/^\S+$/)).optional(),
    yes: z.boolean(),
    overwrite: z.boolean(),
    cwd: z.string(),
    all: z.boolean(),
    path: z.string().optional(),
})

export const add = new Command()
    .name("add")
    .description("add a component to your project")
    .argument("[components...]", "the components to add")
    .option("-y, --yes", "skip confirmation prompt.", true)
    .option("-o, --overwrite", "overwrite existing files.", false)
    .option(
        "-c, --cwd <cwd>",
        "the working directory. defaults to the current directory.",
        process.cwd()
    )
    .option("-a, --all", "add all available components", false)
    .option("-p, --path <path>", "the path to add the component to.")
    .action(async (components, opts) => {
        try {
            const spinner = ora("Checking for package if exist!").start() // Start loader animation
            console.log(DEPRECATED_MESSAGE)
            const options = addOptionsSchema.parse({
                components,
                ...opts,
            })
            const cwd = path.resolve(options.cwd)

            if (!existsSync(cwd)) {
                logger.error(`The path ${cwd} does not exist. Please try again.`)
                process.exit(1)
            }
            if (options.components?.length == 0) {
                spinner.fail("No components provided")
                return
            }
            spinner.stop()
            if (options.components) {
                for (const component of options.components) {
                    const { url, error, registry = "local" } = await checkPackage(component);
                    if (error) {
                        spinner.fail(`Error checking package ${component}: ${error}`);
                        continue;
                    }
                    if (!url) {
                        spinner.fail(`Package does not exist: ${component}`);
                        continue;
                    }
                    await new Promise<void>((resolve, reject) => {
                        const child = spawn(`npx`, ["shadcn@latest", "add", registry == "shadcn" ? component : url], { stdio: "inherit" });

                        child.on("error", (error) => {
                            console.error(`Failed to start command: ${error.message}`);
                            reject(error);
                        });

                        child.on("close", (code) => {
                            if (code === 0) {
                                console.log(`Command executed successfully for ${component}`);
                                resolve();
                            } else {
                                console.log(`Command failed with exit code: ${code} for ${component}`);
                                reject(new Error(`Command failed with exit code: ${code} for ${component}`));
                            }
                        });
                    });
                }
            }

            spinner.succeed(`Done.`)
            spinner.stop()
        } catch (error) {
            console.log(error)
            return
            // handleError(error)
        }
    })


// Function to run a shell command and watch the logs live
const runCommand = (command: string, args: string[]) => {
    const child = spawn(command, args, { stdio: "inherit" });

    // This will print the command's output in real time
    child.on("error", (error) => {
        console.error(`Failed to start command: ${error.message}`);
    });

    child.on("close", (code) => {
        if (code === 0) {
            console.log("Command executed successfully");
        } else {
            console.log(`Command failed with exit code: ${code}`);
        }
    });
};