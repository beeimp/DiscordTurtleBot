const Axios = require("axios").default;

const weatherParse = (items) => {
  return items.map((item, itemIndex) => {
    let value = item.obsrValue ? item.obsrValue : item.fcstValue;
    let name = "";
    let unit = "";
    switch (item.category) {
      case "POP": // 강수확률
        name = "강수확률";
        value = value;
        unit = "%";
        break;
      case "PTY": // 강수형태
        const pty = {
          0: "",
          1: "비🌧",
          2: "비와 눈🌧❄",
          3: "눈❄",
          4: "소나기☔",
          5: "빗방울💧",
          6: "빗방울과 눈날림💧❄🌫",
          7: "눈날림❄🌫",
        };
        name = "강수 형태";
        value = pty[value];
        unit = "";
        break;
      case "LGT":
        name = "낙뢰";
        unit = "KA(킬로암페어)/㎢"; // 킬로암페어
      case "RN1": // 강수량(1시간)
        name = "강수량";
        unit = "mm";
        break;
      case "R06": // 강수량(6시간)
        name = "강수량 (6시간)";
        unit = "mm";
        break;
      case "REH": // 습도
        name = "습도";
        unit = "%";
        break;
      case "S06": // 6시간 신적설
        name = "눈의 양 (6시간)";
        unit = "cm";
        break;
      case "SKY": // 하늘상태
        const sky = { 1: "맑음🌞", 3: "구름 많음⛅", 4: "흐림☁" };
        name = "하늘 상태";
        value = sky[value];
        unit = "";
        break;
      case "T1H": // 기온 (1시간)
        name = "기온";
        unit = "℃";
        break;
      case "T3H": // 3시간 기온
        name = "기온";
        unit = "℃";
        break;
      case "TMN": // 아침 최저기온
        name = "아침 최저기온";
        unit = "℃";
        break;
      case "TMX": // 낮 최고기온
        name = "낮 최고기온";
        unit = "℃";
        break;
      case "UUU": // 풍속(동서성분)
        name = "풍속(동서)";
        value = value == 0 ? "" : value > 0 ? "동" : "서";
        unit = "℃";
        break;
      case "VVV": // 풍속(남북성분)
        name = "풍속(남북)";
        value = value == 0 ? "" : value > 0 ? "남" : "북";
        unit = "℃";
        break;
      case "WAV": // 파고
        name = "파도 높이";
        unit = "M";
        break;
      case "VEC": // 풍향 deg
        const degree = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];
        name = "풍향";
        value = degree[parseInt(value / 45)];
        unit = "";
        break;
      case "WSD": // 풍속
        name = "풍속";
        unit = "m/s";
        break;

      default:
        break;
    }

    if (item.fcstTime) {
      return {
        name: name,
        category: item.category,
        fcstDate: item.fcstDate,
        fcstTime: item.fcstTime,
        value: value,
        unit: unit,
      };
    } else {
      return {
        name: name,
        category: item.category,
        value: value,
        unit: unit,
      };
    }
  });
};

const getWeather = (num = 0, nx = 68, ny = 80) => {
  const baseUrl = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/";

  const apiFunction = [
    { name: "getUltraSrtNcst", desc: "초단기실황조회" },
    { name: "getUltraSrtFcst", desc: "초단기예보조회" },
    { name: "getVilageFcst", desc: "동네예보조회" }, // num의 기본값
    // { name: "getFcstVersion", desc: "예보버전조회" },
  ];

  const baseTime = {
    0: [
      "2330",
      "2230",
      "2130",
      "2030",
      "1930",
      "1830",
      "1730",
      "1630",
      "1530",
      "1430",
      "1330",
      "1230",
      "1130",
      "1030",
      "0930",
      "0830",
      "0730",
      "0630",
      "0530",
      "0430",
      "0330",
      "0230",
      "0130",
      "0030",
    ],
    1: [
      "2330",
      "2230",
      "2130",
      "2030",
      "1930",
      "1830",
      "1730",
      "1630",
      "1530",
      "1430",
      "1330",
      "1230",
      "1130",
      "1030",
      "0930",
      "0830",
      "0730",
      "0630",
      "0530",
      "0430",
      "0330",
      "0230",
      "0130",
      "0030",
    ],
    2: ["2330", "2030", "1730", "1430", "1130", "0830", "0530", "0230"],
  };

  const date = new Date();

  const timeNow = `${
    date.getHours().toString().length < 2
      ? "0" + date.getHours().toString()
      : date.getHours().toString()
  }${
    date.getMinutes().toString().length < 2
      ? "0" + date.getMinutes().toString()
      : date.getMinutes().toString()
  }
  `;

  let base_time = "";
  baseTime[num].some((v, index) => {
    const bt = parseInt(v);
    const tn = parseInt(timeNow);

    if (bt < tn) {
      base_time = v;
      return true; // some은 true가 되는 순간 멈춤
    }
  });
  if (base_time === "") {
    base_time = baseTime[num][0];
    date.setDate(date.getDate() - 1);
  }

  const base_date = date
    .toLocaleDateString()
    .split("-")
    .map((item) => (item.length < 2 ? "0" + item : item))
    .join("");

  // console.log(base_date, base_time);

  return (
    Axios.get(`${baseUrl}${apiFunction[num].name}`, {
      headers: { Accept: "application/json" },
      params: {
        ServiceKey: process.env.WEATHER_NEIGHBORHOOD_AUTH_KEY,
        numOfRows: "200", // 153
        pageNo: "1",
        dataType: "JSON",
        base_date: base_date,
        base_time: base_time,
        // base_time: `
        // ${
        //   date.getHours().toString().length < 2
        //     ? "0" + date.getHours().toString()
        //     : date.getHours().toString()
        // }${
        //   date.getMinutes().toString().length < 2
        //     ? "0" + date.getMinutes().toString()
        //     : date.getMinutes().toString()
        // }`,
        nx: nx,
        ny: ny,
      },
    })
      .then((res) => res.data)
      .then((data) => data.response)
      .then((response) => response.body.items.item)
      // .then((response) => console.log(response))
      // 필요없는 카테고리 제거
      .then((items) =>
        items.filter(
          (item) =>
            ![
              "TMN", // 아침 최저 기온
              "TMN", // 낮 최고기온
              "UUU", // 풍속(동서성분)
              "VVV", // 풍속(남북성분)
            ].includes(item.category)
        )
      )
      .then((items) => weatherParse(items))
    // .then((weatherInfo) => {
    //   const keys = new Set(weatherInfo.map((item) => item.date));

    //   const groupDay = [...keys].map((key) => {
    //     return {
    //       date: key,
    //       info: weatherInfo.filter((item) => item.date === key),
    //     };
    //   });
    //   return groupDay;
    // })
    // .then((item) => {
    //   console.log(item);
    //   console.log(item.length);
    // })
  );
};

