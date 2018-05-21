"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_deivery_client_1 = require("./clients/task-deivery-client");
class RAMonitor {
    constructor(taskType, region) {
        if (taskType == undefined)
            throw new Error('Missing parameter [taskType]');
        if (region == undefined)
            throw new Error('Missing parameter [region]');
        this.taskType = taskType;
        this.region = region;
        this.taskDeliveryClient = new task_deivery_client_1.TaskDeliveryClient();
    }
    async init() {
        let task = null;
        task = 'https://www.att.com.mx/tienda/motorola.html?limit=15;att;mexico;2017-01-07 18:00:00';
        try {
            const result = await this.executeTask(task);
            this.taskDeliveryClient.updateTask({ failedtaskData: '', id: task['Id'], status: 3 });
        }
        catch (err) {
            console.error(err);
            this.taskDeliveryClient.updateTask({ failedtaskData: err.message, id: task['Id'], status: -1 });
        }
    }
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async executeTask(taskData) {
        throw new Error('Not Implemented');
    }
}
exports.RAMonitor = RAMonitor;
//# sourceMappingURL=ra-monitor.js.map