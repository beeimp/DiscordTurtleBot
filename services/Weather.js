const Axios = require("axios").default;

const getWeather = (num = 1) => {
  const baseUrl = "http://apis.data.go.kr/1360000/VilageFcstInfoService/";

  const apiFunction = [
    { name: "getUltraSrtNcst", desc: "초단기실황조회" },
    { name: "getUltraSrtFcst", desc: "초단기예보조회" },
    { name: "getVilageFcst", desc: "동네예보조회" },
    { name: "getFcstVersion", desc: "예보버전조회" },
  ];

  Axios.get(`${baseUrl}${apiFunction[num].name}`, {
    headers: { Accept: "application/json" },
    params: {
      ServiceKey: process.env.WEATHER_NEIGHBORHOOD_AUTH_KEY,
      numOfRows: "10",
      pageNo: "1",
      dataType: "JSON",
      base_date: "20210525",
      base_time: "0500",
      nx: "59",
      ny: "75",
    },
  })
    .then((res) => res.data)
    .then((data) => data.response)
    .then((response) => console.log(response.body.items.item));
  // .then((response) => response.body);
  // .then((body) => body.items)
  // .then((items) => console.log(items.item));
};

exports.getWeather = getWeather;
