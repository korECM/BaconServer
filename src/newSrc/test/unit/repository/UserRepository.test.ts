import {Connection} from "typeorm";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {ShopRepository} from "../../../repositories/Shop/ShopRepository";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {Container} from "typedi";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {UserRepository} from "../../../repositories/UserRepository";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {Gender} from "../../../domains/User/User";

describe("ShopRepository", () => {
    let db: Connection;
    let userRepository: UserRepository;

    let domainInitializationService: DomainInitializationService;

    beforeAll(async () => {
        db = await createMemoryDatabase();
        domainInitializationService = Container.get(DomainInitializationService);
    })

    beforeEach(async () => {
        await domainInitializationService.initAllDomain();
        userRepository = db.getCustomRepository(UserRepository);
        await FoodingSeed.setUp(db);
    });

    afterAll(() => db.close());

    const getUser = async (option: any) => {
        return userRepository
            .findOne(option, {select: Object.getOwnPropertyNames(userRepository.create(UserSeed[0])) as any})
    }

    describe("emailExists", () => {
        it("이미 존재하는 이메일이면 true를 반환한다", async () => {
            // given
            const email = UserSeed[0].email

            // when
            const result = await userRepository.emailExists(email);

            // then
            expect(result).toBeTrue();
        })
        it("존재하지 않는 이메일이면 false를 반환한다", async () => {
            // given
            const email = "notExistsEmail@naver.com"

            // when
            const result = await userRepository.emailExists(email);

            // then
            expect(result).toBeFalse();
        })
    })

    describe("snsUserExists", () => {
        it("존재 여부에 따라서 true, false를 반환한다", async () => {
            // given
            // sns유저가 아닌 경우
            const {snsId: snsId1, provider: provider1} = UserSeed[0];
            // sns유저
            const {snsId: snsId2, provider: provider2} = UserSeed[1];
            const notExistsSnsId = "1234";

            // when
            const result1 = await userRepository.snsUserExists(snsId1, provider1);
            const result2 = await userRepository.snsUserExists(snsId2, provider2);
            const result3 = await userRepository.snsUserExists(notExistsSnsId, provider2);

            // then
            expect(result1).toBeFalse();
            expect(result2).toBeTrue();
            expect(result3).toBeFalse();
        })
    })

    describe("nameExists", () => {
        it("이미 존재하는 이름이면 true를 반환한다", async () => {
            // given
            const name = UserSeed[0].name

            // when
            const result = await userRepository.nameExists(name);

            // then
            expect(result).toBeTrue();
        })
        it("존재하지 않는 이름이면 false를 반환한다", async () => {
            // given
            const name = "존재하지않는이름"

            // when
            const result = await userRepository.nameExists(name);

            // then
            expect(result).toBeFalse();
        })
    })

    describe("addLocalUser", () => {
        it("전달받은 값을 가지고 유저를 생성해서 저장한다", async () => {
            // given
            const [name, email, password, gender] = ["이름", "asdf@naver.com", "password", Gender.m];

            // when
            await userRepository.addLocalUser(name, email, password, gender);
            const userResult = await getUser({email});

            // then
            expect(userResult).not.toBeNull();
            expect(userResult).not.toBeUndefined();
            expect(name).toEqual(userResult!.name);
            expect(email).toEqual(userResult!.email);
            expect(password).not.toEqual(userResult!.password);
            expect(await userResult!.hasPassword(password)).toBeTrue();
            expect(gender).toEqual(userResult!.gender);
        })
    })

})