// base | 새로고침 시, window 가장 위로
window.onload = function(){
  setTimeout(function(){
    scrollTo(0, 0);
  },100);
};

// survice_key
const API_KEY = config.apikey;
const NAVER_API_CLIENT_ID = config.NAVER_API_CLIENT_ID;
const VWORLD_API_KEY = config.vworld_apikey;

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

const warnMsg = document.querySelector('.warn_msg');
let alreadyAjaxCnt = 0;
let isWarn=false;

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
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      dfs_xy_conv("toXY", lat, lng); // 현재 위치 로드될 때 xy
      let location = new naver.maps.LatLng(lat, lng);
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
    function searchCoordinateToAddress(latlng){ // 주소 로드될 때만 위경도 값을 이용해서 주소 찾기
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
        getWeatherData();
        }
      );
    }
}


let newOriginRegion = ''; // 미세먼지 값의 원래 이름
// 주소 > 좌표 : 전역으로 넣어서 호출할 수 있게
function searchAddressToCoordinate(address){ // 여기에서 날씨 함수에도 지역 적용이 되도록
  const newAddress = address.split(' ');
  if(newAddress.length==3){
    const newCity = newAddress[0];
    const newRegion = newAddress[1];
    newOriginRegion = newAddress[2];
    address = `${newCity} ${newRegion}`;
  }
  naver.maps.Service.geocode({
    query: address
  }, function (status, response) {
    if (status === naver.maps.Service.Status.ERROR) {
      return alert('위치를 불러오는 중 문제가 생겼습니다.');
    }
    // 주소를 도로명으로 찾을 때, 건물명까지 입력하지 않으면 응답받지 못한다.
    if (response.v2.meta.totalCount === 0) {
      if(alreadyAjaxCnt){ // 이미 지명도 도로명도 전부 검색이 안된다면, 반복 막기
        if(!isWarn){
          console.warn(`${address.split(' ')[1]} is not exist in ${address.split(' ')[0]}`);
          alert('존재하지 않는 지명입니다.');
          isWarn=true;
        }
        alreadyAjaxCnt=0;
        return;
      }
      // return alert('totalCount' + response.v2.meta.totalCount);
      // 찾을 수 없는 주소를 여기서 도로명 api로 처리 하기 : address
      address = address.split(' ');
      const city = address[0];
      const region = address[1];
      // const originRegion = address[2];
      // 도로명 함수에 삽입
      callAjax(city, region);
      return; // 여기서 함수를 빠져나가지 않으면 아래 코드가 그대로 진행된다.
      // return alert('도로명 주소는 찾을 수 없습니다.');
    }
    item = response.v2.addresses[0];
    // 좌표
    // point = new naver.maps.Point(item.x, item.y);


    // 새로 검색되어 입력되는 주소 | getWeatherData
    dfs_xy_conv("toXY", item.y, item.x);
    getWeatherData();


    let pointMove = new naver.maps.LatLng(item.y, item.x)

    // staitionName에 존재하지 않는 지역이라면, //
    if(!existCnt){
      existCnt++;
      let subAddress = '';
      let YX = '';
      let absY = 0;
      let absX = 0;
      let cntLength = 0;
      // 가장 가까운 위치를 찾기
      let closestLocation = null; // 최종 할담 값
      let smallestDistance = Infinity; // 처음에는 최소 거리를 무한대로 설정
      //여기서 비교하고 싶음//
      for(let i=0;i<cityRegions.length;i++){
        subAddress = `${addrCity} ${cityRegions[i]}`;
        naver.maps.Service.geocode({
          query: subAddress
        }, function (status, response){
          if(status === naver.maps.Service.Status.ERROR){
            return alert('위치를 불러오는 중 문제가 생겼습니다.');
          }
          if(response.v2.meta.totalCount === 0){
            // console.warn(subAddress)
          }
          else{
            YX = response.v2.addresses[0];
            absY = Math.abs(item.y - YX.y);
            absX = Math.abs(item.x - YX.x);
            
            cntLength++;

            // 유클리드 거리 계산
            const distance = Math.sqrt(absY * absY + absX * absX);
            if(distance < smallestDistance){
              smallestDistance = distance;
              closestLocation = cityRegions[i];
            }else if(cityRegions.length-1==cntLength){
              // 반복문 마지막에 최종값
              addrRegion = closestLocation;
              
              // 검색지역이 아닌, 기존 지역 이름 저장
              originRegions(address);

              statusNowUI(localDust);
            };
            }
          })
          }
      }
      alreadyAjaxCnt=0; // 검색이 성공적으로 되면 다시 초기화
      // 맵 이동
      address = address.split(' ');
      let infowindow = new naver.maps.InfoWindow();
      map.setCenter(pointMove);
      infowindow.setContent(`<i class="fa-solid fa-location-dot loaction_icon"></i>`);
      infowindow.open(map, map.getCenter()); // 현재 위치에 인포 윈도우를 엽니다.
      updateInfo(address[0], address[1]); // 0 city | 1 region
      getData();

  });
}

