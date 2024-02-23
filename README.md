[![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en)
[![DBMS MySQL](https://img.shields.io/badge/dbms-mysql-blue.svg)](https://www.mysql.com/)
# Purpose of this project
- 지하철에 있는 보관함 사용을 위한 서비스 따라해보기 
- Reference : [또타라커](https://apps.apple.com/kr/app/t-locker-%EB%98%90%ED%83%80%EB%9D%BC%EC%BB%A4-%EC%A7%80%ED%95%98%EC%B2%A0-%EB%AC%BC%ED%92%88-%EB%B3%B4%EA%B4%80-%EC%A0%84%EB%8B%AC%ED%95%A8/id1503291383)


# Implemented functions
- 맵에 역의 위치 표시
- 역 클릭시 역의 현재 날씨, 습도, 보관함 정보 표시
- 사물함 마다 상태를 다른 색으로 표시
- 
- 맵은 [leaflet](https://leafletjs.com/) 사용히여 보관함들이 있는 역의 위치를 맵에 표시
- 역 클릭시 역의 현재 날씨 습도 및 역에 있는 보관함의 대여가능 여부 표시
- 사물함 대여, 반납, 관리기능 
- 회원가입 / 로그인 / 로그아웃
- 게시판에 메세지 게시 / 게시글에 답글 기능
- 마이 페이지 : 로그인한 유저가 빌린 사물함, 게시한 게시물과 해당하는 댓글 확인이 가능한 페이지
- 관리자 페이지 : 게시물, 댓글, 역, 락커, 유저를 삭제, 복원, 수정이 가능한 페이지

# Stack
- Language: JavaScript
- Library & Framework : Node.js
- Database : MySQL
- ORM : Sequelize
- Deploy: AWS EC2

# Project Structure
## Back-end
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
## Front-end
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
