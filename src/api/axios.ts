import axios from "axios";

const api = axios.create({
    baseURL: "https://www.kap.org.tr/tr/api/",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

export default api