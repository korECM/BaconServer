import {Connection} from "typeorm";
import {DomainInitializationService} from "../../../Services/DomainInitializationService";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {Container} from "typedi";
import {FoodingSeed} from "../../utils/seeds/FoodingSeed";
import {UserAuthService} from "../../../Services/UserAuthService";
import {UserSeed} from "../../utils/seeds/UserSeed";
import {AuthProvider, Gender, Role, User} from "../../../domains/User/User";
import {
    UserForLocalSignInRequest,
    UserForLocalSignUpRequest,
    UserForSignInResponse,
    UserForSnsSignInRequest,
    UserForSnsSignUpRequest
} from "../../../Dtos/User";


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
            const result = await userAuthService.signInLocal(new UserForLocalSignInRequest(email, password));
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
            const result1 = await userAuthService.signInLocal(new UserForLocalSignInRequest("notExists" + email, password));
            const result2 = await userAuthService.signInLocal(new UserForLocalSignInRequest(email, "notExistsPassword"));
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
            const result = await userAuthService.signInSns(new UserForSnsSignInRequest(snsId, provider));
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
            const result1 = await userAuthService.signInSns(new UserForSnsSignInRequest(snsId + '123', provider));
            const result2 = await userAuthService.signInSns(new UserForSnsSignInRequest(snsId, AuthProvider.local));
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
            const userResult = await userAuthService.signInLocal(new UserForLocalSignInRequest(email, password));
            expect(userResult).not.toBeUndefined();
            expect(userResult).not.toBeNull();
            expect(signUpResult).toBeInstanceOf(UserForSignInResponse);
            expect(signUpResult).toEqual(userResult!);

            expect(userResult).toMatchObject({
                name, email, gender, role: Role.user, snsNameSet: true
            })
        });

        it("이미 이름이 존재한다면 null을 반환한다", async () => {
            // given
            const name = UserSeed[0].name;
            const email = "asdfasdf@naver.com";
            const gender = Gender.m;
            const password = "1111";
            const userDto = new UserForLocalSignUpRequest(name, email, gender, password);
            // when
            const signUpResult = await userAuthService.signUpLocal(userDto);
            // then
            expect(signUpResult).toBeNull();
        });

        it("이미 이메일이 존재한다면 null을 반환한다", async () => {
            // given
            const name = "이름";
            const email = UserSeed[0].email!;
            const gender = Gender.m;
            const password = "1111";
            const userDto = new UserForLocalSignUpRequest(name, email, gender, password);
            // when
            const signUpResult = await userAuthService.signUpLocal(userDto);
            // then
            expect(signUpResult).toBeNull();
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
            const userResult = await userAuthService.signInSns(new UserForSnsSignInRequest(snsId, provider));
            expect(userResult).not.toBeUndefined();
            expect(userResult).not.toBeNull();
            expect(signUpResult).toBeInstanceOf(UserForSignInResponse);
            expect(signUpResult).toEqual(userResult!);

            expect(userResult).toMatchObject({
                name, email, gender, role: Role.user
            })
        });

        it("이미 존재하는 사용자라면 null을 반환한다", async () => {
            // given
            const name = "이름";
            const email = null;
            const snsId = UserSeed[1].snsId!;
            const gender = Gender.m;
            const provider = AuthProvider.kakao;
            const userDto = new UserForSnsSignUpRequest(name, email, snsId, gender, provider);
            // when
            const signUpResult = await userAuthService.signUpSns(userDto);
            // then
            expect(signUpResult).toBeNull();
        });
    })

    describe('findUserById', () => {
        it('만약 해당 id와 일치하는 사용자가 존재하면 User를 반환한다', async () => {
            // given
            const user = UserSeed[0];
            // when
            const result = await userAuthService.findUserById(user.id)
            // then
            expect(result).not.toBeNull()
            expect(result).not.toBeUndefined()
            expect(result).toBeInstanceOf(User)
            expect(result!.id).toBe(user.id)
        })
        it('만약 해당 id와 일치하는 사용자가 없다면 undefined를 반환한다', async () => {
            // given
            const id = 1234;
            // when
            const result = await userAuthService.findUserById(id)
            // then
            expect(result).toBeUndefined()
        })
    })

    describe('userExistById', () => {
        it('만약 해당 id와 일치하는 사용자가 존재하면 true를 반환한다', async () => {
            // given
            const user = UserSeed[0];
            // when
            const result = await userAuthService.userExistById(user.id)
            // then
            expect(result).toBeTrue()
        })
        it('만약 해당 id와 일치하는 사용자가 없다면 false를 반환한다', async () => {
            // given
            const id = 1234;
            // when
            const result = await userAuthService.userExistById(id)
            // then
            expect(result).toBeFalse()
        })
    })
})