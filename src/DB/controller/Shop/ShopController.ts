import Shop, { ShopInterface, ShopSchemaInterface, ShopCategory, Location, FoodCategory, DetailFoodCategory } from '../../models/Shop';
import Keyword, { KeywordInterface } from '../../models/Keyword';
import mongoose from 'mongoose';
import Menu from '../../models/Menu';
import Image, { ImageType } from '../../models/Image';
import ShopReport, { ShopReportState } from '../../models/ShopReport';
import User from '../../models/User';
import { deleteImage } from '../../../lib/image';
import ImageReport, { ImageReportState } from '../../models/ImageReport';
import ReviewReport, { ReviewReportState } from '../../models/ReviewReport';
import { s3ToCf } from '../../../lib/imageUrlConverting';
import { Client } from '@elastic/elasticsearch';

const ObjectId = mongoose.Types.ObjectId;

// TODO: 키워드, 가격 검색 추가 필요
export enum ShopOrder {
  Recommended = 'recommended',
  Rate = 'rate',
  Review = 'review',
}

export interface ShopFilterInterface {
  category?: ShopCategory[];
  foodCategory?: FoodCategory[];
  location?: Location[];
  price?: string[];
  order?: ShopOrder;
  keyword?: KeywordInterface[];
  name?: string;
}

export interface ReportOption {
  type: number[];
  comment: string;
  userId: string;
}

export interface MenuInputInterface {
  menu: string;
  price: number;
}

export class ShopController {
  constructor() {}

  async findById(id: string): Promise<ShopSchemaInterface | null> {
    return await Shop.findById(id);
  }