let exsitNum = 0; // 해당 아래 함수가 실행됐는지 안됐는지 확인
let originAddrRegion = '';
function originRegions(address){
  originAddrRegion = address[1];
  exsitNum++;
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
  if(date<10){date = '0'+date};

  let hours = getNow.getHours();
  if(hours<10){hours = '0'+hours};
  let minutes = getNow.getMinutes();
  if(minutes<10){minutes = '0'+minutes};
  let sec = getNow.getSeconds();
  if(sec<10){sec = '0'+sec};
  
  return  {year, month, date, hours, minutes, sec}; // 객체로 반환
}

let cityRegions = [];
let localDust = '';
// json
const getData = async (LatLng)=>{
  // 시도별 실시간 측정정보 조회
  let localCode = ''
  for(let i=0;i<local.length;i++){
    if(local[i].name==addrCity){
      localCode = local[i].code;
    }
  }
  if(newOriginRegion){
    addrRegion = newOriginRegion;
  }

  try{ // 데이터 응답에따른 url요청 변화
    const url = new URL(`https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=130&pageNo=1&sidoName=${localCode}&ver=1.0`);
    const response = await fetch(url);
    if(!response.ok){
      throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
    }
    // response.ok 라면, 그대로 실행
    const data = await response.json();

    localDust = data.response.body.items;

    // city의 regions을 담기
    cityRegions = []; // 새로 값들어오면 새로 채워줘야하므로
    for(let k=0;k<localDust.length;k++){
      cityRegions.push(localDust[k].stationName);
    }
  
    statusNowUI(localDust);
    timeNow();
    const date = timeNow();
    document.querySelector('.cuttent_time').innerHTML = `${date.year}-${date.month}-${date.date}`;
    wait();
    document.querySelector('.tap').classList.add('active')
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
  }catch(error){
    console.log('에러 발생', error);
  }
}
// getData();

// 우선순위 및 사용하기 좋게 배열에 값을 담아준다.
const dustLv = ['좋음', '보통', '나쁨', '매우나쁨'];
const statusColor = ['#2d7dd2', 'green', 'orange', 'red'];
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
let existCnt = 0; 

// let statusNow = ()=>{};
// function statusNow(){};
function statusNowUI(data){
  document.querySelector('.current_location').innerHTML = `${addrCity} ${addrRegion}`
  // grade = 좋음~나쁨 | value : 측정값
  for(let i=0;i<data.length;i++){
    if(newOriginRegion){ // 검색해서 본 주소를 검색해야할때 (즉, 검색해야할것과 띄워줄 것이 다를떄)
      if(data[i].stationName == newOriginRegion){
        existCnt++;
        dustTotalGrade = data[i].khaiGrade;
        dustTotalValue = data[i].khaiValue;
        allDust(data, i);
      }
    }else{
      if(data[i].stationName == addrRegion){ // 특정 지역을 filter
        existCnt++;
        dustTotalGrade = data[i].khaiGrade;
        dustTotalValue = data[i].khaiValue;
        // data[i]의 값을 다 가져오고 싶다면?
        allDust(data, i);
        if(exsitNum){
          document.querySelector('.current_location').innerHTML = `${addrCity} ${originAddrRegion}`
        }
      }
    }
  }
  // 값이 존재하지 않는다면
  notExist()

  dustListUI(dustValue, dustGrade);


  // console.log(dustTotalValue); // 수치를 가공해서 퍼센테이지로 대기수준을 표시하고 싶음.
  if(!dustTotalValue || dustTotalValue=='-' || dustTotalValue=='통신장애'){
    document.querySelector('.percent').innerHTML = `
    <div class="ventilation">현재 정보가 잡히지 않아요!</div>
    <div class="khai">통합대기지수<i class="fa-solid fa-circle-question"></i></div>
    <i class="fa-solid fa-earth-asia"></i>
    No Data
    `;
  }else{
    totalPercent = Math.floor((dustTotalValue*2)*0.1)+'%';

    let venMsg = '';
    if(dustTotalGrade<3){
      venMsg = '아침 점심 저녁 세번! <br /> 얼른 환기하세요!'
    }else if(dustTotalGrade==3){
      venMsg = '30분 환기 추천해요.'
    }else if(dustTotalGrade==4){
      venMsg = '외출을 삼가세요! 짧게 3~5분 환기 추천해요.'
    }
    document.querySelector('.percent').innerHTML = `
    <div class="ventilation">${venMsg}</div>
    <div class="khai">통합대기지수<i class="fa-solid fa-circle-question"></i></div>
    <i class="fa-solid fa-earth-asia"></i>${totalPercent}
    `;
    const msgColor = document.querySelector('.ventilation');
    if(dustTotalGrade==1){
      msgColor.style.color = '#2d7dd2';
    }else if(dustTotalGrade==2){
      msgColor.style.color = 'green';
    }else if(dustTotalGrade==3){
      msgColor.style.color = 'orange';
    }else{
      msgColor.style.color = 'red';
    }
  }

  let emoji = document.querySelector('.total_emoji');
  let emotionColor =  document.querySelectorAll('#container .dust_condition dl');
  emotionColor.forEach((item)=>{
    let emojiIdx = item.childNodes[5].innerText;
    item.style.backgroundColor = statusColor[dustLv.indexOf(emojiIdx)];
  });
  if(!dustTotalGrade || dustTotalGrade=='-' || dustTotalGrade=='통신장애'){
    emoji.innerHTML = `<i class="fa-regular fa-face-flushed"></i>`
    emoji.querySelector('i').style.color = 'gray';
    document.querySelector('.total_status').innerHTML = '???';
  }else{
    emoji.innerHTML = `<i class="fa-regular fa-face-${statusEmoji[dustTotalGrade-1]}"></i>`
    emoji.querySelector('i').style.color = statusColor[dustTotalGrade-1];
    document.querySelector('.total_status').innerHTML = dustLv[dustTotalGrade-1];
  }
}

