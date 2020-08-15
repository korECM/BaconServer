import Shop, { ShopInterface, ShopSchemaInterface, ShopCategory, Location } from '../../models/Shop';
import Keyword, { KeywordSchemaInterface } from '../../models/Keyword';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

// TODO: 키워드, 가격 검색 추가 필요
export enum ShopOrder {
  Recommended = 'recommended',
  Rate = 'rate',
  Review = 'review',
}

export interface ShopFilterInterface {
  category?: ShopCategory[];
  location?: Location[];
  price?: string;
  order?: ShopOrder;
}

export class ShopController {
  constructor() {}

  async findById(id: string): Promise<ShopSchemaInterface | null> {
    return await Shop.findById(id);
  }

  async getShop(id: string, userId?: string): Promise<ShopInterface | null> {
    let shops = await Shop.aggregate([
      {
        $match: {
          _id: ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'keywords',
          localField: 'keyword',
          foreignField: '_id',
          as: 'keyword',
        },
      },
      {
        $unwind: {
          path: '$keyword',
        },
      },
      {
        $project: {
          keywords: {
            __v: 0,
            registerDate: 0,
          },
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'shop',
          as: 'reviews',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            shopId: '$_id',
          },
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
      {
        $lookup: {
          from: 'scores',
          localField: '_id',
          foreignField: 'shop',
          as: 'scores',
        },
      },
      {
        $addFields: {
          scoreAverage: {
            $avg: '$scores.score',
          },
          reviewCount: {
            $size: '$reviews',
          },
          likerCount: {
            $size: '$liker',
          },
          didLike: {
            $in: [ObjectId(userId), '$liker._id'],
          },
        },
      },
      {
        $project: {
          reviews: 0,
          __v: 0,
          liker: 0,
          scores: 0,
        },
      },
    ]);
    if (shops.length === 0) return null;
    return shops[0];
  }

  async getShops(filter: ShopFilterInterface): Promise<ShopInterface[]> {
    let where: any = {};
    let { category, location, order, price } = filter;
    if (category && category.length > 0) where.category = { $in: category };
    if (location && location.length > 0) where.location = { $in: location };
    if (price && !isNaN(Number(price))) where.price = { $lte: parseInt(price) };
    order = order || ShopOrder.Recommended;

    let orderQuery: any;
    switch (order) {
      case ShopOrder.Rate:
        orderQuery = {
          $sort: {
            scoreAverage: -1,
            likerCount: -1,
            reviewCount: -1,
          },
        };
        break;
      case ShopOrder.Recommended:
        orderQuery = {
          $sort: {
            likerCount: -1,
            scoreAverage: -1,
            reviewCount: -1,
          },
        };
        break;
      case ShopOrder.Review:
        orderQuery = {
          $sort: {
            reviewCount: -1,
            scoreAverage: -1,
            likerCount: -1,
          },
        };
        break;
    }

    let shops = await Shop.aggregate([
      // 해당 가게 찾은 후에
      { $match: where },
      // reviews에 Review Join
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'shop',
          as: 'reviews',
        },
      },
      {
        $lookup: {
          from: 'scores',
          localField: '_id',
          foreignField: 'shop',
          as: 'scores',
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
        $addFields: { scoreAverage: { $avg: '$scores.score' }, reviewCount: { $size: '$reviews' }, likerCount: { $size: '$liker' } },
      },
      // Review 가리도록
      {
        $project: {
          reviews: 0,
          __v: 0,
          liker: 0,
          scores: 0,
        },
      },
      orderQuery,
    ]);
    return shops || [];
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

  async addMenuImage(id: string, imageLink: string[]) {
    try {
      let shop = await this.findById(id);
      if (shop === null) return false;
      if (!shop.menuImage) shop.menuImage = [];
      shop.menuImage.push(...imageLink);

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
    price: number,
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
