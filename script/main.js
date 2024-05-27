// survice_key
const API_KEY = config.apikey;
const NAVER_API_CLIENT_ID = config.NAVER_API_CLIENT_ID;

// local addr data
const local = [
  {
    name: '서울',
    code: '%EC%84%9C%EC%9A%B8'
  },
  {
    name: '부산',
    code: '%EB%B6%80%EC%82%B0',
  },
  {
    name: '대구',
    code: '%EB%8C%80%EA%B5%AC',
  },
  {
    name: '인천',
    code: '%EC%9D%B8%EC%B2%9C',
  },
  {
    name: '광주',
    code: '%EA%B4%91%EC%A3%BC',
  },
  {
    name: '대전',
    code: '%EB%8C%80%EC%A0%84&',
  },
  {
    name: '울산',
    code: '%EC%9A%B8%EC%82%B0',
  },
  {
    name: '경기',
    code: '%EA%B2%BD%EA%B8%B0',
  },
  {
    name: '강원',
    code: '%EA%B0%95%EC%9B%90',
  },
  {
    name: '충북',
    code: '%EC%B6%A9%EB%B6%81',
  },
  {
    name: '충남',
    code: '%EC%B6%A9%EB%82%A8',
  },
  {
    name: '전북',
    code: '%EC%A0%84%EB%B6%81',
  },
  {
    name: '전남',
    code: '%EC%A0%84%EB%82%A8',
  },
  {
    name: '경북',
    code: '%EA%B2%BD%EB%B6%81',
  },
  {
    name: '경남',
    code: '%EA%B2%BD%EB%82%A8',
  },
  {
    name: '제주',
    code: '%EC%A0%9C%EC%A3%BC',
  },
  {
    name: '세종',
    code: '%EC%84%B8%EC%A2%85',
  },
]

