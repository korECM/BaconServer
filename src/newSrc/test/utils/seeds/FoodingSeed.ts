import {Connection, DeepPartial, Repository} from "typeorm";
import {User} from "../../../domains/User/User";
import {Shop} from "../../../domains/Shop/Shop";
import {Menu} from "../../../domains/Shop/Menu";
import {MenuSeed} from "./MenuSeed";
import {UserSeed} from "./UserSeed";
import {ShopSeed} from "./ShopSeed";
import {Review} from "../../../domains/Review/Review";
import {ReviewSeed} from "./ReviewSeed";
import {Score} from "../../../domains/Score/Score";
import {ScoreSeed} from "./ScoreSeed";
import {Image} from "../../../domains/Image/Image";
import {ImageSeed} from "./ImageSeed";
import {FoodClassification, FoodClassificationEnum} from "../../../domains/Shop/Classification/FoodClassification";
import {
    IngredientClassification,
    IngredientClassificationEnum
} from "../../../domains/Shop/Classification/IngredientClassification";
import {ShopClassification, ShopClassificationEnum} from "../../../domains/Shop/Classification/ShopClassification";

export class FoodingSeed {

    public static async setUp(connection: Connection) {
        const userRepository = connection.getRepository(User);
        const shopRepository = connection.getRepository(Shop);
        const menuRepository = connection.getRepository(Menu);
        const reviewRepository = connection.getRepository(Review);
        const scoreRepository = connection.getRepository(Score);
        const imageRepository = connection.getRepository(Image);
        const foodClassificationRepository = connection.getRepository(FoodClassification);
        const ingredientClassificationRepository = connection.getRepository(IngredientClassification);
        const shopClassificationRepository = connection.getRepository(ShopClassification);

        await imageRepository.clear()
        await shopRepository.clear()
        await menuRepository.clear()
        await reviewRepository.clear()
        await scoreRepository.clear()
        await userRepository.clear()

        const foodClassification = {
            korean: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.korean}))!,
            japanese: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.japanese}))!,
            asian: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.asian}))!,
            bakery: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.bakery}))!,
            chicken: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.chicken}))!,
            chinese: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.chinese}))!,
            fastfood: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.fastfood}))!,
            meat: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.meat}))!,
            pig: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.pig}))!,
            pizza: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.pizza}))!,
            steamed: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.steamed}))!,
            stew: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.stew}))!,
            western: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.western}))!,
            school: (await foodClassificationRepository.findOne({foodClassification: FoodClassificationEnum.school}))!,
        }

        const ingredientClassification = {
            rice: (await ingredientClassificationRepository.findOne({ingredientClassification: IngredientClassificationEnum.rice}))!,
            bread: (await ingredientClassificationRepository.findOne({ingredientClassification: IngredientClassificationEnum.bread}))!,
            noodle: (await ingredientClassificationRepository.findOne({ingredientClassification: IngredientClassificationEnum.noodle}))!,
            meat: (await ingredientClassificationRepository.findOne({ingredientClassification: IngredientClassificationEnum.meat}))!,
            etc: (await ingredientClassificationRepository.findOne({ingredientClassification: IngredientClassificationEnum.etc}))!,
        }

        const shopClassification = {
            korean: (await shopClassificationRepository.findOne({shopClassification: ShopClassificationEnum.korean}))!,
            japanese: (await shopClassificationRepository.findOne({shopClassification: ShopClassificationEnum.japanese}))!,
            western: (await shopClassificationRepository.findOne({shopClassification: ShopClassificationEnum.western}))!,
            other: (await shopClassificationRepository.findOne({shopClassification: ShopClassificationEnum.other}))!,
            fusion: (await shopClassificationRepository.findOne({shopClassification: ShopClassificationEnum.fusion}))!,
            school: (await shopClassificationRepository.findOne({shopClassification: ShopClassificationEnum.school}))!,
            chinese: (await shopClassificationRepository.findOne({shopClassification: ShopClassificationEnum.chinese}))!,
        }

        let users = await this.save(UserSeed, userRepository);
        let menus: Menu[] = await this.save(MenuSeed, menuRepository);
        let shops: Shop[] = await this.save(ShopSeed, shopRepository);
        let reviews: Review[] = await this.save(ReviewSeed, reviewRepository);
        let scores: Score[] = await this.save(ScoreSeed, scoreRepository);
        let images: Image[] = await this.save(ImageSeed, imageRepository);
        // 칠기마라탕
        shops[0].likers = users.slice(0, 2);
        shops[0].reviews = reviews.slice(0, 3);
        shops[0].menus = menus.slice(0, 3);
        shops[0].foodClassification = [foodClassification.chicken, foodClassification.stew];
        shops[0].ingredientClassification = [ingredientClassification.noodle, ingredientClassification.meat, ingredientClassification.etc]
        shops[0].shopClassification = [shopClassification.chinese]
        // 가마로강정
        shops[1].likers = users.slice(2, 1);
        shops[1].reviews = reviews.slice(3, 1);
        shops[1].menus = menus.slice(6, 3);
        await shopRepository.save(shops);
        reviews[0].user = users[0];
        reviews[1].user = users[1];
        reviews[2].user = users[2];
        reviews[3].user = users[0];
        await reviewRepository.save(reviews);
        scores[0].shop = shops[0];
        scores[0].by = users[0];
        scores[1].shop = shops[0];
        scores[1].by = users[1];
        scores[2].shop = shops[1];
        scores[2].by = users[2];
        scores[3].shop = shops[2];
        scores[3].by = users[0];
        await scoreRepository.save(scores);
        images[0].shop = shops[0];
        images[0].by = users[0];
        images[1].shop = shops[0];
        images[1].by = users[0];
        images[2].shop = shops[0];
        images[2].by = users[0];
        images[3].shop = shops[1];
        images[3].by = users[1];
        images[4].shop = shops[2];
        images[4].by = users[2];
        await imageRepository.save(images);

    }

    public static async save<T>(dataList: DeepPartial<T>[], repository: Repository<T>) {
        let entityList: T[] = [];
        for (let data of dataList) {
            entityList.push(await repository.save(repository.create(data)));
        }
        return entityList;
    }
}