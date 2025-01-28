# licorice api collection
![GitHub License](https://img.shields.io/github/license/dohyeon5626/licorice-api-collection?style=flat&color=green)

각종 개인 프로젝트에서 필요한 자잘한 API들을 제공하는 **'감초'** 프로젝트입니다. *(약방에 감초)*  
현재 AWS API Gateway와 Lambda를 사용하여 Serverless 형태로 운영되며, 큰 서비스는 따로 서버 어플리케이션을 구축하여 사용하고, 그 외 확장 프로그램, 플러그인, 간단한 웹페이지 등 규모가 크지 않은 프로젝트에서 가벼운 서버 기능이 필요할 때 이용합니다.


**관련 개인 프로젝트**
> 깃허브 Html 미리보기 확장프로그램 : [github-html-preview-extension](https://github.com/dohyeon5626/github-html-preview-extension)  
깃허브 Html 미리보기 웹페이지 : [github-html-preview-page](https://github.com/dohyeon5626/github-html-preview-page)

## API
```
https://licorice-api.dohyeon5626.com
```
**github content proxy**
```
1. 깃허브 content를 header없이 url로 가져오기 위한 proxy api
  GET /github-content-proxy/content/{token}/{proxy+}

2. 깃허브 content proxy api 사용시 github token을 숨기기 위한 jwt 발급 api
  POST /github-content-proxy/token
```