// dust_btn
const dustPrevBtn = document.querySelector('.dust_condition_btn button.prev_btn');
const dustNextBtn = document.querySelector('.dust_condition_btn button.next_btn');
const dustBtn = ()=>{
  dustPrevBtn.addEventListener('click', ()=>{
    const ulList = document.querySelectorAll('.dust_condition ul li');
    // active 할 수 있을 때만 작동
    if(dustPrevBtn.classList.contains('active')==true){
      ulList[0].style.transition = '0.5s ease'
      ulList[1].style.left = '400px';
      ulList[0].style.left = '0';

      // 작동하면 false로 만들고, 반대편 버튼 활성화
      dustPrevBtn.classList.remove('active');
      dustNextBtn.classList.add('active');
    }
  });
  dustNextBtn.addEventListener('click', ()=>{
    const ulList = document.querySelectorAll('.dust_condition ul li');
    if(dustNextBtn.classList.contains('active')==true){
      ulList[1].style.transition = '0.5s ease'
      ulList[1].style.left = '0';
      ulList[0].style.left = '-400px';


      dustNextBtn.classList.remove('active');
      dustPrevBtn.classList.add('active');
      
    }

  });
}
dustBtn();

function notExist(){
  // 로드된 주소가 반복문이 다 끝났음에도
  // existCnt==0 (한번도 if문을 거치지 않았다면, 즉 region이 존재하지 않았다면)
  if(existCnt==0){
    // addrCity & addrRegion 위경도 찾은 후, getData에서 유사 경도위도 값 찾기 > 기본적으로 도로명이아닌 지명으로 검색이 되므로 네이버 api 서치를 이용해도 될 것
    searchAddressToCoordinate(`${addrCity} ${addrRegion}`)
    existCnt = 0; // 다시 0
  }else{
    // 전부 필터를 거쳐서 가공했음에도 돌아온 데이터(지명)
    // if()
    
  }
};


