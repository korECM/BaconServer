import mongoose from 'mongoose';
import { setupDB } from '../DBTestUtil';
import faker from 'faker/locale/ko';
import Shop, { ShopSchemaInterface, ShopCategory, Location } from '../../DB/models/Shop';
import { ShopController } from '../../DB/controller/Shop/ShopController';
import Keyword, { KeywordSchemaInterface } from '../../DB/models/Keyword';
import { ShopOrder } from '../../service/ShopService';

setupDB('shop');

describe('ShopController', () => {
  let dataShop: ShopSchemaInterface;
  let keyword: KeywordSchemaInterface;
  beforeAll(async () => {
    keyword = await Keyword.create({
      atmosphere: 0,
      costRatio: 0,
      group: 0,
      individual: 0,
      registerDate: new Date(),
      riceAppointment: 0,
      spicy: 0,
    });

    dataShop = await Shop.create({
      address: faker.address.streetAddress(),
      category: ShopCategory.Korean,
      closed: ' ',
      contact: faker.phone.phoneNumber(),
      image: ['testLink'],
      location: Location.Front,
      name: '식당 이름',
      open: ' ',
      registerDate: new Date(),
      keyword: keyword._id,
    });

    await Shop.create({
      address: faker.address.streetAddress(),
      category: ShopCategory.Japanese,
      closed: ' ',
      contact: faker.phone.phoneNumber(),
      image: [''],
      location: Location.Back,
      name: '식당 이름',
      open: ' ',
      registerDate: new Date(),
      keyword: keyword._id,
    });
  });
  describe('findById', () => {
    it('id가 일치하는 Shop을 찾아서 있으면 해당 Shop을 반환한다', async () => {
      // Arrange
      let shopController = new ShopController();

      // Act
      const shop = await shopController.findById(dataShop.id);

      // Assert
      expect(shop).not.toBeNull();
      if (shop) {
        expect(shop.id).toBe(dataShop.id);
      }
    });
    it('id가 일치하는 User가 없다면 null 반환', async () => {
      // Arrange
      let shopController = new ShopController();

      // Act
      const shop = await shopController.findById(new mongoose.mongo.ObjectId().toHexString());

      // Assert
      expect(shop).toBeNull();
    });
  });

  describe('addImage', () => {
    it('주어진 shop이 없으면 false 반환', async () => {
      // Arrange
      let shopController = new ShopController();

      // Act
      const shop = await shopController.addImage(new mongoose.mongo.ObjectId().toHexString(), []);

      // Assert
      expect(shop).toBeFalsy();
    });

    it('주어진 shop이 존재하면 해당 shop image에 링크 추가', async () => {
      // Arrange
      let shopController = new ShopController();
      let link = faker.internet.url();
      // Act
      const shop = await shopController.addImage(dataShop.id, [link, link + '1']);

      const modifiedShop = await shopController.findById(dataShop.id);

      // Assert
      expect(shop).toBeTruthy();

      expect(modifiedShop!.image.join(',')).toBe(['testLink', link, link + '1'].join(','));
    });
  });

  describe('getShops', () => {
    it('category 한 개 주어졌을 때 일치하는 Shop 반환', async () => {
      // Arrange
      let shopController = new ShopController();

      // Act
      const shop = await shopController.getShops(
        {
          category: { $in: ShopCategory.Korean },
        },
        ShopOrder.Recommended,
        false,
      );

      // Assert
      expect(shop).not.toBeNull();
      if (shop) {
        expect(shop.length).toBe(1);
        expect(shop[0].category).toBe(ShopCategory.Korean);
      }
    });

    it('category 여러 개 주어졌을 때 일치하는 Shop 반환', async () => {
      // Arrange
      let shopController = new ShopController();

      // Act
      const shop = await shopController.getShops(
        {
          category: { $in: [ShopCategory.Korean, ShopCategory.Japanese] },
        },
        ShopOrder.Recommended,
        false,
      );

      // Assert
      expect(shop).not.toBeNull();
      if (shop) {
        expect(shop.length).toBe(2);
        shop.forEach((element) => {
          expect([ShopCategory.Korean, ShopCategory.Japanese].includes(element.category)).toBeTruthy();
        });
      }
    });

    it('location 주어지면 일치하는 Shop 반환', async () => {
      // Arrange
      let shopController = new ShopController();

      // Act
      const shop = await shopController.getShops(
        {
          location: { $in: [Location.Front, Location.Back] },
        },
        ShopOrder.Recommended,
        false,
      );

      // Assert
      expect(shop).not.toBeNull();
      if (shop) {
        expect(shop.length).toBe(2);
        shop.forEach((element) => {
          expect([Location.Front, Location.Back].includes(element.location)).toBeTruthy();
        });
      }
    });
  });
});
