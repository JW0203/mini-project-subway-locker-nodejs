//------ Station
import IP_ADDRESS from './config/config';
async function makeStations(stationsData) {
  try {
    const token = localStorage.getItem('accessToken'); // 인증 토큰 가져오기

    const response = await fetch(`${IP_ADDRESS}/stations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // 인증 토큰 사용
      },
      body: JSON.stringify(stationsData),
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
    const createdStations = await response.json();
    console.log('생성된 역:', createdStations);
  } catch (error) {
    console.error('역 추가 중 에러가 발생했습니다:', error.message);
    alert(error.message); // 에러 메세지를 알림으로 표시
  }
}

async function modifyStation(modifyData) {
  try {
    const token = localStorage.getItem('accessToken'); // 인증 토큰 가져오기

    const { id, data } = modifyData;
    const response = await fetch(`${IP_ADDRESS}/stations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // 인증 토큰 사용
      },
      body: JSON.stringify(data),
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
    const revisedStation = await response.json();
    console.log('수정된 역:', revisedStation);
  } catch (error) {
    console.error('역 정보 수정 중 에러가 발생했습니다:', error.message);
    alert(error.message);
  }
}

// make station
document.getElementById('addStation').addEventListener('click', function () {
  const container = document.getElementById('stationInputsContainer');
  const newInput = document.createElement('div');
  newInput.classList.add('stationInput');

  // Create the input elements directly
  const inputName = document.createElement('input');
  inputName.setAttribute('type', 'text');
  inputName.setAttribute('name', 'stationName');
  inputName.setAttribute('placeholder', '역 이름');
  inputName.required = true;

  const inputLatitude = document.createElement('input');
  inputLatitude.setAttribute('type', 'number');
  inputLatitude.setAttribute('name', 'stationLatitude');
  inputLatitude.setAttribute('placeholder', '위도');
  inputLatitude.setAttribute('step', 'any');
  inputLatitude.required = true;

  const inputLongitude = document.createElement('input');
  inputLongitude.setAttribute('type', 'number');
  inputLongitude.setAttribute('name', 'stationLongitude');
  inputLongitude.setAttribute('placeholder', '경도');
  inputLongitude.setAttribute('step', 'any');
  inputLongitude.required = true;

  // Create the remove button
  const removeBtn = document.createElement('button');
  removeBtn.setAttribute('type', 'button');
  removeBtn.classList.add('removeStation');
  removeBtn.textContent = 'Remove';

  // Append the created elements to the newInput div
  newInput.appendChild(inputName);
  newInput.appendChild(inputLatitude);
  newInput.appendChild(inputLongitude);
  newInput.appendChild(removeBtn);

  // Append the newInput div to the container
  container.appendChild(newInput);

  // Add event listener to the remove button
  removeBtn.addEventListener('click', function () {
    newInput.remove();
  });
});

document.getElementById('stationsAdd').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const stationsData = [];
  const names = formData.getAll('stationName');
  const latitudes = formData.getAll('stationLatitude');
  const longitudes = formData.getAll('stationLongitude');

  names.forEach((name, index) => {
    stationsData.push({
      name: name,
      latitude: parseFloat(latitudes[index]),
      longitude: parseFloat(longitudes[index]),
    });
  });

  await makeStations(stationsData);
});

async function deleteStation(stationId) {
  try {
    if (confirm('이 정류장을 정말 삭제하시겠습니까?')) {
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${IP_ADDRESS}/stations/${stationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
    }
  } catch (error) {
    console.error('역 삭제 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('stationsRevise').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const stationsData = [];
  const id = Number(formData.get('stationId')) || null;
  const name = formData.get('stationName') || null;
  const latitude = formData.get('stationLatitude') || null;
  const longitude = formData.get('stationLongitude') || null;

  const modifyData = {
    id,
    data: {
      name,
      latitude,
      longitude,
    },
  };

  await modifyStation(modifyData);
});

document.getElementById('stationsDelete').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('stationId') || null;

  await deleteStation(id);
});

async function restoreStation(stationId) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IP_ADDRESS}/stations/restore/${stationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
  } catch (error) {
    console.error('역 복원 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('stationRestore').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('stationId') || null;

  await restoreStation(id);
});

//------ Locker
async function makeLockers(lockersData) {
  try {
    const token = localStorage.getItem('accessToken');
    const authority = localStorage.getItem('authority');
    const response = await fetch(`${IP_ADDRESS}/lockers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Authority: `${authority}`,
      },
      body: JSON.stringify(lockersData),
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
    const results = await response.json();
    console.log('사물함 생성 결과:', results);
  } catch (error) {
    console.error('사물함 추가 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('makeLockers').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const stationId = Number(formData.get('stationId'));
  const numberLockers = Number(formData.get('numberLockers'));
  const lockersData = {
    stationId,
    numberLockers,
  };

  await makeLockers(lockersData);
});

async function modifyLocker(lockersData) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IP_ADDRESS}/lockers/management`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(lockersData),
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
    const results = await response.json();
    console.log('사물함 수정 결과:', results);
  } catch (error) {
    console.error('사물함 정보 수정 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}
document.getElementById('reviseLocker').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const lockerId = Number(formData.get('lockerId'));
  const status = formData.get('lockerStatus');
  const lockersData = {
    lockerId,
    status,
  };
  await modifyLocker(lockersData);
});

async function deleteLocker(id) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IP_ADDRESS}/lockers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
    console.log('사물함 삭제 성공');
  } catch (error) {
    console.error('사물함 삭제 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('deleteLocker').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('lockerId');
  await deleteLocker(id);
});