// 대기오염 리스트를 출력하는 함수
function dustListUI(dustValue, dustGrade){
  dustContent = ''; // 검색시 초기화
  dustContent = `
  <ul>
    <li class="animated">
  `
for(let i=0;i<6;i++){
  // 값을 불러올 수 없을 때
  const condition = !dustValue[i] || !dustGrade[i] || dustValue[i]=='-' || dustValue[i]=='통신장애' || dustGrade[i]=='-' || dustGrade[i]=='통신장애'
  if(condition){
    dustContent += `
        <dl class="null_data">
          <dt class="type">${dustName[i]}</dt>
          <dd><i class="fa-regular fa-face-flushed"></i></dd>
          <dd class="status">???</dd>
          <dd class="unit">데이터 없음</dd>
        </dl>`
        // 3개씩 나눠서 pagenation / 하지만 마지막에도 해당 태그가 붙으면 안됨
    if((i+1)%3==0 && (i+1)<dustValue.length){
      dustContent += `
      </li>
      <li class="animated">
      `
    }
  }else{ // 값을 무사히 받았을 때
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
}
dustContent += `
    </li>
  </ul>`
document.querySelector('.dust_condition').innerHTML = dustContent;
}

// 모든 grade, value를 정리해주는 함수
function allDust(data, i){
  // 검색 시 초기화
  dustGrade = [];
  dustValue = [];
  for(let k=0;k<dustType.length;k++){
    let grade = dustType[k]+'Grade';
    let value = dustType[k]+'Value';
    if(!data[i][value] || data[i][value]=='-' || data[i][value]=='통신장애'){
      dustGrade = null;
    }else{
      dustGrade.push(data[i][grade]);
      if(k<2){
        dustValue.push(data[i][value]+unitPm);
      }else{
        dustValue.push(data[i][value]+unitPpm);
      }
    }
  }
}

// 잠시만 기다려주세요.
function wait(){
  document.querySelector('.wait').classList.remove('active');
  document.querySelector('.container_box').classList.add('on');
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

  // menu.addEventListener('mouseleave', ()=>{
  //   console.log('leave')
  //   setTimeout(()=>{
  //     menu.classList.remove('active');
  //   },1000);
  // });
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
// enterEvent
function searchEnter(event) {
	if (event.keyCode == 13) {
    searchEvent();
    }
}
// select로 city 선택
let selectedValue = '';
let currentRequestId = 0; //현재요청 ID
function selectCity(local){
  const inputCity = document.querySelector('select.addr_city');
  let cityContent = `
  <option class="choice_city" disabled hidden selected>지역을 선택하세요.</option>
  `;
  for(let i=0;i<local.length;i++){
    cityContent += `<option name="city" value="${local[i].name}">${local[i].name}</option>`
  }
  inputCity.innerHTML = cityContent;

  const citySelected = document.querySelector('.addr_city');
  citySelected.addEventListener('click', ()=>{
    citySelected.style.color = 'black';
  });

  // 여기서 city는 select의 id | 하지만 이미 selected를 지정한 태그가 있어서 로드 되자마자 선택된 것을 출력하고
  // 선택 시, 재 출력이 되지 않는다.
  // let cityValue = inputCity.options[city.selectedIndex].value;
  const selectElement = document.querySelector('.addr_city');
  selectElement.addEventListener('change', async(event)=>{

    event.preventDefault()
    selectedValue = event.target.value;
    const selectCities = document.querySelector('.input_search');
    selectCities.value = '';
    await matchingRegion(selectedValue, local);
  });
}

// slectCity 함수에 들어가있으면, 이벤트 리스너가 여러번 등록되는 것을 방지
async function matchingRegion(v, local){ // 제대로 값이 받아지는 것을 확인
  let localCode = '';
  for(let i=0;i<local.length;i++){
    if(local[i].name==v){
      localCode = local[i].code;
    }}

    // 요청 ID 증가
    const requestId = ++currentRequestId;
    try{
      // 지역을 받고 > url 다시 요청, 데이터 값 받아서 region 값을 다 리스트에 담기 > datalist를 출력,
      const url = new URL(`https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=130&pageNo=1&sidoName=${localCode}&ver=1.0`);
      const response = await fetch(url);
      if(!response.ok){
        throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
      }
        const data = await response.json();

        // 여기서 확인 : 현재 요청 ID가 최신인지
        if(requestId!==currentRequestId){
          // 최신이 아니면 처리를 중단
          return
        }

        // 여기에 데이터 처리 로직 추가
        // console.log(data); // 예시 출력

        let localDust = data.response.body.items;
        // 이제 검색창에 띄워주기

        // datalist 생성
        // 시각적 편의를 위해 정렬
        const addData = document.querySelector('.search_select');
        let sortData = [];
        for(let k=0;k<localDust.length;k++){
          sortData.push(localDust[k].stationName);
        }
        sortData = sortData.sort();

        // 정렬한 데이터 삽입
        let dataList = `<datalist id="search_list">`
        for(let k=0;k<localDust.length;k++){
          dataList += `<option value="${sortData[k]}" />`
        }
        dataList += `</datalist>`
        addData.innerHTML = dataList;

    } catch(error){
      console.error('에러 발생', error);
    }
};

// 검색 함수
function searchEvent(){
  if(!selectedValue){ // 도시선택 필수
    warnMsg.innerText = '지역이 선택되지 않았습니다.'
    warnMsg.classList.remove('hidden');
    warnMsg.style.fontSize = '12px';
    return; // 선택하지 않으면 아무런 함수도 실행x
  }else{
    const region = document.querySelectorAll('#search_list option')
  let regions = [];
  for(let m=0;m<region.length;m++){
    regions.push(region[m].value);
  }

  // 이벤트리스너 내부에 정의해줘야 value값을 가져올 수 있음.
  const searchRegion = document.querySelector('.input_search').value;
  if(regions.indexOf(searchRegion)==-1){
    // 나중에 위도 경도 유사한 측정소의 값을 가져올 것 (현재는 임시)
    if(!searchRegion){
      warnMsg.innerText = '주소가 입력되지 않았습니다.';
      warnMsg.classList.remove('hidden');
      warnMsg.style.fontSize = '12px';
      return;
    }else if(searchRegion.indexOf(' ')>-1){
      warnMsg.innerText = '주소에 공백이 있습니다.';
      warnMsg.classList.remove('hidden');
      warnMsg.style.fontSize = '12px';
      return;
    }else if(searchRegion.slice(-1)=='동'||searchRegion.slice(-1)=='구'||searchRegion.slice(-1)=='읍'||searchRegion.slice(-1)=='리'||searchRegion.slice(-1)=='군'){
      existCnt=0; // 없는 주소를 검색 > 근처 측정소 값을 가져오기 위한 초기화
      warnMsg.classList.add('hidden');
      warnMsg.style.fontSize = '0';
      document.querySelector('.menu_list').classList.remove('active');
      searchAddressToCoordinate(`${selectedValue} ${searchRegion}`);
      isWarn=false; // 새로 검색 성공할 때는 초기화
      return;
    }
    warnMsg.innerText = '지명만 검색 됩니다.';
    warnMsg.classList.remove('hidden');
    warnMsg.style.fontSize = '12px';
    return;

  }else{// 값이 존재한다면 값을 넘기자.
    // 경고 문구 삭제 및, 검색되면 메뉴창 집어넣기
    warnMsg.classList.add('hidden');
    warnMsg.style.fontSize = '0';
    document.querySelector('.input_search').value = '';

    // 간혹 ()이 들어간 문구들이 있음. 이 자료를 정리해서 보내자.
    const delTxtIdx = searchRegion.indexOf('('); // 숫자
    let region = '';
      if(delTxtIdx !== -1){
        region = searchRegion.slice(0, delTxtIdx);
      }else if(searchRegion.slice(-1)=='역'){ // 마지막 글자가 '역' 인 역
        const idx = searchRegion.indexOf('역');
        region = searchRegion.slice(0, idx);
      }else if(searchRegion.slice(-1)=='도'){ // 마지막 글자가 '도' 인 섬
        const idx = searchRegion.indexOf('도');
        region = searchRegion.slice(0, idx);
      }else if(searchRegion.split(' ').length==2){ // 마지막 글자가 '도' 인 섬들
        region = searchRegion.split(' ')[1];
      }
      else{
        region = searchRegion;
      }
      document.querySelector('.menu_list').classList.remove('active');
      // 주소 / 지도를 검색할 지역 / 미세먼지를 검색할 지역(가공되지않은 원래의 미세먼지 region)
      isWarn=false;
      searchAddressToCoordinate(`${selectedValue} ${region} ${searchRegion}`);
  }
  }
}

//이벤트 리스너가 함수안에서 계속 실행되면 겹치므로 빼줌.
const searchClick = document.querySelector('.search_btn');
const searchBtn = ()=>{
  // 클릭 시, 지역 값이 없을 때
  searchClick.addEventListener('click', (e)=>{
    e.preventDefault(); // 버블링 막기
    searchEvent()
  });
};
searchBtn();

// 도로명을 검색할 수 있는 api
let  callAjax = function(city, queryLocation, originRegion){
  if(alreadyAjaxCnt){return;}else{alreadyAjaxCnt++;}
  console.warn('Convert from road name to place name.');
  // 주소 값에 지역 까지 들어가면 검색이 되지 않음.
  const sizeCnt = 20;
	let  data = `service=search&request=search&version=2.0&size=${sizeCnt}&page=1&query=${queryLocation}&type=road&format=json&errorformat=json&key=${VWORLD_API_KEY}`

	$.ajax({
		type: "get",
		url: "https://api.vworld.kr/req/search",
		data : data,
		dataType: 'jsonp',
		async: true,
		success: function(data){

      // console.log(queryLocation, ' : ',data.response.status);
      if(data.response.status=='NOT_FOUND'){
        //석모리
        if(queryLocation=='석모리'){
          searchAddressToCoordinate(`${city} 강화군 석모리`);
        }else if(queryLocation=='묵호항'){
          searchAddressToCoordinate(`${city} 묵호진동 묵호항`);
        }else{
          warnMsg.innerText = '존재하지 않는 주소입니다.';
          warnMsg.classList.remove('hidden');
          warnMsg.style.fontSize = '12px';
          if(!isWarn){
            alert('존재하지 않는 지명입니다.');
            isWarn=true;
          }
          return;
        }
      }
      const item =  data.response.result.items;
      let region = '';
      // city에 속하는 지역명 뽑기
      for(let i=0;i<item.length;i++){
        if(item[i].district.indexOf(city)!=-1){ // district(지역명)에 city(다른city, 겹치는 region방지)가 있는 것을 넣기
          region = item[i].district;
          // break; // return을 사용하면 함수밖으로 빠져나가기 때문에
        }
      }
      // console.log(region);
      
      if(!region){//없을시, 첫 로드될때 값이 없는 함수로 실행
        console.warn('!region');
        if(queryLocation=='남항'){
          searchAddressToCoordinate(`${city} 중구 남항`);
        }else if(queryLocation=='신항'){
          searchAddressToCoordinate(`${city} 송도동 신항`);
        }else if(queryLocation=='3공단'){
          searchAddressToCoordinate(`${city} 진미동 3공단`);
        }else if(queryLocation=='4공단'){
          searchAddressToCoordinate(`${city} 옥계동 4공단`);
        }else{
          warnMsg.innerText = '존재하지 않는 주소입니다.';
          warnMsg.classList.remove('hidden');
          warnMsg.style.fontSize = '12px';
          if(!isWarn){
            alert('존재하지 않는 지명입니다.');
            isWarn=true;
          }
          return; // 이외 값은 빠져나가기
        }
      }
      
      if(region.indexOf('(')==-1){ // 괄호가 없다면,
        // 가장 마지막 단어를 주소로 입력
        const regionAddr = region.split(' ');
        // console.log(regionAddr.slice(-1)); // objecy
        // console.log(regionAddr[regionAddr.length-1]); // string

        // 사용할 값은 string이 더 적절한 것 같으므로
        const findRegion = regionAddr[regionAddr.length-1];
        searchAddressToCoordinate(`${city} ${findRegion} ${queryLocation}`);
        
      }else{// 괄호가 있을시, 괄호의 주소를 가져옴
        const firstIdx = region.indexOf('('); // 중복되어도 첫번째 찾는 값을 가져오므로
        const lastIdx =  region.indexOf(')');
        findRegion = region.slice(firstIdx+1, lastIdx);
        searchAddressToCoordinate(`${city} ${findRegion} ${queryLocation}`);
        // getWeatherData(city, findRegion)
      }
			},
		error: function(xhr, stat, err){}
	});
}

////////////////////// 날씨 데이터 ///////////////////////
let time = timeNow(); // 객체로 한번에 받지 않으면 date값만 들어온다.

function setTime(){
  let times = timeNow(); 
  document.querySelector('.time_now').innerHTML = `
  <h2 class="hidden">현재 시간</h2>
  ${times.hours} : ${times.minutes} <span class="sec">${times.sec}</span>
  `;
};


function statusWeatherUI(items, nowDate, nowTime){
  const afterOneHour = time.hours+1 +'';
  let cnt = 0; // 현재시간의 값 총 14개를 뽑아 줄 것  
  let listCnt = 0; // 기본적으로 4일 이후의 값까지 발표되기 때문에 자료가 없을 염려는 하지 않아도 된다.
  let tmpCnt = 0; // tmp값도 가져올 것
  let tmpList = [];
  const weatherList = document.querySelector('.today_weather_list');
  let weatherListContent = '';

  setTime();
  setInterval(setTime, 1000);

  for(let i=0;i<items.length;i++){
  
    // 총 6가지 데이터만 쓸 것 : category
    // PTY(강수형태), REH(습도), SKY(하늘상태), TMP(1시간 기온), TMN(최저기온), TMX(최고기온)
    const category = items[i].category;
    const weatherType = category=='PTY' || category=='REH' || category=='SKY' || category=='TMP';
    // 현재를 포함한 이후의 시간 값을 구하려고 했으나, 모든 시간대에 카테고리가 전부 존재하는 것이 아님.
    // 예상일자와 현재일자도 다를 수 있다. | 날짜도 같고, 시간은 현재시간대
    if((items[i].fcstDate==nowDate && items[i].fcstTime>nowTime && items[i].fcstTime<afterOneHour && cnt<6) && weatherType){
      if(category=='SKY'){
        let value = items[i].fcstValue;
        sky.innerHTML = `
          <div class="sky_icon">
            <i class="fa-solid fa-${weatherSkyIcon[value]}"></i>
            <p>${weatherSkyStaus[value]}</p>
          </div>
        `
      }else if(category=='PTY'){
        let value = items[i].fcstValue;
          pty.innerHTML = `
          <div class="pty_icon">
            <i class="fa-solid fa-${weatherPtyIcon[value]}"></i>
            <p>${weatherPtyStaus[value]}</p>
          </div>
          `          
      }else if(category=='REH'){
        let value = items[i].fcstValue;
        for(let k=0;k<weatherObj.length;k++){
          if(category==weatherObj[k].type){
            value += weatherObj[k].unit;
          }
        }
        reh.innerHTML = `
        <h4>습도</h4>
        <p class="icon_value"><i class="fa-solid fa-droplet"></i>
        <span class="weather_value">${value}</span><p>
        `
      }else if(category=='TMP'){
        let value = items[i].fcstValue;
        for(let k=0;k<weatherObj.length;k++){
          if(category==weatherObj[k].type){
            value += weatherObj[k].unit;
          }
        }
        tmp.innerHTML = `
        <h4>기온</h4>
        <p class="icon_value"><i class="fa-solid fa-temperature-low"></i>
        <span class="weather_value">${value}<span><p>
        `
      }

    }else{
      // 하루에 한 두번만 가져와지는 값 같으므로
      let tmnCnt = 0;
      let tmxCnt = 0;
      if(category=='TMN' || category=='TMX'){
        if(category=='TMN'&&tmnCnt==0){
          let value = items[i].fcstValue;
          for(let k=0;k<weatherObj.length;k++){
            if(category==weatherObj[k].type){
              value += weatherObj[k].unit;
            }
          }
          maxMinTemp.innerHTML = `
          <div class="tmn">
          <i class="fa-solid fa-temperature-arrow-down"></i>
          <h4 class="hidden">최저기온</h4>
          <div class="tmn_value">${value}</div>
          </div>
          <p>/</p>
          `
          tmnCnt++;
        }else if(category==='TMX' && tmxCnt==0){
          let value = items[i].fcstValue;
          for(let k=0;k<weatherObj.length;k++){
            if(category==weatherObj[k].type){
              value += weatherObj[k].unit;
            }
          }
          maxMinTemp.innerHTML += `
          <div class="tmx">
          <i class="fa-solid fa-temperature-arrow-up"></i>
            <h4 class="hidden">최고기온</h4>
            <div class="tmx_value">${value}</div>
          </div>
          `
          tmxCnt++;
        }
        cnt ++;
      }
    }
    // 날씨 리스트 만들기
    let status = '';
    let statusIcon = '';
    const timeRules = (items[i].fcstDate==nowDate && items[i].fcstTime>nowTime)||(items[i].fcstDate>nowDate);
    if((category=='SKY' || category=='PTY') && timeRules){
      if(category=='PTY' && items[i].fcstValue>0 && listCnt<12){ //눈,비 예보일때는 pty 값 가져오기
        status = weatherPtyStaus[items[i].fcstValue];
        statusIcon = weatherPtyIcon[items[i].fcstValue];
        weatherListContent += `
        <li>
        <p>${items[i].fcstTime.slice(0, 2)}시</p>
        <i class="fa-solid fa-${statusIcon}"></i>
        <span class="tmp_c"></span>
        <span>${status}</span>
        </li>`;
        listCnt++;
      }else if(category=='SKY' && listCnt<12){ // 아닐 때는 sky 값
        status = weatherSkyStaus[items[i].fcstValue];
        statusIcon = weatherSkyIcon[items[i].fcstValue];
        weatherListContent += `
        <li>
        <p>${items[i].fcstTime.slice(0, 2)}시</p>
        <i class="fa-solid fa-${statusIcon}"></i>
        <span class="tmp_c"></span>
        <span>${status}</span>
        </li>`;
        listCnt++;
        }
      }
      if(category=='TMP' && tmpCnt<12 && timeRules){
        console.log((items[i]));
        for(let t=0;t<weatherObj.length;t++){
          if(weatherObj[t].type=='TMP'){
            tmpList.push(items[i].fcstValue + weatherObj[t].unit);
          }
        }
        tmpCnt++;
      }
    }//for(반복문)이 끝나면
    weatherList.innerHTML = weatherListContent;
    const tmpStatus = document.querySelectorAll('.tmp_c');
    for(let t=0;t<tmpList.length;t++){
      tmpStatus[t].innerHTML = tmpList[t];
    }
    document.querySelector('.weather').classList.add('active');
    document.querySelector('.wait_weather').classList.remove('active');
}


// 탭 : classList 를 사용 (display none X)
const tap = document.querySelectorAll('.tap h2');
const tapDisplay = document.querySelectorAll('.container_box section');
const tapClick = function(){
  for(let i=0;i<tap.length;i++){
    tap[i].addEventListener('click', ()=>{
      for(let k=0;k<tap.length;k++){
        tap[k].classList.remove('on');
        tapDisplay[k].classList.remove('on');
      }
      tap[i].classList.add('on');
      tapDisplay[i].classList.add('on');
    });
  }
};
tapClick()

// 기상청 단기예보 data xlsx > json
let cityCodeList = [];
const getDataJson = ()=>{
  fetch('./script/data.json')
  .then((res)=>{
    return res.json()
  })
  .then((obj)=>{
    cityCodeList = obj.items;
  })
};
getDataJson()

let NewLatLng = '';
function xyUpdate(LatLng){
    NewLatLng = LatLng;
    return NewLatLng;
}

// 값을 넣을 곳
const sky = document.querySelector('.sky');
const pty = document.querySelector('.pty');
const reh = document.querySelector('.reh');
const tmp = document.querySelector('.tmp');
const maxMinTemp = document.querySelector('.max_min_temp');

// 필요한 데이터 가공을 위한 객체
const weatherObj = [
  {
    type: 'SKY',
    unit: null,
    name: '하늘 상태',
  },
  {
    type: 'PTY',
    unit: null,
    name: '강수 상태',
  },
  {
    type: 'REH',
    unit: '%',
    name: '습도',
  },
  {
    type: 'TMP',
    unit: '℃',
    name: '현재 기온',
  },
  {
    type: 'TMN',
    unit: '℃',
    name: '최저 기온',
  },
  {
    type: 'TMX',
    unit: '℃',
    name: '기온',
  },
]
// 하늘상태(SKY) 코드 : 맑음(1), 구름많음(3), 흐림(4)
const weatherSkyStaus = ['', '맑음', '', '구름많음', '흐림'];
const weatherSkyIcon = ['', 'sun', '', 'cloud-sun', 'cloud'];
// 강수형태(PTY) 코드 :  (단기) 없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4) 
const weatherPtyStaus = ['강수 없음', '비', '비/눈', '눈', '소나기'];
const weatherPtyIcon = ['water', 'cloud-rain', 'umbrella', 'snowflake', 'cloud-showers-heavy'];

const getWeatherData = async ()=>{
    // 계산된 시간이 범위를 0~23 넘지 않도록 처리
    let h = time.hours-1;
    if(h<10){h='0'+h}else if(h<0){h='00'};
    let ah = time.hours+1;
    if(ah<10){ah='0'+ah}else if(ah>23){ah='00'}
  
    const nowTime = h +''+ time.minutes; 

  // fcstTime : 현재 시간으로 필터 > 14개값
  const rows = 1000; // 최대 1000개 이내의 개수, 새벽 6시부터 새벽12시 > 12시간 동안의 시간을 보여줌
  const nx = NewLatLng.x;
  const ny = NewLatLng.y;
  // 한자리 값은 문자열로 되어있으므로, 합쳐도 string으로 합쳐진다.
  // 하지만 전부 두자리 숫자로 들어올 가능성도 있으니 중간에 문자열을 추가해준다.
  const nowDate = time.year +''+ time.month + time.date; // 현재날짜
  const url = new URL(`https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=${rows}&dataType=json&base_date=${nowDate}&base_time=0500&nx=${nx}&ny=${ny}`);
  await fetch(url)
  .then(response=>{
    if(!response.ok){
      throw new Error('네트워크가 원활하지 않습니다.');
    }
    return response.json();
  })
  .then(data=>{
    // 데이터 가공
    const items = data.response.body.items.item;
    // 현재시간대를 포함한 날씨들을 불러올 것
    statusWeatherUI(items, nowDate, nowTime);
  })
  .catch(error=>{
    console.error('There has been a problem with your fetch operation:', error)
  });
}

// 기상청 홈페이지에서 발췌한 변환 함수
// LCC DFS 좌표변환 ( code : 
//    "toXY"(위경도->좌표, v1:위도, v2:경도)
function dfs_xy_conv(code, v1, v2) {
  // LCC DFS 좌표변환을 위한 기초 자료
  let RE = 6371.00877; // 지구 반경(km)
  let GRID = 5.0; // 격자 간격(km)
  let SLAT1 = 30.0; // 투영 위도1(degree)
  let SLAT2 = 60.0; // 투영 위도2(degree)
  let OLON = 126.0; // 기준점 경도(degree)
  let OLAT = 38.0; // 기준점 위도(degree)
  let XO = 43; // 기준점 X좌표(GRID)
  let YO = 136; // 기1준점 Y좌표(GRID)

  let DEGRAD = Math.PI / 180.0;
  let RADDEG = 180.0 / Math.PI;
  
  let re = RE / GRID;
  let slat1 = SLAT1 * DEGRAD;
  let slat2 = SLAT2 * DEGRAD;
  let olon = OLON * DEGRAD;
  let olat = OLAT * DEGRAD;
  
  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);
  let rs = {};
  if (code == "toXY") {
    rs['lat'] = v1;
    rs['lng'] = v2;
    let ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    
    let theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  }
  else {
    rs['x'] = v1;
    rs['y'] = v2;
    let xn = v1 - XO;
    let yn = ro - v2 + YO;
    ra = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) - ra;
    let alat = Math.pow((re * sf / ra), (1.0 / sn));
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;
    
    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    }
    else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) - theta;
      }
      else theta = Math.atan2(xn, yn);
    }
    let alon = theta / sn + olon;
    rs['lat'] = alat * RADDEG;
    rs['lng'] = alon * RADDEG;
  }
  xyUpdate(rs);
  // getWeatherData 로 값 넘겨주기
  return rs;
}

