import DB from '../DB';
import { MenuInputInterface, ShopController } from '../DB/controller/Shop/ShopController';
import dotenv from 'dotenv';
import { DetailFoodCategory, FoodCategory, ShopCategory } from '../DB/models/Shop';
import { KeywordInterface } from '../DB/models/Keyword';
import shopData from './detailFoodCategory.json';
dotenv.config();

export interface DetailFoodCategoryAddInterface {
  _id: string;
  foodCategory: FoodCategory[];
  name: string;
  category: FoodCategory;
  price: number;
  detailCategory1: DetailFoodCategory;
  detailCategory2: DetailFoodCategory;
  detailCategory3: DetailFoodCategory;
}

(async () => {
  await DB.connect();
  let shopController = new ShopController();
  let index = 0;
  for (let shop of shopData as DetailFoodCategoryAddInterface[]) {
    index += 1;
    let detailFoodCategory: DetailFoodCategory[] = [];
    if (shop.detailCategory1) {
      detailFoodCategory.push(shop.detailCategory1);
    }
    if (shop.detailCategory2) {
      detailFoodCategory.push(shop.detailCategory2);
    }
    if (shop.detailCategory3) {
      detailFoodCategory.push(shop.detailCategory3);
    }

    try {
      let shopModel = await shopController.findById(shop._id);
      if (shopModel === null) {
        console.error(`${shop._id} 모델 존재 안함`);
        continue;
      }
      shopModel.detailFoodCategory = detailFoodCategory;
      shopModel.price = shop.price;
      await shopModel.save();
    } catch (error) {
      console.error(error);
    }
    console.log(`${index} : ${shopData.length} ${shop._id} 생성`);
  }
  console.log('Shop 수정 완료');
})();
