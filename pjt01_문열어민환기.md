# :door: 문열어 민환기

1. `문열어 민환기` 는 미세먼지 체크 프로그램의 프로젝트입니다.
   -  **제공 데이터 API** 출처 : 에어코리아
   - **사용된 API** : Naver
     - Naver mpas 3v
2. **환경** : `HTML5` &`CSS3` &  `VanilaJs` 
2. 미세먼지 측정지역이 아닌 곳은 경도 위도가 가장 가까운 곳에서 유사 데이터를 뽑아오는 것으로 추측, 우선 일치하는 지역만 가져올 수 있도록 한 후, 마지막에 개선
2. **후기** : 도로명, 지번 전부 지원되는 [카카오 API](https://developers.kakao.com/docs/latest/ko/local/dev-guide) 를 사용하는 게 더 적절했을 것 같음



## :question: 문제해결

- API를 사용하기 전에...

  ```js
  // survice_key
  const API_KEY = config.apikey;
  const NAVER_API_CLIENT_ID = config.NAVER_API_CLIENT_ID;
  ```

  - 키 값을 `.ignore` 에 처리해준 js파일에 담아주었다.

  

- url을 가져오면 한글 코드가 다르게 변환되기에 10가지 지역 정보를 직접 긁어서 데이터(`json`)로 담았다.

```js
const local = [
  {
    name: '서울',
    code: '%EC%84%9C%EC%9A%B8'
  },
  {
    name: '부산',
    code: '%EB%B6%80%EC%82%B0',
  },
  ...
```



- `getData` 는 네이버 API에서 값을 가져온 후 실행할 수 있도록 `asyncNaverAPI` 내부 마지막에 실행하도록 했다. 그 뒤 데이터를 얻어오고 UI를 그리는 형식으로 진행했다.

- 비동기 처리를 하고, 필요한 값을 필터해서 넣어주었다. 

- UI를 그리고 난 후 실행되었으면 하는 로직들을 블록 닫히기 전에 순서대로 정리했다.

  ```js
  const getData = async ()=>{
    // 시도별 실시간 측정정보 조회
    let localCode = ''
    for(i=0;i<local.length;i++){
      if(local[i].name==addrCity){
        localCode = local[i].code;
        // console.log(local[i].code);
      }
    }
    const url = new URL(`https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=100&pageNo=1&sidoName=${localCode}&ver=1.0`);
    const response = await fetch(url);
    const data = await response.json();
    let localDust = data.response.body.items;
  
    statusNowUI(localDust);
    timeNow();
    ...
  ```



- 네이버지도 API

  ```js
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
        // 함수실행순서 정하기 : fetchNaverAPI > getData()
        await asyncNaverAPI();
        // getData(); // updateInfo 뒤에 실행하고 싶으므로 아예 내부 함수로
      }
    };
  });
  ```

  - 위치값에서 주소로 바꿔주는 `reverseGeolocation` 은 서브모듈에 있으므로, 서브모듈도 추가해주었다.
  - 비동기 처리를 위해 `asyncNaverAPI` 함수를 따로 빼주었다.
    - `await` 는 실행되는 블록 내 가장 최상위에서만 사용할 수 있다.



- !!!! 네이버 좌표> 위치 / 위치 > 좌표



- 특정 아이콘에 ` mouseover` 을 올렸을 시, box가 생기는 함수

  ```js
  function queryIcon(){
    const queryBtn = document.querySelector('.fa-circle-question');
    const posiBtn = document.querySelector('.percent');
    queryBtn.addEventListener('mouseenter', ()=>{
      console.log('enter')
      console.log(queryBtn)
      posiBtn.innerHTML += `<div class="query_box">`
    
      posiBtn.innerHTML += `</div>`
    });
    queryBtn.addEventListener('mouseleave', ()=>{
      console.log('leave')
      posiBtn.innerHTML += `<div class="query_box">`
    
      posiBtn.innerHTML += `</div>`
    });
  }
  ```

  1. 해당 코드는 오버할 시, `<div>` 가 생성되기 때문에 query로 요소를 찾을 수 없다.

     - 해결 과정

       ```js
       const queryBox = document.createElement('div');
       queryBox.classList.add('query_box');
       posiBtn.appendChild; // 가장 마지막에 요소를 붙일것이므로 appendChild
       ```

  2. 하지만 오버를 할 시, 바로 생성이 되는 것이 아닌, 이미 생성해놓은 `<div>` 를  `display:none` :arrow_forward: `display: block` 으로 해주는 것이 더 가벼워질 것 같음.

  3. 최종 해결

     ```js
     ...
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
     }
     
     function queryIcon(){
       // 변수를 못찾아서 한번 더 querySelector
       const queryBtn = document.querySelector('.fa-circle-question');
       const queryTxt = document.querySelector('.query_box')
       queryBtn.addEventListener('mouseenter', ()=>{
         console.log('enter')
         queryTxt.classList.add('on')
       });
       queryBtn.addEventListener('mouseleave', ()=>{
         console.log('leave')
         queryTxt.classList.remove('on')
       });
     }
     ```



- select의 선택된 option의 value 또는 text 값을 가져오기

  ```js
  const citySelected = document.querySelector('.addr_city');
  // 여기서 city는 select의 id 
  let cityValue = inputCity.options[city.selectedIndex].value;
  ```

  - 하지만 이미 selected를 지정한 태그가 있어서 로드 되자마자 선택된 것을 출력하고 선택 시, 재 출력이 되지 않는다.

    - 해결 과정
      이벤트 리스너 `change`를 사용하여 값이 변할 때 마다 함수가 실행되도록 한다.
      
      ```js
      const selectElement = document.querySelector('.addr_city');
        let selectedValue = '';
        selectElement.addEventListener('change', (event)=>{
          selectedValue = event.target.value;
          matchingRegion(selectedValue);
        });
      ```
      





- 함수가 실행은 되지만, 한번 밖에 실행되지 않는다.

  ```html
  <div class="search">
          <h2 class="hidden">검색창</h2>
          <h3>주소 검색</h3>
          <select class="addr_city" name="addr_city" id="addr_city">
            <option class="choice_city" disabled hidden selected>지역을 선택하세요.</option>
            <!-- js로 옵션 넣기 -->
          </select>
          <input class="input_search" type="text" placeholder="주소를 입력하세요." list="search_list">
          <button type="submit">검색</button>
        </div>
  ```

  ```js
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
  
          const addData = document.querySelector('.search');
          let dataList = `<datalist id="search_list">`
          for(k=0;k<localDust.length;k++){
            dataList += `<option value="${localDust[k].stationName}" />`
          }
          dataList += `</datalist>`
          addData.innerHTML += dataList;
        }
        getRegionData();
    };
  ```

  - 해결과정
    이미 함수는 제대로 실행되고 있다. `addData` 에 추가하는 방식이 아닌, 덮어씌우는 방식을 사용해보자.

    ```html
    ...
    				<!-- js로 옵션 넣기 -->
            </select>
            <input class="input_search" type="text" placeholder="주소를 입력하세요." list="search_list">
            <button type="submit">검색</button>
      
      			<!-- 덮어씌워주기 위해 공간을 새로 만들어 주었다. -->
            <div class="search_select"></div>
          </div>
    ```

    ```js
    ...
          // 새로운 공간(class="search_select")에 덮어씌워주자.
          const addData = document.querySelector('.search_select');
          let dataList = `<datalist id="search_list">`
          for(k=0;k<localDust.length;k++){
            dataList += `<option value="${localDust[k].stationName}" />`
          }
        	dataList += `</datalist>`
    
        	// 덮어 씌우기
        	addData.innerHTML = dataList;
        }
    		getRegionData();
    ```

    - 처음에는 함수가 한번만 실행이 되어서 한번만 출력이 되는 줄 알았으나, 이벤트리스너는 한번 추가되면 계속 작동하는 원리라는 것을 깨달았다. 해당 코드로 바꾸니 제대로 작동을 한다! (`select option` 을 고르면 초반 입력값이 지워지는 것도 해결 되었다.)



- 중복으로 인한 버벅임 해결
  기존 코드에서는 이벤트 리스너가 `change` 될 때마다 `metchingRegions` 내의 `getRegionData` 비동기 요청을 하게된다.

  ```js
  selectElement.addEventListener('change', (event)=>{
      selectedValue = event.target.value;
      selectCities.value = '';
      matchingRegion(selectedValue);
    });
  
    function matchingRegion(v){ // 제대로 값이 받아지는 것을 확인
      let localCode = '';
      for(let i=0;i<local.length;i++){
        if(local[i].name==v){
          localCode = local[i].code;
        }}...
        const getRegionData = async ()=>{
  ```

  - 수정 코드

  ```js
  const selectElement = document.querySelector('.addr_city');
    const selectCities = document.querySelector('.input_search');
  
    let currentRequestId = 0; //현재요청 ID
    selectElement.addEventListener('change', async(event)=>{
      selectedValue = event.target.value;
      selectCities.value = '';
      await matchingRegion(selectedValue);
    });
  
    async function matchingRegion(v){ // 제대로 값이 받아지는 것을 확인
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
            console.log(data); // 예시 출력
  
            let localDust = data.response.body.items;
            // 이제 검색창에 띄워주기
    
            // datalist 생성
            const addData = document.querySelector('.search_select');
            let dataList = `<datalist id="search_list">`
            for(let k=0;k<localDust.length;k++){
              dataList += `<option value="${localDust[k].stationName}" />`
            }
            dataList += `</datalist>`
            addData.innerHTML = dataList;
    
        } catch(error){
          console.error('에러 발생', error);
        }
    };
  }
  ```

  1. **요청 ID 확인 위치 수정**: `if (requestId !== currentRequestId)` 조건을 데이터 처리 전에 체크하도록 수정 :arrow_forward: 중복된 비동기 요청이 발생하더라도 최신 요청만 처리
  2. **에러 메시지 출력**: 서버에서 데이터를 가져오는 데 실패했을 때의 에러 메시지를 명확히 출력하도록 `throw new Error` 부분을 유지 :arrow_forward: 코드가 비동기 요청의 중복을 제대로 관리하고, 에러 발생 시 적절히 처리
     :red_circle: `console.log` 로 확인해본 결과, 요청이 너무 빠르면 로직 내의 `const requestId = ++currentRequestId;` && `*if*(requestId!==currentRequestId){` 가 속도를 따라갈 수 없으므로 return이 되어 코드에 안정성을 주는 것 같음.

  -  하지만 여전히 반복 실행이 되므로, 확인 필요. (두번째 요청시 request가 두번 값을 가져오는 것을 확인)

    `await matchingRegion(selectedValue, local);` 
    `async function matchingRegion(v, local){...` 함수를 `function selectCity(local){` 외부로 빼준다.

  ```js
  let selectedValue = '';
  let currentRequestId = 0; //현재요청 ID
  function selectCity(local){
    ...
    const selectElement = document.querySelector('.addr_city');
    selectElement.addEventListener('change', async(event)=>{
      selectedValue = event.target.value;
      const selectCities = document.querySelector('.input_search');
      selectCities.value = '';
      await matchingRegion(selectedValue, local);
    });
  }
  
  async function matchingRegion(v, local){ 
    let localCode = '';
    ...
  ```

  -  `selectCity` 함수 내에서 이벤트 리스너는 한 번만 등록 
  - 이벤트 리스너가 중복으로 등록되지 않아 `request`가 계속 증가하는 문제를 해결
    1. 이벤트 리스너 내부에서 해당 함수를 호출하는 것 자체가 중복을 **완전히 없애는 것은 아님**
    2. 이벤트가 발생할 때마다 `handleEvent` 함수가 호출되지만, `handleEvent` 함수의 정의는 단 한 번만 작성되므로 코드의 중복은 :arrow_down:
    3. 즉, 이벤트 리스너 내부에서 함수가 호출되는 것은 맞지만, 함수를 바깥으로 빼내어 정의함으로써 중복을 줄이고, 코드의 재사용성을 높이는 효과
    4. 이벤트 리스너 내에서 직접 로직을 작성하는 것보다 함수를 바깥으로 분리하여 호출하는 방식이 효율적



- 네이버 API사용 시, 도로명은 위치반환을 해주지 않는 것을 확인

  - **외부 주소 API**를 가져와서 결합해보자.

  1. 브이월드 검색 API : https://www.vworld.kr/dev/v4dv_search2_s001.do
  2. 참고 예제 : https://jsbin.com/bepajecipo/edit?html,output

  - 해당 코드를 불러오면 `cors` 에러가 뜬다.

    1. api를 허용한 url 과 일치하지 않아서 생기는 것을 보아하니, api 신청 url과는 무관한 듯
    2. 백엔드 서버에서 우회하거나, 로컬서버가 아닌 웹서버를 시도해보거나 jsonp우회방법 세가지가 있다.

    - 이 중 **jsonp** 방법을 선택

    ```html
      <!-- ajax를 사용하기 위한 jquery script를 가져온다. -->
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script defer src="./script/main.js"></script>
    	...
    </head>
    <body>
      ...
    ```

    ```js
    let  callAjax = function(){
    	const queryLocation = '판교로';
    	let  data = `service=search&request=search&version=2.0&size=10&page=1&query=${queryLocation}&type=road&format=json&errorformat=json&key=${VWORLD_API_KEY}`
    	$.ajax({
    		type: "get",
    		url: "https://api.vworld.kr/req/search",
    		data : data,
    		dataType: 'jsonp',
    		async: true,
    		success: function(data){
    				console.log(data);
    			 },
    		error: function(xhr, stat, err){}
    	});
    }
    callAjax();
    ```

    - 주소 값을 다듬어서 사용

      ```js
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
      ```

- 지도를 지역 상관없이 검색하는 것은 해결,

  - 하지만 다듬어진 데이터 값을 사용 한 결과, 미세먼지가 도로명인 경우에는 변하지 않는것을 확인
  - 다듬어진 값과, 기존의 값(`originRegion`)을 데이터를 같이 쓸 필요가 있다고 생각

  ```js
  const delTxtIdx = searchRegion.indexOf('('); // 숫자
        let region = '';
          if (delTxtIdx !== -1) {
            region = searchRegion.slice(0, delTxtIdx);
          } else {
            region = searchRegion;
          }
          document.querySelector('.menu_list').classList.remove('active');
          searchAddressToCoordinate(`${selectedValue} ${region} ${searchRegion}`);
  ```

  - 도로명을 다듬어주는 경우, 값을 세가지 전부 보내기로 했다.

  ```js
  // 기존 region값을 저장할 전역 변수 생성
  let newOriginRegion = '';
  function searchAddressToCoordinate(address){
    const newAddress = address.split(' ');
    // 쪼갰을 경우 즉, 값이 3개인 경우 if문
    if(newAddress.length==3){
      const newCity = newAddress[0];
      const newRegion = newAddress[1];
      newOriginRegion = newAddress[2]; // 이대로 값을 가져간다.
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
        // 찾을 수 없는 주소를 여기서 도로명 api로 처리 하기 : address
        address = address.split(' ');
        const city = address[0];
        const region = address[1];
        const originRegion = address[2];
        // 도로명 함수에 삽입
        callAjax(city, region);
        return;
      }
        ...
        getData();
    });
    ...
  const getData = async ()=>{
    let localCode = ''
    for(i=0;i<local.length;i++){
      if(local[i].name==addrCity){
        localCode = local[i].code;
      }
    }
    // newOriginRegion 값이 있을때 미세먼지를 검색할 변수를 치환
    if(newOriginRegion){
      addrRegion = newOriginRegion;
    }
  ```

  - 역이름을 검색하면 도로명도 지번도 아니기 때문에 검색이 되지않는다. `역` 을 `slice(-1)` 조건으로 추가 + `도`

  - `항` 은 검색 및 `response.ok` 이므로 수정 :x:  

    ```js
    const delTxtIdx = searchRegion.indexOf('('); // 숫자
          let region = '';
            if(delTxtIdx !== -1){
              region = searchRegion.slice(0, delTxtIdx);
            }else if(searchRegion.slice(-1)=='역'){ // 마지막 글자가 '역' 인 역들만 
              const idx = searchRegion.indexOf('역');
              region = searchRegion.slice(0, idx);
              console.log(region);
            }else if(searchRegion.slice(-1)=='도'){ // 마지막 글자가 '도' 인 섬들
              const idx = searchRegion.indexOf('도');
              region = searchRegion.slice(0, idx);
            }else{
              region = searchRegion;
            }
            document.querySelector('.menu_list').classList.remove('active');
            // 주소 / 지도를 검색할 지역 / 미세먼지를 검색할 지역(가공되지않은 원래의 미세먼지 region)
            searchAddressToCoordinate(`${selectedValue} ${region} ${searchRegion}`);
    ...
    ```

  - region 값이 `인천 신항` `인천 남항`... 으로 되어있으면 값을 잘라도 아예 찾을 수가 없었으므로 예외처리

  ```js
  if(!region){//없을시, 첫 로드될때 값이 없는 함수로 실행
    if(queryLocation=='남항'){
      searchAddressToCoordinate(`${city} 중구 남항`);
    }else if(queryLocation=='신항'){
      searchAddressToCoordinate(`${city} 송도동 신항`);
    }
  }
  ```



- 로드 시, 값을 불러올 수 없는 경우가 많아 가까운 측정소 값 가져오기

  ```js
  function searchAddressToCoordinate(address){
  		...    
  		item = response.v2.addresses[0];
      // 좌표
      // point = new naver.maps.Point(item.x, item.y);
      let pointMove = new naver.maps.LatLng(item.y, item.x)
  
      // staitionName에 존재하지 않는 지역이라면,
      if(!existCnt){
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
              if(distance < smallestDistance) {
                smallestDistance = distance;
                closestLocation = cityRegions[i];
              }
              if(cityRegions.length-1==cntLength){
                // 반복문 마지막에 최종값
                addrRegion = closestLocation;
                
                // 검색지역이 아닌, 기존 지역 이름 저장
                originRegions(address);
  
                // 리 랜더링
                statusNowUI(localDust);
              };
              }
            })
            }
        }
  ...
    });
  }
  
  let exsitNum = 0; // 해당 아래 함수가 실행됐는지 안됐는지 확인
  let originAddrRegion = '';
  function originRegions(address){
    originAddrRegion = address[1];
    exsitNum++;
  }
  ```

  ```js
  function statusNowUI(data){
    document.querySelector('.current_location').innerHTML = `${addrCity} ${addrRegion}`
    // grade = 좋음~나쁨 | value : 측정값
    for(let i=0;i<data.length;i++){
      if(newOriginRegion){ // 검색해서 본 주소를 검색해야할때 (즉, 검색해야할것과 띄워줄 것이 다를때)
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
          if(exsitNum){// 위의 originRegions함수가 발동되었을 시 실행(리 랜더링)
            document.querySelector('.current_location').innerHTML = `${addrCity} ${originAddrRegion}`
          }
        }
      }
    }
  
    // 값이 존재하지 않는다면
    notExist()
  
    dustListUI(dustValue, dustGrade);
    ...
    function notExist(){
    // 반복문이 다 끝났음에도 existCnt==0 (한번도 if문을 거치지 않았다면, 즉 region이 존재하지 않았다면)
    if(existCnt==0){
      // addrCity & addrRegion 위경도 찾은 후, getData에서 유사 경도위도 값 찾기 > 기본적으로 도로명이아닌 지명으로 검색이 되므로 네이버 api 서치를 이용해도 될 것
      searchAddressToCoordinate(`${addrCity} ${addrRegion}`)
      existCnt = 0; // 다시 0
    }else{
      // 전부 필터를 거쳐서 가공했음에도 돌아온 데이터(지명)
      // if()
      
    }
  };
  ```



- selectedCity 의 값 증가

  ```js
  let selectedValue = '';
  function selectCity(local){
    const inputCity = document.querySelector('select.addr_city');
    let cityContent = ''; // 변수로 담아서
    for(i=0;i<local.length;i++){
      cityContent += `<option name="city" value="${local[i].name}">${local[i].name}</option>`
    }
    inputCity.innerHTML = cityContent; // 재할당
  ```



- 엔터키로도 검색할 수 있도록 수정

  ```js
  // enterEvent
  function searchEnter(event) {
  	if (event.keyCode == 13) {
      searchEvent();
      }
  }
  ```

  - 최신 브라우저에서는 `window.event` 가 아닌, ` onkeyup="searchEnter(event)"` 로 event 인자를 제대로 보내서 명시적으로 작성하는 것으로 바뀌었다.



- 날씨 (기상청 단기예보 API)

  `timeNow()` 함수에서 값을 재활용 하고 싶으므로, `return` 을 추가하고 `console.log(timeNow())` 를 출력하였으나, 전역에서는 불러지는데 api데이터를 불러오는 함수에서는 불러지지 않았다.

  - 해결

    ```js
    function timeNow(){
      let getNow = new Date();
      let year = getNow.getFullYear();
      let month = getNow.getMonth()+1;
      if(month<10){month = '0'+month};
      let date = getNow.getDate();
      document.querySelector('.cuttent_time').innerHTML = `${year}-${month}-${date}`;
    
      return  {year, month, date}; // 객체로 반환
    }
    ```

    - 객체로 값을 전달하니

      결과 :  `{year:2024 ,month:'05', date:31}` 를 받아올 수 있었다.



---

## :bookmark: 힘들었던 점

1. 한페이지에서   
