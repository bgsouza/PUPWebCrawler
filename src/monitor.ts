import { post } from 'request';
import { RAMonitor } from './core/ra-monitor';
import { MonitorCategoriaTask } from './core/model/monitor-task';
import { Product } from './core/model/product';
import { MonitorCategoriaService } from './monitor-service';
import { RAPuppeteerChrome } from './core/ra-puppeteer'
import { RAMoney } from './core/ra-money';
import { CoinsTypes } from './core/model/coin-types';
import * as fs from 'fs';

export class MonitorCategoria extends RAMonitor {
  private MonitorCategoriaService: MonitorCategoriaService;
  private RAMoney: RAMoney;
  private tagType: number;
  private chrome: RAPuppeteerChrome;
  private maxPage: number;
  private coinsType: any;

  constructor() {
    const taskType: number = 40000;
    const region: number = 0;

    super(taskType, region);

    this.MonitorCategoriaService = new MonitorCategoriaService();
    this.RAMoney = new RAMoney();
    this.tagType = 1;
    this.maxPage = 10;
    this.coinsType = CoinsTypes;

    this.chrome = new RAPuppeteerChrome();
  }

  public async executeTask(rawTaskData: MonitorCategoriaTask) {
    const taskData = new MonitorCategoriaTask(rawTaskData);
    
    if(!taskData["url"])
      return;

    //open brwoser
    await this.openBrowserDefinitions(taskData);

    //Load Scripts
    let scripts = await this.loadSettingsByRetailer(taskData);
    
    //Check Pre Definitions
    if(scripts["ScriptDefinitions"]["pre"] != null) {
      await this.executeScriptPreDefinitions(scripts["ScriptDefinitions"]["pre"]);
      if(scripts["ScriptDefinitions"]["reload"]) {
        await this.chrome.reload();
      }
    }
    //load coins
    let coin = await this.loadCoinByTask(taskData); 

    let response = await this.collectInfos(scripts, coin);
    //this.MonitorCategoriaService.save(response);
    console.log('#### Final ####');
    console.log(response);

  }

  /* Browser definitions */
  private async executeScriptPreDefinitions(code: string) {
     await this.chrome.executeScript(code)
          .then((sucess) => {
            console.log('sucess',sucess);
          }, (err) => {
            throw new Error("no executed")
            }
          );
     await this.chrome.waitFor(4000);
     await this.chrome.includeJQuery();;
     await this.chrome.hasJQuery();
      
  }

  private async executeScriptPosDefinitions(code: string) {
    await this.chrome.executeScript(code)
         .then((sucess) => {
           //console.log('sucess',sucess);
         }, (err) => {
           throw new Error("no executed")
           }
         );
    await this.chrome.waitFor(4000);
    //await this.chrome.includeJQuery();;
    //await this.chrome.hasJQuery();
     
 }
  

