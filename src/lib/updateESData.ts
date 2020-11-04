import { Client } from '@elastic/elasticsearch';
import { ShopController } from '../DB/controller/Shop/ShopController';
import Menu from '../DB/models/Menu';
import Shop from '../DB/models/Shop';

export async function updateESData() {
  try {
    const esClient = new Client({
      node: process.env.ELASTICSEARCH,
    });

    let data: string[] = [];
    let shopController = new ShopController();
    let shops = await shopController.getAllShops();
    if (shops === null) return;
    shops.forEach((shop, index) => {
      data.push(`{"index":{"_id":"${index + 1}"}}`);
      data.push(`{"id":"${shop._id}","name":"${shop.name}"}`);
    });
    console.log('ES Shop data Push');
    let response = await esClient.bulk({
      index: 'shop',
      body: data,
    });
    console.log(response.body.items[0].index.error);

    let shopsWithMenu = await Menu.find({}).populate('shopId');
    if (shopsWithMenu === null) return;

    data = [];

    shopsWithMenu.forEach((shop, index) => {
      data.push(`{"index":{"_id":"${index + 1}"}}`);
      data.push(`{"name":"${(shop as any).shopId.name}", "menu":"${shop.title}", "price":"${shop.price}"}`);
    });
    console.log('ES Menus data Push');
    response = await esClient.bulk({
      index: 'menu',
      body: data,
    });
    console.log(response.body.items[0].index.error);
  } catch (error) {
    console.error(error);
  }
}
