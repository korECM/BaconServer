/*
 * File generated by Interface generator (dotup.dotup-vscode-interface-generator)
 * Date: 2020-07-29 13:33:46
 */
import Shop, { ShopInterface, ShopSchemaInterface, ShopCategory, Location, FoodCategory, DetailFoodCategory } from '../../models/Shop';
import { KeywordInterface, KeywordSchemaInterface } from '../../models/Keyword';
import { MenuInputInterface, ShopOrder } from './ShopController';

export interface IShopController {
  findById(id: string): Promise<ShopSchemaInterface | null>;

  getAllShops(): Promise<ShopInterface[] | null>;
  getShops(filter: any, order: ShopOrder, withOrder: boolean): Promise<ShopInterface[] | null>;

  addImage(id: string, imageLink: string[]): Promise<boolean>;
  createShop(
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
  ): Promise<ShopInterface | null>;
}
