function searchCoordinateToAddress(latlng){
    naver.maps.Service.reverseGeocode({
      coords: latlng,
      orders: [
        naver.maps.Service.OrderType.ADDR,
        naver.maps.Service.OrderType.ROAD_ADDR
      ].join(',')
    }, function(status, response){
      if(status===naver.maps.Service.Status.ERROR){
        return alert('위치를 불러오는 중 문제가 생겼습니다.')
      }
      
      let items = response.v2.results
      let address = ''
      let htmlAddresses = [];

      for(let i=0;i<items.length;i++){
        let item = items[i];
        let addrType = makeAddress(item) || '';
        addrType = item.name === 'roadaddr' ? '[도로명 주소]' : '[지번 주소]';
        htmlAddresses.push((i+1) +'. '+ addrType +' '+ address);
      }
      console.log(items[0].region.area1.alias);
      console.log(items[0].region.area2.name);
      
      // 주소 만들기 (현재 사용X)
      function makeAddress(item){
        if(!item){
          return;
        }

        let name = item.name;
        let region = item.region;
        let land = item.land;
        let isRoadAddress = name==='roadaddr';
        // console.log(region.area1.alias);
        // console.log(region.area2.name);

        let sido = '';
        let sigugun = '';
        let dongmyun = '';
        let ri = '';
        let rest = '';

        if (hasArea(region.area1)) {
          sido = region.area1.name;
        }
        if (hasArea(region.area2)) {
          sigugun = region.area2.name;
        }
        if (hasArea(region.area3)) {
          dongmyun = region.area3.name;
        }
        if (hasArea(region.area4)) {
          ri = region.area4.name;
        }
        if (land) {
          if (hasData(land.number1)) {
            if (hasData(land.type) && land.type === '2') {
              rest += '산';
            }
            rest += land.number1;
            if (hasData(land.number2)) {
              rest += ('-' + land.number2);
            }
          }

          if (isRoadAddress === true) {
            if (checkLastString(dongmyun, '면')) {
              ri = land.name;
            } else {
              dongmyun = land.name;
              ri = '';
            }

            if (hasAddition(land.addition0)) {
              rest += ' ' + land.addition0.value;
            }
          }
        }
        return [sido, sigugun, dongmyun, ri, rest].join(' ');
        
        function hasArea(area) {
          return !!(area && area.name && area.name !== '');
        }
        function hasData(data) {
          return !!(data && data !== '');
        }
        function checkLastString (word, lastString) {
          return new RegExp(lastString + '$').test(word);
        }
        function hasAddition (addition) {
          return !!(addition && addition.value);
        }
        // naver.maps.onJSContentLoaded = initGeocoder;
      }// makeAddress() End
      
      }
    );
  }