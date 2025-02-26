exports.handler = async function () {
  return {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    statusCode: 200,
    body: JSON.stringify({
      API_KEY: process.env.API_KEY, // Netlify 환경변수에서 가져옴
      VWORLD_API_KEY: process.env.VWORLD_API_KEY,
      NAVER_API_CLIENT_ID: process.env.NAVER_API_CLIENT_ID,
      // NAVER_API_KEY: process.env.NAVER_API_KEY,
    }),
  };
};
