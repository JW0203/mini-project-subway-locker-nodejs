import IP_ADDRESS from './config/config';
let currentPage = 1;
const limit = 5; // 페이지당 게시물 수

// 모달 요소 가져오기
var modal = document.getElementById('message-modal');

// 모달을 여는 버튼 가져오기
var btn = document.getElementById('write-message-btn');

// 모달을 닫는 <span> 요소 가져오기
var span = document.getElementsByClassName('close-btn')[0];

// 사용자가 버튼 클릭 시 모달 열기
btn.onclick = function () {
  if (localStorage.getItem('accessToken') === null) {
    // 로그인 페이지로 리다이렉트
    const redirectUrl = `message-board.html`;
    const authority = 'user';
    window.location.href = `../public/sign-in.html?authority=${authority}&redirect=${redirectUrl}`;
  }
  if (localStorage.getItem('accessToken')) {
    // 사용자가 로그인한 경우, 메시지 모달 표시
    modal.style.display = 'block';
  }
};

// 사용자가 <span> (x) 클릭 시 모달 닫기
span.onclick = function () {
  modal.style.display = 'none';
};

// 사용자가 모달 외부를 클릭할 때 모달 닫기
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// 폼 제출 처리 (예시)
document.getElementById('message-form').onsubmit = async function (event) {
  event.preventDefault(); // 실제 폼 제출 방지
  try {
    const response = await fetch(`{IP_ADDRESS}/posts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        title: document.getElementById('message-title').value,
        content: document.getElementById('message-content').value,
      }),
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
    console.error('메시지 게시 중 에러 발생:', error);
    alert(error.message);
  }
  modal.style.display = 'none'; // 제출 후 모달 닫기
  document.getElementById('message-title').value = ''; // 폼 필드 초기화
  document.getElementById('message-content').value = '';
};

async function fetchPosts(page) {
  const apiUrl = `${IP_ADDRESS}/posts/?limit=${limit}&page=${page}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    return null;
  }
}

function displayPosts(posts) {
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = ''; // 이전 게시물 지우기
  posts.forEach((post) => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
            <h3 class="post-title">${post.title}</h3>
            <p class="post-content">${post.content}</p>
            <p class="post-user">사용자 ID: ${post.userId}</p>
        `;
    postsContainer.appendChild(postElement);
  });
}

function updatePagination(metadata) {
  const pageInfo = document.getElementById('page-info');
  pageInfo.textContent = `페이지 ${metadata.page} / ${metadata.totalPages || '알 수 없음'}`;

  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  prevButton.disabled = metadata.page === 1;
  nextButton.disabled = metadata.page === metadata.totalPages;
}

async function loadPosts(page) {
  const data = await fetchPosts(page);
  if (data) {
    displayPosts(data.items);
    updatePagination(data.metadata);
    currentPage = page; // 현재 페이지 업데이트
  }
}

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) loadPosts(currentPage - 1);
});

document.getElementById('next-page').addEventListener('click', () => {
  loadPosts(currentPage + 1);
});

document.getElementById('search-btn').addEventListener('click', async () => {
  const email = document.getElementById('search-email').value;
  if (email) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '<p>검색 중...</p>';
    try {
      const response = await fetch(`${IP_ADDRESS}/posts/user-email/${email}`);
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
      postsContainer.innerHTML = ''; // 검색 결과로 업데이트
      posts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
          <h3 class="post-title">${post.title}</h3>
          <p class="post-content">${post.content}</p>
          <p class="post-user">사용자 ID: ${post.userId}</p>
          <small>${new Date(post.createdAt).toLocaleString()}</small>
        `;
        postsContainer.appendChild(postElement);
      });
    } catch (error) {
      console.error('검색 오류:', error);
      alert(error.message);
      postsContainer.innerHTML = '<p>검색 결과를 불러오는 데 실패했습니다.</p>';
    }
  } else {
    alert('이메일을 입력해주세요.');
  }
});

// 초기 게시물 로드
loadPosts(currentPage);
