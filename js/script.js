// Alterna o foco visual entre os cartões de login e cadastro
document.querySelectorAll('[data-switch]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const cards = document.querySelectorAll('.auth-card');
    cards.forEach((card) => card.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  });
});

// Validação e redirecionamento de cadastro para o Painel do Artesão
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const senha = document.getElementById('reg-senha').value;
    const confirmar = document.getElementById('reg-senha2').value;

    if (senha !== confirmar) {
      alert('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    alert('Conta de artesão criada com sucesso! Redirecionando para o seu Painel...');
    window.location.href = 'dashboard.html';
  });
}

// Redirecionamento de login para o Painel do Artesão
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Login realizado! Redirecionando para o seu Painel de Artesão...');
    window.location.href = 'dashboard.html';
  });
}
