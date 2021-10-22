import http from 'k6/http'
import {group, check, sleep} from 'k6'
import { randomItem } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
    insecureSkipTLSVerify: true,
    vus: 1,
    iterations: 300,
    duration: '6h'
};

const HOST_IP = 'https://10.36.62.126'

let count = 0;

export function setup() {


}

export default function () {
    const url = HOST_IP + "/api/v1/usersessions"

    const accountInfo = {
        username: "admin",
        password: "admin123"
    }

    const res = http.post(url, JSON.stringify(accountInfo))

    const authToken = JSON.parse(res.body).jwt
    const id = JSON.parse(res.body).usersession.id
    count++;

    const option = {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    }

    group("Add Devices", function () {
        const url = `${HOST_IP}/api/v1/discoveryRequests`
        const res = http.post(url, JSON.stringify({
            startIpAddress: `10.207.15.46~${8001 + (count % 10)}@r${count}`,
            endIpAddress: `10.207.15.46~${8001 + (count % 10)}@r${count}`,
            autoAdd: true,
            generalCredentials:
                {
                    username: 'root',
                    password: 'calvin'
                }
        }), option)
        console.log(res.status);
        check(res, {
            'Is status 201': (r) => r.status === 201
        })
    })
    group("Log out", function () {
        const url = HOST_IP + '/api/v1/userSessions/' + id
        const res = http.del(url, {}, option)
        check(res, {
            'Is status 204': (r) => r.status === 204
        })
    })
    sleep(5);
}
