import { post } from 'request';
import { RADomainApiClient } from './core/clients/ra-domain-api-client';
import { Product } from './core/model/product';

export class MonitorCategoriaService {
    private RADomainApiClient: RADomainApiClient;
    private limit = 100;
    constructor() {
        this.RADomainApiClient = new RADomainApiClient()
    }

    async save(produtcs: Array<Product>) {
        let pages = Math.ceil(produtcs.length/this.limit);
        for(let i = 0; i <= pages; i++) {
            let slice = this.paginate(produtcs, 100, i+1)
            this.RADomainApiClient.post('category-integration/create-bulk', produtcs);
        }
    }

    paginate(array, page_size, page_number) {
        return array.slice(page_number * page_size, (page_number + 1) * page_size);
      }
}