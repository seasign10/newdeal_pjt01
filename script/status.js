// survice_key
const API_KEY = config.apikey;

// 시간데이터를 사용할 일이 있으면 사용하자.
// let getNow = new Date();
// let year = getNow.getFullYear();
// let month = getNow.getMonth()+1;
// let date = getNow.getDate();

const getData = async ()=>{
  // 시도별 실시간 측정정보 조회

  // 서울 코드
  const localSeoul = '%EC%84%9C%EC%9A%B8';
  const url = new URL(`https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=100&pageNo=1&sidoName=${localSeoul}&ver=1.0`);
  const response = await fetch(url);
  const data = await response.json();
  // console.log(data.response.body.items);
  let localDust = data.response.body.items;

  statusNowUI(localDust)
}

getData();

// 서울
const add = '중구';

let dustGrade = '';
let dustValue = '';
let dustContent = ``
// let statusNow = ()=>{};
// function statusNow(){};
function statusNowUI(data){
  // console.log(data.length);
  // grade = 좋음~나쁨 | value : 측정값
  for(let i=0;i<data.length;i++){
    if(data[i].stationName == add){
      dustGrade = data[i].khaiGrade;
      dustValue = data[i].khaiValue;
    }
  }
  console.log(dustGrade);
  console.log(dustValue);
  dustFilter(dustGrade, dustValue);
  // document.querySelector('.dust_situation').innerHTML = dustContent;
}

function dustFilter(g, v){
  // 좋음~나쁨
  // typeof로 찍어보니 string값
  if(g=='1'){
    
  }
}