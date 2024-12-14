import chalk from "chalk";

export const DEPRECATED_MESSAGE = chalk.yellow(
  `\nNote: The componentshost CLI is going to be deprecated soon. Please use ${chalk.bold(
    "npx componentshost",
  )} instead.\n`,
);
