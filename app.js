// ── CHART DEFAULTS ──
Chart.defaults.color='#555570';
Chart.defaults.font.family='JetBrains Mono';
Chart.defaults.font.size=10;
const CH={};

function mkBar(id,labels,data,color,hi=-1){
  if(CH[id])CH[id].destroy();
  const ctx=document.getElementById(id).getContext('2d');
  CH[id]=new Chart(ctx,{type:'bar',data:{labels,datasets:[{data,backgroundColor:data.map((_,i)=>i===hi?color:color+'44'),borderColor:data.map((_,i)=>i===hi?color:color+'77'),borderWidth:1.5,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' P = '+c.raw.toFixed(5)}}},scales:{x:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#555570'}},y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#555570'},beginAtZero:true}}}});
}
function mkLine(id,xs,ys,color){
  if(CH[id])CH[id].destroy();
  const ctx=document.getElementById(id).getContext('2d');
  const g=ctx.createLinearGradient(0,0,0,220);
  g.addColorStop(0,color+'55');g.addColorStop(1,color+'05');
  CH[id]=new Chart(ctx,{type:'line',data:{labels:xs.map(x=>x.toFixed(1)),datasets:[{data:ys,borderColor:color,backgroundColor:g,borderWidth:2.5,pointRadius:0,fill:true,tension:0.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{title:c=>'x='+c[0].label,label:c=>' f(x)='+c.raw.toFixed(5)}}},scales:{x:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#555570',maxTicksLimit:8}},y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#555570'},beginAtZero:true}}}});
}

// ── MATH ──
function fact(n){n=Math.floor(Math.abs(n));if(n>20)return Infinity;if(n<=1)return 1;let r=1;for(let i=2;i<=n;i++)r*=i;return r;}
function C(n,k){if(k>n||k<0)return 0;return fact(n)/(fact(k)*fact(n-k));}
function bP(n,k,p){return C(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);}
function poiP(l,k){return(Math.pow(l,k)*Math.exp(-l))/fact(k);}
function norP(x,m,s){return(1/(s*Math.sqrt(2*Math.PI)))*Math.exp(-0.5*Math.pow((x-m)/s,2));}

function flash(id){const el=document.getElementById(id);el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');}

// ── TABS & NAV ──
function toggleMenu() {
  const nav = document.getElementById('mobile-nav');
  if(nav) nav.classList.toggle('nav-open');
}

const TABS=['home','usage','binom','poisson','normal','rv','rts'];
function goTab(id){
  // Close mobile menu if open
  const nav = document.getElementById('mobile-nav');
  if (nav && nav.classList.contains('nav-open')) nav.classList.remove('nav-open');

  TABS.forEach(t=>{
    const el=document.getElementById(t);
    if(el){
      el.style.display=t===id?'grid':'none';
      if(t===id){el.style.animation='none';el.offsetHeight;el.style.animation='fadeSlideIn 0.3s ease';}
    }
  });
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',TABS[i]===id));
  window.scrollTo({top:0,behavior:'smooth'});
}

// ════════ BINOMIAL ════════
let BS={n:'',p:'',k:'',act:'n'};
const BFL={n:'n — NUMBER OF TRIALS',p:'p — PROBABILITY OF SUCCESS (0 to 1)',k:'k — NUMBER OF SUCCESSES'};

function bSel(f){
  BS.act=f;
  ['n','p','k'].forEach(x=>document.getElementById('bft-'+x).className='ftab'+(x===f?' a1':''));
  document.getElementById('b-sf').textContent=BFL[f];
  document.getElementById('b-sv').textContent=BS[f]||'0';
}
function bK(k){
  let v=BS[BS.act];
  if(k==='back')v=v.slice(0,-1)||'';
  else if(k==='clr')v='';
  else if(k==='next'){const o=['n','p','k'];bSel(o[(o.indexOf(BS.act)+1)%3]);return;}
  else if(k==='.'){if(!v.includes('.'))v+=k;}
  else{v=v==='0'||v===''?k:v+k;}
  BS[BS.act]=v;
  document.getElementById('b-sv').textContent=v||'0';
  const m={n:'bsn',p:'bsp',k:'bsk'};
  document.getElementById(m[BS.act]).textContent=v||'—';
}
function bCalc(){
  const n=parseFloat(BS.n),p=parseFloat(BS.p),k=parseFloat(BS.k);
  if(isNaN(n)||isNaN(p)||isNaN(k)){alert('Enter all 3 values: n, p, k');return;}
  if(p<0||p>1){alert('p must be between 0 and 1');return;}
  const ni=Math.round(n),ki=Math.round(k);
  if(ki>ni){alert('k cannot be greater than n');return;}
  const cn=C(ni,ki),pk=Math.pow(p,ki),qnk=Math.pow(1-p,ni-ki),prob=cn*pk*qnk;
  const mean=ni*p,vari=ni*p*(1-p);
  document.getElementById('b-rp').textContent=prob.toFixed(4); flash('b-rp');
  document.getElementById('b-rm').textContent=mean.toFixed(4);
  document.getElementById('b-rv').textContent=vari.toFixed(4);
  document.getElementById('b-steps').innerHTML=`
    <div class="step"><div class="snum s1">1</div><div class="scnt">C(${ni},${ki}) = ${ni}! / (${ki}! × ${ni-ki}!) = <b style="color:var(--c1)">${cn}</b></div></div>
    <div class="step"><div class="snum s1">2</div><div class="scnt">p<sup>${ki}</sup> = ${p}<sup>${ki}</sup> = <b style="color:var(--c3)">${pk.toFixed(6)}</b></div></div>
    <div class="step"><div class="snum s1">3</div><div class="scnt">(1−p)<sup>${ni-ki}</sup> = ${(1-p).toFixed(4)}<sup>${ni-ki}</sup> = <b style="color:var(--c4)">${qnk.toFixed(6)}</b></div></div>
    <div class="step"><div class="snum s1">4</div><div class="scnt">P(X=${ki}) = ${cn} × ${pk.toFixed(5)} × ${qnk.toFixed(5)}<br>= <b style="color:var(--c1);font-size:1.05rem">${prob.toFixed(6)}</b></div></div>`;
  const L=Array.from({length:ni+1},(_,i)=>i);
  mkBar('bChart',L,L.map(i=>bP(ni,i,p)),'#00e5ff',ki);
  confetti();scrollToResults('binom');
}

// ════════ POISSON ════════
let PS={lam:'',k:'',act:'lam'};
function pSel(f){
  PS.act=f;
  ['lam','k'].forEach(x=>document.getElementById('pft-'+x).className='ftab'+(x===f?' a2':''));
  document.getElementById('p-sf').textContent=f==='lam'?'λ — AVERAGE RATE OF EVENTS':'k — NUMBER OF OBSERVED EVENTS';
  document.getElementById('p-sv').textContent=PS[f]||'0';
}
function pK(k){
  let v=PS[PS.act];
  if(k==='back')v=v.slice(0,-1)||'';
  else if(k==='clr')v='';
  else if(k==='next'){PS.act=PS.act==='lam'?'k':'lam';pSel(PS.act);return;}
  else if(k==='.'){if(!v.includes('.'))v+=k;}
  else{v=v==='0'||v===''?k:v+k;}
  PS[PS.act]=v;
  document.getElementById('p-sv').textContent=v||'0';
  document.getElementById(PS.act==='lam'?'psl':'psk').textContent=v||'—';
}
function pCalc(){
  const l=parseFloat(PS.lam),k=parseFloat(PS.k);
  if(isNaN(l)||isNaN(k)){alert('Enter both λ and k');return;}
  if(l<=0){alert('λ must be positive');return;}
  const ki=Math.round(k),lk=Math.pow(l,ki),em=Math.exp(-l),kf=fact(ki),prob=lk*em/kf;
  document.getElementById('p-rp').textContent=prob.toFixed(4); flash('p-rp');
  document.getElementById('p-rm').textContent=l.toFixed(4);
  document.getElementById('p-rs').textContent=Math.sqrt(l).toFixed(4);
  document.getElementById('p-steps').innerHTML=`
    <div class="step"><div class="snum s2">1</div><div class="scnt">λ<sup>k</sup> = ${l}<sup>${ki}</sup> = <b style="color:var(--c2)">${lk.toFixed(5)}</b></div></div>
    <div class="step"><div class="snum s2">2</div><div class="scnt">e<sup>−λ</sup> = e<sup>−${l}</sup> = <b style="color:var(--c3)">${em.toFixed(6)}</b></div></div>
    <div class="step"><div class="snum s2">3</div><div class="scnt">k! = ${ki}! = <b style="color:var(--c4)">${kf}</b></div></div>
    <div class="step"><div class="snum s2">4</div><div class="scnt">P(X=${ki}) = ${lk.toFixed(4)} × ${em.toFixed(5)} / ${kf}<br>= <b style="color:var(--c2);font-size:1.05rem">${prob.toFixed(6)}</b></div></div>`;
  const mK=Math.max(15,Math.ceil(l*3)),L=Array.from({length:mK+1},(_,i)=>i);
  mkBar('pChart',L,L.map(i=>poiP(l,i)),'#ff6b9d',ki);
  confetti();scrollToResults('poisson');
}

// ════════ NORMAL ════════
let NS={mu:'',sig:'',x:'',act:'mu'};
const NFL={mu:'μ — MEAN (CENTER)',sig:'σ — STANDARD DEVIATION',x:'x — VALUE TO EVALUATE'};
function nSel(f){
  NS.act=f;
  ['mu','sig','x'].forEach(x=>document.getElementById('nft-'+x).className='ftab'+(x===f?' a3':''));
  document.getElementById('n-sf').textContent=NFL[f];
  document.getElementById('n-sv').textContent=NS[f]||'0';
}
function nK(k){
  let v=NS[NS.act];
  if(k==='back')v=v.slice(0,-1)||'';
  else if(k==='clr')v='';
  else if(k==='next'){const o=['mu','sig','x'];nSel(o[(o.indexOf(NS.act)+1)%3]);return;}
  else if(k==='.'){if(!v.includes('.'))v+=k;}
  else if(k==='pm'){v=v.startsWith('-')?v.slice(1):v?'-'+v:v;}
  else{v=v==='0'||v===''?k:v+k;}
  NS[NS.act]=v;
  document.getElementById('n-sv').textContent=v||'0';
  const m={mu:'nsmu',sig:'nssig',x:'nsx'};
  document.getElementById(m[NS.act]).textContent=v||'—';
}
function nCalc(){
  const mu=parseFloat(NS.mu),sig=parseFloat(NS.sig),x=parseFloat(NS.x);
  if(isNaN(mu)||isNaN(sig)){alert('Enter μ and σ');return;}
  if(sig<=0){alert('σ must be positive');return;}
  const xv=isNaN(x)?mu:x;
  const s1=sig*Math.sqrt(2*Math.PI),s2=Math.pow((xv-mu)/sig,2),s3=Math.exp(-0.5*s2);
  const fx=s3/s1,z=(xv-mu)/sig;
  document.getElementById('n-rf').textContent=fx.toFixed(5); flash('n-rf');
  document.getElementById('n-rz').textContent=z.toFixed(4);
  document.getElementById('n-rv').textContent=(sig*sig).toFixed(4);
  document.getElementById('n-steps').innerHTML=`
    <div class="step"><div class="snum s3">1</div><div class="scnt">σ√2π = ${sig}×${Math.sqrt(2*Math.PI).toFixed(4)} = <b style="color:var(--c3)">${s1.toFixed(5)}</b></div></div>
    <div class="step"><div class="snum s3">2</div><div class="scnt">((x−μ)/σ)² = ((${xv}−${mu})/${sig})² = <b style="color:var(--c1)">${s2.toFixed(5)}</b></div></div>
    <div class="step"><div class="snum s3">3</div><div class="scnt">e<sup>−½×${s2.toFixed(4)}</sup> = <b style="color:var(--c4)">${s3.toFixed(6)}</b></div></div>
    <div class="step"><div class="snum s3">4</div><div class="scnt">f(${xv}) = ${s3.toFixed(5)} / ${s1.toFixed(4)}<br>= <b style="color:var(--c3);font-size:1.05rem">${fx.toFixed(6)}</b></div></div>
    <div class="step"><div class="snum s3">5</div><div class="scnt">Z = (${xv}−${mu})/${sig} = <b style="color:var(--c1)">${z.toFixed(4)}</b></div></div>`;
  const r=sig*4,pts=180,xs=Array.from({length:pts},(_,i)=>mu-r+(i/(pts-1))*2*r);
  mkLine('nChart',xs,xs.map(xi=>norP(xi,mu,sig)),'#69ff87');
  confetti();scrollToResults('normal');
}

// ════════ RANDOM VARIABLES ════════
let RVD=[{x:'1',p:'0.2'},{x:'2',p:'0.3'},{x:'3',p:'0.3'},{x:'4',p:'0.2'}];
let RVA={row:0,col:'x'};

function rvRender(){
  document.getElementById('rv-rows').innerHTML=RVD.map((r,i)=>`
    <div class="rvrow">
      <div class="rvcell ${RVA.row===i&&RVA.col==='x'?'focused':''}" onclick="rvFocus(${i},'x')">${r.x||'0'}</div>
      <div class="rvcell ${RVA.row===i&&RVA.col==='p'?'focused':''}" onclick="rvFocus(${i},'p')">${r.p||'0'}</div>
      <div class="rvdel" onclick="rvDel(${i})">×</div>
    </div>`).join('');
  const s=RVD.reduce((a,r)=>a+(parseFloat(r.p)||0),0);
  const ok=Math.abs(s-1)<0.002;
  document.getElementById('rv-sum').textContent=s.toFixed(4);
  document.getElementById('rv-sum').style.color=ok?'var(--c3)':'var(--c2)';
  document.getElementById('rv-sumok').textContent=ok?'✓ Valid':'✗ Must = 1';
  document.getElementById('rv-sumok').style.color=ok?'var(--c3)':'var(--c2)';
  const v=RVA.col==='x'?RVD[RVA.row]?.x:RVD[RVA.row]?.p;
  document.getElementById('rv-sf').textContent=`Row ${RVA.row+1} — ${RVA.col==='x'?'X value':'P(X = x)'}`;
  document.getElementById('rv-sv').textContent=v||'0';
}
function rvFocus(row,col){RVA={row,col};rvRender();}
function rvAdd(){RVD.push({x:'0',p:'0'});RVA={row:RVD.length-1,col:'x'};rvRender();}
function rvDel(i){if(RVD.length<=1)return;RVD.splice(i,1);RVA.row=Math.min(RVA.row,RVD.length-1);rvRender();}
function rvK(k){
  const r=RVD[RVA.row];
  let v=RVA.col==='x'?r.x:r.p;
  if(k==='back')v=v.slice(0,-1)||'';
  else if(k==='clr')v='';
  else if(k==='.'){if(!v.includes('.'))v+=k;}
  else if(k==='pm'){v=v.startsWith('-')?v.slice(1):v?'-'+v:v;}
  else{v=v==='0'||v===''?k:v+k;}
  if(RVA.col==='x')r.x=v;else r.p=v;
  rvRender();
}
function rvCalc(){
  const d=RVD.map(r=>({x:parseFloat(r.x),p:parseFloat(r.p)})).filter(r=>!isNaN(r.x)&&!isNaN(r.p));
  if(!d.length)return;
  const s=d.reduce((a,r)=>a+r.p,0);
  if(Math.abs(s-1)>0.01){alert('Probabilities must sum to 1\nCurrent sum: '+s.toFixed(4));return;}
  const ex=d.reduce((a,r)=>a+r.x*r.p,0);
  const ex2=d.reduce((a,r)=>a+r.x*r.x*r.p,0);
  const vari=ex2-ex*ex,std=Math.sqrt(Math.max(0,vari));
  document.getElementById('rv-ex').textContent=ex.toFixed(4); flash('rv-ex');
  document.getElementById('rv-ex2').textContent=ex2.toFixed(4);
  document.getElementById('rv-var').textContent=vari.toFixed(4);
  document.getElementById('rv-std').textContent=std.toFixed(4);
  const t1=d.map(r=>`(${r.x}×${r.p})`).join('+');
  const t2=d.map(r=>`(${r.x}²×${r.p})`).join('+');
  document.getElementById('rv-steps').innerHTML=`
    <div class="step"><div class="snum s4">1</div><div class="scnt">E(X) = Σ x·P(x)<br><span class="d">= ${t1}</span><br>= <b style="color:var(--c4)">${ex.toFixed(4)}</b></div></div>
    <div class="step"><div class="snum s4">2</div><div class="scnt">E(X²) = Σ x²·P(x)<br><span class="d">= ${t2}</span><br>= <b style="color:var(--c1)">${ex2.toFixed(4)}</b></div></div>
    <div class="step"><div class="snum s4">3</div><div class="scnt">Var(X) = ${ex2.toFixed(4)} − (${ex.toFixed(4)})²<br>= <b style="color:var(--c2)">${vari.toFixed(4)}</b></div></div>
    <div class="step"><div class="snum s4">4</div><div class="scnt">σ = √${vari.toFixed(4)} = <b style="color:var(--c3)">${std.toFixed(4)}</b></div></div>`;
  mkBar('rvChart',d.map(r=>'x='+r.x),d.map(r=>r.p),'#ffb830');
  confetti();scrollToResults('rv');
}

// ════════ RANDOM TELEGRAPH SIGNAL (RTS) ════════
let RTSS={A:'',al:'',tau:'',f:'',act:'A'};
const RTSFL={A:'A — SIGNAL AMPLITUDE',al:'α — TRANSITION RATE (α > 0)',tau:'τ — TIME LAG (AUTOCORR)',f:'f — FREQUENCY (PSD)'};

function rtsSel(f){
  RTSS.act=f;
  ['A','al','tau','f'].forEach(x=>document.getElementById('rtsft-'+x).className='ftab'+(x===f?' a5':''));
  document.getElementById('rts-sf').textContent=RTSFL[f];
  document.getElementById('rts-sv').textContent=RTSS[f]||'0';
}

function rtsK(k){
  let v=RTSS[RTSS.act];
  if(k==='back')v=v.slice(0,-1)||'';
  else if(k==='clr')v='';
  else if(k==='next'){
    const o=['A','al','tau','f'];
    rtsSel(o[(o.indexOf(RTSS.act)+1)%o.length]);
    return;
  }
  else if(k==='.'){if(!v.includes('.'))v+=k;}
  else if(k==='pm'){v=v.startsWith('-')?v.slice(1):v?'-'+v:v;}
  else{v=v==='0'||v===''?k:v+k;}

  RTSS[RTSS.act]=v;
  document.getElementById('rts-sv').textContent=v||'0';
  const m={A:'rtsSA',al:'rtsSAL',tau:'rtsST',f:'rtsSF'};
  document.getElementById(m[RTSS.act]).textContent=v||'—';
}

function mkRtsLine(id,xs,ys,color,markX=null,markY=null){
  if(CH[id])CH[id].destroy();
  const ctx=document.getElementById(id).getContext('2d');
  const g=ctx.createLinearGradient(0,0,0,220);
  g.addColorStop(0,color+'55');g.addColorStop(1,color+'05');

  let pr=0,pbg=null;
  if(markX!==null){
    let hi=0,bd=Infinity;
    for(let i=0;i<xs.length;i++){
      const d=Math.abs(xs[i]-markX);
      if(d<bd){bd=d;hi=i;}
    }
    pr=xs.map((_,i)=>i===hi?4.5:0);
    pbg=xs.map((_,i)=>i===hi?'#00e5ff':color);
  }

  const datasets=[{
    data:ys,
    borderColor:color,
    backgroundColor:g,
    borderWidth:2.5,
    pointRadius:pr,
    pointBackgroundColor:pbg,
    pointHoverRadius:xs.map((_,i)=>Array.isArray(pr)&&pr[i]>0?6:0),
    fill:true,
    tension:0.25
  }];

  CH[id]=new Chart(ctx,{
    type:'line',
    data:{labels:xs.map(x=>x.toFixed(2)),datasets},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{title:c=>`τ = ${c[0].label}`,label:c=>` R(τ) = ${Number(c.raw).toFixed(6)}`}}
      },
      scales:{
        x:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#555570',maxTicksLimit:8}},
        y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#555570'},beginAtZero:true}
      }
    }
  });
}

function rtsCalc(){
  const A=parseFloat(RTSS.A);
  const alpha=parseFloat(RTSS.al);
  const tau=parseFloat(RTSS.tau);
  const f=parseFloat(RTSS.f);

  if([A,alpha,tau,f].some(x=>Number.isNaN(x))){alert('Enter all 4 values: A, α, τ, f');return;}
  if(alpha<=0){alert('α must be positive');return;}

  const mean=0;
  const A2=A*A;
  const at=Math.abs(tau);
  const expTerm=Math.exp(-2*alpha*at);
  const Rt=A2*expTerm;
  const w=2*Math.PI*f;
  const denom=(4*alpha*alpha)+(w*w);
  const Sf=(4*A2*alpha)/denom;

  document.getElementById('rts-mean').textContent=mean.toFixed(4); flash('rts-mean');
  document.getElementById('rts-var').textContent=A2.toFixed(6);
  document.getElementById('rts-r').textContent=Rt.toFixed(6);
  document.getElementById('rts-s').textContent=Sf.toFixed(6);

  document.getElementById('rts-steps').innerHTML=`
    <div class="step"><div class="snum s5">1</div><div class="scnt">Mean: E[X(t)] = <b style="color:var(--c5)">0</b></div></div>
    <div class="step"><div class="snum s5">2</div><div class="scnt">Variance: Var[X(t)] = A² = (${A})² = <b style="color:var(--c4)">${A2.toFixed(6)}</b></div></div>
    <div class="step"><div class="snum s5">3</div><div class="scnt">Autocorrelation at τ = ${tau}:<br><span class="d">R(τ) = A² · e<sup>−2α|τ|</sup> = ${A2.toFixed(6)} · e<sup>−2·${alpha}·|${tau}|</sup></span><br>= ${A2.toFixed(6)} · e<sup>−${(2*alpha*at).toFixed(6)}</sup> = ${A2.toFixed(6)} · ${expTerm.toFixed(6)}<br>= <b style="color:var(--c1);font-size:1.05rem">${Rt.toFixed(6)}</b></div></div>
    <div class="step"><div class="snum s5">4</div><div class="scnt">PSD at f = ${f}:<br><span class="d">S(f) = 4A²α / (4α² + (2πf)²)</span><br>= 4·${A2.toFixed(6)}·${alpha} / (4·${(alpha*alpha).toFixed(6)} + (2π·${f})²)<br>= ${(4*A2*alpha).toFixed(6)} / (${(4*alpha*alpha).toFixed(6)} + ${(w*w).toFixed(6)})<br>= <b style="color:var(--c3);font-size:1.05rem">${Sf.toFixed(6)}</b></div></div>`;

  const base=(5/(2*alpha));
  const tauRange=Math.min(25,Math.max(1,Math.max(Math.abs(tau)*1.4,base)));
  const pts=220;
  const xs=Array.from({length:pts},(_,i)=>-tauRange+(i/(pts-1))*2*tauRange);
  const ys=xs.map(x=>A2*Math.exp(-2*alpha*Math.abs(x)));
  mkRtsLine('rtsChart',xs,ys,'#a78bfa',tau,Rt);
  confetti();scrollToResults('rts');
}

// ══ FLOATING PARTICLES ══
(function initParticles(){
  const canvas=document.getElementById('particles-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let w,h;
  const symbols=['∑','∫','π','√','∞','Δ','θ','λ','μ','σ','±','≈','∂','φ','Ω','!','×','÷'];
  const particles=[];
  function resize(){w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;}
  resize();
  window.addEventListener('resize',resize);
  const count=window.innerWidth<600?10:20;
  for(let i=0;i<count;i++){
    particles.push({
      x:Math.random()*w,y:Math.random()*h,
      vx:(Math.random()-0.5)*0.25,vy:(Math.random()-0.5)*0.25,
      size:Math.random()*12+10,
      symbol:symbols[Math.floor(Math.random()*symbols.length)],
      opacity:Math.random()*0.05+0.015,
      rotation:Math.random()*360,rotSpeed:(Math.random()-0.5)*0.4
    });
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation*Math.PI/180);
      ctx.font=p.size+'px JetBrains Mono,monospace';
      ctx.fillStyle='rgba(255,255,255,'+p.opacity+')';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(p.symbol,0,0);ctx.restore();
      p.x+=p.vx;p.y+=p.vy;p.rotation+=p.rotSpeed;
      if(p.x<-40)p.x=w+40;if(p.x>w+40)p.x=-40;
      if(p.y<-40)p.y=h+40;if(p.y>h+40)p.y=-40;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ══ CONFETTI ══
function confetti(){
  const colors=['#00e5ff','#ff6b9d','#69ff87','#ffb830','#bb86fc','#ff5252'];
  for(let i=0;i<35;i++){
    const el=document.createElement('div');
    el.className='confetti-piece';
    el.style.left=Math.random()*100+'vw';
    el.style.top='-10px';
    el.style.background=colors[Math.floor(Math.random()*colors.length)];
    el.style.setProperty('--dur',(Math.random()*1+0.8)+'s');
    el.style.setProperty('--delay',(Math.random()*0.3)+'s');
    el.style.setProperty('--spin',(Math.random()*720+360)+'deg');
    el.style.width=(Math.random()*5+4)+'px';
    el.style.height=(Math.random()*5+4)+'px';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),2500);
  }
}

// ══ QUICK EXAMPLES ══
function bExample(){
  BS={n:'10',p:'0.3',k:'3',act:'k'};
  document.getElementById('bsn').textContent='10';
  document.getElementById('bsp').textContent='0.3';
  document.getElementById('bsk').textContent='3';
  bSel('k');bCalc();
}
function pExample(){
  PS={lam:'4',k:'2',act:'k'};
  document.getElementById('psl').textContent='4';
  document.getElementById('psk').textContent='2';
  pSel('k');pCalc();
}
function nExample(){
  NS={mu:'100',sig:'15',x:'85',act:'x'};
  document.getElementById('nsmu').textContent='100';
  document.getElementById('nssig').textContent='15';
  document.getElementById('nsx').textContent='85';
  nSel('x');nCalc();
}
function rtsExample(){
  RTSS={A:'1',al:'2',tau:'0.5',f:'1',act:'f'};
  document.getElementById('rtsSA').textContent='1';
  document.getElementById('rtsSAL').textContent='2';
  document.getElementById('rtsST').textContent='0.5';
  document.getElementById('rtsSF').textContent='1';
  rtsSel('f');rtsCalc();
}

// ══ DICE ROLLER ══
const DICE_FACES=['⚀','⚁','⚂','⚃','⚄','⚅'];
function rollDice(){
  const d1=document.getElementById('dice1'),d2=document.getElementById('dice2');
  d1.style.animation='none';d2.style.animation='none';
  void d1.offsetHeight;
  d1.style.animation='diceRoll 0.5s ease';
  d2.style.animation='diceRoll 0.5s ease 0.1s';
  const r1=Math.floor(Math.random()*6),r2=Math.floor(Math.random()*6);
  setTimeout(()=>{
    d1.textContent=DICE_FACES[r1];d2.textContent=DICE_FACES[r2];
    document.getElementById('dice-result').textContent=(r1+1)+' + '+(r2+1)+' = '+(r1+r2+2);
  },300);
}

// ══ MOBILE SCROLL ══
function scrollToResults(tabId){
  if(window.innerWidth<=860){
    const left=document.querySelector('#'+tabId+' .left');
    if(left)setTimeout(()=>left.scrollIntoView({behavior:'smooth',block:'start'}),300);
  }
}

// ── INIT ──
rvRender();
