(function(){'use strict';
  const samples={espaco:{src:'./assets/espaco.jpg',alt:'Página de amostra: espaço físico e esquema do fluxo entre área suja e área limpa'},registros:{src:'./assets/registros.jpg',alt:'Página de amostra: modelos de plano de ação e registro de cada carga'}};
  const image=document.getElementById('sample-image'),dialog=document.getElementById('sample-dialog'),large=document.getElementById('large-sample');
  let returnFocus=null;
  document.addEventListener('click',e=>{
    const sample=e.target.closest('[data-sample]');
    if(sample){const selected=samples[sample.dataset.sample];if(!selected)return;image.src=selected.src;image.alt=selected.alt;document.querySelectorAll('[data-sample]').forEach(b=>{const active=b===sample;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
    if(e.target.closest('[data-enlarge]')){returnFocus=document.activeElement;large.src=image.src;large.alt=image.alt;if(typeof dialog.showModal==='function')dialog.showModal();else window.open(image.src,'_blank','noopener');}
    if(e.target.closest('[data-close]')||e.target===dialog)dialog.close();
  });
  dialog.addEventListener('close',()=>returnFocus?.focus());
})();
