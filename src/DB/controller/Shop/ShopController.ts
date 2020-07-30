import Shop, { ShopInterface, ShopSchemaInterface, ShopCategory } from '../../models/Shop';
import { KeywordSchemaInterface } from '../../models/Keyword';

export class ShopController {
  constructor() {}

  async findById(id: string): Promise<ShopSchemaInterface | null> {
    return await Shop.findById(id);
  }

  async getShops(filter: any): Promise<ShopInterface[] | null> {
    return await Shop.find(filter);
  }

  async getAllShops(): Promise<ShopInterface[] | null> {
    return await Shop.find({});
  }

  async createShop(
    name: string,
    contact: string,
    address: string,
    image: string[],
    open: string,
    closed: string,
    location: Location,
    keyword: KeywordSchemaInterface,
    category: ShopCategory[],
  ): Promise<ShopInterface | null> {
    let shop = new Shop({
      name,
      contact,
      address,
      image,
      category,
      keyword,
      open,
      closed,
      location,
    });

    try {
      await shop.save();

      return shop as ShopInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
