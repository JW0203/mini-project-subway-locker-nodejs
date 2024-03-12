const goHome = document.getElementById('goHome');
if (goHome) {
  goHome.addEventListener('click', function () {
    window.location.href = './index.html';
  });
}
const goSignIn = document.getElementById('goSignIn');
if (goSignIn) {
  goSignIn.addEventListener('click', function () {
    window.location.href = '../public/sign-in.html';
  });
}

const goAdmin = document.getElementById('goAdmin');
if (goAdmin) {
  const authority = 'admin';
  const redirectUrl = 'admin.html';
  goAdmin.addEventListener('click', function () {
    if (userIsLoggedInUserAuthority(authority)) {
      window.location.href = `./public/admin.html`;
    }
    if (!userIsLoggedInUserAuthority(authority)) {
      window.location.href = `./public/sign-in.html?authority=${authority}&redirect=${redirectUrl}`;
    }
  });
}

const goMessageBoard = document.getElementById('goMessageBoard');
if (goMessageBoard) {
  goMessageBoard.addEventListener('click', function () {
    window.location.href = `./public/message-board.html`;
  });
}

function userIsLoggedInUserAuthority(authority) {
  // Implement your logic to check if the user is logged in
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return false;
  }
  if (accessToken) {
    const decodedToken = parseJwt(accessToken);
    const authorityFromToken = decodedToken.authority;
    return authorityFromToken === authority;
  }
}

function parseJwt(token) {
  // JWT는 세 부분으로 구성되어 있으며, 각 부분은 점('.')으로 구분됩니다.
  const base64Url = token.split('.')[1]; // 페이로드 부분을 추출합니다.
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Base64 URL 인코딩을 일반 Base64로 변환합니다.
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        // 디코딩된 문자열을 각 문자에 대한 URI 컴포넌트로 변환합니다.
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload); // JSON 문자열을 객체로 변환합니다.
}
