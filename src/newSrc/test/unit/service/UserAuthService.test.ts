import {Connection} from "typeorm";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {Container} from "typedi";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {UserAuthService} from "../../../Services/UserAuthService";
import {UserSeed} from "../../utils/seeds/UserSeed";


describe("UserAuthService", () => {

    let db: Connection;
    let domainInitializationService: DomainInitializationService;
    let userAuthService: UserAuthService

    beforeAll(async () => {
        db = await createMemoryDatabase();
        domainInitializationService = Container.get(DomainInitializationService);
        userAuthService = Container.get(UserAuthService);
    })

    beforeEach(async () => {
        await domainInitializationService.initAllDomain();
        await FoodingSeed.setUp(db);
    });

    afterAll(() => db.close());

    describe("signInLocal", () => {
        it("전달된 이메일과 패스워드를 가지고 Local 로그인에 성공하면 비밀번호가 제거된 사용자를 반환한다", async () => {
            // given
            const localUser = UserSeed[0];
            const email = localUser.email!;
            const password = localUser.password!;
            const {password: tempForRemove, ...userWithoutPassword} = localUser;
            // when
            const result = await userAuthService.signInLocal(email, password);
            // then
            expect(result).not.toBeUndefined();
            expect(result).not.toBeNull();
            expect(userWithoutPassword).toMatchObject(result!);
        })

        it("전달된 이메일과 패스워드와 일치하는 사용자가 존재하지 않으면 null을 반환한다", async () => {
            // given
            const localUser = UserSeed[0];
            const email = localUser.email!;
            const password = localUser.password!;
            // when
            const result1 = await userAuthService.signInLocal("notExists" + email, password);
            const result2 = await userAuthService.signInLocal(email, "notExistsPassword");
            // then
            expect(result1).toBeNull();
            expect(result2).toBeNull();
        })
    })
})