async function deleteAccount() {
  try {
    const response = await fetch(`http://localhost:3000/users/delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        Authority: localStorage.getItem('authority'),
      },
    });
    if (response.status === 204) {
      localStorage.removeItem('accessToken');
      alert('계정이 삭제되었습니다.');
      window.location.href = '../index.html';
    }
  } catch (error) {
    console.error('계정 삭제중 에러가 발생했습니다.:', error);
  }
}

async function fetchRentedLockers() {
  try {
    const response = await fetch(`http://localhost:3000/users/mine`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        authority: localStorage.getItem('authority'),
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
    return await response.json();
  } catch (error) {
    console.error('빌린 사물함을 불러오는 중에 에러가 발생했습니다.:', error);
    alert(error.message);
  }
}

function userIsLoggedIn(authority) {
  return localStorage.getItem('accessToken') !== null; // Example check
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!userIsLoggedIn()) {
    alert('현재 페이지를 보려면 로그인을 하셔야 합니다.');
    window.location.href = '../public/sign-in.html'; // Redirect to sign-in page
    return;
  }

  try {
    // const userEmail = localStorage.getItem('email'); // You need to implement this
    const posts = await fetchUserPosts();
    const lockers = await fetchRentedLockers();
    const lockerList = document.getElementById('rentedLockers');

    lockers.forEach((locker) => {
      // Create a button element for each locker
      const lockerButton = document.createElement('button');
      lockerButton.className = 'locker-button';
      lockerButton.innerHTML = `
        Locker Number: ${locker.id}<br>
        Station Name: ${locker.stationName}<br>
        Rental Period: ${new Date(locker.startDateTime).toLocaleString()}
      `;
      // When the button is clicked, return the locker's ID
      lockerButton.onclick = function () {
        returnLocker(locker.id); // This function needs to be defined elsewhere
      };

      // Append the button to the list
      lockerList.appendChild(lockerButton);
    });
  } catch (error) {
    console.error('대여 중인 락커를 불러오는데 실패했습니다.:', error);
    document.getElementById('rentedLockers').innerHTML = '<p>Error loading lockers.</p>';
  }
});

async function returnLocker(lockerId) {
  try {
    const userConfirmed = confirm('정말로 사용중인 라커를 반환하시겠습니까?');

    if (userConfirmed) {
      const endDateTime = new Date();
      const requestBody = {
        id: lockerId,
        endDateTime: endDateTime,
        payment: true,
      };
      const response = await fetch(`http://localhost:3000/lockers/return`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Include the authorization header with the bearer token
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          Authority: localStorage.getItem('authority'),
        },
        body: JSON.stringify(requestBody),
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
    console.error('락커를 반환하는 도중에 에러가 발생했습니다.:', error);
    alert('릭카 반환 실패');
  }
}
document.getElementById('deleteAccount').addEventListener('click', async function (event) {
  event.preventDefault();
  const userConfirmed = confirm('정말로 계정을 지우시겠습니까?');
  if (userConfirmed) {
    await deleteAccount(localStorage.getItem('id'));
  }
});

async function fetchUserPosts() {
  try {
    const response = await fetch(`http://localhost:3000/posts/user-posts`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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

    const posts = await response.json();
    displayPosts(posts);
  } catch (error) {
    console.error('error:', error.message);
  }
}

function displayPosts(posts) {
  const postsContainer = document.getElementById('postsContainer');

  posts.forEach((post) => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <button onclick="fetchAndDisplayComments(${post.id})">댓글 보기</button>
      <div id="comments-${post.id}" class="comments"></div>
    `;
    postsContainer.appendChild(postElement);
  });
}

async function fetchAndDisplayComments(postId) {
  try {
    const response = await fetch(`http://localhost:3000/comments?postId=${postId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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

    const comments = await response.json();
    const commentsContainer = document.getElementById(`comments-${postId}`);
    commentsContainer.innerHTML = ''; // 이전에 표시된 댓글이 있을 경우 초기화
    comments.forEach((comment) => {
      const commentElement = document.createElement('div');
      commentElement.className = 'comment';
      commentElement.innerHTML = `<p>${comment.author || 'admin'}: ${comment.content}</p>`;
      commentsContainer.appendChild(commentElement);
    });
  } catch (error) {
    console.error('댓글 로딩 중 에러:', error.message);
    alert(error.message);
  }
}
