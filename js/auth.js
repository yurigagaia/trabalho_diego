document.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide)lucide.createIcons();
  const demo={email:'artesao@artenossa.com',password:'123456',name:'Maria Ferreira'};
  localStorage.setItem('arteNossaDemo',JSON.stringify(demo));
  document.querySelectorAll('.toggle-password').forEach(btn=>btn.onclick=()=>{const input=btn.parentElement.querySelector('input'),show=input.type==='password';input.type=show?'text':'password';btn.innerHTML=`<i data-lucide="${show?'eye-off':'eye'}"></i>`;if(window.lucide)lucide.createIcons()});
  const message=(form,text,ok=false)=>{const el=form.querySelector('.form-message');el.textContent=text;el.classList.toggle('success',ok)};
  const login=document.querySelector('#login-form');
  const demoBtn=document.querySelector('#use-demo');
  if(demoBtn)demoBtn.onclick=()=>{document.querySelector('#login-email').value=demo.email;document.querySelector('#login-senha').value=demo.password;message(login,'Acesso de demonstração preenchido.',true)};
  if(login)login.onsubmit=e=>{e.preventDefault();const email=document.querySelector('#login-email').value.trim(),pass=document.querySelector('#login-senha').value;if(!login.checkValidity()){message(login,'Preencha o usuário e uma senha de pelo menos 6 caracteres.');return}if(email!==demo.email||pass!==demo.password){message(login,'Use o acesso de demonstração exibido acima.');return}localStorage.setItem('arteNossaSession',JSON.stringify({name:demo.name,email:demo.email,demo:true}));message(login,'Login realizado. Abrindo seu painel...',true);setTimeout(()=>location.href='dashboard.html',650)};
  const register=document.querySelector('#register-form');if(register)register.onsubmit=e=>{e.preventDefault();if(!register.checkValidity()){message(register,'Confira os campos obrigatórios e aceite os termos.');return}const pass=document.querySelector('#reg-senha').value,confirm=document.querySelector('#reg-senha2').value;if(pass!==confirm){message(register,'As senhas não coincidem.');return}localStorage.setItem('arteNossaUser',JSON.stringify({name:document.querySelector('#reg-nome').value,email:document.querySelector('#reg-email').value,user:document.querySelector('#reg-user').value}));message(register,'Conta criada com sucesso. Abrindo seu painel...',true);setTimeout(()=>location.href='dashboard.html',700)};
  const forgot=document.querySelector('#forgot');if(forgot)forgot.onclick=e=>{e.preventDefault();message(login,'Para a demonstração, use a senha 123456.',true)};
});
