import http from 'k6/http'
import { group, check, sleep } from 'k6'
import { randomItem } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
    insecureSkipTLSVerify: true,
    vus: 100,
};

const HOST_IP = 'https://10.162.249.208';
const LOGIN_URL = '/api/v1/usersessions'
const SP_LIST =  '/api/v1/devices?filter=&page_token=0&page_size=200&order_by=created_at%20DESC'
export function setup() {

    const accountInfo = {
        username: "admin",
        password: "admin123"
    }

    const res = http.post(HOST_IP + LOGIN_URL, JSON.stringify(accountInfo))

    return JSON.parse(res.body).jwt
}

export default function (authToken) {
    const option = {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    }

    const deviceList = JSON.parse(http.get(HOST_IP + SP_LIST, option).body);
    const deviceIds = randomItem(deviceList.devices.map(device => device.id))

    console.log(deviceIds)

    group("Get LED Status", function () {
        const url = HOST_IP + `/api/v1/devices/${deviceIds}/ledState`
        const res =  http.get(url, option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

    group("Get Reset Status", function () {
        const url = HOST_IP + `/api/v1/devices/${deviceIds}/reset`
        const res =  http.get(url, option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

    group("Get Restart Options", function () {
        const url = HOST_IP + `/api/v1/devices/${deviceIds}/restart`
        const res =  http.get(url, option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

    group("Get Common Status", function () {
        const url = HOST_IP + `/api/v1/devices/${deviceIds}/status`
        const res =  http.get(url, option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

    group("Get Boot Order", function () {
        const url = HOST_IP + `/api/v1/devices/${deviceIds}/bootOrder`
        const res =  http.get(url, option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

    group("Get Metrics", function () {
        const url = HOST_IP + `/api/v1/devices/${deviceIds}/metrics`
        const res =  http.get(url, option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

    group("Get Virtual Media", function () {
        const url = HOST_IP + `/api/v1/devices/${deviceIds}/virtualMedia`
        const res =  http.get(url, option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

    group("Get Resync Device", function () {
        const url = HOST_IP + `/api/v1/devices/${deviceIds}/resync`
        const res = http.post(url, JSON.stringify({
            id: deviceIds
        }), option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

    sleep(15)
}
