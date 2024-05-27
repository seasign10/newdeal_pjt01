# :door: 문열어 민환기

1. `문열어 민환기` 는 미세먼지 체크 프로그램의 프로젝트입니다.
   -  **제공 데이터 API** 출처 : 에어코리아
   - **사용된 API** : Naver
     - Naver mpas 3v
2. **환경** : `HTML5` &`CSS3` &  `VanilaJs` 



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



- 미세먼지 측정지역이 아닌 곳은 경도 위도가 가장 가까운 곳에서 유사 데이터를 뽑아오는 것 같다. 
  이 문제를 해결하는 것은 가장 마지막에 추가해보자.

