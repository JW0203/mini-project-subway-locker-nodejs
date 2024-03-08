document.getElementById('lockerForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const page = document.getElementById('page').value;
  const limit = document.getElementById('limit').value;
  fetchLockers(page, limit);
});

async function fetchLockers(page, limit) {
  try {
    const response = await fetch(`http://localhost:3000/lockers?limit=${limit}&page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const data = await response.json();
    displayLockers(data.items);
    displayPagination(data.metadata);
  } catch (error) {
    console.error(error.message);
  }
}

function displayLockers(lockers) {
  const lockerInfo = document.getElementById('lockerInfo');
  lockerInfo.innerHTML = '';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr><th>ID</th><th>시작 날짜</th><th>종료 날짜</th><th>상태</th><th>스테이션 ID</th><th>사용자 ID</th></tr>`;
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  lockers.forEach((locker) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${locker.id}</td><td>${locker.startDateTime}</td><td>${locker.endDateTime}</td><td>${locker.status}</td><td>${locker.stationId}</td><td>${locker.userId}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  lockerInfo.appendChild(table);
}

function displayPagination(metadata) {
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';
  if (metadata.previousPage) {
    const prevButton = document.createElement('button');
    prevButton.textContent = '이전';
    prevButton.onclick = () => fetchLockers(metadata.previousPage, metadata.limit);
    paginationDiv.appendChild(prevButton);
  }
  if (metadata.nextPage) {
    const nextButton = document.createElement('button');
    nextButton.textContent = '다음';
    nextButton.onclick = () => fetchLockers(metadata.nextPage, metadata.limit);
    paginationDiv.appendChild(nextButton);
  }
}

// 초기 데이터 로드
fetchLockers(1, 5);
