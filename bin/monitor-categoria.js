"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backendapi_client_1 = require("./lib/clients/backendapi-client");
const ra_monitor_1 = require("./lib/ra-monitor");
const monitor_categoria_task_1 = require("./model/monitor-categoria-task");
const product_1 = require("./model/product");
const monitor_categoria_service_1 = require("./monitor-categoria-service");
const ra_puppeteer_1 = require("./lib/ra-puppeteer");
const ra_money_1 = require("./lib/ra-money");
const coin_types_1 = require("./lib/model/coin-types");
const fs = require("fs");
class MonitorCategoria extends ra_monitor_1.RAMonitor {
    constructor() {
        const taskType = 40000;
        const region = 0;
        super(taskType, region);
        this.BackendApiClient = new backendapi_client_1.BackendApiClient();
        this.MonitorCategoriaService = new monitor_categoria_service_1.MonitorCategoriaService();
        this.RAMoney = new ra_money_1.RAMoney();
        this.tagType = 1;
        this.maxPage = 10;
        this.coinsType = coin_types_1.CoinsTypes;
        this.chrome = new ra_puppeteer_1.RAPuppeteerChrome();
    }
    async executeTask(rawTaskData) {
        const taskData = new monitor_categoria_task_1.MonitorCategoriaTask(rawTaskData);
        if (!taskData["url"])
            return;
        await this.openBrowserDefinitions(taskData);
        let scripts = await this.loadSettingsByRetailer(taskData);
        if (scripts["ScriptDefinitions"]["pre"] != null) {
            await this.executeScriptPreDefinitions(scripts["ScriptDefinitions"]["pre"]);
            if (scripts["ScriptDefinitions"]["reload"]) {
                await this.chrome.reload();
            }
        }
        let coin = await this.loadCoinByTask(taskData);
        let response = await this.collectInfos(scripts, coin);
        this.MonitorCategoriaService.save(response);
        console.log('#### Final ####');
        console.log(response);
    }
    async executeScriptPreDefinitions(code) {
        await this.chrome.executeScript(code)
            .then((sucess) => {
            console.log('sucess', sucess);
        }, (err) => {
            throw new Error("no executed");
        });
        await this.chrome.waitFor(4000);
        await this.chrome.includeJQuery();
        ;
        await this.chrome.hasJQuery();
    }
    async executeScriptPosDefinitions(code) {
        await this.chrome.executeScript(code)
            .then((sucess) => {
        }, (err) => {
            throw new Error("no executed");
        });
        await this.chrome.waitFor(4000);
    }
    async openBrowserDefinitions(taskData) {
        await this.chrome.initializeBrowser();
        try {
            await this.chrome.navigateTo(taskData.url)
                .then(() => this.chrome.waitPageLoad(), (err) => { console.log(`Error when trying to navigate: ${err}`); });
            await this.chrome.IncludeAndAwaitJquery();
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async collectInfos(scripts, coin) {
        let items = [];
        let productsResults = {};
        let productNames = [];
        let position = 1;
        let currentUri = "";
        let nextPage = true;
        let visitedUris = [];
        try {
            for (let page = 1; page <= this.maxPage && nextPage; page++) {
                console.log(`#### PAG ${page} ####`);
                if (scripts["ScriptDefinitions"]["pos"] != null) {
                    await this.executeScriptPosDefinitions(scripts["ScriptDefinitions"]["pos"]);
                }
                if (page > 1 && !scripts["PaginatorIsAjax"]) {
                    await this.chrome.IncludeAndAwaitJquery(2000);
                }
                if (scripts["ScriptProdutsBrowser"])
                    productsResults = await this.chrome.executeScript(scripts["ScriptProdutsBrowser"]);
                currentUri = await this.chrome.executeScript("location.href");
                const newPage = await this.chrome.openInNewTab();
                const pageList = await this.chrome.pages();
                if (productsResults && productsResults != {}) {
                    for (let i = 0; i < productsResults.length; i++) {
                        let product = new product_1.Product();
                        product.name = productsResults[i].nome || null;
                        product.url = productsResults[i].url || null;
                        ;
                        product.price = this.parseMoney(productsResults[i].precoRegular) || null;
                        product.priceSpecial = productsResults[i].precoEspecial || null;
                        product.priceOf = this.parseMoney(productsResults[i].precoDe) || null;
                        product.category = productsResults[i].categoria || null;
                        product.brand = productsResults[i].marca || null;
                        product.subbrand = productsResults[i].submarca || null;
                        product.os = productsResults[i].os || null;
                        product.status = productsResults[i].disponivel || false;
                        product.priceDolar = product.price / coin;
                        product.priceOfDolar = product.priceOf / coin;
                        console.log(`produto Coletado`, product);
                        if (productNames.indexOf(productsResults[i].name) == -1 && scripts["ScriptProductIntenalDetail"] != null) {
                            if (product.url == null)
                                continue;
                            await this.chrome.navigateTo(product.url, newPage).then(() => this.chrome.waitPageLoad(), (err) => { console.log(`Error when trying to navigate: ${err}`); });
                            var details = await this.chrome.executeScript(scripts["ScriptProductIntenalDetail"]);
                            if (details == undefined || typeof details !== "object") {
                                continue;
                            }
                            product.priceSpecial = details.precoEspecial || product.priceSpecial;
                            product.category = details.categoria || product.category;
                            product.brand = details.marca || product.price;
                            product.subbrand = details.submarca || product.price;
                            product.os = details.os || product.os;
                            product.status = details.disponivel || product.status;
                            productNames.push(productsResults[i]);
                            position++;
                        }
                        items.push(product);
                    }
                }
                this.chrome.closeNewTab(newPage);
                let successPaginate;
                if (!scripts["PaginatorIsAjax"]) {
                    await this.chrome.executeScript(scripts["ScriptNextPageBrowser"])
                        .then((sucess) => {
                        console.log('sucess', sucess);
                    }, (err) => {
                        nextPage = false;
                        throw new Error("no page next");
                    });
                }
                else {
                    console.log('Paginação por Ajax');
                    await this.chrome.executeScript(scripts["ScriptNextPageBrowser"]);
                }
                await this.chrome.waitFor(4000);
            }
        }
        catch (err) {
            nextPage = false;
            console.error(err);
        }
        return items;
    }
    async loadSettingsByRetailer(taskData) {
        return JSON.parse(fs.readFileSync(`${__dirname}/../src/model/clients/${taskData.country}/${taskData.retailerName}.json`, 'utf8'));
    }
    async loadCoinByTask(taskData) {
        let coins = await this.RAMoney.getCoinsParsed2File();
        let coinType = `USD${this.coinsType[taskData.country.toUpperCase()] || this.coinsType["BRASIL"]}`;
        return coins[coinType];
    }
    parseMoney(money) {
        money = money != undefined && money != null ? money.toString().replace(/r\$|\./gmi, '').replace(',', '.') : "0";
        return parseFloat(money);
    }
}
exports.MonitorCategoria = MonitorCategoria;
//# sourceMappingURL=monitor-categoria.js.map