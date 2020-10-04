import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import path from 'path';
import * as UUID from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});
const uuid = UUID.v4;

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'bacon-shop-origin/images', // 버킷 이름
    contentType: multerS3.AUTO_CONTENT_TYPE, // 자동을 콘텐츠 타입 세팅
    acl: 'public-read', // 클라이언트에서 자유롭게 가용하기 위함
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      let extension = path.extname(file.originalname) || '.jpg';
      cb(null, uuid() + Date.now().toString() + extension);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 용량 제한
});

export const deleteImage = async (imageName: string) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: 'bacon-shop-origin',
        Key: 'images/' + imageName,
      },
      (err, data) => {
        if (err) {
          console.error('이미지 삭제 실패');
          reject();
        }
        console.log('delete Image', data);
        resolve();
      },
    );
  });
};
