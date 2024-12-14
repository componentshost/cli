import path from "path";
import fs from "fs-extra";
import os from "os";

export function getRegistryConfig() {
    const configDir = path.join(os.homedir(), ".componentshost");
    const configFile = path.join(configDir, "config");

    if (!fs.existsSync(configFile)) {
        fs.writeFileSync(
            configFile,
            `TOKEN=\nID=\nNAME='\nCOMPONENTS_REGISTRY_URL=${defaultParams.COMPONENTS_REGISTRY_URL}'`,
            "utf8",
        );
        return defaultParams;
    }

    const config = parseEnvToJson(configFile);
    return {
        TOKEN: config?.TOKEN || defaultParams.TOKEN,
        ID: config?.ID || defaultParams.ID,
        NAME: config?.NAME || defaultParams.NAME,
        COMPONENTS_REGISTRY_URL: config?.COMPONENTS_REGISTRY_URL || defaultParams.COMPONENTS_REGISTRY_URL,
    };
}


// Function to parse .env file to JSON
function parseEnvToJson(envFilePath: string): Record<string, string> {
    // Read the .env file
    const envFileContent = fs.readFileSync(envFilePath, { encoding: 'utf-8' });

    // Initialize an empty object to store key-value pairs
    const jsonOutput: Record<string, string> = {};

    // Split content line by line and parse each line
    envFileContent.split('\n').forEach((line) => {
        // Remove spaces and skip comments or empty lines
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        // Match key-value pairs (KEY: "value" or KEY=value)
        const match = trimmedLine.match(/^([^=:\s]+)\s*[:=]\s*"?([^"]+)"?$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            jsonOutput[key] = value;
        }
    });

    return jsonOutput;
}


const defaultParams = {
    TOKEN: "",
    ID: "",
    NAME: "",
    COMPONENTS_REGISTRY_URL: "https://www.componentshost.com",
}