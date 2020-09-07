const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const getHtml = async (link) => {
  try {
    return await axios.get(link);
  } catch (error) {
    console.error(error);
  }
};

const makeLink = (postFix) => {
  return `https://www.mangoplate.com${postFix}`;
};

function getLink(maxPageNum) {
  let linkList = [];
  return new Promise((resolve, reject) => {
    for (let i = 1; i <= maxPageNum; i++) {
      getHtml(`https://www.mangoplate.com/search/%EC%A4%91%EC%95%99%EB%8C%80?keyword=%EC%A4%91%EC%95%99%EB%8C%80&page=${i}`).then((html) => {
        const $ = cheerio.load(html.data);
        let listContainer = $('body > main > article > div.column-wrapper > div > div > section > div.search-list-restaurants-inner-wrap > ul').children('li');
        listContainer.each(function (i, elem) {
          const postFix = $(this).find('div:nth-child(1) > figure > a').attr('href');
          const preFix = $(this).find('div:nth-child(2) > figure > a').attr('href');
          linkList.push(makeLink(postFix));
          linkList.push(makeLink(preFix));
        });
        if (i === 10) {
          setTimeout(() => {
            resolve(linkList);
          }, 3000);
        }
      });
    }
  });
}

function getDataOption($, selector, name) {
  if ($(`${selector} > th`).text() === name) {
    return $(`${selector} > td`).text();
  }
  return '';
}

function getData(link) {
  return new Promise((resolve, reject) => {
    getHtml(link).then((html) => {
      const $ = cheerio.load(html.data);
      const name = $(
        'body > main > article > div.column-wrapper > div.column-contents > div > section.restaurant-detail > header > div.restaurant_title_wrap > span > h1',
      ).text();
      let address = '';
      let contact = '';
      let foodCategory = '';
      let category = '';
      let price = '';
      let open = '';
      let closed = '';

      const detail = $('body > main > article > div.column-wrapper > div.column-contents > div > section.restaurant-detail > table > tbody').children('tr');
      detail.each(function () {
        const title = $(this).find('th').text();
        const data = $(this).find('td').text();
        switch (title) {
          case '주소':
            address = data.split('지번')[0].trim();
            break;
          case '전화번호':
            contact = data;
            break;
          case '음식 종류':
            foodCategory = data.trim();
            break;
          case '가격대':
            price = data.trim();
            break;
          case '영업시간':
            open = data.trim();
            break;
          case '휴일':
            closed = data.trim();
            break;
          default:
            break;
        }
      });

      const menuContainer = $('.Restaurant_MenuList').children('li');

      const menus = [];

      menuContainer.each(function () {
        const name = $(this).find('.Restaurant_Menu').text();
        const price = $(this).find('.Restaurant_MenuPrice').text().replace('원', '').replace(/,/g, '');
        menus.push({
          name,
          price,
        });
      });
      // console.log($(this).find('.restaurant_name').text())

      resolve({
        link,
        name,
        address,
        contact,
        category,
        foodCategory,
        price,
        closed,
        // menus,
        open,
      });
    });
  });
}

getLink(10).then((linkList) => {
  let resultData = [];
  console.log('링크 수', linkList.length);
  Promise.all(
    linkList.map((link) => {
      return new Promise((resolve, reject) => {
        getData(link).then((data) => {
          resultData.push(data);
          resolve();
        });
      });
    }),
  ).then(() => {
    // console.dir(resultData)
    console.log('식당 수 : ', resultData.length);
    fs.writeFileSync('shopData.json', JSON.stringify(resultData));
  });
});