const getShortTermLiveWeather = async (name = "", currentWeather) => {
  try {
    // const currentWeather = await getWeather(0, location[0], location[1]);
    if (!currentWeather) {
      return `현재 날씨 정보가 없습니다`;
    }
    let info = {};
    currentWeather.map((item) => {
      let result = "";
      switch (item.name) {
        case "강수 형태":
          if (item.value === "") return;
        default:
          result = `${item.value} ${item.unit}`;
          break;
      }
      info = {
        ...info,
        [item.name]: result,
      };
    });
    // console.log(info);
    return `${"```cs"}
  ====== 현재 날씨 정보 (${name}) ======
  
  기    온 : ${info["기온"]}
  습    도 : ${info["습도"]}
  강 수 량 : ${info["강수량"]} ${
      info["강수 형태"] ? "( " + info["강수 형태"] + ")" : ""
    }
  바    람 : ${info["풍향"]}쪽에서 ${info["풍속"]}
  ${"```"}`;
  } catch (error) {
    console.error(error);
  }
};

const getShortTermForecastWeather = async (name, forecastWeather) => {
  try {
    if (!forecastWeather) {
      return `과거 날씨 정보가 없습니다`;
    }

    let result = [];

    result.push("```cs");
    result.push(`========== ${name} 시간대별 날씨 ==========`);
    // const forecastWeather = await getWeather(1, location[0], location[1]);
    const dateSet = new Set(forecastWeather.map((item) => item.fcstDate));
    const dateArray = [...dateSet];

    dateArray.map((date, index) => {
      result.push(
        `
-------- ${date.substring(4, 6)}월 ${date.substring(6, 8)}일 --------`
      );
      const timeSet = new Set(
        forecastWeather
          .filter((item) => item.fcstDate === date)
          .map((item) => {
            return item.fcstTime;
          })
      );
      const timeArray = [...timeSet];

      timeArray.map((time) => {
        let info = {};
        forecastWeather
          .filter((item) => item.fcstDate === date && item.fcstTime === time)
          .map((item) => {
            let result = "";
            switch (item.name) {
              case "강수 형태":
              case "하늘 상태":
                if (item.value === "") return;
              default:
                result = `${item.value} ${item.unit}`;
                break;
            }
            info = {
              ...info,
              [item.name]: result,
            };
          });

        result.push(`
............. ${time.substring(0, 2)} 시 ..............

기    온 : ${info["기온"]}
습    도 : ${info["습도"]}
강 수 량 : ${info["강수량"]} ${
          info["강수 형태"] ? "( " + info["강수 형태"] + ")" : ""
        } ${info["하늘 상태"] ? "( " + info["하늘 상태"] + ")" : ""}
바    람 : ${info["풍향"]}쪽에서 ${info["풍속"]}`);
      });
    });
    result.push("```");
    result = result.join("\n");
    return result;
  } catch (error) {
    console.error(error);
  }
};

exports.getShortTermLiveWeather = getShortTermLiveWeather;
exports.getShortTermForecastWeather = getShortTermForecastWeather;
exports.getWeather = getWeather;

/*   * 동네 예보 코드값 정보
		 * 항목값	항목명	단위
		 * POP	강수확률	 %
		 * PTY	강수형태	코드값
		 * R06	6시간 강수량	범주 (1 mm)
		 * REH	습도	 %
		 * S06	6시간 신적설	범주(1 cm)
		 * SKY	하늘상태	코드값
		 * T3H	3시간 기온	 ℃
		 * TMN	아침 최저기온	 ℃
		 * TMX	낮 최고기온	 ℃
		 * UUU	풍속(동서성분)	 m/s
		 * VVV	풍속(남북성분)	 m/s
		 * WAV	파고	 M
		 * VEC	풍향	 m/s
		 * WSD	풍속	1

		 */
