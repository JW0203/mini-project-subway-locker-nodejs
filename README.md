<!--
[![Nodejs](https://img.shields.io/badge/Runtime-Node.js-green)](https://nodejs.org/en)
[![express](https://img.shields.io/badge/Web_frame-express.js-white)](https://nodejs.org/en)
[![Js](https://img.shields.io/badge/code-JavaScript-blue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Sequelize](https://img.shields.io/badge/ORM-Sequelize-yellow)](https://sequelize.org/)
[![mysql](https://img.shields.io/badge/DBMS-MySQL-orange)](https://www.mysql.com/)
-->

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?logo=amazon-aws&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white)
![OpenWeather](https://img.shields.io/badge/OpenWeather_API-FF6B00?logo=OpenWeather&logoColor=white)


# Mini Project : Subway Locker Rental Service

## Purpose of this project
- Recreate a real-world service for practical experience
- Lightweight implementation of the Front-end using JavaScript, HTML, and CSS 
- Understand interaction between Front-end and Back-end
- Applied back-end concepts in practice
  - API naming conventions
  - RESTful design principles
  - HTTP status codes
  - Middleware implementation
  - Function-level logic


## Features Implemented

### 1. Station Map
- **Display station locations on a map**
  - Implemented using [Leaflet](https://leafletjs.com/)

### 2. Station Interaction
- **Click a station to view current weather and locker status**
    - Weather data fetched from [OpenWeather API](https://openweathermap.org/api)
    - Locker status shown with different colors:
      - Available / In Use / Under Maintenance 

### 3. User Account Management
- **Sign up / Log in / Log out**
    - Implemented with JWT authentication
 
### 4. Role-Based Access Control
- Role verification using **custom middleware**
  - authorityConfirmation.js

### 5. Message Board (Q&A)
- Post messages and reply to messages
    - Users can post messages
    - Admins can reply to message

### 6. My Page (User Dashboard)
- **Personalized dashboard for users**
    - Return rented lockers
    - Delete account
    - View own posts and comments

### 7. Admin Page
- **Admin control panel**
    - Manage stations, lockers, posts, comments, and user accounts
    - Features: delete, restore, edit

## Database ERD
![ERD 설명](ERD-2.png)

## Stack
Back-end
- Language: JavaScript
- Runtime: Node.js
- Framework: Express.js
- DBMS: MySQL
- ORM: Sequelize
- Authentication: JWT
- Deployment: AWS EC2

Front-end
- Language: JavaScript
- Markup & Styling: HTML, CSS
- Map Library: Leaflet (map)
- API: OpenWeather API


## Project Structure
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
