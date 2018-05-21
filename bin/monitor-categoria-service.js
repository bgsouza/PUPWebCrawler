"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ra_domain_api_client_1 = require("./lib/clients/ra-domain-api-client");
class MonitorCategoriaService {
    constructor() {
        this.limit = 100;
        this.RADomainApiClient = new ra_domain_api_client_1.RADomainApiClient();
    }
    async save(produtcs) {
        let pages = Math.ceil(produtcs.length / this.limit);
        for (let i = 0; i <= pages; i++) {
            let slice = this.paginate(produtcs, 100, i + 1);
            this.RADomainApiClient.post('category-integration/create-bulk', produtcs);
        }
    }
    paginate(array, page_size, page_number) {
        return array.slice(page_number * page_size, (page_number + 1) * page_size);
    }
}
exports.MonitorCategoriaService = MonitorCategoriaService;
//# sourceMappingURL=monitor-categoria-service.js.map