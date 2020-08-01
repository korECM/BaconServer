import { IShopController } from '../DB/controller/Shop/IShopController';
import { ShopController } from '../DB/controller/Shop/ShopController';
import { ShopCategory } from '../DB/models/Shop';

// TODO: 키워드, 가격 검색 추가 필요
export enum ShopOrder {
  Recommended,
  Rate,
  Review,
}

export interface ShopFilterInterface {
  category: ShopCategory[] | undefined;
  location: Location[] | undefined;
  order: ShopOrder | undefined;
}

export class ShopService {
  constructor(private ShopDB: IShopController = new ShopController()) {}

  async getAllShops() {
    let shops = await this.ShopDB.getAllShops();
    if (shops === null) return [];
    return shops;
  }

  async getShops(filter: ShopFilterInterface, withReview: boolean = false) {
    let where: any = {};
    const { category, location, order } = filter;
    if (category && category.length > 0) where.category = { $in: category };
    if (location && location.length > 0) where.location = { $in: location };
    let shops = await this.ShopDB.getShops(where, order || ShopOrder.Recommended, withReview);
    if (shops === null) return [];
    return shops;
  }
}
