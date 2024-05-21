# :memo: README.md

1. **미세먼지**와 **날씨** 데이터 값을 가져옵니다. *(출처 : 공공데이터기관)*

   - [미세먼지 data](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15073861)

   - [날씨 data](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15059468)

2. **검색**이나 **지도**를 이용하여 접근성과 편의성을 높일 수 있도록 UI 구성
   - 검색은 JS, 지도는 API를 사용 :arrow_right: 현재 위치값을 가져와서 미세먼지&날씨 출력



---

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



- 에어코리아 OpenAPI 서비스 내 오퍼레이션의 **항목별 실시간 자료 측정 단위**

| 항목 | SO2  | CO   | O3   | NO2  | PM10  | PM2.5 |
| ---- | ---- | ---- | ---- | ---- | ----- | ----- |
| 단위 | ppm  | ppm  | ppm  | ppm  | ㎍/㎥ | ㎍/㎥ |

| 등급      | 좋음 | 보통 | 나쁨 | 매우나쁨 |
| --------- | ---- | ---- | ---- | -------- |
| Grade  값 | 1    | 2    | 3    | 4        |



- [국내 대기환경 기준](https://www.airkorea.or.kr/web/contents/contentView/?pMENU_NO=132&cntnts_no=6)