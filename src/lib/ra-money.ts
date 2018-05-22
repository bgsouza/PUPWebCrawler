import { post, get, RequestResponse, CoreOptions } from "request";
import { CurrencyLayerType } from './../lib/model/types-currencylayer';
import { inspect } from 'util';
import * as fs from 'fs';

export class RAMoney {

    private apiUri: string;
    private apiToken: string;
    private coins: Array<string>;
    private parsersFile: string;
    private coinsParsedFile: string;
    private type: CurrencyLayerType;
    private types: CurrencyLayerType;

    constructor() {
        this.apiUri = process.env.CURRENCYLAYER_API;
        this.apiToken = process.env.CURRENCYLAYER_TOKEN;
        this.parsersFile = `${process.cwd()}/src/model/money/parsers.json`;
        this.coinsParsedFile = `${process.cwd()}/src/model/money/coin.json`;
        this.type = CurrencyLayerType[process.env.CURRENCYLAYER_TYPE];
    }

    async getApi(uri: string) {
        return await new Promise<any>((resolve, reject) => {
            get(uri, {}, (error: any, response: RequestResponse, body: string) => {
              if (error) return reject(error);
              if (response.statusCode != 200) return reject(response);
      
              if (!body)
                return resolve();
      
              if (typeof (body) == 'string')
                return resolve(JSON.parse(body.replace(/^\uFEFF/, '')));
      
              return resolve(body);
            });
          });
    }

    async getCoinsParsed2File() {
        if(await this.checkCache()) {
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

        //for(let $i in this.coins) {
            let $data = await this.getApi(this.formatUri2Api(this.coins[this.type], this.type.toString()));
            console.log(`returned`,$data);
            $coinsParserd = $data;
        //}

        return $coinsParserd;
    }

    formatUri2Api(args, type: string) {
        /*
          ? access_key = YOUR_ACCESS_KEY
            & from = USD
            & to = EUR
            & amount = 25
            & format = 1 
        */
        let $uriFormated = `${this.apiUri.replace('#method#',type.toLowerCase())}${this.apiToken}`;
        switch(type) {
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

        return seconds < 86400
    }

    cachedFile() {
        return this.coins = JSON.parse(fs.readFileSync(this.coinsParsedFile, 'utf8'));
    }

    async writeFile(data) {
        if(await fs.existsSync(this.coinsParsedFile) && data["quotes"] != undefined) {
            await fs.writeFileSync(this.coinsParsedFile, JSON.stringify(data["quotes"]),null);
        }
    }
}