# :memo: README.md

1. **미세먼지**와 **날씨** 데이터 값을 가져옵니다. *(출처 : 공공데이터기관)*

   - [미세먼지 data](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15073861)

   - [날씨 data](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15059468)

2. **검색**이나 **지도**를 이용하여 접근성과 편의성을 높일 수 있도록 UI 구성
   - 검색은 JS, 지도는 API를 사용 :arrow_right: 현재 위치값을 가져와서 미세먼지&날씨 출력



---

## :dash: 미세먼지

- `Grade` : 환경지수(좋음~나쁨) | `Value` : 환경수치(number 값)

| Key           | Value                        | 우선 순위 |
| ------------- | ---------------------------- | --------- |
| so2Grade      | 아황산가스 환경지수          | 6         |
| so2Value      | 아황산가스 환경수치          | 6         |
| o3Grade       | 오존 환경지수                | 4         |
| o3Value       | 오존 환경수치                | 4         |
| **khaiGrade** | 통합대기 환경지수            | **Main**  |
| **khaiValue** | 통합대기 환경농도            | **Main**  |
| no2Grade      | 이산화질소 환경지수          | 3         |
| no2Value      | 이산화질소 환경수치          | 3         |
| pm10Grade     | 미세먼지 입자 10pm 환경지수  | 1         |
| pm10Value     | 미세먼지 입자 10pm 환경수치  | 1         |
| pm25Grade     | 미세먼지 입자 2.5pm 환경지수 | 2         |
| pm25Value     | 미세먼지 입자 2.5pm 환경수치 | 2         |
| coGrade       | 일산화탄소 환경지수          | 5         |
| coValue       | 일산화탄소 환경수치          | 5         |

> <u>미세먼지 **PM10**</u>
> PM은 Particulate Matter의 약자. 미세먼지 PM10은 지름이 10㎛ 이하의 먼지를 뜻합니다. '**거대분진**'이라고도 불리고 세계 여러 국가에서 대기오염 지표로 삼고 있습니다. 우리나라도 2014년부터 PM10을 기준으로 미세먼지 예보를 하고 있습니다.
>
> <u>미세먼지 **PM2.5**</u>
> 지름이 2.5㎛ 이하의 먼지를 뜻합니다. 미세분진, **초미세먼지**하고 불립니다. 일반적으로 인위적인 공래에 의해 만들어지는 것으로 신체에 매우 위험합니다. PM10과 함께 대기오염의 지표가 되고 있습니다.

:heavy_plus_sign: `pm10Grade1h` : 미세먼지 1시간 등급 | `pm25Grade1h` 초미세먼지 1시간 등급

### :earth_asia: 통합대기수준

| 지수구분 |                          좋음                           |                           보통                            |                             나쁨                             |                          매우 나쁨                           |                          매우 나쁨                           |
| -------- | :-----------------------------------------------------: | :-------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| 점수     |                          0~50                           |                          51~100                           |                           101~250                            |                           251~350                            |                           351~500                            |
| 개요     | 대기오염 관련 질환자군 에서도 영향이 유발되지 않을 수준 | 환자군에게 만성 노출 시 경미한 영향이 유발될 수 있는 수준 | 환자군 및 민감군에게 유해한 영향이 유발될 수 있는 수준, 일반인도 건강상 불쾌감을 경험할 수 있는 수준 | 환자군 및 민감군에게 급성 노출 시 심각한 영향 유발, 일반인도 약한 영향을 받을 수 있는 수준 | 환자군 및 민감군에게 응급조치가 발생되거나, 일반인도 유해한 영향을 받을 수 있는 수준 |



- 에어코리아 OpenAPI 서비스 내 오퍼레이션의 **항목별 실시간 자료 측정 단위**

| 항목 | SO2  | CO   | O3   | NO2  | PM10  | PM2.5 |
| ---- | ---- | ---- | ---- | ---- | ----- | ----- |
| 단위 | ppm  | ppm  | ppm  | ppm  | ㎍/㎥ | ㎍/㎥ |

| 등급      | 좋음 | 보통 | 나쁨 | 매우나쁨 |
| --------- | ---- | ---- | ---- | -------- |
| Grade  값 | 1    | 2    | 3    | 4        |



