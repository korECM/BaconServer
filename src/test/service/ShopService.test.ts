import request from 'supertest';
import Sinon from 'sinon';
import dotenv from 'dotenv';
import { ShopController } from '../../DB/controller/Shop/ShopController';
import { ShopService } from '../../service/ShopService';
import { ShopInterface, ShopCategory, Location } from '../../DB/models/Shop';
import Keyword from '../../DB/models/Keyword';
dotenv.config();

describe('ShopService', () => {
  let shopController: ShopController;
  let shopDBStub: Sinon.SinonStubbedInstance<ShopController>;
  let shopService: ShopService;

  beforeEach(async () => {
    shopController = new ShopController();
    shopDBStub = Sinon.stub(shopController);
    shopService = new ShopService(shopDBStub);
  });

  let validShop: ShopInterface = {
    _id: 0,
    address: '주소',
    category: ShopCategory.Korean,
    closed: '',
    contact: '연락처',
    image: [''],
    keyword: new Keyword(),
    location: Location.Back,
    name: '이름',
    open: '',
    registerDate: new Date(),
  };
  describe('getAllShops', () => {
    it('존재하는 가게가 없다면 빈 배열을 반환한다', async () => {
      // Arrange
      shopDBStub.getAllShops.resolves(null);
      //Act
      let result = await shopService.getAllShops();
      // Assert
      expect(result).not.toBeNull();
      expect(result.length).toBe(0);
    });

    it('존재하는 모든 가게를 배열로 반환한다', async () => {
      // Arrange
      shopDBStub.getAllShops.resolves([validShop, validShop, validShop]);
      //Act
      let result = await shopService.getAllShops();
      // Assert
      expect(result).not.toBeNull();
      expect(result.length).toBe(3);
    });
  });

  describe('getShops', () => {});
});
