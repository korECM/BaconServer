import DB from '../DB';
import { MenuInputInterface, ShopController } from '../DB/controller/Shop/ShopController';
import dotenv from 'dotenv';
import Shop, { DetailFoodCategory, FoodCategory, ShopCategory } from '../DB/models/Shop';
import { KeywordInterface } from '../DB/models/Keyword';
import shopData from './detailFoodCategory.json';
dotenv.config();

(async () => {
  await DB.connect();
  let shopController = new ShopController();
  let index = 0;
  let shops = await Shop.find();
  for (let shop of shops) {
    if (!shop.price) {
      shop.price = 0;
      await shop.save();
    }
  }
  console.log('Shop 수정 완료');
})();
