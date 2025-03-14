/*    Copyright 2023 Firewalla Inc.
 *
 *    This program is free software: you can redistribute it and/or  modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import axios from 'axios';
import fs from 'fs';

// Create .token and .domain file or use environment variables to setup your MSP domain and credential
const msp_domain = process.env.domain || fs.readFileSync('./.domain').toString();
const token = process.env.token || fs.readFileSync('./.token').toString();

const begin = process.env.begin || Date.now() / 1000 - 30 * 24 * 3600; // last 30 days
let end = process.env.end || Date.now() / 1000;


// Related API Document
// https://docs.firewalla.net/api-reference/flow/


async function main() {

    const httpClient = axios.create({
        // aggr function is only supported on v1 version, will add it to v2 and update the API Doc recently
        baseURL: `https://${msp_domain}/v1`,
    })
    httpClient.defaults.headers.common['Authorization'] = 'Token ' + token;
    httpClient.defaults.headers.common['Content-Type'] = 'application/json'

    // pagination, keep fetching until next returned as null
    const resp = await httpClient({
        method: 'post',
        url: `/flows/query?format=v2`,
        data: {
            start: begin,
            end,
            limit: 50,
            sortBy: [{ name: "total", order: "desc" }],
            groupBy: ['device']
        },
    }).then(r => r.data)

    const results = resp.flows.map(f => { return { deviceName: f.device.name, total: f.total, download: f.download, upload: f.upload } });
    console.table(results, ["deviceName", "download", "upload", "total"])
}


main().catch(err => {
    console.error('Failed to get flows', err);
    process.exit(1)
})
