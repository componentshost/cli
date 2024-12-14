import apiRequest from "./axios"
import { AxiosError } from "axios"
import { getRegistryConfig } from "./get-registy-config"



export const checkPackage = async (packageName: string) => {
    try {
        const { COMPONENTS_REGISTRY_URL, TOKEN } = getRegistryConfig()
        if (TOKEN == "") {
            return { error: "You need to login first. Run `npx componentshost login`" }
        }
        const axios = apiRequest(COMPONENTS_REGISTRY_URL)
        const { data, } = await axios.post(`/packages/${packageName}.json?token=${TOKEN}`, {
            type: "check"
        })
        if (data?.error) {
            return { error: data.error, url: "" }
        }
        return { url: `${COMPONENTS_REGISTRY_URL}/packages/${packageName}.json?token=${TOKEN}`, registry: data?.registry ?? "local" }
    } catch (error) {
        if (error instanceof AxiosError) {
            return { error: error.response?.data?.message, url: "" }
        }
        if (error instanceof Error) {
            return { error: error.message, url: "" }
        }
        console.log(error)
        return { error: "Something went wrong", url: "" }
    }
}


