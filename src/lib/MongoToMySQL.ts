import DB from '../DB';
import dotenv from 'dotenv';
import Shop, {ShopInterface} from '../DB/models/Shop';
import {Shop as ShopEntity} from "../newSrc/domains/Shop/Shop"
import Image from "../DB/models/Image";
import {createDatabaseConnection} from "../newSrc/database";
import {Keyword} from "../newSrc/domains/Shop/Keyword";
import {Location} from "../newSrc/domains/Shop/Location";
import {BusinessHours} from "../newSrc/domains/Shop/BusinessHours";
import {FoodClassification} from "../newSrc/domains/Shop/Classification/FoodClassification";
import {IngredientClassification} from "../newSrc/domains/Shop/Classification/IngredientClassification";
import {ShopClassification} from "../newSrc/domains/Shop/Classification/ShopClassification";
import {Menu as MenuEntity} from "../newSrc/domains/Shop/Menu";
import {Image as ImageEntity} from "../newSrc/domains/Image/Image";
import {Review as ReviewEntity} from "../newSrc/domains/Review/Review";
import Menu from "../DB/models/Menu";
import {Score as ScoreEntity} from "../newSrc/domains/Score/Score";
import {AuthProvider, Gender, Role, User as UserEntity} from "../newSrc/domains/User/User";
import User from "../DB/models/User";
import Review from "../DB/models/Review";
import Score from "../DB/models/Score";

