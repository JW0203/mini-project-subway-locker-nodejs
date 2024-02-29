[![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en)
[![DBMS MySQL](https://img.shields.io/badge/dbms-mysql-blue.svg)](https://www.mysql.com/)
# Purpose of this project
- 지하철에 있는 보관함 사용을 위한 서비스 따라해보기 
- Reference : [또타라커](https://apps.apple.com/kr/app/t-locker-%EB%98%90%ED%83%80%EB%9D%BC%EC%BB%A4-%EC%A7%80%ED%95%98%EC%B2%A0-%EB%AC%BC%ED%92%88-%EB%B3%B4%EA%B4%80-%EC%A0%84%EB%8B%AC%ED%95%A8/id1503291383)



# 구현된 기능들

### 지도 기능
- **지도 위 역 위치 표시**
  - [Leaflet](https://leafletjs.com/)을 이용

### 역 상호작용
- **역 클릭 시 현재 날씨 및 사물함 정보 표시**
    - 역을 클릭하면 현재 날씨, 습도, 사물함 상태 정보가 표시
    - 날씨 정보는 [OpenWeather API](https://openweathermap.org/api)를 이용
    - 사물함 상태(대여 중, 대여 가능, 점검 중)는 다른 색으로 구분

### 사용자 계정 관리
- **회원가입 / 로그인 / 로그아웃**
    - jwt 를 이용
 
### 유저와 관리자 권한 구별
- **미들웨어**를 이용한 구별
  - authorityConfirmation.js

### 메시지 보드 (Q&A)
- **메시지 게시 / 게시물에 답글 달기**
    - 사용자가 게시판에 메시지를 게시
    - 관리자가 기존 메시지에 답글을 게시

### 마이 페이지
- **개인화된 사용자 대시보드**
    - 대여한 사물함 반환
    - 계정 삭제
    - 작성한 메세지 및 댓글 확인

### 관리자 페이지
- **콘텐츠 및 사용자 관리**
    - 관리자가 게시물, 댓글, 역, 락커, 사용자 계정을 삭제, 복원, 편집할 수 있는 기능을 제공


# Stack
- Language: JavaScript
- Library & Framework : Node.js
- Database : MySQL
- ORM : Sequelize
- Deploy: AWS EC2

# Project Structure
### Back-end
```
Back-end
├── app.js
├── config
├── functions
├── middleware
│   ├── HttpException.js
│   ├── authenticateToken.js
│   ├── authorityConfirmation.js
│   └── index.js
├── models
│   ├── Admin.js
│   ├── BlackList.js
│   ├── Comment.js
│   ├── Locker.js
│   ├── Post.js
│   ├── Station.js
│   ├── User.js
│   ├── enums
│   └── index.js
└── routes
    ├── auth.js
    ├── comments.js
    ├── index.js
    ├── lockers.js
    ├── posts.js
    ├── stations.js
    └── user.js
```
### Front-end
```
Front-end
├── css
├── images
│   └── train.png
├── public
│   ├── admin.html
│   ├── index.html
│   ├── message-board.html
│   ├── my-page.html
│   ├── search-lockers.html
│   ├── sign-in.html
│   └── sign-up.html
└── src
    ├── admin-script.js
    ├── button.js
    ├── main.js
    ├── message-borad.js
    ├── my-page.js
    ├── search-locker-script.js
    ├── sign-in-script.js
    └── sign-up-script.js
```
