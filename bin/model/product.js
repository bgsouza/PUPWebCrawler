"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Product {
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
exports.Product = Product;
var ProductStatus;
(function (ProductStatus) {
    ProductStatus[ProductStatus["DISPONIVEL"] = 0] = "DISPONIVEL";
    ProductStatus[ProductStatus["RUPTURA"] = 1] = "RUPTURA";
})(ProductStatus = exports.ProductStatus || (exports.ProductStatus = {}));
//# sourceMappingURL=product.js.map