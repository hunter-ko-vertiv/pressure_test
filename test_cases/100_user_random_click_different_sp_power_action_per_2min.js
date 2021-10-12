import http from 'k6/http'
import { group, check, sleep } from 'k6'
import { randomItem } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
    insecureSkipTLSVerify: true,
    vus: 1,
    iterations: 1
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


    group("Change Sp Power Action", function () {

        const url = HOST_IP + `/api/v1/devices/${deviceIds}/restart`

        const power_action = JSON.parse(http.get(url, option).body).options.map(item => item.reboot_type);

        const res = http.post(HOST_IP + `/api/v1/devices/${deviceIds}:restart`, JSON.stringify(
            {
                option: {
                    reboot_type: randomItem(power_action)
                }
            }
        ), option)
        check(res, {
            'Is status 200': (r) => r.status === 200
        })
    })

}