  private async openBrowserDefinitions(taskData: any) {
    await this.chrome.initializeBrowser();
    try {
        await this.chrome.navigateTo(taskData.url)
          .then(() => this.chrome.waitPageLoad(), (err) => { console.log(`Error when trying to navigate: ${err}`) });
        await this.chrome.IncludeAndAwaitJquery();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  private async collectInfos(scripts: any, coin: number) {
    let items:Array<Product> = [];
    let productsResults = {};
    let productNames = [];
    let position = 1;
    let currentUri = "";
    let nextPage: boolean = true;
    let visitedUris: Array<string> = [];
    try {
      for(let page = 1; page <= this.maxPage && nextPage; page++)
      {
        console.log(`#### PAG ${page} ####`);

      //Check Pós Definitions
      if(scripts["ScriptDefinitions"]["pos"] != null) {
        await this.executeScriptPosDefinitions(scripts["ScriptDefinitions"]["pos"]);
      }

        if(page > 1 && !scripts["PaginatorIsAjax"]) 
        {
          await this.chrome.IncludeAndAwaitJquery(2000);
        }

        if (scripts["ScriptProdutsBrowser"])
        productsResults = await this.chrome.executeScript(scripts["ScriptProdutsBrowser"]);
        //Get current uri
        currentUri = await this.chrome.executeScript("location.href");
        
        //Open new Tab for search details
        const newPage = await this.chrome.openInNewTab();
        const pageList = await this.chrome.pages();
	      //const page = pageList[pageList.length - 1];
        
        if (productsResults && productsResults != {})
        {
          for (let i = 0; i < (productsResults as Array<string>).length; i++) {
            
           let product = new Product();
           product.name = productsResults[i].nome || null;
           product.url = productsResults[i].url || null;;
           product.price = this.parseMoney(productsResults[i].precoRegular) || null;
           product.priceSpecial = productsResults[i].precoEspecial || null;
           product.priceOf = this.parseMoney(productsResults[i].precoDe) || null;
           product.category = productsResults[i].categoria || null;
           product.brand = productsResults[i].marca || null;
           product.subbrand = productsResults[i].submarca || null;
           product.os = productsResults[i].os || null;
           product.status = productsResults[i].disponivel || false;
          
           //convert in dolar
           product.priceDolar = product.price/coin;
           product.priceOfDolar = product.priceOf/coin;
           

            console.log(`produto Coletado`,product);
            if(productNames.indexOf(productsResults[i].name) == -1 && scripts["ScriptProductIntenalDetail"] != null) //não existe na lista
            {
              //Coleta mais infos de cada produtos
              if(product.url == null)
                continue;
              
              await this.chrome.navigateTo(product.url,newPage).then(() => this.chrome.waitPageLoad(), (err) => { console.log(`Error when trying to navigate: ${err}`) });           
              var details = await this.chrome.executeScript(scripts["ScriptProductIntenalDetail"]);
              
              if(details == undefined || typeof details !== "object") {
                //console.log(`produto Coletado Detalhes: falhou`);
                continue;
              }

              //console.log(`produto Coletado Detalhes`, details);

              //product.price = details.precoRegular || product.price;
              product.priceSpecial = details.precoEspecial || product.priceSpecial;
              //product.priceOf = details.precoDe || product.priceOf;
              product.category = details.categoria || product.category;
              product.brand = details.marca || product.price;
              product.subbrand = details.submarca || product.price;
              product.os = details.os || product.os;
              product.status = details.disponivel || product.status;
              
              //close tab
              //this.chrome.closeNewTab(tabs[3]);      

              productNames.push(productsResults[i]);
              position++;
            }
            items.push(product);
          } 
        }
        
        //verifica paginação ajax
        this.chrome.closeNewTab(newPage);
        //await this.chrome.waitFor(1000);
        
        //return page: porque ele navaga em item por item e precisa voltar para o pai
        //await this.chrome.navigateTo(currentUri).then(() => {this.chrome.waitPageLoad()}, (err) => { //console.log(`Error when trying to navigate: ${err}`) });       

        
        let successPaginate: any;
        if(!scripts["PaginatorIsAjax"]) {
          await this.chrome.executeScript(scripts["ScriptNextPageBrowser"])
          .then((sucess) =>      {
            console.log('sucess',sucess);
          }, (err) => {
            nextPage = false; throw new Error("no page next")
            }
          );
          
        } else {
          console.log('Paginação por Ajax');
          await this.chrome.executeScript(scripts["ScriptNextPageBrowser"])
        }
        await this.chrome.waitFor(4000);
      }    
    } catch (err) {
      nextPage = false;      
      console.error(err)
    }

    return items;
  }

 /* Bussiness */
 private async loadSettingsByRetailer(taskData) {
   return JSON.parse(fs.readFileSync(`${process.cwd()}/store/config/${taskData.country}/${taskData.retailerName}.json`, 'utf8'));
 }

 private async loadCoinByTask(taskData) {
  let coins = await this.RAMoney.getCoinsParsed2File();
  let coinType = `USD${this.coinsType[taskData.country.toUpperCase()] || this.coinsType["BRASIL"]}`;
  return coins[coinType];
 }
 

 /* Bussiness */

  /* Helpers */
  private parseMoney(money?: string): number {
    money = money!= undefined && money != null ? money.toString().replace(/r\$|\./gmi,'').replace(',','.') : "0";
    return parseFloat(money);
  }
}