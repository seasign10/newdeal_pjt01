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
        getWeatherData(addrCity, addrRegion);
        }
      );
    }
}

// 주소 > 좌표 : 전역으로 넣어서 호출할 수 있게
function searchAddressToCoordinate(address){
  naver.maps.Service.geocode({
    query: address
  }, function (status, response) {
    if (status === naver.maps.Service.Status.ERROR) {
      return alert('위치를 불러오는 중 문제가 생겼습니다.');
    }
    // 주소를 도로명으로 찾을 때, 건물명까지 입력하지 않으면 응답받지 못한다.
    if (response.v2.meta.totalCount === 0) {
      // return alert('totalCount' + response.v2.meta.totalCount);
      // 찾을 수 없는 주소를 여기서 도로명 api로 처리 하기 : address
      address = address.split(' ');
      const city = address[0];
      const region = address[1];
      // 도로명 함수에 삽입
      callAjax(city, region);
      return;
      // return alert('도로명 주소는 찾을 수 없습니다.');
    }
      item = response.v2.addresses[0];
      // 좌표
      // point = new naver.maps.Point(item.x, item.y);
      let pointMove = new naver.maps.LatLng(item.y, item.x)

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
}
// getData();

// 우선순위 및 사용하기 좋게 배열에 값을 담아준다.
const dustLv = ['좋음', '보통', '나쁨', '매우나쁨'];
const statusColor = ['#0062ff', 'green', 'orange', 'red'];
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
      msgColor.style.color = '#0062ff';
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

// 지역 선택하는 select
function choiceSelect(){

};

// 대기오염 리스트를 출력하는 함수
function dustListUI(dustValue, dustGrade){
  dustContent = ''; // 검색시 초기화
  dustContent = `
  <ul>
    <li class="on">
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
      <li>
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
// select로 city 선택
let selectedValue = '';
let currentRequestId = 0; //현재요청 ID
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
//이벤트 리스너가 함수안에서 계속 실행되면 겹치므로 빼줌.
const searchClick = document.querySelector('.search_btn');
const warnMsg = document.querySelector('.warn_msg');
const searchBtn = ()=>{
  // 클릭 시, 지역 값이 없을 때
  searchClick.addEventListener('click', (e)=>{
    e.preventDefault(); // 버블링 막기
    if(!selectedValue){
      warnMsg.innerText = '지역이 선택되지 않았습니다.'
      warnMsg.classList.remove('hidden');
      warnMsg.style.fontSize = '12px';
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
      warnMsg.innerText = '목록에 있는 주소를 선택해주세요.';
      warnMsg.classList.remove('hidden');
      warnMsg.style.fontSize = '12px'; 
    }else{// 값이 존재한다면 값을 넘기자.
      // 경고 문구 삭제 및, 검색되면 메뉴창 집어넣기
      warnMsg.classList.add('hidden');
      warnMsg.style.fontSize = '0';
      document.querySelector('.input_search').value = '';

      // 간혹 ()이 들어간 문구들이 있음. 이 자료를 정리해서 보내자.
      const delTxtIdx = searchRegion.indexOf('('); // 숫자
      let region = '';
        if (delTxtIdx !== -1) {
          region = searchRegion.slice(0, delTxtIdx);
        } else {
          region = searchRegion;
        }
        document.querySelector('.menu_list').classList.remove('active');
        searchAddressToCoordinate(`${selectedValue} ${region}`);
        getWeatherData(selectedValue, region)
        
    }
    }
  });
};
searchBtn();

// 도로명을 검색할 수 있는 api
let  callAjax = function(city, queryLocation){
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
				const item =  data.response.result.items;
        let region = '';
        // city에 속하는 지역명 뽑기
        for(let i=0;i<sizeCnt;i++){
          if(item[i].district.indexOf(city)>-1){
            region = item[i].district;
            // break; // return을 사용하면 함수밖으로 빠져나가기 때문에
          }
        }
        if(region.indexOf('(')==-1){
          // 가장 마지막 단어를 주소로 입력
          const regionAddr = region.split(' ');
          // console.log(regionAddr.slice(-1)); // objecy
          // console.log(regionAddr[regionAddr.length-1]); // string

          // 사용할 값은 string이 더 적절한 것 같으므로
          const findRegion = regionAddr[regionAddr.length-1];
          searchAddressToCoordinate(`${city} ${findRegion}`);
          
        }else{// 괄호가 있을시, 괄호의 주소를 가져옴
          const firstIdx = region.indexOf('('); // 중복되어도 첫번째 찾는 값을 가져오므로
          const lastIdx =  region.indexOf(')');
          findRegion = region.slice(firstIdx+1, lastIdx);
          searchAddressToCoordinate(`${city} ${findRegion}`);
        }
			 },
		error: function(xhr, stat, err){}
	});
}

////////////////////// 날씨 데이터 ///////////////////////
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

const getWeatherData = async(addrCity, addrRegion)=>{
  let cityId = '';
  for(let i=0;i<cityCodeList.length;i++){
    if(cityCodeList[i].Name==addrCity){
      cityId = cityCodeList[i].Code;
    }else if(cityCodeList[i].Name.indexOf(addrRegion)!=-1){
      cityId = cityCodeList[i].Code;
      console.log(cityCodeList[i].Name);
    }
  }
  const url = new URL(`https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=10&dataType=json&regId=${cityId}&tmFc=202405300600`);
  await fetch(url)
  .then(response=>{
    if(!response.ok){
      throw new Error('네트워크가 원활하지 않습니다.');
    }
    return response.json();
  })
  .then(data=>{
    console.log(data.response.body.items.item);
  })
  .catch(error=>{
    console.error('There has been a problem with your fetch operation:', error)
  });
}