// 네이버 지도 API
document.addEventListener('DOMContentLoaded', function(){
  // 네이버 지도 API 로드
  const script = document.createElement('script');
  script.src =
    `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_API_CLIENT_ID}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = ()=>{// 메인모듈 onload 후, 서브 모듈
    // 서브 모듈 (reverseGeocode 사용을 위해)
    const scriptSub = document.createElement('script');
    scriptSub.src =
      `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_API_CLIENT_ID}&submodules=geocoder`;
    scriptSub.async = true;
    scriptSub.defer = true;
    document.head.appendChild(scriptSub);

    //onload + async => 스크립트 로드 완료 후, 실행하도록 function() 을 사용할거면 화살표 함수를 없애도록.
    scriptSub.onload = async()=>{ // 서브모듈
      // 네이버 함수 실행
      // 함수실행순서 정하기 : asyncNaverAPI > getData()
      await asyncNaverAPI();
      // getData(); // updateInfo 뒤에 실행하고 싶으므로 아예 내부 함수로
    }
  };
});

// map을 전역으로 지정해놔야 제한없이 호출이 가능
let map
let addrCity = '';
let addrRegion = '';
async function asyncNaverAPI(){
    // 네이버 지도 생성
    map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(37.56100278, 126.9996417),
      zoom: 12,
      draggable: false,
      minZoom: 12, // 줌을 disable 하기 위함
      maxZoom: 12, // 줌을 disable 하기 위함
      disableDoubleTapZoom: true,
      disableDoubleClickZoom: true,
      disableTwoFingerTapZoom: true
    });
  
    let infowindow = new naver.maps.InfoWindow();
    window.addEventListener('load', function() {
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(onSuccessGeolocation,onErrorGeolocation);
        // console.log(infowindow.DEFAULT_OPTIONS)
        let center = map.getCenter();
        infowindow.setContent(`<span class="undefined_location">위치를 찾지 못했어요.</span>`)
        infowindow.open(map, center); //중앙 위치에 infowindow 열기        
      }
    });
  
    function onSuccessGeolocation(position){
      // 성공 시 처리 로직
      let location = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(location) // 지도의 중심을 현재 위치로 이동
      infowindow.setContent(`<i class="fa-solid fa-location-dot loaction_icon"></i>`);
      infowindow.open(map, location); // 현재 위치에 인포 윈도우를 엽니다.
    
      searchCoordinateToAddress(location);
    }
    function onErrorGeolocation(error){
      // 에러 시 처리 로직
      console.log(error);
      infowindow.setContent('<div>Geolocation 오류: ' + error.message + '</div>');
      let center = map.getCenter();
      infowindow.open(map, center); // 중앙 위치에 인포 윈도우를 엽니다.
    }
  
    // 좌표 > 주소(위치정보)
    function searchCoordinateToAddress(latlng){
      naver.maps.Service.reverseGeocode({
        coords: latlng,
        orders: [
          naver.maps.Service.OrderType.ADDR,
        ].join(',')
      }, function(status, response){
        if(status===naver.maps.Service.Status.ERROR){
          return alert('위치를 불러오는 중 문제가 생겼습니다.')
        }
        
        let item = response.v2.results[0].region
        addrCity = item.area1.alias;
        addrRegion = item.area2.name;
        updateInfo(addrCity, addrRegion);

        getData();
        }
      );
    }

    // 주소 > 좌표
    function searchAddressToCoordinate(address) {
      naver.maps.Service.geocode({
        query: address
      }, function (status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
          return alert('위치를 불러오는 중 문제가 생겼습니다.');
        }
        if (response.v2.meta.totalCount === 0) {
          return alert('totalCount' + response.v2.meta.totalCount);
        }
          item = response.v2.addresses[0],
          // 좌표
          point = new naver.maps.Point(item.x, item.y);
      });
    }

    // 값을 집어 넣는 곳
    function initGeocoder(inputCity, inputRegion) {
      // searchAddressToCoordinate(`${inputCity} ${inputRegion}`);
      searchAddressToCoordinate(`서울 은평구`);
    }
    naver.maps.onJSContentLoaded = initGeocoder
/////////////////////////////////////////////////////
}
// 아이디 인증실패시
window.navermap_authFailure = function () {
  console.warn('클라이언트 아이디를 확인해주세요.');
}

// 전역 함수 : 변수 업데이트
function updateInfo(city, region){
  addrCity = city;
  addrRegion = region;
};

// 시간데이터를 사용할 일이 있으면 사용하자.
function timeNow(){
  let getNow = new Date();
  let year = getNow.getFullYear();
  let month = getNow.getMonth()+1;
  if(month<10){month = '0'+month};
  let date = getNow.getDate();
  
  document.querySelector('.cuttent_time').innerHTML = `${year}-${month}-${date}`;
}

// json
const getData = async ()=>{
  // 시도별 실시간 측정정보 조회
  let localCode = ''
  for(i=0;i<local.length;i++){
    if(local[i].name==addrCity){
      localCode = local[i].code;
      // console.log(local[i].code);
    }
  }
  const url = new URL(`https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=130&pageNo=1&sidoName=${localCode}&ver=1.0`);
  const response = await fetch(url);
  const data = await response.json();
  let localDust = data.response.body.items;

  statusNowUI(localDust);
  timeNow();
  wait();
  const queryBtn = document.querySelector('.fa-circle-question');
  queryBtn.innerHTML += `
    <dl class="query_box">
      <dt>통합대기지수 (단위: %)</dt>
      <dd>현재 대기오염 정도를<br />
      퍼센트(%)로 나타냅니다</dd>
      <dd>자료제공 : 에어코리아</dd>
    </dl>
    `
  queryIcon();
  const menu = document.querySelector('.menu_list');
  const menuBtn = document.querySelector('.menu_bar');
  const menuInBtn = document.querySelector('.menu_icon i');
  reAppear()
  menuList(menu, menuBtn, menuInBtn);
  selectCity(local)
}
// getData();

// 우선순위 및 사용하기 좋게 배열에 값을 담아준다.
const dustLv = ['좋음', '보통', '나쁨', '매우나쁨'];
const statusColor = ['blue', 'green', 'orange', 'red'];
const statusEmoji = ['laugh-squint', 'smile-wink', 'surprise', 'tired'];
const dustType = ['pm10', 'pm25', 'no2', 'o3', 'co', 'so2'];
const dustName = ['미세먼지', '초미세먼지', '이산화질소', '오존', '일산화탄소', '아황산가스'];
const unitPm = '㎍/㎥';
const unitPpm = 'ppm';

// 통합 환경지수, 환경수치
let dustTotalGrade = '';
let dustTotalValue = '';
let totalPercent = 0;

// 배열에 값을 담아주자,
let dustGrade = [];
let dustValue = [];
let grade = '';
let value = '';

// UI content
let dustContent = ``


// let statusNow = ()=>{};
// function statusNow(){};
function statusNowUI(data){
  document.querySelector('.current_location').innerHTML = `${addrCity} ${addrRegion}`
  // console.log(data.length);
  // grade = 좋음~나쁨 | value : 측정값
  for(let i=0;i<data.length;i++){
    if(data[i].stationName == addrRegion){ // 특정 지역을 filter
      dustTotalGrade = data[i].khaiGrade;
      dustTotalValue = data[i].khaiValue;

      // data[i]의 값을 다 가져오고 싶다면?
      allDust(data, i);
    }
  }
  dustListUI(dustValue, dustGrade);

  // console.log(dustTotalValue); // 수치를 가공해서 퍼센테이지로 대기수준을 표시하고 싶음.
  totalPercent = Math.floor((dustTotalValue*2)*0.1);
  document.querySelector('.percent').innerHTML = `<i class="fa-solid fa-earth-asia"></i>${totalPercent}%<i class="fa-solid fa-circle-question"></i>`;

  let emoji = document.querySelector('.total_emoji');
  let emotionColor =  document.querySelectorAll('#container .dust_condition dl');
  emotionColor.forEach((item)=>{
    let emojiIdx = item.childNodes[5].innerText;
    item.style.backgroundColor = statusColor[dustLv.indexOf(emojiIdx)];
  });
  emoji.innerHTML = `<i class="fa-regular fa-face-${statusEmoji[dustTotalGrade-1]}"></i>`
  emoji.querySelector('i').style.color = statusColor[dustTotalGrade-1];
  document.querySelector('.total_status').innerHTML = dustLv[dustTotalGrade-1];
}

// 지역 선택하는 select
function choiceSelect(){

};

// 대기오염 리스트를 출력하는 함수
function dustListUI(dustValue, dustGrade){
  dustContent = `
  <ul>
    <li class="on">
  `
for(let i=0;i<dustValue.length;i++){
  dustContent += `
      <dl>
        <dt class="type">${dustName[i]}</dt>
        <dd><i class="fa-regular fa-face-${statusEmoji[dustGrade[i]]}"></i></dd>
        <dd class="status">${dustLv[dustGrade[i]]}</dd>
        <dd class="unit">${dustValue[i]}</dd>
      </dl>`
      // 3개씩 나눠서 pagenation / 하지만 마지막에도 해당 태그가 붙으면 안됨
  if((i+1)%3==0 && (i+1)<dustValue.length){
    dustContent += `
    </li>
    <li>
    `
  }
}
dustContent += `
    </li>
  </ul>`
document.querySelector('.dust_condition').innerHTML = dustContent;
}

// 모든 grade, value를 정리해주는 함수
function allDust(data, i){
  for(let k=0;k<dustType.length;k++){
    let grade = dustType[k]+'Grade';
    let value = dustType[k]+'Value';
    dustGrade.push(data[i][grade]);
    if(k<2){
      dustValue.push(data[i][value]+unitPm);
    }else{
      dustValue.push(data[i][value]+unitPpm);
    }
  }
}

// 잠시만 기다려주세요.
function wait(){
  document.querySelector('.wait').classList.remove('active');
};

// 물음표
function queryIcon(){
  const queryBtn = document.querySelector('.fa-circle-question');
  const queryTxt = document.querySelector('.query_box')
  queryBtn.addEventListener('mouseenter', ()=>{
    queryTxt.classList.add('on')
  });
  queryBtn.addEventListener('mouseleave', ()=>{
    queryTxt.classList.remove('on')
  });
}

// 메뉴
function menuList(menu, menuBtn, menuInBtn){
  menuBtn.addEventListener('click', ()=>{
    menu.classList.add('active');
  });
  menuInBtn.addEventListener('click', ()=>{
    menu.classList.remove('active');
  });
}
// 메뉴도 랜더링 될 동안 wait 알려주기
const menuChange = document.querySelector('.fa-bars');
menuChange.classList.remove('fa-bars');
menuChange.classList.add('fa-circle-notch');
menuChange.style.animation = 'rotate_icon 3s linear infinite';
// 매뉴 나타나기
function reAppear(){
  menuChange.classList.remove('fa-circle-notch');
  menuChange.classList.add('fa-bars');
  menuChange.style.animation = 'none';
}

// 검색창
// select로 city 선택
function selectCity(local){
  const inputCity = document.querySelector('select.addr_city');
  for(i=0;i<local.length;i++){
    inputCity.innerHTML += `<option name="city" value="${local[i].name}">${local[i].name}</option>`
  }

  const citySelected = document.querySelector('.addr_city');
  citySelected.addEventListener('click', ()=>{
    citySelected.style.color = 'black';
  });

  // 여기서 city는 select의 id | 하지만 이미 selected를 지정한 태그가 있어서 로드 되자마자 선택된 것을 출력하고
  // 선택 시, 재 출력이 되지 않는다.
  // let cityValue = inputCity.options[city.selectedIndex].value;
  const selectElement = document.querySelector('.addr_city');
  let selectedValue = '';
  selectElement.addEventListener('change', (event)=>{
    selectedValue = event.target.value;
    matchingRegion(selectedValue);
  });

  function matchingRegion(v){
    let localCode = '';
    for(i=0;i<local.length;i++){
      if(local[i].name==v){
        localCode = local[i].code;
      }}
      // 지역을 받고 > url 다시 요청, 데이터 값 받아서 region 값을 다 리스트에 담기 > datalist를 출력,
      const getRegionData = async ()=>{
        url = new URL(`https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=130&pageNo=1&sidoName=${localCode}&ver=1.0`);
      
        const response = await fetch(url);
        const data = await response.json();
        let localDust = data.response.body.items;
        // 이제 검색창에 띄워주기

        const addData = document.querySelector('.search_select');
        let dataList = `<datalist id="search_list">`
        for(k=0;k<localDust.length;k++){
          dataList += `<option value="${localDust[k].stationName}" />`
        }
        dataList += `</datalist>`
        addData.innerHTML = dataList;
      }
      getRegionData();
  };






  

  
}
