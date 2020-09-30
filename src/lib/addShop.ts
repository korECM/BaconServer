import DB from '../DB';
import { MenuInputInterface, ShopController } from '../DB/controller/Shop/ShopController';
import dotenv from 'dotenv';
import { FoodCategory, ShopCategory } from '../DB/models/Shop';
import { KeywordInterface } from '../DB/models/Keyword';
import { Data } from './makeShopData';
dotenv.config();

let shopData: Data[] = [];

(async () => {
  await DB.connect();
  let shopController = new ShopController();
  let index = 0;
  for (let shop of shopData as Data[]) {
    index += 1;
    let foodCategory: FoodCategory[] = [];
    let menus: MenuInputInterface[] = [];
    let keyword: KeywordInterface = {
      _id: '',
      atmosphere: shop.atmosphere,
      costRatio: shop.costRatio,
      individual: shop.individual,
      group: shop.group,
      riceAppointment: shop.riceAppointment,
      registerDate: new Date(),
    };
    if (shop.rice) foodCategory.push(FoodCategory.Rice);
    if (shop.bread) foodCategory.push(FoodCategory.Bread);
    if (shop.noodle) foodCategory.push(FoodCategory.Noodle);
    if (shop.meat) foodCategory.push(FoodCategory.Meat);
    if (shop.etc) foodCategory.push(FoodCategory.Etc);
    if (shop.menu1) {
      menus.push({
        menu: shop.menu1,
        price: shop.price1,
      });
    }
    if (shop.menu2) {
      menus.push({
        menu: shop.menu2,
        price: shop.price2,
      });
    }
    if (shop.menu3) {
      menus.push({
        menu: shop.menu3,
        price: shop.price3,
      });
    }

    await shopController.createShop(
      shop.name,
      shop.contact,
      shop.address,
      shop.open,
      shop.closed,
      shop.price,
      parseInt(shop.latitude) || 0,
      parseInt(shop.longitude) || 0,
      shop.location,
      foodCategory,
      shop.category,
      keyword,
      menus,
    );
    console.log(`${index} : ${shopData.length} ${shop.name} 생성`);
  }
  console.log('Shop Insert 완료');
})();
