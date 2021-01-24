import {EntityRepository} from "typeorm";
import {AuthProvider, Gender, Role, User} from "../domains/User/User";
import {BaseRepository} from "typeorm-transactional-cls-hooked";

export class UserNotExists extends Error {
    constructor(private userId: number, message?: string) {
        super(message || `${userId}에 해당하는 User가 존재하지 않습니다`);
    }
}

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {

    async emailExists(email: string | null): Promise<boolean> {
        if (email === null) return false
        const user = await this.createQueryBuilder("user")
            .where("user.email = :email", {email})
            .getOne()
        return !!user
    }

    async snsUserExists(snsId: string | null, provider: AuthProvider) {
        if (!snsId) return false
        const user = await this.createQueryBuilder("user")
            .where("user.snsId = :snsId", {snsId})
            .andWhere("user.provider = :provider", {provider})
            .getOne()
        return !!user
    }

    async nameExists(name: string): Promise<boolean> {
        const user = await this.createQueryBuilder("user")
            .where("user.name = :name", {name})
            .getOne()
        return !!user
    }

    async addLocalUser(name: string, email: string, password: string, gender: Gender) {
        const user = this.create({
            name,
            email,
            password,
            gender,
            provider: AuthProvider.local,
            role: Role.user
        });

        return await this.save(user);
    }

    async addSnsUser(name: string, email: string | null, snsId: string, provider: AuthProvider, gender: Gender) {
        const user = this.create({
            name,
            email,
            password: null,
            snsId,
            gender,
            provider,
            role: Role.user,
            snsNameSet: false
        });

        return await this.save(user);
    }

    async setName(id: number, name: string) {
        const user = await this.findOne({id});
        if (!user) throw new UserNotExists(id);
        user.name = name;
        user.snsNameSet = true;
        await this.save(user);
    }

}