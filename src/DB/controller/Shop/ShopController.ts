import Shop, { ShopInterface, ShopSchemaInterface, ShopCategory, Location } from '../../models/Shop';
import Keyword, { KeywordSchemaInterface } from '../../models/Keyword';
import { ShopOrder } from '../../../service/ShopService';

export class ShopController {
  constructor() {}

  async findById(id: string): Promise<ShopSchemaInterface | null> {
    return await Shop.findById(id);
  }

  async getShops(filter: any, order: ShopOrder, withOrder: boolean): Promise<ShopInterface[] | null> {
    // TODO: 정렬 방식 추가 필요
    if (withOrder) {
      return await Shop.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'reviews',
            localField: 'reviews',
            foreignField: '_id',
            as: 'reviews',
          },
        },
        {
          $addFields: { scoreAverage: { $avg: '$reviews.score' } },
        },
      ]);
    } else {
      return await Shop.find(filter);
    }
  }

  async getAllShops(): Promise<ShopInterface[] | null> {
    return await Shop.find({});
  }

  async addImage(id: string, imageLink: string[]) {
    try {
      let shop = await this.findById(id);
      if (shop === null) return false;

      shop.image.push(...imageLink);

      await shop.save();

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async createShop(
    name: string,
    contact: string,
    address: string,
    image: string[],
    open: string,
    closed: string,
    location: Location,
    category: ShopCategory,
  ): Promise<ShopInterface | null> {
    try {
      let keyword = new Keyword({
        atmosphere: 0,
        costRatio: 0,
        group: 0,
        individual: 0,
        riceAppointment: 0,
        spicy: 0,
      });

      await keyword.save();

      let shop = new Shop({
        name,
        contact,
        address,
        image,
        category,
        keyword: keyword._id,
        reviews: [],
        open,
        closed,
        location,
      });

      await shop.save();

      return shop as ShopInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
