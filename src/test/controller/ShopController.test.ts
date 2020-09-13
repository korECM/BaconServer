import mongoose from 'mongoose';
import { setupDB } from '../DBTestUtil';
import faker from 'faker/locale/ko';
import Shop, { ShopSchemaInterface, ShopCategory, Location } from '../../DB/models/Shop';
import { ShopController, ShopOrder } from '../../DB/controller/Shop/ShopController';
import Keyword, { KeywordSchemaInterface } from '../../DB/models/Keyword';

setupDB();

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
    });

    dataShop = await Shop.create({
      address: faker.address.streetAddress(),
      mainImage: '',
      category: ShopCategory.Korean,
      foodCategory: [],
      closed: ' ',
      contact: faker.phone.phoneNumber(),
      location: Location.Front,
      latitude: 0,
      longitude: 0,
      name: '식당 이름',
      open: ' ',
      price: 0,
      registerDate: new Date(),
      keyword: keyword._id,
    });

    await Shop.create({
      address: faker.address.streetAddress(),
      mainImage: '',
      category: ShopCategory.Japanese,
      foodCategory: [],
      closed: ' ',
      contact: faker.phone.phoneNumber(),
      location: Location.Back,
      latitude: 0,
      longitude: 0,
      name: '식당 이름',
      open: ' ',
      price: 0,
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

    it('주어진 shop이 존재하면 해당 shop image에 링크 추가', async () => {});
  });

  describe('getShops', () => {
    it('category 한 개 주어졌을 때 일치하는 Shop 반환', async () => {
      // Arrange
      let shopController = new ShopController();

      // Act
      const shop = await shopController.getShops({
        category: [ShopCategory.Korean],
        order: ShopOrder.Recommended,
      });

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
      const shop = await shopController.getShops({
        category: [ShopCategory.Korean, ShopCategory.Japanese],
        order: ShopOrder.Recommended,
      });

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
      const shop = await shopController.getShops({
        location: [Location.Front, Location.Back],
        order: ShopOrder.Recommended,
      });

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
