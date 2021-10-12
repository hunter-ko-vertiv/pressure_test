import http from 'k6/http'
import {group, check, sleep} from 'k6'
import { randomItem } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
    insecureSkipTLSVerify: true,
    vus: 1,
    iterations: 2000,
    duration: '120m'
};

const HOST_IP = 'https://10.162.249.208'

let count = 0;

export function setup() {

    const url = HOST_IP + "/api/v1/usersessions"

    const accountInfo = {
        username: "admin",
        password: "admin123"
    }

    const res = http.post(url, JSON.stringify(accountInfo))

    return JSON.parse(res.body).jwt
}

export default function (authToken) {

    count++;

    const option = {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    }

    group("Add Devices", function () {
        const url = `https://10.162.249.208/api/v1/discoveryRequests`
        const res = http.post(url, JSON.stringify({
            startIpAddress: `10.162.249.63~${8001 + (count % 15)}@r${count}`,
            endIpAddress: `10.162.249.63~${8001 + (count % 15)}@r${count}`,
            autoAdd: true,
            generalCredentials:
                {
                    username: 'root',
                    password: 'calvin'
                }
        }), option)
        check(res, {
            'Is status 201': (r) => r.status === 201
        })
    })
    sleep(2);
}
