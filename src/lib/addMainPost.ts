import DB from '../DB';
import dotenv from 'dotenv';
import Shop, { FoodCategory, ShopCategory } from '../DB/models/Shop';
import Image from '../DB/models/Image';
import MainPost from '../DB/models/MainPost';
dotenv.config();

interface PostInterface {
  title: string;
  link: string;
  image: string;
}

let data: PostInterface[] = [
  {
    title: '중앙대 근처 건강 웰빙 맛집 6곳',
    image: 'https://d3ojewq8movb4o.cloudfront.net/toustous.jpg',
    link: 'https://www.instagram.com/p/CFuLY2spX3R/?igshid=3mohbr3cpa4z',
  },
  {
    title: '서비스 준비중입니다.',
    image: 'https://d3ojewq8movb4o.cloudfront.net/onetwothree.jpg',
    link: '',
  },
  {
    title: '서비스 준비중입니다.',
    image: 'https://d3ojewq8movb4o.cloudfront.net/thirdbutton.jpg',
    link: '',
  },
];

(async () => {
  await DB.connect();
  await MainPost.deleteMany({});
  for (let d of data) {
    await MainPost.create({
      title: d.title,
      image: d.image,
      link: d.link,
    });
  }
  process.exit(0);
})();
