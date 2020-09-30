import MainPost from '../models/MainPost';

export class MainPostController {
  async getMainPosts() {
    try {
      let posts = await MainPost.find();
      if (posts === null) return [];
      return posts;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
