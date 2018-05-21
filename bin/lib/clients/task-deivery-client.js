"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("request");
const task_type_1 = require("./../model/task-type");
class TaskDeliveryClient {
    set apiUrl(value) {
        if (value.endsWith('/'))
            this.apiUrl = value.substr(0, value.length - 1);
        this._apiUrl = value;
    }
    get apiUrl() {
        return this._apiUrl;
    }
    constructor() {
        this.apiUrl = process.env.TASK_DELIVERY_API_URL;
    }
    async getNextTask(getNextTaskModel) {
        const localizedTaskType = getNextTaskModel.taskType + getNextTaskModel.region;
        if (!task_type_1.TaskType[localizedTaskType])
            throw new Error('Invalid TaskType - Region combination');
        const agentOwner = `${process.env.COMPUTERNAME}.MonitorBrowserV2.${process.pid}`;
        const response = await this.post('/api/Task/GetNextTask', { type: localizedTaskType, agentOwner: agentOwner, status: 0 });
        const parsed = JSON.parse(response);
        return parsed.Content;
    }
    async updateTask(updateTaskModel) {
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
    post(path, data) {
        const querystring = `task=${JSON.stringify(data)}`;
        const uri = `${this.apiUrl}${path}`;
        let options = {
            form: data
        };
        return new Promise((resolve, reject) => {
            request_1.post(uri, options, (error, response, body) => {
                if (error)
                    return reject(error);
                if (response.statusCode != 200)
                    return reject(response);
                return resolve(body);
            });
        });
    }
}
exports.TaskDeliveryClient = TaskDeliveryClient;
//# sourceMappingURL=task-deivery-client.js.map