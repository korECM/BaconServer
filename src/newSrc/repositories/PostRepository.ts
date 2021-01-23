import {EntityRepository} from "typeorm";
import {Post} from "../domains/Post/Post";
import env from "../env";
import {BaseRepository} from "typeorm-transactional-cls-hooked";

@EntityRepository(Post)
export class PostRepository extends BaseRepository<Post> {

    async getRecentPosts(num: number): Promise<Post[]> {
        return this
            .createQueryBuilder("post")
            .select()
            .orderBy("post.createdTime", "DESC")
            .limit(num)
            .getMany();
    }

    async getRandomPosts(num: number): Promise<Post[]> {
        return this
            .createQueryBuilder("post")
            .select()
            .orderBy(env.isTest ? "random()" : "RAND()")
            .limit(num)
            .getMany();
    }

}