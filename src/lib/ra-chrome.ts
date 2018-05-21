const chromedriver = require('chromedriver');
import { ThenableWebDriver, Builder, until, WebElementCondition, By, Key } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { spawn } from 'child_process';

export class RAChrome {
  private driver: ThenableWebDriver;

  constructor() {
    const options = new Options();
    //options['options_']['debuggerAddress'] = `${process.env.CHROME_IP_ADDRESS}:${process.env.CHROME_IP_PORT}`;

    this.driver = new Builder()
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
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  async waitPageLoad() {

    let pageready = false;
    do {
      let readyState = await this.driver.executeScript('return document.readyState;');
      pageready = readyState == 'complete';
    } while (!pageready)

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

  async openInNewTab(url: string) {
    this.driver.findElement(By.tagName("body")).sendKeys(Key.CONTROL +"t");
    var tabs = this.driver.getWindowHandle();
    this.driver.switchTo().window(tabs[1]); //switches to new tab
    this.driver.get(url);
  }

  async closeTab(index: number) {
    var tabs = this.driver.getWindowHandle();
    this.driver.switchTo().window(tabs[index]); //switches to new tab
    this.driver.close();
    //volta pra tab pai
    this.driver.switchTo().window(tabs[0]); 
  }

  async includeJQuery() {
    const jqueryscript = 
      `var s=window.document.createElement('script'); s.src='https://code.jquery.com/jquery-3.2.1.min.js'; window.document.head.appendChild(s);`;
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
    } while (!jqueryReady)
    console.log('JQuery OK');
    return jqueryReady;
    //await this.driver.executeScript(`$ = typeof $ == undefined ? jQuery : $`);
  }
}