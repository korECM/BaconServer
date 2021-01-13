import {AuthProvider, Gender, Role} from "../../../domains/User/User";

interface UserSeedInterface {
    id: number,
    name: string,
    email: string,
    provider: AuthProvider,
    kakaoNameSet: boolean,
    gender: Gender,
    snsId: string | null,
    password: string | null,
    role: Role,
}

export const UserSeed: UserSeedInterface[] = [
    {
        id: 1,
        name: "마라탕러버",
        email: "test@test.com",
        provider: AuthProvider.local,
        kakaoNameSet: false,
        gender: Gender.m,
        snsId: null,
        // 1234
        password: "$2a$04$fXrZ0Um.fPksPL/Y8woPQeG4OBazIfAhIYNFavU7PkttvGZQj.Ddi",
        role: Role.admin,
    },
    {
        id: 2,
        name: "리뷰맨",
        email: "none",
        provider: AuthProvider.kakao,
        kakaoNameSet: true,
        gender: Gender.f,
        snsId: "1449580847",
        password: null,
        role: Role.user,
    },
    {
        id: 3,
        name: "맛집을 찾는다",
        email: "none",
        provider: AuthProvider.kakao,
        kakaoNameSet: true,
        gender: Gender.m,
        snsId: "1449580848",
        password: null,
        role: Role.user,
    },
];