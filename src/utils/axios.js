import axios from "axios";
import { BackendUrl } from "../config";


export const api = axios.create({
    baseURL: BackendUrl
})