async function restoreLocker(id) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IP_ADDRESS}/lockers/restore/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
    const results = await response.json();
    console.log('사물함 복구 결과:', results);
  } catch (error) {
    console.error('사물함 복구 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('restoreLocker').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('lockerId');

  await restoreLocker(id);
});

document.getElementById('goLockerSearch').addEventListener('click', function () {
  const redirectUrl = 'search-lockers.html';
  window.location.href = `../public/${redirectUrl}`;
});

document.getElementById('searchLockerId').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('lockerId');
  const resultDisplay = document.getElementById('search-result');
  resultDisplay.innerHTML = '';
  try {
    const response = await fetch(`${IP_ADDRESS}/lockers/${id}`, {
      method: 'GET',
    }); // Use the appropriate URL for your API
    const contentType = response.headers.get('Content-Type');
    if (!response.ok && contentType && contentType.includes('application/json')) {
      const errData = await response.json();
      throw new Error(errData.message);
    }
    if (!response.ok && contentType && contentType.includes('text/html')) {
      const errData = await response.text();
      throw new Error(errData);
    }

    const lockerData = await response.json();
    // Update the DOM with the locker information
    if (resultDisplay) {
      const lockerCard = document.createElement('div');
      lockerCard.className = 'locker-card'; // Use a class to style your card

      // Use a template literal to build the inner HTML, including distinctive labels and formatting
      lockerCard.innerHTML = `
        <h3>Locker ID: ${lockerData.id}</h3>
        <p><strong>Status:</strong> ${lockerData.status}</p>
        <p><strong>Station ID:</strong> ${lockerData.stationId}</p>
        <p><strong> User's ID in using:</strong> ${lockerData.userId}</p>
        <p><strong>Start Date Time:</strong> ${lockerData.startDateTime}</p>
        <p><strong>End Date Time:</strong> ${lockerData.endDateTime}</p>
        <p><strong>Start Date Time:</strong> ${lockerData.startDateTime}</p>
      `;

      resultDisplay.appendChild(lockerCard);
    }
    if (!resultDisplay) {
      console.error('resultDisplay 요소가 DOM에 존재하지 않습니다');
    }
  } catch (error) {
    console.error('락커를 찾는 중 에러가 발생했습니다.:', error);
    alert(error.message);
  }
});

//------ Post

async function deletePost(id) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IP_ADDRESS}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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

    alert('게시물 삭제 성공');
  } catch (error) {
    console.error('게시물 삭제 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('deletePost').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('postId');
  await deletePost(id);
});

async function restorePost(id) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IP_ADDRESS}/posts/restore/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
    const results = await response.json();
    console.log('게시물 복구 결과:', results);
  } catch (error) {
    console.error('게시물 복구 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('restorePost').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('postId');
  await restorePost(id);
});

//------ Comment
async function addComment(data) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IP_ADDRESS}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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
    const results = await response.json();
    console.log('댓글 추가 결과:', results);
  } catch (error) {
    console.error('댓글 추가 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('addComment').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const postId = Number(formData.get('postId'));
  const content = formData.get('commentContent');
  const data = {
    postId,
    content,
  };
  await addComment(data);
});

async function reviseComment(id, data) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IP_ADDRESS}/comments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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
    const results = await response.json();
    console.log('댓글 수정 결과:', results);
  } catch (error) {
    console.error('댓글 수정 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('reviseComment').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('commentId');
  const content = formData.get('commentContent');
  const data = {
    content,
  };
  await reviseComment(id, data);
});

async function deleteComment(id) {
  try {
    const token = localStorage.getItem('accessToken');
    const authority = localStorage.getItem('authority');
    const response = await fetch(`${IP_ADDRESS}/comments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Authority: `${authority}`,
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
    alert('댓글 삭제 성공');
  } catch (error) {
    console.error('댓글 삭제 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('deleteComment').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('commentId');
  await deleteComment(id);
});

async function restoreComment(id) {
  try {
    const token = localStorage.getItem('accessToken');
    const authority = localStorage.getItem('authority');
    const response = await fetch(`${IP_ADDRESS}/comments/restore/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Authority: `${authority}`,
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
    const results = await response.json();
    console.log('댓글 복구 결과:', results);
  } catch (error) {
    console.error('댓글 복구 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}
document.getElementById('restoreComment').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('commentId');
  await restoreComment(id);
});

//------ User
async function deleteUser(id) {
  try {
    const response = await fetch(`${IP_ADDRESS}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        Authority: localStorage.getItem('authority'),
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

    console.log('사용자 삭제 성공');
  } catch (error) {
    console.error('사용자 삭제 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('deleteUser').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('userId');
  await deleteUser(id);
});

async function restoreUser(id) {
  try {
    const response = await fetch(`${IP_ADDRESS}/users/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        Authority: localStorage.getItem('authority'),
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
    const results = await response.json();
    console.log('사용자 복구 결과:', results);
    alert('사용자 복구 성공');
  } catch (error) {
    console.error('사용자 복구 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('restoreUser').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('userId');
  await restoreUser(id);
});
