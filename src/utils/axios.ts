import axios from "axios";




export default function apiRequest(baseURL: string) {
    return axios.create({
        timeout: 30000,
        baseURL: baseURL,
    })
}