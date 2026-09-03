document.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide)lucide.createIcons();
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const cards=[...document.querySelectorAll('.product')],buttons=[...document.querySelectorAll('.filters button')];
  const input=document.querySelector('#search-input'),count=document.querySelector('#count'),empty=document.querySelector('#empty');let filter='todos';
  const getCart=()=>JSON.parse(localStorage.getItem('arteNossaCart')||'[]');
  const saveCart=cart=>{localStorage.setItem('arteNossaCart',JSON.stringify(cart));updateCount()};
  const updateCount=()=>{const el=document.querySelector('#cart-count');if(el)el.textContent=getCart().reduce((n,i)=>n+i.qty,0)};
  const money=text=>Number(text.replace(/[^0-9,]/g,'').replace(',','.'));
  function update(){let n=0,q=norm(input.value.trim());cards.forEach(c=>{const text=norm(c.dataset.search+' '+c.textContent),show=(filter==='todos'||text.includes(norm(filter)))&&(!q||text.includes(q));c.hidden=!show;if(show)n++});count.textContent=`${n} ${n===1?'peça encontrada':'peças encontradas'}`;empty.hidden=n!==0}
  buttons.forEach(b=>b.onclick=()=>{buttons.forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;update()});
  input.oninput=update;document.querySelector('#search-form').onsubmit=e=>{e.preventDefault();update();document.querySelector('#vitrine').scrollIntoView()};
  cards.forEach((card,index)=>{const footer=card.querySelector('.info footer'),oldIcon=footer.querySelector('svg'),button=document.createElement('button');if(oldIcon)oldIcon.remove();button.className='add-cart';button.innerHTML='<i data-lucide="plus"></i> Carrinho';footer.append(button);const photo=card.querySelector('.photo');photo.removeAttribute('target');photo.setAttribute('href','#');const add=e=>{e.preventDefault();const item={id:index+1,name:card.querySelector('h3').textContent,artisan:card.querySelector('.info small').textContent,price:money(card.querySelector('.info strong').textContent),image:card.querySelector('img').getAttribute('src'),qty:1};const cart=getCart(),found=cart.find(x=>x.id===item.id);found?found.qty++:cart.push(item);saveCart(cart);toast.textContent=`${item.name} foi para o carrinho`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)};button.onclick=add;photo.onclick=add});
  const toast=document.createElement('div');toast.className='cart-toast';toast.setAttribute('role','status');document.body.append(toast);updateCount();update();
  const menu=document.querySelector('.menu'),nav=document.querySelector('.topbar nav');menu.onclick=()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.innerHTML=`<i data-lucide="${open?'x':'menu'}"></i>`;if(window.lucide)lucide.createIcons()};nav.querySelectorAll('a').forEach(a=>a.onclick=()=>nav.classList.remove('open'));document.querySelector('#year').textContent=new Date().getFullYear();if(window.lucide)lucide.createIcons();
});
