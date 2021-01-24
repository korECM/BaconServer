import {Connection} from "typeorm";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {Container} from "typedi";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {UserRepository} from "../../../repositories/UserRepository";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {AuthProvider, Gender} from "../../../domains/User/User";

describe("UserRepository", () => {
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
            const userResult = await userRepository.findOne({email});

            // then
            expect(userResult).not.toBeNull();
            expect(userResult).not.toBeUndefined();
            expect(userResult!.name).toEqual(name);
            expect(userResult!.email).toEqual(email);
            expect(userResult!.password).not.toEqual(password);
            expect(await userResult!.hasPassword(password)).toBeTrue();
            expect(userResult!.gender).toEqual(gender);
        })
    })

    describe("addSnsUser", () => {
        it("전달받은 값을 가지고 유저를 생성해서 저장한다", async () => {
            // given
            const [name, email, snsId, provider, gender] = ["이름", "asdf@naver.com", "123456", AuthProvider.kakao, Gender.m];

            // when
            await userRepository.addSnsUser(name, email, snsId, provider, gender);
            const userResult = await userRepository.findOne({snsId});

            // then
            expect(userResult).not.toBeNull();
            expect(userResult).not.toBeUndefined();
            expect(userResult!.name).toBe(name);
            expect(userResult!.email).toBe(email);
            expect(userResult!.password).toBeNull();
            expect(userResult!.snsId).toBe(snsId);
            expect(userResult!.gender).toBe(gender);
        })
    })

})