import { Options } from 'selenium-webdriver/chrome';
import { post, RequestResponse, CoreOptions } from "request";
import { TaskType } from './../model/task-type'

export class TaskDeliveryClient {
  private _apiUrl: string;
  private set apiUrl(value: string) {
    if (value.endsWith('/'))
      this.apiUrl = value.substr(0, value.length - 1);

    this._apiUrl = value;
  }
  private get apiUrl(): string {
    return this._apiUrl;
  }

  constructor() {
    this.apiUrl = process.env.TASK_DELIVERY_API_URL;
  }

  public async getNextTask(getNextTaskModel: GetNextTaskModel) {
    const localizedTaskType = getNextTaskModel.taskType + getNextTaskModel.region;

    if (!TaskType[localizedTaskType])
      throw new Error('Invalid TaskType - Region combination');

    const agentOwner = `${process.env.COMPUTERNAME}.MonitorBrowserV2.${process.pid}`;
    const response = await this.post('/api/Task/GetNextTask', { type: localizedTaskType, agentOwner: agentOwner, status: 0 });
    const parsed = JSON.parse(response);

    return parsed.Content;
  }

  public async  updateTask(updateTaskModel: UpdateTaskModel) {
    if (!updateTaskModel)
      throw new Error('Invalid parameter: updateTaskModel');

    if (!updateTaskModel.id)
      throw new Error('Missing property: updateTaskModel.id');

    if (!updateTaskModel.status)
      throw new Error('Missing property: updateTaskModel.status');

    const response = await this.post('/api/Task/UpdateTaskStatus', updateTaskModel);
    const parsed = JSON.parse(response);

    return parsed.Content;
  }

  private post(path: string, data: any): Promise<string> {

    const querystring = `task=${JSON.stringify(data)}`;
    const uri = `${this.apiUrl}${path}`;

    let options: CoreOptions = {
      form: data
    };

    return new Promise<string>((resolve, reject) => {
      post(uri, options, (error: any, response: RequestResponse, body: string) => {
        if (error) return reject(error);
        if (response.statusCode != 200) return reject(response);

        return resolve(body);
      });
    });
  }
}

interface UpdateTaskModel {
  id: number;
  status: number;
  failedtaskData: string;
}

interface GetNextTaskModel {
  taskType: TaskType;
  region: number;
}