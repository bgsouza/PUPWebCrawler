import { Promise, EventEmitter } from 'puppeteer';
import { timeout, TimeoutError } from 'promise-timeout';
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

export class RAPuppeteerChrome {
    public browser : Promise;
    public page : EventEmitter;

    constructor() {
    }

    async initializeBrowser() {
        this.browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
        this.page = await this.browser.newPage();
        this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36')
        this.page.setViewport({
            width: 1920,
            height: 1080
        });   
    }

    async navigateTo(url, page?: any) {
        if (!url)
          throw new Error('Missing URL');
          if(page == null) {
            return await this.page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 180000
            });
        } else {
            //await page.setRequestInterception(true); //make sure it won't load extra stuff
            return await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 180000
            });
        }
    }

    async takeScreenshot() {  
        let image = this.page.screenshot({fullPage: true, type: 'jpeg'});
        await timeout(image, 30000)
        .then((thing) => console.log("Screenshot successfull!"))
        .catch((err) => {
            //logger.verbose(err);
            console.log(`[takeScreenshot][ERROR]: ${err}`)
            image = null;
        });
        return image;
    }

    destroy() {
        if (this.browser)
          this.browser.close();
    }

    async closeBrowser() {
        return await this.browser.close();
    }

    async pages() {
        return await this.browser.pages();
    }

    async executeScript(jQueryExpression) {
        try {
          const scriptResult = await this.page.evaluate(jQueryExpression);
          return scriptResult;
        } catch (err) {
          //console.error(err);
          throw new Error(err);
          //return {};
        }
    }

    async reload() {
        await this.page.reload().then(() => this.waitPageLoad(), (err) => { console.log(`Error when trying to navigate: ${err}`) });
    }

    async waitPageLoad() {
        let pageready =  false;
        do {
        let readyState = await this.executeScript('document.readyState;');
        pageready = readyState == 'complete' || readyState == 'interactive';
        } while (!pageready)
        return pageready;
    }

    async waitFor(ms: number) {
        await this.page.waitFor(4000);
    }

    async wait(ms: number) {
        await timeout(()=>{return true;}, 3000);
    }

    async openInNewTab() {
        return await this.browser.newPage()
    }
    
    async closeNewTab(page: any) {
       await page.close();
    }

    async setCookie(cookie) {
        let arrCookie = cookie.split('=');
        let key = arrCookie[0];
        let value = arrCookie[1];
        return await this.page.setCookie({name:key, value:value});
    }

    async setCookieJQuery(cookie) {
        await this.executeScript("document.cookie='"+cookie+"'");
    }

    async getCurrentUri() {
        return await this.executeScript("location.href");
    }
    async getCultureInfo() {
        let script = "navigator.language || navigator.userLanguage;";
        return await this.executeScript(script);
    }

    async includeJQuery() {
        const jqueryscript = 
          `var s=window.document.createElement('script'); s.src='https://code.jquery.com/jquery-3.2.1.min.js'; window.document.head.appendChild(s);`;
        await this.executeScript(jqueryscript);
      }
    
    async hasJQuery() {
        let jqueryReady = false;
        let hit = 0;
        let script = `document.querySelector('script[src="https://code.jquery.com/jquery-3.2.1.min.js"]') != null;`;
        
        do {
          let readyState = await this.executeScript(script);
          jqueryReady = readyState == true;
          hit++;

          if(hit > 3) {
              await this.includeJQuery();
          }
        } while (!jqueryReady)
        await this.waitFor(2000);
        await this.executeScript('$=jQuery');
        return jqueryReady;
        //await this.driver.executeScript(`$ = typeof $ == undefined ? jQuery : $`);
    }

    async IncludeAndAwaitJquery(timeout?: number) {
        if(timeout != null) {
            await this.waitFor(timeout);
        }
        await this.includeJQuery()
        return await this.hasJQuery();
    }

    private convertExpressionToJqueryFunction(jQueryExpression) {
        //This method returns only a function of the jquery expression or false.
        var reg = /\jQuery\(('|").*?('|")\)\.|\$\(('|").*?('|")\)\./;
        if(reg.test(jQueryExpression)) 
        {
            let match = reg.exec(jQueryExpression);
            let selector = match[0].replace(").", ")");
            return selector;
        } 
        return jQueryExpression;
    }


}