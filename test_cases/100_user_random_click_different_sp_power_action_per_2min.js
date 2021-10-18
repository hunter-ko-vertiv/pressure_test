import http from 'k6/http'
import { group, check, sleep } from 'k6'
import { randomItem } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
    insecureSkipTLSVerify: true,

    duration: '10m',
    vus: 500,
    iterations: 3000
};

const HOST_IP = 'https://10.36.62.126';
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

    group("Change Sp Power Action", function () {

        const url = HOST_IP + `/api/v1/devices/${deviceIds}/restart`

        // const power_action = JSON.parse(http.get(url, option).body).options.map(item => item.reboot_type);

        const res = http.post(HOST_IP + `/api/v1/devices/${deviceIds}:restart`, JSON.stringify(
            {
                option: {
                    reboot_type: "REBOOT_TYPE_SVR_NMI"
                }
            }
        ), option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
        if (res.status !== 200) {
            console.log(res.status);
            console.log(JSON.stringify(res.body));
        } else {
            console.log(res.status, 'ok')
        }
    })
    sleep(10)
}

