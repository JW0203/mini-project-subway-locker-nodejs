const IP_ADDRESS = 'localhost';

document.getElementById('signInForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const requiredAuthority = urlParams.get('authority');
  const redirectAddress = urlParams.get('redirect');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Make a request to your backend to authenticate the user
  try {
    const response = await fetch(`http://${IP_ADDRESS}:3000/auth/sign-in/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
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
    if (data.authority !== requiredAuthority) {
      alert('You are not authorized to access this page.');
    }
    // Check if authenticated user is admin
    if (data.authority === requiredAuthority && redirectAddress) {
      window.location.href = `${redirectAddress}`;
      localStorage.setItem('accessToken', data.accessToken);
    }
  } catch (error) {
    console.error('로그인 중 에러가 발생했습니다.:', error);
    alert(error.message);
  }
});
