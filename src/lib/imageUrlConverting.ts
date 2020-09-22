const s3 = 'bacon-shop-origin.s3.ap-northeast-2.amazonaws.com';
const cf = 'd3s32mx82uelsl.cloudfront.net';

export const s3ToCf = (url: string): string => {
  return url.replace(s3, cf);
};
