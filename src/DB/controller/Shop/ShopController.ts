import Shop, { ShopInterface, ShopSchemaInterface, ShopCategory, Location } from '../../models/Shop';
import Keyword, { KeywordSchemaInterface } from '../../models/Keyword';
import { ShopOrder } from '../../../service/ShopService';
import User from '../../models/User';

export class ShopController {
  constructor() {}

  async findById(id: string): Promise<ShopSchemaInterface | null> {
    return await Shop.findById(id);
  }

  async getShops(filter: any, order: ShopOrder, withOrder: boolean): Promise<ShopInterface[] | null> {
    // TODO: 정렬 방식 추가 필요
    if (withOrder) {
      let shops = await Shop.aggregate([
        // 해당 가게 찾은 후에
        { $match: filter },
        // reviews에 Review Join
        {
          $lookup: {
            from: 'reviews',
            localField: 'reviews',
            foreignField: '_id',
            as: 'reviews',
          },
        },
        // Review의 shop 안보이도록
        {
          $project: {
            'reviews.shop': 0,
          },
        },
        // Review 평균 구해서 scoreAverage 추가
        {
          $addFields: { scoreAverage: { $avg: '$reviews.score' } },
        },
      ]);
      // reviews 안에 있는 userId Join
      await User.populate(shops, { path: 'reviews.user', select: '_id name email' });
      return shops;
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
