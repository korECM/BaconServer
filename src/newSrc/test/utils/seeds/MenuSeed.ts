import {Money} from "../../../domains/Shop/Money";

interface MenuSeedInterface {
    id: number,
    name: string,
    price: Money,
}

export const MenuSeed: MenuSeedInterface[] = [
    {
        id: 1,
        name: "마라탕 100g(6000~)",
        price: new Money(1800),
    },
    {
        id: 2,
        name: "마라샹궈 100g(16000~)",
        price: new Money(1800),
    },
    {
        id: 3,
        name: "꿔바로우 소",
        price: new Money(1800),
    },
    {
        id: 4,
        name: "부대찌개 1인분",
        price: new Money(7000),
    },
    {
        id: 5,
        name: "부대찌개 소",
        price: new Money(14000),
    },
    {
        id: 6,
        name: "팬 스테이크",
        price: new Money(15000),
    },
    {
        id: 7,
        name: "매콤/달콤강정 대",
        price: new Money(14000),
    },
    {
        id: 8,
        name: "매콤/달콤강정 중",
        price: new Money(8000),
    },
    {
        id: 9,
        name: "매콥/달콤강정 컵",
        price: new Money(3000),
    },
    {
        id: 10,
        name: "보쌈정식",
        price: new Money(9000),
    },
    {
        id: 11,
        name: "로스트보쌈",
        price: new Money(26000),
    },
    {
        id: 12,
        name: "훈제족발",
        price: new Money(26000),
    },
    {
        id: 13,
        name: "뼈 해장국",
        price: new Money(8000),
    }
];