  async getShop(id: string, userId?: string): Promise<ShopInterface | null> {
    try {
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
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private priceToQuery(price: number) {
    switch (price) {
      case 5000:
        return {
          $lt: 5000,
        };
      case 10000:
        return {
          $lt: 10000,
          $gt: 5000,
        };
      case 15000:
        return {
          $lt: 20000,
          $gt: 10000,
        };
      case 20000:
        return {
          $gt: 20000,
        };
    }
  }

  async getShops(filter: ShopFilterInterface): Promise<ShopInterface[] | null> {
    let where: any = {};
    let priceQuery: any = {};
    let keywordWhere: any = {};
    let menuQuery: any = {};
    let minKeywordSum = -1;
    let { category, location, order, price, keyword, name, foodCategory } = filter;
    if (category && category.length > 0) where.category = { $in: category };
    if (foodCategory && foodCategory.length > 0) where.foodCategory = { $in: foodCategory };
    if (location && location.length > 0) where.location = { $in: location };
    if (name && name.length > 0) {
      menuQuery = {
        $or: [
          { name: { $regex: name } },
          {
            menus: {
              $elemMatch: {
                $regex: name,
              },
            },
          },
        ],
      };
    } else {
      menuQuery = {
        $expr: {
          $gt: ['$keywordSum', -1],
        },
      };
    }
    if (price && price.every((p) => !isNaN(Number(p)))) {
      priceQuery = {
        $or: price.map((p) => ({ price: this.priceToQuery(parseInt(p)) })),
      };
    }
    if (keyword && keyword.length > 0) {
      // keywordWhere.topKeyword = { $in: keyword };
      keywordWhere.topKeyword = { $all: keyword };
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

    try {
      let shops = await Shop.aggregate([
        // 해당 가게 찾은 후에
        { $match: where },
        { $match: priceQuery },
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
              $add: ['$keyword.atmosphere', '$keyword.costRatio', '$keyword.group', '$keyword.individual', '$keyword.riceAppointment'],
            },
            menus: {
              $map: {
                input: '$menus',
                as: 'el',
                in: '$$el.title',
              },
            },
          },
        },
        {
          $match: menuQuery,
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
            'keywordObjectArray.v': -1,
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
            mainImage: {
              $first: '$mainImage',
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
            foodCategory: {
              $first: '$foodCategory',
            },
            detailFoodCategory: {
              $first: '$detailFoodCategory',
            },
            registerDate: {
              $first: '$registerDate',
            },
            menus: {
              $first: '$menus',
            },
          },
        },
        {
          $addFields: {
            sortedKeywordObjectArray: {
              $filter: {
                input: '$sortedKeywordObjectArray',
                as: 'object',
                cond: { $gt: ['$$object.v', 0] },
              },
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
              $slice: ['$topKeyword', 3],
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
          $addFields: {
            shopImage: {
              $cond: {
                if: { $gte: [{ $size: '$shopImage' }, 1] },
                then: { $slice: ['$shopImage', 1] },
                else: '',
              },
            },
          },
        },
        {
          $project: {
            keywords: {
              __v: 0,
              registerDate: 0,
            },
            menus: {
              __v: 0,
              _id: 0,
              price: 0,
              registerDate: 0,
              shopId: 0,
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
            sortedKeywordObjectArray: 0,
          },
        },
        orderQuery,
      ]);
      return shops || [];
    } catch (error) {
      console.error(error);
      return null;
    }
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

    try {
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
            'keywordObjectArray.v': -1,
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
            foodCategory: {
              $first: '$foodCategory',
            },
            detailFoodCategory: {
              $first: '$detailFoodCategory',
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
          $addFields: {
            shopImage: {
              $cond: {
                if: { $gte: [{ $size: '$shopImage' }, 1] },
                then: { $slice: ['$shopImage', 1] },
                else: '',
              },
            },
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
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async searchShop(keyword: string): Promise<ShopSearchResult> {
    try {
      const esClient = new Client({
        node: process.env.ELASTICSEARCH,
      });

      console.time('search');
      console.log('Search 시작');

      // let { body } = await esClient.search({
      //   index: 'shop',
      //   body: {
      //     query: {
      //       query_string: {
      //         fields: ['name^2.0', 'menus^1.0'],
      //         query: `*${keyword}*`,
      //       },
      //     },
      //   },
      // });
      let shops = (
        await esClient.search({
          index: 'shop',
          body: {
            query: {
              bool: {
                should: [{ term: { name: keyword } }, { match_phrase: { 'name.ngram': keyword } }],
                minimum_should_match: 1,
              },
            },
          },
        })
      ).body.hits.hits.map((data: any) => ({
        name: data._source.name,
      }));
      console.timeLog('search', 'shop');
      let menus = (
        await esClient.search({
          index: 'menu',
          body: {
            query: {
              bool: {
                should: [{ term: { menu: keyword } }, { match_phrase: { 'menu.ngram': keyword } }],
                minimum_should_match: 1,
              },
            },
          },
        })
      ).body.hits.hits.map((data: any) => ({
        name: data._source.name,
        menu: data._source.menu,
      }));
      console.timeLog('search', 'menu');
      console.timeEnd('search');

      return {
        shops,
        menus,
      };
      // return body.hits.hits.map((data: any) => data._source.name);
    } catch (error) {
      console.error(error);
      return {
        shops: [],
        menus: [],
      };
    }
  }

  async getAllShops(): Promise<ShopInterface[] | null> {
    try {
      return await Shop.find({});
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async addImage(id: string, imageLink: string[]) {
    try {
      let shop = await this.findById(id);
      if (shop === null) return false;

      for (let link of imageLink) {
        await Image.create({
          imageLink: s3ToCf(link),
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

  async setMainImage(id: string, imageLink: string) {
    try {
      let shop = await this.findById(id);
      if (shop === null) return false;

      shop.mainImage = imageLink;

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

      for (let link of imageLink) {
        await Image.create({
          imageLink: s3ToCf(link),
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

  async deleteShopImage(imageId: string) {
    try {
      let image = await Image.findById(imageId);
      if (image === null) return false;

      let imageNameArray = image.imageLink.split('/');
      let imageName = imageNameArray[imageNameArray.length - 1];
      if (!imageName) return false;

      await deleteImage(imageName);

      await image.remove();

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async deleteMenuImage(imageId: string) {
    try {
      let image = await Image.findById(imageId);
      if (image === null) return false;

      let imageNameArray = image.imageLink.split('/');
      let imageName = imageNameArray[imageNameArray.length - 1];
      if (!imageName) return false;

      await deleteImage(imageName);

      await image.remove();

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
    foodCategory: FoodCategory[],
    detailFoodCategory: DetailFoodCategory[],
    category: ShopCategory,
    keywordInput: KeywordInterface,
    menus: MenuInputInterface[],
  ): Promise<ShopInterface | null> {
    try {
      let keyword = new Keyword({
        atmosphere: keywordInput.atmosphere,
        costRatio: keywordInput.costRatio,
        group: keywordInput.group,
        individual: keywordInput.individual,
        riceAppointment: keywordInput.riceAppointment,
      });

      await keyword.save();

      let shop = await Shop.create({
        name,
        mainImage: '',
        contact,
        address,
        category,
        foodCategory,
        detailFoodCategory,
        open,
        closed,
        location,
        keyword: keyword._id,
        latitude,
        longitude,
        price,
        registerDate: new Date(),
      });

      for (let menu of menus) {
        await Menu.create({
          price: menu.price,
          shopId: shop._id,
          title: menu.menu,
        });
      }

      return shop as ShopInterface;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async setShopReportMode(reportId: string, mode: string) {
    try {
      let report = await ShopReport.findById(reportId);
      if (!report) return false;
      if (mode === 'confirm') {
        report.state = ShopReportState.Confirmed;
      } else if (mode === 'done') {
        report.state = ShopReportState.Done;
      } else {
        report.state = ShopReportState.Rejected;
      }
      await report.save();
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async setImageReportMode(reportId: string, mode: string) {
    try {
      let report = await ImageReport.findById(reportId);
      if (!report) return false;
      if (mode === 'done') {
        report.state = ImageReportState.Done;
      } else {
        report.state = ImageReportState.Rejected;
      }
      await report.save();
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  reportTypeToString(report: number) {
    switch (report) {
      case 0:
        return '폐업했어요';
      case 1:
        return '주소가 틀려요';
      case 2:
        return '가격이 틀려요';
      case 3:
        return '메뉴가 틀려요';
      case 4:
        return '영업일 틀려요';
      case 5:
        return '전화번호 틀려요';
    }
    return '';
  }

  async getMyReport(userId: string) {
    try {
      let shopReport = await ShopReport.find().where('userId').equals(userId).populate('shopId');
      let reviewReport = await ReviewReport.find()
        .where('userId')
        .equals(userId)
        .populate('userId')
        .populate('reviewId')
        .populate({
          path: 'reviewId',
          populate: { path: 'user', select: 'name' },
        })
        .populate({
          path: 'reviewId',
          populate: { path: 'shop', select: 'name _id' },
        });
      let imageReport = await ImageReport.find().where('userId').equals(userId).populate('imageId').populate('shopId');

      return [
        ...shopReport.map((report) => ({
          title: (report.shopId as any).name as string,
          text: report.type.length > 0 ? report.type.map((type) => this.reportTypeToString(type)).join(', ') + ' ' + report.comment : report.comment,
          registerDate: report.registerDate,
          state: report.state as string,
        })),
        ...reviewReport.map((report) => ({
          title:
            report.reviewId === null
              ? (report.userId as any).name + '님의 ' + '삭제된 댓글'
              : (report.userId as any).name + '님의 ' + ((report.reviewId as any).shop.name as string) + ' 리뷰',
          text: report.comment,
          registerDate: report.registerDate,
          state: report.state as string,
        })),
        ...imageReport.map((report) => ({
          title: ((report.shopId as any).name as string) + ' 사진',
          text: '',
          registerDate: report.registerDate,
          state: report.state as string,
        })),
      ];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getShopReport() {
    try {
      return await ShopReport.find().where('state').nin([ShopReportState.Done, ShopReportState.Rejected]).populate('shopId');
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getImageReport() {
    try {
      return await ImageReport.find()
        .where('state')
        .nin([ImageReportState.Done, ImageReportState.Rejected])
        .populate('imageId')
        .populate({
          path: 'imageId',
          populate: { path: 'shopId', select: 'name _id' },
        });
    } catch (error) {
      console.error(error);
      return [];
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
        state: ShopReportState.Issued,
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async addImageReport(imageId: string, userId: string) {
    try {
      let image = await Image.findById(imageId);
      if (!image) return false;

      await ImageReport.create({
        registerDate: new Date(),
        imageId,
        userId,
        state: ImageReportState.Issued,
        shopId: image.shopId,
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

interface ShopSearch {
  name: string;
}

interface MenuSearch {
  name: string;
  menu: string;
}
export interface ShopSearchResult {
  shops: ShopSearch[];
  menus: MenuSearch[];
}
