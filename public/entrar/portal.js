/* This public shell contains no premium guide data. The database authorizes every load. */
(async function(){
  const root=document.getElementById('portal');
  const cfg=window.GUIA_SUPABASE;
  const api=window.GuiaSupabaseClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'guia-rdc-auth'}});
  window.GUIA_AUTH_CLIENT=api;
  let view='login',busy=false,started=false,recovery=location.hash.includes('type=recovery');
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={login:['Acesse seu guia','Entre com o mesmo e-mail usado na compra.','Entrar'],signup:['Primeiro acesso','Crie sua conta com o e-mail informado na Hotmart. Depois, confirme o e-mail recebido.','Criar conta'],forgot:['Recuperar acesso','Informe seu e-mail para receber as instruções.','Enviar instruções'],recovery:['Escolha sua senha','Defina uma senha com pelo menos 8 caracteres.','Salvar senha']};
  function frame(content){root.innerHTML=`<div class="portal-wrap"><a class="portal-brand" href="./">Info Ebooks<span>GUIA INTERATIVO · RDC 1.002/2025</span></a><div class="portal-layout"><section class="portal-intro"><p class="portal-eyebrow">MENOS DÚVIDAS. MAIS ORGANIZAÇÃO.</p><h1>Seu próximo passo<br>mais claro.</h1><p>Entenda os cuidados, confira sua rotina e organize o que precisa ser feito.</p><div class="portal-highlights"><span><b>51</b> indicadores explicados</span><span><b>7</b> trilhas de consulta</span></div><p class="portal-footnote">Compra única · 12 meses de acesso ao guia<br>O e-book é entregue separadamente pela Hotmart.</p></section><section class="portal-card">${content}</section></div><footer class="portal-footer">Material educativo independente. Não certifica conformidade sanitária. Não inclua dados de pacientes.</footer></div>`;}
  function message(text){const el=document.getElementById('portal-message');if(el)el.textContent=text;}
  function form(mode='login'){
    view=mode;const [title,hint,label]=labels[mode];
    frame(`<p class="portal-eyebrow">ÁREA DO COMPRADOR</p><h2>${title}</h2><p>${hint}</p><form id="portal-form">${mode!=='recovery'?'<label>E-mail<input name="email" type="email" autocomplete="email" required></label>':''}${['login','signup','recovery'].includes(mode)?`<label>Senha<input name="password" type="password" minlength="${mode==='login'?1:8}" autocomplete="${mode==='login'?'current-password':'new-password'}" required></label>`:''}<button class="button primary portal-submit" type="submit">${label}</button></form><p id="portal-message" role="status" aria-live="polite"></p><div class="portal-links">${mode!=='login'?'<button data-view="login">Já tenho conta</button>':'<button data-view="signup">Primeiro acesso</button><button data-view="forgot">Esqueci minha senha</button>'}</div><div class="portal-note">A conta usa o e-mail da compra. Comprar somente o e-book não libera o guia.</div>`);
  }
  async function script(path){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=path;s.onload=resolve;s.onerror=reject;document.head.append(s);});}
  async function check(){
    if(busy||started)return;busy=true;
    try{
      const {data:{user},error}=await api.auth.getUser();
      if(error||!user){form(recovery?'recovery':'login');return;}
      if(recovery){form('recovery');return;}
      frame('<h2>Conferindo seu acesso…</h2><p>Estamos verificando a compra e a validade do guia.</p>');
      const access=await api.rpc('guia_access_status');
      if(access.error)throw access.error;
      if(!access.data?.active){
        const msgs={confirm_email:'Confirme seu e-mail antes de acessar.',expired:'Seu período de acesso terminou.',revoked:'O acesso desta compra foi encerrado.',suspended:'A compra está em análise.',pending:'Aguardando a confirmação do pagamento.',no_purchase:'Não encontramos uma compra aprovada do guia para este e-mail.'};
        frame(`<p class="portal-eyebrow">${esc(user.email)}</p><h2>Seu acesso ao guia</h2><p>${msgs[access.data?.status]||msgs.no_purchase}</p><p>Se você acabou de pagar, aguarde a confirmação da Hotmart e confira novamente. Se usou outro e-mail na compra, entre com ele.</p><button class="button primary" data-check>Verificar novamente</button><div class="portal-links"><button data-logout>Entrar com outro e-mail</button></div><p id="portal-message" role="status"></p>`);return;
      }
      const result=await api.rpc('guia_paid_content');
      if(result.error||!result.data?.guide||!result.data?.roi)throw new Error('Conteúdo indisponível');
      window.GUIDE_DATA=result.data.guide;window.ROI_DATA=result.data.roi;
      const template=await fetch('./shell.html',{cache:'no-store'});if(!template.ok)throw new Error('Interface indisponível');
      document.body.innerHTML=await template.text();started=true;
      await script('./core.js');await script('./cloud-core.js');await script('./app.js');
      // Recheck server permissions while the guide is open; do not cache paid payloads.
      const expires=Date.parse(result.data.access.expires_at);
      setTimeout(()=>location.reload(),Math.max(1000,Math.min(expires-Date.now(),2147483647)));
      setInterval(async()=>{const r=await api.rpc('guia_access_status');if(r.error||!r.data?.active)location.reload();},60000);
    }catch{frame('<h2>Não foi possível verificar o acesso.</h2><p>Confira sua conexão e tente novamente. Seus registros continuam vinculados à sua conta.</p><button class="button primary" data-check>Tentar novamente</button><div class="portal-links"><button data-logout>Sair da conta</button></div>');}
    finally{busy=false;}
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.view)form(b.dataset.view);
    if(b.hasAttribute('data-check'))await check();
    if(b.hasAttribute('data-logout')){await api.auth.signOut({scope:'local'});location.reload();}
  });
  document.addEventListener('submit',async e=>{
    if(e.target.id!=='portal-form')return;e.preventDefault();if(busy)return;busy=true;
    const fields=new FormData(e.target),email=String(fields.get('email')||'').trim(),password=String(fields.get('password')||'');
    const button=e.target.querySelector('button');button.disabled=true;message('Aguarde…');
    try{
      const back=new URL('./',location.href).href;let r;
      if(view==='login')r=await api.auth.signInWithPassword({email,password});
      if(view==='signup')r=await api.auth.signUp({email,password,options:{emailRedirectTo:back}});
      if(view==='forgot')r=await api.auth.resetPasswordForEmail(email,{redirectTo:back});
      if(view==='recovery')r=await api.auth.updateUser({password});
      if(r.error)throw r.error;
      if(view==='signup'||view==='forgot'){e.target.reset();message('Se a solicitação puder ser concluída, você receberá um e-mail com as instruções.');}
      else{recovery=false;busy=false;await check();}
    }catch{message(view==='login'?'Não foi possível entrar. Confira e-mail e senha.':'Não foi possível concluir. Tente novamente em instantes.');}
    finally{busy=false;button.disabled=false;}
  });
  api.auth.onAuthStateChange((event,session)=>{
    if(event==='PASSWORD_RECOVERY')recovery=true;
    if(started&&event==='SIGNED_OUT'){location.reload();return;}
    if(event==='PASSWORD_RECOVERY'||event==='SIGNED_IN')setTimeout(()=>check(),0);
  });
  await check();
})();
