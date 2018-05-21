"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MonitorCategoriaTask {
    constructor(taskData) {
        let parts = taskData.split(';');
        if (parts.length < 4)
            throw new Error('Invalid taskData');
        this.url = parts[0];
        this.retailerName = parts[1];
        this.country = parts[2];
        this.monitoringTime = parts[3];
    }
}
exports.MonitorCategoriaTask = MonitorCategoriaTask;
//# sourceMappingURL=monitor-categoria-task.js.map