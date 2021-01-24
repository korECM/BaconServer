import {Connection, Repository} from "typeorm";
import {User} from "../../../domains/User/User";
import {createMemoryDatabase} from "../../utils/setupDatabase";
import {UserSeed} from "../../utils/seeds/UserSeed";


describe("User", () => {
    let db: Connection;
    let userRepository: Repository<User>;

    const getUser = async (option: any) => {
        return userRepository
            .findOne(option, {select: Object.getOwnPropertyNames(userRepository.create(UserSeed[0])) as any})
    }

    beforeAll(async () => {
        db = await createMemoryDatabase();
    })

    beforeEach(async () => {
        userRepository = db.getRepository(User);
        await userRepository.clear();
    })

    afterAll((() => db.close()))

    it("새로운 유저를 생성하면 비밀번호는 암호화해서 저장한다", async () => {
        // given
        let userSeed = UserSeed[0];

        // when
        await userRepository.save(userRepository.create(userSeed));

        // then
        const userResult = await getUser(userSeed.id);

        expect(userResult).not.toBeNull();
        expect(userResult).not.toBeUndefined();
        expect(userResult!.password).not.toBeNull();
        expect(userResult!.password).not.toBeUndefined();
        // 암호화 되어서 저장된다
        expect(userResult!.password).not.toBe(userSeed.password);
        // 복호화가 되어야 한다
        expect(await userResult!.hasPassword(userSeed.password!)).toBeTrue();
    })

    it("유저의 비밀번호를 변경할 때도 비밀번호는 암호화해서 저장한다", async () => {
        // given
        let userSeed = UserSeed[0];

        // when
        await userRepository.save(userRepository.create(userSeed));
        const userResult = await getUser(userSeed.id);
        userResult!.password = "5678";
        await userRepository.save(userResult!);

        // then
        expect(userResult).not.toBeNull();
        expect(userResult).not.toBeUndefined();
        expect(userResult!.password).not.toBeNull();
        expect(userResult!.password).not.toBeUndefined();
        // 암호화 되어서 저장된다
        expect(userResult!.password).not.toBe("5678");
        // 복호화가 되어야 한다
        expect(await userResult!.hasPassword("1234")).not.toBeTrue();
        expect(await userResult!.hasPassword("5678")).toBeTrue();
    })

    it("유저의 비밀번호가 null인 경우 암호화를 하지 않는다", async () => {
        // given
        let userSeed = UserSeed[1];

        // when
        await userRepository.save(userRepository.create(userSeed));

        // then
        const userResult = await getUser({id: userSeed.id});

        expect(userResult).not.toBeNull();
        expect(userResult).not.toBeUndefined();
        expect(userResult!.password).toBeNull();
        // 복호화 시도를 하면 false를 반환한다
        expect(await userResult!.hasPassword("some password")).not.toBeTrue();
    })
})