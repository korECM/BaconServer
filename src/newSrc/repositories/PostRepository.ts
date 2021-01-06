import {EntityRepository, Repository} from "typeorm";
import {Post} from "../domains/Post/Post";

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {

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
            .orderBy("random()")
            .limit(num)
            .getMany();
    }

}