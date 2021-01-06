import {Service} from "typedi";
import {Post} from "../domains/Post/Post";
import {PostRepository} from "../repositories/PostRepository";
import {InjectRepository} from "typeorm-typedi-extensions";
import {MainPostResponse} from "../Dtos/MainPost";

@Service()
export class MainPostService {
    constructor(@InjectRepository() private postRepository: PostRepository) {
    }

    async getMainPosts(): Promise<MainPostResponse[]> {
        let posts: Post[] = await this.postRepository.getRandomPosts(3);

        return posts.map(post => new MainPostResponse(post.id, post.title, post.imageLink, post.postLink));
    }

}