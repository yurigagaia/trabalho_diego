// Alterna o foco visual entre os cartões de login e cadastro
document.querySelectorAll('[data-switch]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const cards = document.querySelectorAll('.auth-card');
    cards.forEach((card) => card.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  });
});

// Exemplo simples de validação de senha no cadastro
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

    alert('Conta criada com sucesso! (exemplo — conecte a um backend para salvar de verdade)');
    registerForm.reset();
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Login enviado! (exemplo — conecte a um backend para autenticar de verdade)');
  });
}
