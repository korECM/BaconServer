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
    if (withOrder) {
      let orderQuery: any;
      switch (order) {
        case ShopOrder.Rate:
          orderQuery = {
            $sort: {
              scoreAverage: -1,
            },
          };
          break;
        case ShopOrder.Recommended:
          orderQuery = {
            $sort: {
              likerCount: -1,
            },
          };
          break;
        case ShopOrder.Review:
          orderQuery = {
            $sort: {
              reviewCount: -1,
            },
          };
          break;
      }

      let shops = await Shop.aggregate([
        // 해당 가게 찾은 후에
        { $match: filter },
        // reviews에 Review Join
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'shop',
            as: 'reviews',
          },
        },
        // 해당 가게 Like 한사람 Join
        {
          $lookup: {
            from: 'users',
            let: { shopId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$$shopId', '$likeShop'],
                  },
                },
              },
            ],
            as: 'liker',
          },
        },
        // Review 평균 구해서 scoreAverage 추가
        {
          $addFields: { scoreAverage: { $avg: '$reviews.score' }, reviewCount: { $size: '$reviews' }, likerCount: { $size: '$liker' } },
        },
        // Review 가리도록
        {
          $project: {
            reviews: 0,
            __v: 0,
            liker: 0,
          },
        },
        orderQuery,
      ]);
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
