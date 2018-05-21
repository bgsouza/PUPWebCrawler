"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("request");
const types_currencylayer_1 = require("./../lib/model/types-currencylayer");
const fs = require("fs");
class RAMoney {
    constructor() {
        this.apiUri = process.env.CURRENCYLAYER_API;
        this.apiToken = process.env.CURRENCYLAYER_TOKEN;
        this.parsersFile = `${__dirname}/../../src/model/money/parsers.json`;
        this.coinsParsedFile = `${__dirname}/../../src/model/money/coin.json`;
        this.type = types_currencylayer_1.CurrencyLayerType[process.env.CURRENCYLAYER_TYPE];
    }
    async getApi(uri) {
        return await new Promise((resolve, reject) => {
            request_1.get(uri, {}, (error, response, body) => {
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
    async getCoinsParsed2File() {
        if (await this.checkCache()) {
            return this.cachedFile();
        }
        let $coins = this.loadCoinsToConvert();
        let $coinParsed = await this.convert();
        await this.writeFile($coinParsed);
        return this.cachedFile();
    }
    loadCoinsToConvert() {
        this.coins = JSON.parse(fs.readFileSync(this.parsersFile, 'utf8'));
    }
    async convert() {
        let $coinsParserd = {};
        let $data = await this.getApi(this.formatUri2Api(this.coins[this.type], this.type.toString()));
        console.log(`returned`, $data);
        $coinsParserd = $data;
        return $coinsParserd;
    }
    formatUri2Api(args, type) {
        let $uriFormated = `${this.apiUri.replace('#method#', type.toLowerCase())}${this.apiToken}`;
        switch (type) {
            case "HISTORICAL":
                $uriFormated = `${$uriFormated}&from=${args.from}&to=${args.to}&amount=1&format=1`;
                break;
            case "LIVE":
                $uriFormated = `${$uriFormated}&currencies=${args.join(',')}&format=1`;
                break;
        }
        console.log(`URL to api: ${$uriFormated}`);
        return $uriFormated;
    }
    async checkCache() {
        let file = fs.statSync(this.coinsParsedFile);
        let seconds = (new Date().getTime() - new Date(file.mtime).getTime()) / 1000;
        return seconds < 86400;
    }
    cachedFile() {
        return this.coins = JSON.parse(fs.readFileSync(this.coinsParsedFile, 'utf8'));
    }
    async writeFile(data) {
        if (await fs.existsSync(this.coinsParsedFile) && data["quotes"] != undefined) {
            await fs.writeFileSync(this.coinsParsedFile, JSON.stringify(data["quotes"]), null);
        }
    }
}
exports.RAMoney = RAMoney;
//# sourceMappingURL=ra-money.js.map