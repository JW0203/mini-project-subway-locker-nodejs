const IP_ADDRESS = 'localhost';

var trainIcon = L.icon({
  iconUrl: './images/train.png',
  iconSize: [25, 25], // Adjust the size as needed
  iconAnchor: [19, 25], // Adjust the anchor point as needed
  popupAnchor: [0, -25],
});

var map = L.map('map').setView([37.5665, 126.978], 11); // Seoul's center coordinates

var tile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 18,
}).addTo(map);
var markers = new Array();

L.svg().addTo(map);

// Function to fetch and display stations
async function fetchAndDisplayStations() {
  try {
    const response = await fetch(`http://${IP_ADDRESS}:3000/stations`);
    const contentType = response.headers.get('Content-Type');
    if (!response.ok && contentType && contentType.includes('application/json')) {
      const errData = await response.json();
      throw new Error(errData.message);
    }
    if (!response.ok && contentType && contentType.includes('text/html')) {
      const errData = await response.text();
      throw new Error(errData);
    }
    const stations = await response.json();
    stations.forEach((station) => {
      var marker = L.marker([station.latitude, station.longitude], { icon: trainIcon })
        .addTo(map)
        .on('click', function () {
          fetchStationDetails(station.id);
        });
    });
  } catch (error) {
    console.error('역 데이터를 가져오는 중 오류가 발생했습니다:', error.message);
  }
}

// Function to fetch station details
async function fetchStationDetails(stationId) {
  try {
    const response = await fetch(`http://${IP_ADDRESS}:3000/stations/${stationId}`);

    const contentType = response.headers.get('Content-Type');
    if (!response.ok && contentType && contentType.includes('application/json')) {
      const errData = await response.json();
      throw new Error(errData.message);
    }
    if (!response.ok && contentType && contentType.includes('text/html')) {
      const errData = await response.text();
      throw new Error(errData);
    }

    const stationDetails = await response.json();

    displayStationDetails(stationDetails);
  } catch (error) {
    console.error('역 정보를 가져오는 중 오류가 발생했습니다:', error.message);
  }
}

// Function to display station details
function displayStationDetails(details) {
  // Zoom to the station and center the map
  map.setView([details.station.latitude, details.station.longitude], 17); // Zoom level 17 is an example

  let detailsContent = `
        <h2>${details.station.name}</h2>
        <p>온도: ${details.temperature}°C</p>
        <p>습도: ${details.humidity}%</p>
        <h3>사물함:</h3>
        <div class="lockers-legend">
            <div><span class="legend-color-box" style="background-color: grey;"></span> 사용중</div>
            <div><span class="legend-color-box" style="background-color: blue;"></span> 미사용</div>
            <div><span class="legend-color-box" style="background-color: green;"></span> 관리중</div>
        </div>
        <div class="lockers-container">`;

  details.lockers.forEach((locker) => {
    let color;
    switch (locker.status) {
      case 'occupied':
        color = 'grey';
        break;
      case 'unoccupied':
        color = 'blue';
        break;
      case 'under management':
        color = 'green';
        break;
      default:
        color = 'black'; // Default color for unknown status
    }
    detailsContent += `<div class="locker-box" style="background-color: ${color};" onclick="lockerClickHandler(${locker.id})">
        ${locker.id}
    </div>`;
  });

  detailsContent += '</div>';
  var detailsDiv = document.getElementById('stationDetails');
  detailsDiv.style.display = 'block';
  detailsDiv.innerHTML = detailsContent;
}

async function rentLocker(id) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://${IP_ADDRESS}:3000/lockers/rental`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lockerId: id }),
    });

    const contentType = response.headers.get('Content-Type');
    if (!response.ok && contentType && contentType.includes('application/json')) {
      const errData = await response.json();
      throw new Error(errData.message);
    }
    if (!response.ok && contentType && contentType.includes('text/html')) {
      const errData = await response.text();
      throw new Error(errData);
    }
    alert('사물함을 성공적으로 대여했습니다!');
  } catch (error) {
    console.error('사물함 대여 오류:', error.message);
    alert(error.message);
  }
}

async function lockerClickHandler(id) {
  if (userIsLoggedIn()) {
    await rentLocker(id);
    var lockerElement = document.getElementById(`locker-${id}`);
    if (lockerElement) {
      lockerElement.style.backgroundColor = 'gray';
    }
  }
  if (!userIsLoggedIn()) {
    alert('이 기능을 사용하려면 로그인 해주세요.');
    const redirectUrl = `index.html`;
    const authority = 'user';
    window.location.href = `../public/sign-in.html?authority=${authority}&redirect=${redirectUrl}`;
  }
}

function userIsLoggedIn() {
  const accessToken = localStorage.getItem('accessToken');
  return accessToken !== null; // Example check
}

document.getElementById('logout').addEventListener('click', async () => {
  const token = localStorage.getItem('accessToken'); // 로그인 시 저장된 이메일 주소
  if (!token) {
    alert('이미 로그아웃 상태입니다.');
    return;
  }

  try {
    const response = await fetch(`http://${IP_ADDRESS}:3000/auth/sign-out`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      // body: JSON.stringify({ email }),
    });

    if (response.status === 204) {
      // 로그아웃 성공
      localStorage.removeItem('accessToken');
      alert('로그아웃 되었습니다.');
      // 로그아웃 후 홈페이지로 이동하거나 페이지 새로고침
      window.location.href = '../index.html'; // 홈페이지 URL로 변경하세요
    } else {
      // 로그아웃 실패 처리
      alert('로그아웃에 실패했습니다.');
    }
  } catch (error) {
    console.error('로그아웃 오류:', error);
    alert('로그아웃 중 오류가 발생했습니다.');
  }
});

// Event listener for the "Return" button
document.getElementById('myPage').addEventListener('click', () => {
  if (userIsLoggedIn()) {
    window.location.href = '../public/my-page.html';
  } else {
    alert('사물함 대여 정보를 보려면 로그인 해주세요.');
    const redirectUrl = 'my-page.html';
    window.location.href = `../public/sign-in.html?authority=user&redirect=${redirectUrl}`; // Update with the actual path to your sign-in page
  }
});

// Initial fetch and display stations on main
fetchAndDisplayStations();
