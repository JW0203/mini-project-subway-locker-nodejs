async function signUp(email, password, role) {
  try {
    const baseUrl = 'http://localhost:3000/auth/';
    const signUpUrl = role === 'admin' ? baseUrl + 'admin/sign-up/' : baseUrl + 'sign-up/';

    const response = await fetch(signUpUrl, {
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
    alert('회원가입이 성공적으로 완료되었습니다.');
  } catch (error) {
    console.error('회원가입 중 에러가 발생했습니다:', error);
    alert(error.message);
  }
}

document.getElementById('signUpForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const role = document.getElementById('role').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  if (password !== passwordConfirm) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  await signUp(email, password, role);
});
