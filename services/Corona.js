const Axios = require("axios").default;

const getCorona = (date) => {
  const baseUrl =
    "http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19SidoInfStateJson";

  if (date.getHours() <= 9) {
    date.setDate(date.getDay() - 1);
  }
  const dateParse = date
    .toLocaleDateString()
    .split("-")
    .map((v) => (v.toString().length > 1 ? v : "0" + v))
    .join("");
  try {
    return (
      Axios.get(baseUrl, {
        //   headers: { Accept: "application/json" },
        params: {
          ServiceKey: process.env.CORONA_BY_CITY_AUTH_KEY,
          pageNo: 1,
          numOfRows: 100,
          //   startCreateDt: dateParse,
          //   endCreateDt: dateParse,
        },
      })
        .then((json) => json.data.response.body)
        //   .then((body) => console.log(body));
        .then((body) => body.items.item)
    );
  } catch (err) {
    console.error(err);
  }
};

const printCorona = async (date) => {
  try {
    const todayCoronas = await getCorona(date);
    if (!todayCoronas) {
      return "오늘의 코로나 확진자가 최신화되지 않았습니다.";
    }
    let messages = [];

    todayCoronas.map((todayCorona, i) => {
      if (todayCorona.gubun === "합계") {
        messages.unshift("");
      }
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

exports.printCorona = printCorona;
