export class Product {
    name: string;
    url: string;
    price: number;
    priceSpecial: boolean;
    priceOf: number;
    priceDolar: number;
    priceOfDolar: number;
    category: string;
    brand: string;
    subbrand: string;
    os: string;
    status: ProductStatus;

    constructor() {
        this.name = null;
        this.url = null;
        this.price = 0;
        this.priceSpecial = false;
        this.priceOf = 0;
        this.category = null;
        this.brand = null;
        this.subbrand = null;
        this.os = null;
        this.priceDolar = 0;
        this.status = ProductStatus.DISPONIVEL;
    }
}

export enum ProductStatus {
    DISPONIVEL,
    RUPTURA,
}