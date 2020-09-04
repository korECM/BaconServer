import DB from '../DB';
import { ShopController } from '../DB/controller/Shop/ShopController';
import dotenv from 'dotenv';
import dataJson from './finalData.json';
import { FoodCategory, ShopCategory } from '../DB/models/Shop';
dotenv.config();

export interface Data {
  name: string;
  address: string;
  location: Location;
  latitude: string;
  longitude: string;
  contact: string;
  category: ShopCategory;
  price: number;
  closed: string;
  open: string;
  costRatio: number;
  atmosphere: number;
  group: number;
  individual: number;
  riceAppointment: number;
  spicy: number;
  rice: number;
  bread: number;
  noodle: number;
  meat: number;
  etc: number;
}

export enum Location {
  Back = 'back',
  Front = 'front',
  FrontFar = 'front_far',
  HsStation = 'hs_station',
}

(async () => {
  await DB.connect();
  let shopController = new ShopController();

  for (let shop of dataJson as Data[]) {
    let foodCategory: FoodCategory[] = [];
    if (shop.rice) foodCategory.push(FoodCategory.Rice);
    if (shop.bread) foodCategory.push(FoodCategory.Bread);
    if (shop.noodle) foodCategory.push(FoodCategory.Noodle);
    if (shop.meat) foodCategory.push(FoodCategory.Meat);
    if (shop.etc) foodCategory.push(FoodCategory.Etc);

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
    );
  }
  console.log('Shop Insert 완료');
})();
