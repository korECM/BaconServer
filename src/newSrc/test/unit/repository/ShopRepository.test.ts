import {Connection, Repository} from "typeorm";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {ShopRepository} from "../../../repositories/Shop/ShopRepository";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {Container} from "typedi";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {Menu} from "../../../domains/Shop/Menu";
import {Shop} from "../../../domains/Shop/Shop";

describe("ShopRepository", () => {
    let db: Connection;
    let shopRepository: ShopRepository;
    let menuRepository: Repository<Menu>;

    let domainInitializationService: DomainInitializationService;

    beforeAll(async () => {
        db = await createMemoryDatabase();
        domainInitializationService = Container.get(DomainInitializationService);
    })

    beforeEach(async () => {
        await domainInitializationService.initAllDomain();
        shopRepository = db.getCustomRepository(ShopRepository);
        menuRepository = db.getRepository(Menu);
        await FoodingSeed.setUp(db);
    });

    afterAll(() => db.close());

    describe("searchShopsByName", () => {
        it("없는 이름을 찾으면 빈 배열을 반환한다", async () => {
            // given

            // when
            const result = await shopRepository.searchShopsByName("이건 없는 이름");
            // then
            // 반환 결과는 빈 배열
            expect(result).toBeArrayOfSize(0);
        })
        it("검색 결과에의 가게 이름 또는 메뉴 이름에 검색어가 포함되어야만 한다", async () => {
            // given
            const keyword = "마라";
            // when
            const result = await shopRepository.searchShopsByName(keyword);
            // then
            // 반환 결과는 배열
            expect(result).toBeArray();
            // 반환 결과의 가게 이름 / 메뉴 이름에 반드시 키워드 포함되어야 한다
            expect(result).toSatisfyAll((shop: Shop) => {
                if (shop.name.includes(keyword))
                    return true;
                return shop.menus.some(menu => menu.name.includes(keyword));
            })

            console.log(await shopRepository.getShop(1, 1));
        })
    })


})