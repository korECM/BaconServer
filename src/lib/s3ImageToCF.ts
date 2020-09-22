import DB from '../DB';
import { MenuInputInterface, ShopController } from '../DB/controller/Shop/ShopController';
import dotenv from 'dotenv';
import Shop, { FoodCategory, ShopCategory } from '../DB/models/Shop';
import Image from '../DB/models/Image';
dotenv.config();

(async () => {
  await DB.connect();
  let images = await Image.find();
  for (const image of images) {
    if (image.imageLink.includes('bacon-shop-origin.s3.ap-northeast-2.amazonaws.com')) {
      console.log(`${image.shopId} image 변환`);
      image.imageLink = image.imageLink.replace('bacon-shop-origin.s3.ap-northeast-2.amazonaws.com', 'd3s32mx82uelsl.cloudfront.net');
      await image.save();
    }
  }
  let shops = await Shop.find();
  for (const shop of shops) {
    if (shop.mainImage.length > 0 && shop.mainImage.includes('bacon-shop-origin.s3.ap-northeast-2.amazonaws.com')) {
      console.log(`${shop.name} mainImage 변환`);
      shop.mainImage = shop.mainImage.replace('bacon-shop-origin.s3.ap-northeast-2.amazonaws.com', 'd3s32mx82uelsl.cloudfront.net');
      await shop.save();
    }
  }
  console.log('Image 변환 완료');
})();
