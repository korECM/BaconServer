import {ImageType} from "../../../domains/Image/Image";

interface ImageSeedInterface {
    imageLink: string;
    type: ImageType
}

export const ImageSeed: ImageSeedInterface[] = [
    {
        imageLink: "https://d3s32mx82uelsl.cloudfront.net/images/5dabdc93-5d0a-432a-8e1d-432f778363d11601484996300.JPG",
        type: ImageType.shop
    },
    {
        imageLink: "https://d3s32mx82uelsl.cloudfront.net/images/3be3ec44-6adf-4ee0-a4da-c938858a52cb1605264870029.jpeg",
        type: ImageType.menu
    },
    {
        imageLink: "https://d3s32mx82uelsl.cloudfront.net/images/1dc5e3d5-c6e7-417d-a4ba-1997baa4fc731605264840258.jpeg",
        type: ImageType.menu
    },
    {
        imageLink: "https://d3s32mx82uelsl.cloudfront.net/images/3293fd64-4efc-4cf5-ba76-1288c309bc761605264840290.jpeg",
        type: ImageType.shop
    },
    {
        imageLink: "https://d3s32mx82uelsl.cloudfront.net/images/95618153-e126-4f01-b284-51440c77ce4b1605264840322.jpeg",
        type: ImageType.shop
    },
]