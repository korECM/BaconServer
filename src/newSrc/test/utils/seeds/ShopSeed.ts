import {BusinessHours} from "../../../domains/Shop/BusinessHours";
import {Keyword} from "../../../domains/Shop/Keyword";
import {Location, LocationCategory} from "../../../domains/Shop/Location";
import {ShopClassification} from "../../../domains/Shop/Classification/ShopClassification";
import {FoodClassification} from "../../../domains/Shop/Classification/FoodClassification";
import {IngredientClassification} from "../../../domains/Shop/Classification/IngredientClassification";

interface ShopSeedInterface {
    id: number,
    name: string,
    contact: string,
    mainImage: string,
    businessHours: BusinessHours,
    viewCount: number,
    price: number,
    shopClassification: ShopClassification[],
    foodClassification: FoodClassification[],
    ingredientClassification: IngredientClassification[],
    location: Location,
    keyword: Keyword,
}

export const ShopSeed: ShopSeedInterface[] = [
    {
        id: 1,
        name: "칠기마라탕",
        contact: "02-123-456",
        mainImage: "",
        businessHours: new BusinessHours("11:00 - 22:00", "명절 휴무"),
        viewCount: 15,
        price: 6000,
        shopClassification: [],
        foodClassification: [],
        ingredientClassification: [],
        location: new Location("서울특별시 동작구 흑석로 89", LocationCategory.front, "0", "0"),
        keyword: new Keyword(2, 1, 2, 3, 7),
    },
    {
        id: 2,
        name: "가마로강정",
        contact: "02-3280-0808",
        mainImage: "",
        businessHours: new BusinessHours("11:00 - 24:00", ""),
        viewCount: 0,
        price: 8000,
        shopClassification: [],
        foodClassification: [],
        ingredientClassification: [],
        location: new Location("서울특별시 동작구 서달로 151", LocationCategory.hs_station, "0", "0"),
        keyword: new Keyword(1, 0, 0, 0, 0)
    },
    {
        id: 3,
        name: "가야",
        contact: "02-823-6637",
        mainImage: "",
        businessHours: new BusinessHours("11:30 - 23:30", ""),
        viewCount: 0,
        price: 9000,
        shopClassification: [],
        foodClassification: [],
        ingredientClassification: [],
        location: new Location("서울특별시 동작구 양녕로 286-1", LocationCategory.back, "0", "0"),
        keyword: new Keyword(0, 0, 0, 0, 2),
    },
    {
        id: 4,
        name: "갈매울감자탕",
        contact: "02-817-5001",
        mainImage: "",
        viewCount: 0,
        businessHours: new BusinessHours("00:00 - 24:00", ""),
        price: 8000,
        shopClassification: [],
        foodClassification: [],
        ingredientClassification: [],
        location: new Location("서울특별시 동작구 양녕로 282-1 1F", LocationCategory.back, "0", "0"),
        keyword: new Keyword(1, 0, 0, 1, 0),
    },
    // {
    //     id: 5,
    //     name: "거구장",
    //     contact: "02-815-4725",
    //     mainImage: "",
    //     viewCount: 0,
    //     "open": "10:30 - 21:30",
    //     "closed": "",
    //     price: 12000,
    //     "address": "서울특별시 동작구 흑석로 101-7 1F",
    //     "locationCategory": "front",
    //     "latitude": "0",
    //     "longitude": "0",
    //     "costRatio": 0,
    //     "atmosphere": 0,
    //     "group": 0,
    //     "individual": 0,
    //     "riceAppointment": 1
    // },
    // {
    //     id: 6,
    //     name: "고기먹으러",
    //     contact: "02-816-4027",
    //     mainImage: "",
    //     viewCount: 0,
    //     "open": "10:00 - 22:00",
    //     "closed": "",
    //     price: 6000,
    //     "address": "서울특별시 동작구 흑석로8길 3",
    //     "locationCategory": "front",
    //     "latitude": "0",
    //     "longitude": "0",
    //     "costRatio": 1,
    //     "atmosphere": 0,
    //     "group": 1,
    //     "individual": 0,
    //     "riceAppointment": 0
    // },
    // {
    //     id: 7,
    //     name: "고기스토리",
    //     contact: "02-812-7894",
    //     mainImage: "",
    //     viewCount: 0,
    //     "open": "",
    //     "closed": "",
    //     price: 7000,
    //     "address": "서울특별시 동작구 흑석로8길 4",
    //     "locationCategory": "front",
    //     "latitude": "0",
    //     "longitude": "0",
    //     "costRatio": 1,
    //     "atmosphere": 0,
    //     "group": 1,
    //     "individual": 0,
    //     "riceAppointment": 0
    // },
    // {
    //     id: 8,
    //     name: "고깃집",
    //     contact: "02-3280-6888",
    //     mainImage: "",
    //     viewCount: 0,
    //     "open": "16:00 - 24:00",
    //     "closed": "",
    //     price: 12000,
    //     "address": "서울특별시 동작구 서달로14길 46",
    //     "locationCategory": "hs_station",
    //     "latitude": "0",
    //     "longitude": "0",
    //     "costRatio": 0,
    //     "atmosphere": 1,
    //     "group": 0,
    //     "individual": 0,
    //     "riceAppointment": 1
    // },
    // {
    //     id: 9,
    //     name: "고봉삼계탕",
    //     contact: "02-824-3339",
    //     mainImage: "",
    //     viewCount: 0,
    //     "open": "",
    //     "closed": "",
    //     price: 15000,
    //     "address": "서울특별시 동작구 서달로 166 1F",
    //     "locationCategory": "hs_station",
    //     "latitude": "0",
    //     "longitude": "0",
    //     "costRatio": 0,
    //     "atmosphere": 0,
    //     "group": 0,
    //     "individual": 0,
    //     "riceAppointment": 0
    // },
    // {
    //     id: 10,
    //     name: "고씨네",
    //     contact: "02-817-2134",
    //     mainImage: "",
    //     viewCount: 0,
    //     "open": "11:00 - 21:00",
    //     "closed": "",
    //     price: 6500,
    //     "address": "서울특별시 동작구 흑석로 83-1",
    //     "locationCategory": "front",
    //     "latitude": "0",
    //     "longitude": "0",
    //     "costRatio": 1,
    //     "atmosphere": 0,
    //     "group": 0,
    //     "individual": 0,
    //     "riceAppointment": 1
    // }
]