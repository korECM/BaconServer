FROM node:12.18.2-alpine
MAINTAINER ECM jeffyoun@naver.com

#app 폴더 만들기 - NodeJS 어플리케이션 폴더
RUN mkdir -p /app
#winston 등을 사용할떄엔 log 폴더도 생성

#어플리케이션 폴더를 Workdir로 지정 - 서버가동용
WORKDIR /app

#서버 파일 복사 ADD [어플리케이션파일 위치] [컨테이너내부의 어플리케이션 파일위치]
#저는 Dockerfile과 서버파일이 같은위치에 있어서 ./입니다
# ADD ./ /app
COPY .env ./
RUN yarn global add pm2

COPY package*.json ./
COPY yarn.lock ./


#패키지파일들 받기
RUN yarn install

# RUN yarn global add typescript

COPY ./dist/app.js .
COPY ./dist/index.js .
COPY ./dist/DB ./DB
COPY ./dist/lib ./lib
COPY ./dist/router ./router
COPY ./dist/service ./service
COPY ./dist/test ./test
COPY ./dist/types ./types

COPY pm2.json ./

RUN pm2 install pm2-logrotate

#배포버젼으로 설정 - 이 설정으로 환경을 나눌 수 있습니다.
ENV NODE_ENV=production


EXPOSE 8001
#서버실행
# CMD ["yarn", "start"]
CMD [ "pm2-runtime", "start", "pm2.json" ]