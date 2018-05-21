export class MonitorCategoriaTask {
    
      public monitoringTime: Date;
      public url: string;
      public retailerName: string;
      public country: string;
    
      constructor(taskData: any) {
        let parts = taskData.split(';');
        if (parts.length < 4)
          throw new Error('Invalid taskData');
    
        this.url = parts[0];
        this.retailerName = parts[1];
        this.country = parts[2];
        this.monitoringTime = parts[3];
      }
    }