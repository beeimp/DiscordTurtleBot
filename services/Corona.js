const Axios = require("axios").default;

const getCorona = (date) => {
  const baseUrl =
    "http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19SidoInfStateJson";

  const dateParse = date
    .toLocaleDateString()
    .split("-")
    .map((v) => (v.toString().length > 1 ? v : "0" + v))
    .join("");
  try {
    return Axios.get(baseUrl, {
      //   headers: { Accept: "application/json" },
      params: {
        ServiceKey: process.env.CORONA_BY_CITY_AUTH_KEY,
        pageNo: 1,
        numOfRows: 100,
        startCreateDt: dateParse,
        endCreateDt: dateParse,
      },
    })
      .then((json) => json.data.response.body)
      .then((body) => body.items.item);
  } catch (err) {
    console.error(err);
  }
};

const printCorona = async () => {
  const date = new Date();
  const today = date;

  try {
    const todayCoronas = await getCorona(today);

    let messages = [];

    todayCoronas.map((todayCorona, i) => {
      messages.unshift(
        `${todayCorona.gubun} : ${todayCorona.defCnt} 명 (+ ${todayCorona.incDec} 명) [지역 : ${todayCorona.localOccCnt} / 해외 : ${todayCorona.overFlowCnt}]`
      );
    });

    messages.unshift(
      `=============== ${date.toLocaleDateString()} 코로나 확진자 ===============`
    );
    messages.unshift("```css");
    messages.push("```");

    return messages;
  } catch (err) {
    console.error(err);
  }
};

exports.printCorona = printCorona();

/*
 * 1. 90초마다 코로나 조회
 * 2. 전날과 금일의 해당 지역의 코로나 확진자 비교
 * 3. 1시간 또는 확진자 변동에 따라 출력
 */