dotenv.config();
(async () => {
    try {
        await DB.connect();
        let shops = await Shop.find().populate("keyword", "atmosphere costRatio group individual riceAppointment -_id").populate("image");

        let connection = await createDatabaseConnection();

        let shopRepository = connection.getRepository(ShopEntity);
        let foodClassificationRepository = connection.getRepository(FoodClassification);
        let ingredientClassificationRepository = connection.getRepository(IngredientClassification);
        let shopClassificationRepository = connection.getRepository(ShopClassification);
        let menuRepository = connection.getRepository(MenuEntity);
        let imageRepository = connection.getRepository(ImageEntity);
        let scoreRepository = connection.getRepository(ScoreEntity);
        let userRepository = connection.getRepository(UserEntity);
        let reviewRepository = connection.getRepository(ReviewEntity);

        await imageRepository.remove((await imageRepository.find()));
        await shopRepository.remove((await shopRepository.find()));
        await menuRepository.remove((await menuRepository.find()));
        await scoreRepository.remove((await scoreRepository.find()));
        await userRepository.remove((await userRepository.find()));
        await reviewRepository.remove((await reviewRepository.find()));

        let shopIndex = 0;

        let shopHashTable: { [id: string]: number } = {};
        let userHashTable: { [id: string]: number } = {};
        let reviewHashTable: { [id: string]: number } = {};

        for (let temp of shops) {
            shopIndex++;
            console.log(`Shop(${temp.name}) -> ${shopIndex}/${shops.length}`)
            let t: ShopInterface = {
                _id: temp._id,
                address: temp.address,
                category: temp.category,
                closed: temp.closed,
                contact: temp.contact,
                detailFoodCategory: temp.detailFoodCategory,
                foodCategory: temp.foodCategory,
                keyword: temp.keyword,
                latitude: temp.latitude,
                location: temp.location,
                longitude: temp.longitude,
                mainImage: temp.mainImage,
                name: temp.name,
                open: temp.open,
                price: temp.price || 0,
                registerDate: temp.registerDate,
                viewCount: temp.viewCount || 0,
            }
            let shop: any = {...t}
            let image = await Image.find({
                shopId: shop._id
            }).select("imageLink type registerDate -_id");
            let menus = await Menu.find({
                shopId: shop._id,
            }, "-_id title price")
            shop.image = image;
            shop.menus = menus;

            let shopE = shopRepository.create()
            shopE.id = shopIndex;
            shopE.name = shop.name;
            shopE.contact = shop.contact;
            shopE.mainImage = shop.mainImage;
            shopE.businessHours = new BusinessHours(shop.open, shop.closed);
            shopE.viewCount = shop.viewCount;
            shopE.price = shop.price;
            shopE.foodClassification = [];
            shopE.ingredientClassification = [];
            shopE.shopClassification = [];
            for (let c of shop.detailFoodCategory) {
                let findC = await foodClassificationRepository.findOne(c)
                if (findC)
                    shopE.foodClassification.push(findC);
            }
            for (let c of shop.foodCategory) {
                let findC = await ingredientClassificationRepository.findOne(c)
                if (findC)
                    shopE.ingredientClassification.push(findC);
            }
            {
                let findC = await shopClassificationRepository.findOne(shop.category)
                if (findC)
                    shopE.shopClassification.push(findC);
            }
            shopE.location = new Location(shop.address, shop.location, shop.latitude, shop.longitude);
            shopE.keyword = new Keyword(shop.keyword.costRatio, shop.keyword.atmosphere, shop.keyword.group, shop.keyword.individual, shop.keyword.riceAppointment);

            shopE.menus = []
            for (let m of shop.menus) {
                let menu = menuRepository.create()
                menu.name = m.title;
                menu.price = m.price;
                shopE.menus.push(menu);
                await menuRepository.save(menu);
            }

            shopE.scores = [];

            shopHashTable[`${shop._id}`] = shopE.id;

            await shopRepository.save(shopE);

            for (let im of shop.image) {
                let iii = imageRepository.create();
                iii.imageLink = im.imageLink;
                iii.type = im.type;
                iii.shop = shopE;
                await imageRepository.save(iii);
            }
        }

        let users = await User.find();
        let userIndex = 0;
        for (let user of users) {
            userIndex++;
            console.log(`User(${user.name}) -> ${userIndex}/${users.length}`);
            let userE = userRepository.create()
            userE.id = userIndex;
            userE.name = user.name;
            userE.email = user.email === "none" ? null : user.email;
            userE.provider = user.provider === "local" ? AuthProvider.local : AuthProvider.kakao;
            userE.kakaoNameSet = user.kakaoNameSet ? user.kakaoNameSet : true;
            userE.gender = user.gender === "m" ? Gender.m : Gender.f;
            userE.snsId = user.snsId === "none" ? null : user.snsId;
            userE.password = user.password === "none" ? null : user.password;
            userE.role = user.isAdmin ? Role.admin : Role.user;
            userE.likeShops = [];
            for (let ls of user.likeShop) {
                let findShop = await shopRepository.findOne({id: shopHashTable[`${ls}`]});
                if (findShop) {
                    userE.likeShops.push(findShop);
                }
            }

            userHashTable[`${user._id}`] = userIndex;
            await userRepository.save(userE);
        }

        let reviews = await Review.find();
        let reviewIndex = 0;
        for (let review of reviews) {
            reviewIndex++;
            console.log(`Review -> ${reviewIndex}/${reviews.length}`);
            let reviewE = reviewRepository.create();
            reviewE.comment = review.comment;
            let findShop = await shopRepository.findOne({id: shopHashTable[`${review.shop}`]});
            if (findShop) {
                reviewE.shop = findShop;
            }
            let findUser = await userRepository.findOne({id: userHashTable[`${review.user}`]});
            if (findUser) {
                reviewE.user = findUser;
            }
            reviewE.likers = [];
            for (let liker of review.like) {
                let findUser = await userRepository.findOne({id: userHashTable[`${liker}`]});
                if (findUser) {
                    reviewE.likers.push(findUser);
                }
            }
            reviewHashTable[`${review._id}`] = reviewIndex;
            await reviewRepository.save(reviewE);
        }

        let scores = await Score.find();
        let scoreIndex = 0;
        for (let s of scores) {
            scoreIndex++;
            console.log(`Score -> ${scoreIndex}/${scores.length}`);
            let sss = scoreRepository.create();
            sss.score = s.score;
            let findUser = await userRepository.findOne({id: userHashTable[`${s.user}`]});
            if (findUser) {
                sss.by = findUser;
            }

            let findShop = await shopRepository.findOne({id: shopHashTable[`${s.shop}`]});
            if (findShop) {
                sss.shop = findShop;
            }
            await scoreRepository.save(sss);
        }

        process.exit(0);

    } catch (e) {
        console.dir(e)
        throw e
    }

})
();
