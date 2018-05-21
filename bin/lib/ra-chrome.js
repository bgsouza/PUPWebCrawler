"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chromedriver = require('chromedriver');
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_1 = require("selenium-webdriver/chrome");
class RAChrome {
    constructor() {
        const options = new chrome_1.Options();
        this.driver = new selenium_webdriver_1.Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        this.driver.manage().timeouts().pageLoadTimeout(6000);
    }
    async navigateTo(url) {
        if (!url)
            throw new Error('Missing URL');
        return this.driver.get(url);
    }
    async executeScript(script) {
        try {
            await this.includeJQuery();
            return this.driver.executeScript(script);
        }
        catch (err) {
            console.error(err);
            return {};
        }
    }
    async waitPageLoad() {
        let pageready = false;
        do {
            let readyState = await this.driver.executeScript('return document.readyState;');
            pageready = readyState == 'complete';
        } while (!pageready);
        return pageready;
    }
    async sendValueTo(selector, value) {
        await this.executeScript(`${selector}[0].value='${value}';`);
    }
    async getValueFrom(selector) {
        return await this.executeScript(`return ${selector}[0].value || ${selector}[0].title || ${selector}[0].text.trim();`);
    }
    async submit(formSelector) {
        return await this.executeScript(`${formSelector}.submit();`);
    }
    async quit() {
        if (this.driver)
            await this.driver.quit();
    }
    destroy() {
        if (this.driver)
            this.driver.close();
    }
    async openInNewTab(url) {
        this.driver.findElement(selenium_webdriver_1.By.tagName("body")).sendKeys(selenium_webdriver_1.Key.CONTROL + "t");
        var tabs = this.driver.getWindowHandle();
        this.driver.switchTo().window(tabs[1]);
        this.driver.get(url);
    }
    async closeTab(index) {
        var tabs = this.driver.getWindowHandle();
        this.driver.switchTo().window(tabs[index]);
        this.driver.close();
        this.driver.switchTo().window(tabs[0]);
    }
    async includeJQuery() {
        const jqueryscript = `var s=window.document.createElement('script'); s.src='https://code.jquery.com/jquery-3.2.1.min.js'; window.document.head.appendChild(s);`;
        console.log('Injetando JQuery');
        await this.executeScript(jqueryscript);
        console.log('JQuery injetou');
    }
    async hasJQuery() {
        let jqueryReady = false;
        let script = `return document.querySelector('script[src="https://code.jquery.com/jquery-3.2.1.min.js"]') != null;`;
        do {
            console.log('Testando se tem JQuery');
            let readyState = await this.executeScript(script);
            jqueryReady = readyState == true;
        } while (!jqueryReady);
        console.log('JQuery OK');
        return jqueryReady;
    }
}
exports.RAChrome = RAChrome;
//# sourceMappingURL=ra-chrome.js.map