import Shop, { ShopInterface, ShopSchemaInterface, ShopCategory, Location, Keyword as KeywordInterface } from '../../models/Shop';
import Keyword, { KeywordSchemaInterface } from '../../models/Keyword';
import mongoose from 'mongoose';
import Menu from '../../models/Menu';
import Image, { ImageType } from '../../models/Image';
import ShopReport from '../../models/ShopReport';
import User from '../../models/User';

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
  keyword?: KeywordInterface[];
}

export interface ReportOption {
  type: number[];
  comment: string;
  userId: string;
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
          from: 'images',
          let: { shopId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ['$shopId', '$$shopId'] }, { $eq: ['shop', '$type'] }] },
              },
            },
          ],
          as: 'shopImage',
        },
      },
      {
        $lookup: {
          from: 'images',
          let: { shopId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ['$shopId', '$$shopId'] }, { $eq: ['menu', '$type'] }] },
              },
            },
          ],
          as: 'menuImage',
        },
      },
      {
        $lookup: {
          from: 'menus',
          localField: '_id',
          foreignField: 'shopId',
          as: 'menus',
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
          menus: {
            shopId: 0,
            registerDate: 0,
            __v: 0,
          },
          shopImage: {
            shopId: 0,
            type: 0,
            registerDate: 0,
            __v: 0,
          },
          menuImage: {
            shopId: 0,
            type: 0,
            registerDate: 0,
            __v: 0,
          },
        },
      },
    ]);
    if (shops.length === 0) return null;
    return shops[0];
  }

  async getShops(filter: ShopFilterInterface): Promise<ShopInterface[]> {
    let where: any = {};
    let keywordWhere: any = {};
    let minKeywordSum = -1;
    let { category, location, order, price, keyword } = filter;
    if (category && category.length > 0) where.category = { $in: category };
    if (location && location.length > 0) where.location = { $in: location };
    if (price && !isNaN(Number(price))) where.price = { $lte: parseInt(price) };
    if (keyword && keyword.length > 0) {
      keywordWhere.topKeyword = { $in: keyword };
      minKeywordSum = 0;
    }

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
          keyword: {
            _id: 0,
            registerDate: 0,
            __v: 0,
          },
        },
      },
      {
        $addFields: {
          keywordObjectArray: {
            $objectToArray: '$keyword',
          },
          keywordSum: {
            $add: ['$keyword.atmosphere', '$keyword.costRatio', '$keyword.group', '$keyword.individual', '$keyword.riceAppointment', '$keyword.spicy'],
          },
        },
      },
      // TODO:Keyword 평가가 아예 없는 경우 제외 팀원한테 확인
      {
        $match: {
          $expr: {
            $gt: ['$keywordSum', minKeywordSum],
          },
        },
      },
      {
        $unwind: {
          path: '$keywordObjectArray',
        },
      },
      {
        $sort: {
          'keywordObjectArray.v': 1,
        },
      },
      {
        $group: {
          _id: '$_id',
          sortedKeywordObjectArray: {
            $push: '$keywordObjectArray',
          },
          name: {
            $first: '$name',
          },
          contact: {
            $first: '$contact',
          },
          category: {
            $first: '$category',
          },
          keyword: {
            $first: '$keyword',
          },
          open: {
            $first: '$open',
          },
          closed: {
            $first: '$closed',
          },
          location: {
            $first: '$location',
          },
          registerDate: {
            $first: '$registerDate',
          },
        },
      },
      {
        $addFields: {
          topKeyword: {
            $map: {
              input: '$sortedKeywordObjectArray',
              as: 'object',
              in: {
                $concat: ['$$object.k', ''],
              },
            },
          },
        },
      },
      {
        $addFields: {
          topKeyword: {
            $slice: ['$topKeyword', 2],
          },
        },
      },
      { $match: keywordWhere },
      {
        $lookup: {
          from: 'images',
          let: { shopId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ['$shopId', '$$shopId'] }, { $eq: ['shop', '$type'] }] },
              },
            },
          ],
          as: 'shopImage',
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

  async getMyShop(userId: string) {
    const user = await User.findById(userId);
    if (!user) return [];

    let orderQuery = {
      $sort: {
        scoreAverage: -1,
        likerCount: -1,
        reviewCount: -1,
      },
    };

    let shops = await Shop.aggregate([
      // 해당 가게 찾은 후에
      {
        $match: {
          _id: {
            $in: user.likeShop,
          },
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
          keyword: {
            _id: 0,
            registerDate: 0,
            __v: 0,
          },
        },
      },
      {
        $addFields: {
          keywordObjectArray: {
            $objectToArray: '$keyword',
          },
          keywordSum: {
            $add: ['$keyword.atmosphere', '$keyword.costRatio', '$keyword.group', '$keyword.individual', '$keyword.riceAppointment', '$keyword.spicy'],
          },
        },
      },
      {
        $unwind: {
          path: '$keywordObjectArray',
        },
      },
      {
        $sort: {
          'keywordObjectArray.v': 1,
        },
      },
      {
        $group: {
          _id: '$_id',
          sortedKeywordObjectArray: {
            $push: '$keywordObjectArray',
          },
          name: {
            $first: '$name',
          },
          contact: {
            $first: '$contact',
          },
          category: {
            $first: '$category',
          },
          keyword: {
            $first: '$keyword',
          },
          open: {
            $first: '$open',
          },
          closed: {
            $first: '$closed',
          },
          location: {
            $first: '$location',
          },
          registerDate: {
            $first: '$registerDate',
          },
        },
      },
      {
        $addFields: {
          topKeyword: {
            $map: {
              input: '$sortedKeywordObjectArray',
              as: 'object',
              in: {
                $concat: ['$$object.k', ''],
              },
            },
          },
        },
      },
      {
        $addFields: {
          topKeyword: {
            $slice: ['$topKeyword', 2],
          },
        },
      },
      {
        $lookup: {
          from: 'images',
          let: { shopId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ['$shopId', '$$shopId'] }, { $eq: ['shop', '$type'] }] },
              },
            },
          ],
          as: 'shopImage',
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

      for (let link of imageLink) {
        await Image.create({
          imageLink: link,
          shopId: shop._id,
          type: ImageType.Shop,
        });
      }

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

      for (let link of imageLink) {
        await Image.create({
          imageLink: link,
          shopId: shop._id,
          type: ImageType.Menu,
        });
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async addMenu(shopId: string, title: string, price: number) {
    try {
      let shop = await this.findById(shopId);
      if (shop === null) return false;

      let menu = await Menu.create({
        title,
        price,
        shopId,
      });

      await menu.save();

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async editMenu(menuId: string, title: string, price: number) {
    try {
      let menu = await Menu.findById(menuId);
      if (menu === null) return false;

      menu.title = title;
      menu.price = price;

      await menu.save();

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async deleteMenu(menuId: string) {
    try {
      let menu = await Menu.findById(menuId);
      if (menu === null) return false;

      await menu.remove();

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
    open: string,
    closed: string,
    price: number,
    latitude: number,
    longitude: number,
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

      let shop = await Shop.create({
        name,
        contact,
        address,
        category,
        open,
        closed,
        location,
        keyword: keyword._id,
        latitude,
        longitude,
        price,
        registerDate: new Date(),
      });

      return shop as ShopInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async addReport(shopId: string, data: ReportOption) {
    try {
      let shop = await this.findById(shopId);
      if (shop === null) return false;

      await ShopReport.create({
        comment: data.comment,
        registerDate: new Date(),
        shopId,
        type: data.type,
        userId: data.userId,
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async editShop(shopId: string, shopData: ShopEditData) {
    try {
      let shop = await this.findById(shopId);
      if (shop === null) return false;

      const { name, address, latitude, location, longitude, category, closed, contact, open } = shopData;

      shop.name = name;
      shop.address = address;
      shop.latitude = latitude;
      shop.location = location;
      shop.longitude = longitude;
      shop.category = category;
      shop.closed = closed;
      shop.contact = contact;
      shop.open = open;

      await shop.save();

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

interface ShopEditData {
  name: string;
  address: string;
  location: Location;
  latitude: number;
  longitude: number;
  category: ShopCategory;
  contact: string;
  open: string;
  closed: string;
}
