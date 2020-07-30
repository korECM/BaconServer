/*
 * File generated by Interface generator (dotup.dotup-vscode-interface-generator)
 * Date: 2020-07-29 13:33:46
 */
import Shop, { ShopInterface, ShopSchemaInterface, ShopCategory } from '../../models/Shop';
import { KeywordSchemaInterface } from '../../models/Keyword';

export interface IShopController {
  findById(id: string): Promise<ShopSchemaInterface | null>;
  createShop(
    name: string,
    contact: string,
    address: string,
    image: string[],
    open: string,
    closed: string,
    location: Location,
    keyword: KeywordSchemaInterface,
    category: ShopCategory[],
  ): Promise<ShopInterface | null>;
}
