import { Promise, EventEmitter } from 'puppeteer';
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

export class PuppeteerChrome {
    public browser : Promise;
    public page : EventEmitter;

    constructor() {
    }

    async initializeBrowser() {
        this.browser = await puppeteer.launch({
            headless: false
        });
        this.page = await this.browser.newPage();
        this.page.setViewport({
            width: 1920,
            height: 1080
        });    
    }

    async navigateTo(url) {
        if (!url)
          throw new Error('Missing URL');
        return await this.page.goto(url);
    }

    async takeScreenshot() {  
        let image = await this.page.screenshot({fullPage: true, type: 'jpeg'});
        return image;
    }

    destroy() {
        if (this.browser)
          this.browser.close();
    }

    async closeBrowser() {
        return await this.browser.close();
    }

    async executeScript(jQueryExpression, page?: EventEmitter) {
        let p = page || this.page;
        try {
          const scriptResult = await p.evaluate(jQueryExpression);
          return scriptResult;
        } catch (err) {
          console.error(err);
          return {};
        }
    }

    async waitPageLoad() {
        let pageready = false;
        do {
        let readyState = await this.executeScript('document.readyState;');
        pageready = readyState == 'complete';
        } while (!pageready)
        return pageready;
    }

    async openInNewTab(url: string) {
        const page = await this.browser.newPage()
        await page.goto(url);

        return page;
    }
    
    async closeNewTab(page: EventEmitter) {
        page.close();

        return page;
    }

    async includeJQuery() {
        const jqueryscript = 
          `var s=window.document.createElement('script'); s.src='https://code.jquery.com/jquery-3.2.1.min.js'; window.document.head.appendChild(s);`;
        await this.executeScript(jqueryscript);
      }
    
      async hasJQuery() {
        let jqueryReady = false;
        let script = `document.querySelector('script[src="https://code.jquery.com/jquery-3.2.1.min.js"]') != null;`;
        do {
          let readyState = await this.executeScript(script);
          jqueryReady = readyState == true;
        } while (!jqueryReady)
        return jqueryReady;
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
