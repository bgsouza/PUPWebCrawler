"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("request");
class RADomainApiClient {
    constructor() {
        this.apiUrl = process.env.DOMAINAPI_BACKEND;
    }
    async post(path, data) {
        const uri = `${this.apiUrl}/${path}`;
        let options = {
            json: data,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return await new Promise((resolve, reject) => {
            request_1.post(uri, options, (error, response, body) => {
                if (error)
                    return reject(error);
                if (response.statusCode != 200)
                    return reject(response);
                if (!body)
                    return resolve();
                if (typeof (body) == 'string')
                    return resolve(JSON.parse(body.replace(/^\uFEFF/, '')));
                return resolve(body);
            });
        });
    }
}
exports.RADomainApiClient = RADomainApiClient;
//# sourceMappingURL=ra-domain-api-client.js.map