// weather touch scroll
let startPoint = 0;
let isMouseDown = false;
let scrollLefts = 0;
const dragWeather = document.querySelector('.today_weather_list');
const scrollWeatherList = ()=>{
  dragWeather.addEventListener('mousedown', (e)=>{
    // 마우스를 눌렀을 때
    isMouseDown = true;
    startPoint = e.pageX - dragWeather.offsetLeft;
    scrollLefts = dragWeather.scrollLeft;
  });
  dragWeather.addEventListener('mousemove', (e)=>{
    //마우스가 움직일 때 추적
    if(!isMouseDown) return; // mouseDown 상태가 아닐 때는 작동 x
    e.preventDefault(); // 버블링방지
    // e.pageX : 클릭한 x축 좌표 값 - offsetLeft : 해당 요소의 왼쪽 좌표(얼만큼 페이지와 왼쪽에서 떨어져 있는지)
    // x : 왼쪽 여백을 제외한, 요소의 내부 x좌표
    const x = e.pageX - dragWeather.offsetLeft;
    // x : 현재 mousedouwn한 채 움직이고 있는 최종 마우스 좌표 - startPoint : 요소 내부에서 처음 클릭한 좌표 값(클릭한 순간 고정값)
    // move : 클릭한 위치에서부터 얼만큼 이동했는지 | 음수값 : 마우스 오른쪽>왼쪽 => 오른쪽을 끌어옴 | 양수값 : 마우스 왼쪽>오른쪽 => 왼쪽을 끌어옴
    const move = (x-startPoint);
    dragWeather.scrollLeft = scrollLefts-move;
  });

  dragWeather.addEventListener('mouseup', ()=>{
    isMouseDown=false;
  });
  dragWeather.addEventListener('mouseleave', ()=>{
    isMouseDown=false;
  });
  
};
scrollWeatherList()