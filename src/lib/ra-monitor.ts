import { TaskDeliveryClient } from './clients/task-deivery-client';

export class RAMonitor {

  private taskType: number;
  private region: number;

  private taskDeliveryClient: TaskDeliveryClient;

  constructor(taskType: number, region: number) {
    if (taskType == undefined)
      throw new Error('Missing parameter [taskType]');

    if (region == undefined)
      throw new Error('Missing parameter [region]');

    this.taskType = taskType;
    this.region = region;
    this.taskDeliveryClient = new TaskDeliveryClient()
  }

  public async init() {
    let task = null;

    //task = 'https://www.att.com.mx/tienda/motorola.html?limit=15;att;mexico;2017-01-07 18:00:00';
    //task = 'https://lojaonline.vivo.com.br/vivostorefront/Vivo/Aparelhos/Smartphone/c/SMARTPHONE;vivo;brasil;2017-01-07 18:00:00';
    //task = 'https://lojaonline.claro.com.br/celular;claro;brasil;2017-01-07 18:00:00';
    task   = 'https://www.americanas.com.br/categoria/434997;americanas;brasil;2017-01-07 18:00:00';
    //task   = 'https://lojaonline.tim.com.br/celulares;tim;brasil;2017-01-07 18:00:00';
    
    // do {
    //   try {
    //     task = await this.taskDeliveryClient.getNextTask({ region: this.region, taskType: this.taskType });
    //     if (!task) return;
    //   } catch (err) {
    //     console.error(err);
    //     return;
    //   }

       try {
         const result = await this.executeTask(task);

         this.taskDeliveryClient.updateTask({ failedtaskData: '', id: task['Id'], status: 3 });
       } catch (err) {
         console.error(err);
         this.taskDeliveryClient.updateTask({ failedtaskData: err.message, id: task['Id'], status: -1 });
       }
     //} while (task != null)
  }

  public async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async executeTask(taskData: any) {
    throw new Error('Not Implemented');
  }
}
