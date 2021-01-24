import {Connection} from "typeorm";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {Container} from "typedi";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {UserAuthService} from "../../../Services/UserAuthService";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {AuthProvider, Gender, Role} from "../../../domains/User/User";
import {UserForLocalSignUpRequest, UserForSignInResponse, UserForSnsSignUpRequest} from "../../../Dtos/User";


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

    describe("signInSns", () => {
        it("전달된 snsId와 provider를 가지고 Sns 로그인에 성공하면 비밀번호가 제거된 사용자를 반환한다", async () => {
            // given
            const snsUser = UserSeed[1];
            const snsId = snsUser.snsId!;
            const provider = snsUser.provider!;
            // when
            const result = await userAuthService.signInSns(snsId, provider);
            // then
            expect(result).not.toBeUndefined();
            expect(result).not.toBeNull();
            expect(snsUser).toMatchObject(result!);
        })

        it("전달된 이메일과 패스워드와 일치하는 사용자가 존재하지 않으면 null을 반환한다", async () => {
            // given
            const snsUser = UserSeed[1];
            const snsId = snsUser.snsId!;
            const provider = snsUser.provider!;
            // when
            const result1 = await userAuthService.signInSns(snsId + '123', provider);
            const result2 = await userAuthService.signInSns(snsId, AuthProvider.local);
            // then
            expect(result1).toBeNull();
            expect(result2).toBeNull();
        })
    })

    describe("signUpLocal", () => {
        it("전달된 인자를 가지고 사용자를 생성한 뒤에, UserForSignIn을 반환한다", async () => {
            // given
            const name = "이름";
            const email = "asdfasdf@naver.com";
            const gender = Gender.m;
            const password = "1111";
            const userDto = new UserForLocalSignUpRequest(name, email, gender, password);
            // when
            const signUpResult = await userAuthService.signUpLocal(userDto);
            // then
            const userResult = await userAuthService.signInLocal(email, password);
            expect(userResult).not.toBeUndefined();
            expect(userResult).not.toBeNull();
            expect(signUpResult).toBeInstanceOf(UserForSignInResponse);
            expect(signUpResult).toEqual(userResult!);

            expect(userResult).toMatchObject({
                name, email, gender, role: Role.user
            })
        });
    })

    describe("signUpSns", () => {
        it("전달된 인자를 가지고 사용자를 생성한 뒤에, UserForSignIn을 반환한다", async () => {
            // given
            const name = "이름";
            const email = null;
            const snsId = "12341234";
            const gender = Gender.m;
            const provider = AuthProvider.kakao;
            const userDto = new UserForSnsSignUpRequest(name, email, snsId, gender, provider);
            // when
            const signUpResult = await userAuthService.signUpSns(userDto);
            // then
            const userResult = await userAuthService.signInSns(snsId, provider);
            expect(userResult).not.toBeUndefined();
            expect(userResult).not.toBeNull();
            expect(signUpResult).toBeInstanceOf(UserForSignInResponse);
            expect(signUpResult).toEqual(userResult!);

            expect(userResult).toMatchObject({
                name, email, gender, role: Role.user
            })
        });
    })
})