- [국내 대기환경 기준](https://www.airkorea.or.kr/web/contents/contentView/?pMENU_NO=132&cntnts_no=6)



### :earth_asia: Vworld 지도검색 API

- 체크표시는 사용여부

1. 장소(PLACE) 검색 예제

```link
https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:900913&bbox=14140071.146077,4494339.6527027,14160071.146077,4496339.6527027&size=10&page=1&query=공간정보산업진흥원&type=place&format=json&errorformat=json&key=[KEY]
```

2. 주소(ADDRESS) 검색 예제

```link
https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:900913&bbox=14140071.146077,4494339.6527027,14160071.146077,4496339.6527027&size=10&page=1&query=성남시 분당구 판교로 242&type=address&category=road&format=json&errorformat=json&key=[KEY]
```

3. 행정구역(DISTRICT) 검색 예제

```link
https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:900913&bbox=14140071.146077,4494339.6527027,14160071.146077,4496339.6527027&size=10&page=1&query=삼평동&type=district&category=L4&format=json&errorformat=json&key=[KEY]
```

4. 도로명(ROAD) 검색 예제 :white_check_mark:

```link
https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:900913&bbox=14140071.146077,4494339.6527027,14160071.146077,4496339.6527027&size=10&page=1&query=판교로&type=road&format=json&errorformat=json&key=[KEY]
```

  

## :sun_behind_large_cloud: 날씨

| **항목값** | **항목명**     | **단위**    | **압축bit수** |      |
| ---------- | -------------- | ----------- | ------------- | ---- |
| POP        | 강수확률       | %           | 8             |      |
| PTY        | 강수형태       | 코드값      | 4             |      |
| PCP        | 1시간 강수량   | 범주 (1 mm) | 8             |      |
| REH        | 습도           | %           | 8             |      |
| SNO        | 1시간 신적설   | 범주(1 cm)  | 8             |      |
| SKY        | 하늘상태       | 코드값      | 4             |      |
| TMP        | 1시간 기온     | ℃           | 10            |      |
| TMN        | 일 최저기온    | ℃           | 10            |      |
| TMX        | 일 최고기온    | ℃           | 10            |      |
| UUU        | 풍속(동서성분) | m/s         | 12            |      |
| VVV        | 풍속(남북성분) | m/s         | 12            |      |
| WAV        | 파고           | M           | 8             |      |
| VEC        | 풍향           | deg         | 10            |      |
| WSD        | 풍속           | m/s         | 10            |      |

> \- 하늘상태(SKY) 코드 : 맑음(1), 구름많음(3), 흐림(4)
>
> \- 강수형태(PTY) 코드 :  (단기) 없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4) 

| **항목명(영문)** | **항목명(국문)** | **항목크기** | **항목구분** | **샘플데이터** | **항목설명**                                |
| ---------------- | ---------------- | ------------ | ------------ | -------------- | ------------------------------------------- |
| baseDate         | 발표일자         | 8            | 1            | 20210628       | 21년 6월 28일 발표                          |
| baseTime         | 발표시각         | 4            | 1            | 1200           | 12시00분 발표                               |
| nx               | 예보지점 X 좌표  | 2            | 1            | 55             | 입력한 예보지점 X 좌표                      |
| ny               | 예보지점 Y 좌표  | 2            | 1            | 127            | 입력한 예보지점 Y 좌표                      |
| category         | 자료구분코드     | 3            | 1            | LGT            | 자료구분코드   * 하단 참고자료 참조         |
| fcstDate         | 예측일자         | 8            | 1            | 20210628       | 예측일자(YYYYMMDD)                          |
| fcstTime         | 예측시간         | 4            | 1            | 1200           | 예측시간(HH24MI)                            |
| fcstValue        | 예보 값          | 2            | 1            | 0              | 예보 값  - Category(자료구분)에 대한 예측값 |



- 위경도를 GridXY로 변환해주는 식이 필요

  - 기상청 홈페이지에서 발췌한 변환 함수 ( [참고](https://blog.naver.com/javaking75/220089575454) )

  ```js
  // LCC DFS 좌표변환을 위한 기초 자료
  var RE = 6371.00877; // 지구 반경(km)
  var GRID = 5.0; // 격자 간격(km)
  var SLAT1 = 30.0; // 투영 위도1(degree)
  var SLAT2 = 60.0; // 투영 위도2(degree)
  var OLON = 126.0; // 기준점 경도(degree)
  var OLAT = 38.0; // 기준점 위도(degree)
  var XO = 43; // 기준점 X좌표(GRID)
  var YO = 136; // 기1준점 Y좌표(GRID)
  
  // LCC DFS 좌표변환 ( code : 
  // 		"toXY"(위경도->좌표, v1:위도, v2:경도), 
  // 		"toLL"(좌표->위경도,v1:x, v2:y) )
  function dfs_xy_conv(code, v1, v2) {
    var DEGRAD = Math.PI / 180.0;
    var RADDEG = 180.0 / Math.PI;
  
    var re = RE / GRID;
    var slat1 = SLAT1 * DEGRAD;
    var slat2 = SLAT2 * DEGRAD;
    var olon = OLON * DEGRAD;
    var olat = OLAT * DEGRAD;
  
    var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    var rs = {};
    if (code == "toXY") {
      rs['lat'] = v1;
      rs['lng'] = v2;
      var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
      ra = re * sf / Math.pow(ra, sn);
      var theta = v2 * DEGRAD - olon;
      if (theta > Math.PI) theta -= 2.0 * Math.PI;
      if (theta < -Math.PI) theta += 2.0 * Math.PI;
      theta *= sn;
      rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
      rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    }
    else {
      rs['x'] = v1;
      rs['y'] = v2;
      var xn = v1 - XO;
      var yn = ro - v2 + YO;
      ra = Math.sqrt(xn * xn + yn * yn);
      if (sn < 0.0) - ra;
      var alat = Math.pow((re * sf / ra), (1.0 / sn));
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
      var alon = theta / sn + olon;
      rs['lat'] = alat * RADDEG;
      rs['lng'] = alon * RADDEG;
    }
    return rs;
  }
  ```

  - 콘솔을 찍으면 해당 전역 변수들을 불러오지 못하는 오류가 있어, 내부 스코프로 옮겨주었고, `var` 선언은 `let`으로 변경