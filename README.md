# licorice functions
![GitHub License](https://img.shields.io/github/license/dohyeon5626/licorice-api-collection?style=flat&color=green)

각종 개인 프로젝트을 위한 서버리스 프로젝트입니다. *(약방에 감초)*  
현재 AWS API Gateway, EventBridge, Lambda, CloudWatch 등의 서비스를 사용하여 운영되며, 큰 서비스는 따로 서버 어플리케이션을 구축하여 사용하고, 그 외 확장 프로그램, 플러그인, 간단한 웹페이지 등 규모가 크지 않은 프로젝트에서 가벼운 서버 기능이 필요한 경우에 이용합니다.

**github-content-proxy**
```
1. 깃허브 content를 header없이 url로 가져오기 위한 proxy api
  GET /github-content-proxy/content/{token}/{proxy+}

2. 깃허브 content proxy api 사용시 github token을 숨기기 위한 jwt 발급 api
  POST /github-content-proxy/token
```

**monitoring-system**
```
1. Github Html Preview Extension, Auto Gitkeep Plugin의 현재 상태를 알림 보내주는 Batch
  cron(10 0 * * ? *) // 매일 KST 오전 9시 10분
```
