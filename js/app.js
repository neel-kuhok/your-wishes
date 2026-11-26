(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const C=window.YW,SB=C.SUPABASE_URL&&C.SUPABASE_ANON_KEY;
let lang=localStorage.getItem("yw_lang")||"bn";
const t=s=>s.split("|")[lang==="bn"?1:0]||s;
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let photos=Array(6).fill(null),voice="",music="";
const readURL=f=>new Promise((r,j)=>{const x=new FileReader();x.onload=()=>r(x.result);x.onerror=j;x.readAsDataURL(f)});
const kb=u=>u.length*.75/1024;
const rand=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(b=>"abcdefghjkmnpqrstuvwxyz23456789"[b%31]).join("");
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("");
const say=(sel,s)=>{$(sel).textContent=t(s)};

/* ---------- language ---------- */
function applyLang(){
  document.documentElement.lang=lang;
  $$("[data-t]").forEach(e=>e.textContent=t(e.dataset.t));
  $$("[data-ph]").forEach(e=>e.placeholder=t(e.dataset.ph));
  $$(".lb").forEach(b=>b.classList.toggle("on",b.dataset.l===lang));
  $("#devrole").textContent=t(C.DEV.role);
  $("#showpin").textContent=t($("#pin").type==="password"?"Show|দেখান":"Hide|লুকান");
  renderPhotos();
}
$$(".lb").forEach(b=>b.onclick=()=>{lang=b.dataset.l;localStorage.setItem("yw_lang",lang);applyLang()});

/* ---------- photos ---------- */
async function shrink(f){
  const u=await readURL(f);
  return new Promise(r=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement("canvas");
    c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",.7))};im.onerror=()=>r(u);im.src=u});
}
function renderPhotos(){
  const g=$("#photos");g.innerHTML="";
  photos.forEach((p,i)=>{
    const d=document.createElement("div");d.className="slot";
    d.innerHTML=(p?`<img src="${p.src}" alt=""><input class="cap" maxlength="80" placeholder="${t("Caption|ক্যাপশন")}" value="${esc(p.cap)}">
      <div class="row" style="justify-content:center"><label class="btn sm ghost" for="pf${i}">${t("Replace|বদলান")}</label><button type="button" class="btn sm ghost rm">${t("Remove|মুছুন")}</button></div>`
      :`<label class="ph" for="pf${i}">＋</label>`)+`<input id="pf${i}" type="file" accept="image/*" hidden>`;
    $("input[type=file]",d).onchange=async e=>{const f=e.target.files[0];if(!f)return;const src=await shrink(f);photos[i]={src,cap:p?p.cap:""};renderPhotos()};
    if(p){$(".cap",d).oninput=e=>p.cap=e.target.value;$(".rm",d).onclick=()=>{photos[i]=null;renderPhotos()}}
    g.appendChild(d);
  });
}

/* ---------- voice ---------- */
function setVoice(u){voice=u;const a=$("#vprev");a.hidden=!u;a.src=u||"";$("#vdel").hidden=!u;$("#rec").hidden=false;$("#stop").hidden=true}
let mr,chunks=[];
$("#rec").onclick=async()=>{
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:true});
    mr=new MediaRecorder(s);chunks=[];mr.ondataavailable=e=>chunks.push(e.data);
    mr.onstop=async()=>{s.getTracks().forEach(x=>x.stop());const u=await readURL(new Blob(chunks,{type:mr.mimeType}));
      if(kb(u)>1500){say("#vmsg","Recording too long (max ~1.5 MB). Record a shorter one.|রেকর্ডিং বড় (সর্বোচ্চ ~১.৫ MB)। ছোট করে রেকর্ড করুন।");setVoice("")}else{setVoice(u);$("#vmsg").textContent=""}};
    mr.start();$("#rec").hidden=true;$("#stop").hidden=false;say("#vmsg","Recording…|রেকর্ড হচ্ছে…");
  }catch{say("#vmsg","Microphone unavailable or permission denied.|মাইক্রোফোন পাওয়া যায়নি বা অনুমতি দেওয়া হয়নি।")}
};
$("#stop").onclick=()=>mr&&mr.state!=="inactive"&&mr.stop();
$("#vfile").onchange=async e=>{const f=e.target.files[0];if(!f)return;const u=await readURL(f);
  if(kb(u)>1500)return say("#vmsg","File too large (max 1.5 MB).|ফাইল বড় (সর্বোচ্চ ১.৫ MB)।");setVoice(u);$("#vmsg").textContent=""};
$("#vdel").onclick=()=>{setVoice("");$("#vfile").value=""};

/* ---------- music ---------- */
$("#mfile").onchange=async e=>{const f=e.target.files[0];if(!f)return;const u=await readURL(f);
  if(kb(u)>2048)return say("#mmsg","File too large (max 2 MB). Use a music URL instead.|ফাইল বড় (সর্বোচ্চ ২ MB)। মিউজিক URL ব্যবহার করুন।");
  music=u;$("#mdel").hidden=false;say("#mmsg","Music added.|মিউজিক যোগ হয়েছে।")};
$("#mdel").onclick=()=>{music="";$("#mfile").value="";$("#mdel").hidden=true;$("#mmsg").textContent=""};
const bgm=$("#bgm"),fab=$("#fab");
const syncFab=()=>{fab.classList.toggle("play",!bgm.paused);fab.classList.toggle("off",bgm.paused);fab.title=bgm.paused?t("Music paused|মিউজিক বন্ধ"):t("Music playing|মিউজিক চলছে")};
fab.onclick=()=>{bgm.paused?bgm.play().catch(()=>{}):bgm.pause()};bgm.onplay=bgm.onpause=syncFab;
function setMusic(src){bgm.pause();if(!src){fab.hidden=true;return}bgm.src=src;fab.hidden=false;syncFab()}

/* ---------- PIN toggle ---------- */
$("#showpin").onclick=()=>{const p=$("#pin");p.type=p.type==="password"?"text":"password";applyLang()};

/* ---------- collect ---------- */
const DW=["May your day be full of joy!|তোমার দিনটি আনন্দে ভরে উঠুক!","May all your dreams come true.|তোমার সব স্বপ্ন সত্যি হোক।","Stay healthy and keep smiling.|সুস্থ থাকো, হাসিখুশি থাকো।","You mean the world to me.|তুমি আমার কাছে অনেক বিশেষ।"];
async function collect(strict){
  const v=id=>$("#"+id).value.trim(),pin=$("#pin").value;
  const d={v:1,sender:v("sender"),recipient:v("recipient"),title:v("title")||t("Happy Birthday!|শুভ জন্মদিন!"),date:v("date"),intro:v("intro"),
    wishes:$$(".wish").map((x,i)=>x.value.trim()||t(DW[i])),ltitle:v("ltitle"),letter:v("letter"),signoff:v("signoff"),
    final:v("final")||t("Wishing you a year full of love and happiness.|তোমার নতুন বছর ভরে উঠুক ভালোবাসা ও সুখে।"),
    musicUrl:/^https?:\/\//.test(v("murl"))?v("murl"):"",music,voice,photos:photos.filter(Boolean)};
  if(!d.sender||!d.recipient)throw t("Please enter your name and the recipient's name.|আপনার নাম ও প্রাপকের নাম দিন।");
  if(strict){
    if(pin.length<4)throw t("PIN must be at least 4 characters.|পিন কমপক্ষে ৪ অক্ষরের হতে হবে।");
    d.salt=rand(8);d.pin=await sha(d.salt+pin);
  }
  return d;
}
const fail=e=>{$("#err").textContent=typeof e==="string"?e:t("Something went wrong.|কিছু একটা ভুল হয়েছে।");setTimeout(()=>$("#err").textContent="",6000)};

/* ---------- buttons ---------- */
$("#preview").onclick=async()=>{try{openViewer(await collect(false),true)}catch(e){fail(e)}};
$("#download").onclick=async()=>{
  try{
    const d=await collect(false),o={app:"Your wishes",note:"Photos, voice and music files are embedded as base64 data URLs in this file. The PIN is not exported; set it again when you recreate the card.",card:d};
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,2)],{type:"application/json"}));
    a.download="your-wishes-"+(d.recipient||"card").replace(/\W+/g,"-")+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  }catch(e){fail(e)}
};
$("#create").onclick=async()=>{
  const b=$("#create");
  try{
    const d=await collect(true);b.disabled=true;
    const base=location.origin+location.pathname;let link,msg;
    if(SB){
      const id=rand(10);
      const r=await fetch(C.SUPABASE_URL+"/rest/v1/cards",{method:"POST",headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:"Bearer "+C.SUPABASE_ANON_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({id,data:d})});
      if(!r.ok)throw t("Could not save online. Check your Supabase setup or reduce file sizes.|অনলাইনে সংরক্ষণ হয়নি। Supabase সেটআপ দেখুন বা ফাইল ছোট করুন।");
      link=base+"?c="+id;msg="Saved online with photos, voice and music. Share the PIN separately.|অনলাইনে সংরক্ষিত (ছবি, ভয়েস ও মিউজিকসহ)। পিন আলাদাভাবে পাঠান।";
    }else{
      const lite={...d,photos:[],music:"",voice:""};
      link=base+"#d="+btoa(unescape(encodeURIComponent(JSON.stringify(lite))));
      msg="No backend connected: this link carries text only (no photos, voice or uploaded music). Connect Supabase for full cards. Share the PIN separately.|ব্যাকএন্ড যুক্ত নেই: এই লিংকে শুধু লেখা থাকবে (ছবি, ভয়েস, আপলোড করা মিউজিক নয়)। পূর্ণ কার্ডের জন্য Supabase যুক্ত করুন। পিন আলাদাভাবে পাঠান।";
    }
    $("#link").value=link;say("#rmsg",msg);$("#result").hidden=false;$("#result").scrollIntoView({behavior:"smooth"});
    window._last=d;openViewer(d,true);
  }catch(e){fail(e)}finally{b.disabled=false}
};
$("#copy").onclick=async()=>{const l=$("#link");try{await navigator.clipboard.writeText(l.value)}catch{l.select();document.execCommand("copy")}say("#copy","Copied ✓|কপি হয়েছে ✓");setTimeout(()=>say("#copy","Copy link|লিংক কপি"),1800)};
$("#open").onclick=()=>{window._last?openViewer(window._last,true):window.open($("#link").value)};

/* ---------- effects ---------- */
function conf(n=40){const e=["🎉","✨","🎈","💖","🌟","🎊"];for(let k=0;k<n;k++){const s=document.createElement("span");s.className="cf";s.textContent=e[k%6];
  s.style.cssText=`left:${Math.random()*100}vw;font-size:${14+Math.random()*16}px;animation-duration:${2.5+Math.random()*2.5}s;animation-delay:${Math.random()*.8}s`;document.body.appendChild(s);setTimeout(()=>s.remove(),6500)}}

/* ---------- viewer ---------- */
function openViewer(d,pv){
  const V=$("#viewer");V.hidden=false;document.body.style.overflow="hidden";V.scrollTop=0;
  setMusic(d.music||d.musicUrl||"");
  const close=()=>{V.hidden=true;V.innerHTML="";document.body.style.overflow="";setMusic("")};
  const x=pv?`<button class="btn sm close" id="cl">← ${t("Edit Card|কার্ড এডিট")}</button>`:"";
  const wrap=h=>{V.innerHTML=`<div class="stage">${h}</div>`+x;if(pv)$("#cl").onclick=close};
  if(!pv&&d.pin){
    wrap(`<div class="pinbox"><h2>🔒 ${t("Enter the secret PIN|গোপন পিন দিন")}</h2><p>${t("This surprise is for")} ${esc(d.recipient)}</p>
      <input id="vp" type="password" autocomplete="off"><label class="btn sm ghost" style="margin:8px 0;display:inline-block"><input id="vs" type="checkbox" style="width:auto;margin-right:6px">${t("Show PIN|পিন দেখান")}</label>
      <button class="btn big" id="vg">${t("Unlock|খুলুন")}</button><p class="err" id="ve"></p></div>`);
    const go=async()=>{if(await sha(d.salt+$("#vp").value)===d.pin)run();else{$("#ve").textContent=t("Incorrect PIN. Try again.|ভুল পিন। আবার চেষ্টা করুন।")}};
    $("#vg").onclick=go;$("#vp").onkeydown=e=>e.key==="Enter"&&go();$("#vs").onchange=e=>$("#vp").type=e.target.checked?"text":"password";
  }else run();

  function run(){
    const st=["gift","cake","bal","gal","voice","letter","final"].filter(s=>(s!=="gal"||d.photos.length)&&(s!=="voice"||d.voice));
    let i=0;
    const nb=`<button class="btn" id="nx" style="margin-top:18px">${t("Next|পরবর্তী")} ›</button>`;
    const go=()=>{i++;show()};
    function show(){
      const s=st[i],nm=esc(d.recipient);
      if(s==="gift"){
        wrap(`<h2>${esc(d.title)}</h2><p>${esc(d.intro)}</p><button class="gbox" id="gb" aria-label="${t("Open gift|গিফট খুলুন")}"><span class="b"></span><span class="l"></span></button><p>${t("Tap the gift to open it|খুলতে গিফটে ট্যাপ করুন")}</p>`);
        $("#gb").onclick=e=>{e.currentTarget.classList.add("open");conf(50);if(bgm.src&&bgm.paused)bgm.play().catch(()=>{});setTimeout(go,1700)};
      }else if(s==="cake"){
        wrap(`<h2>${nm}</h2><p>${esc(d.date)}</p><div class="cake"><div class="cd" id="cd"><i></i><i></i><i></i><i></i><i></i></div><div class="t"></div><div class="m"></div><div class="p"></div></div>
          <button class="btn" id="blow">🌬️ ${t("Blow out the candles|মোমবাতি নেভান")}</button><p id="cm"></p>`);
        const blow=()=>{const c=$("#cd");if(c.classList.contains("out"))return;c.classList.add("out");conf(60);
          $("#cm").innerHTML=`🎉 <b>${t("Happy Birthday|শুভ জন্মদিন")}, ${nm}!</b><br>${t("Make a wish!|একটি ইচ্ছা করো!")}`;$("#blow").outerHTML=nb;$("#nx").onclick=go};
        $("#blow").onclick=blow;$("#cd").onclick=blow;
      }else if(s==="bal"){
        const col=["#e0314f","#d4af37","#c2185b","#ff7a59"];
        wrap(`<h2>${t("Four wishes for you|তোমার জন্য চারটি শুভেচ্ছা")}</h2><p>${t("Tap a balloon|বেলুনে ট্যাপ করুন")}</p><div class="bal">${d.wishes.map((_,k)=>`<button class="balloon" data-k="${k}" style="background:radial-gradient(circle at 30% 30%,#fff6,${col[k]} 55%)" aria-label="${t("Balloon|বেলুন")} ${k+1}">${k+1}</button>`).join("")}</div>
          <div class="wishbox" id="wb" aria-live="polite">${t("Your wish will appear here ✨|তোমার শুভেচ্ছা এখানে দেখা যাবে ✨")}</div>${nb}`);
        $$(".balloon").forEach(b=>b.onclick=()=>{b.classList.add("pop");$("#wb").textContent=d.wishes[b.dataset.k];conf(12)});$("#nx").onclick=go;
      }else if(s==="gal"){
        let g=0;
        wrap(`<h2>${t("Sweet Moments|মধুর মুহূর্ত")}</h2><div class="gal" id="gv"></div><div class="row" style="justify-content:center"><button class="btn sm" id="pv">‹</button><button class="btn sm" id="nv">›</button></div>${nb}`);
        const draw=()=>{const p=d.photos[g];$("#gv").innerHTML=`<img src="${p.src}" alt="${esc(p.cap)}"><div class="cap">${esc(p.cap)}</div><div class="thumbs">${d.photos.map((_,k)=>`<b class="${k===g?"on":""}"></b>`).join("")}</div>`};
        $("#pv").onclick=()=>{g=(g+d.photos.length-1)%d.photos.length;draw()};$("#nv").onclick=()=>{g=(g+1)%d.photos.length;draw()};draw();$("#nx").onclick=go;
      }else if(s==="voice"){
        wrap(`<h2>🎙️ ${t("A voice message for you|তোমার জন্য ভয়েস বার্তা")}</h2><p>${t("Tap play to listen|শুনতে প্লে চাপুন")}</p><audio controls src="${d.voice}"></audio>${nb}`);$("#nx").onclick=go;
      }else if(s==="letter"){
        wrap(`<div class="paper"><h3>${esc(d.ltitle||t("A letter for you|তোমার জন্য চিঠি"))}</h3><div>${esc(d.letter)}</div><div class="so">${esc(d.signoff)}<br>${esc(d.sender)}</div></div>${nb}`);$("#nx").onclick=go;
      }else{
        wrap(`<p style="font-size:44px">🎂</p><div class="big-name">${nm}</div><h2>${esc(d.title)}</h2><div class="wishbox" style="margin:16px 0">${esc(d.final)}</div><p>— ${esc(d.sender)} ♡</p>
          <button class="btn" id="again">${t("Replay|আবার দেখুন")} ↺</button>`);
        conf(70);$("#again").onclick=()=>{i=0;show()};
      }
      V.scrollTop=0;
    }
    show();
  }
}

/* ---------- developer credit ---------- */
const AV="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#8c0f25"/><circle cx="50" cy="38" r="18" fill="#f3dc8a"/><path d="M14 92c4-26 24-32 36-32s32 6 36 32z" fill="#f3dc8a"/></svg>');
$("#devname").textContent=C.DEV.name;$("#devfb").href=C.DEV.facebook;
$("#devimg").src=localStorage.getItem("yw_devimg")||C.DEV.photo||AV;
$("#devfile").onchange=async e=>{const f=e.target.files[0];if(!f)return;const u=await shrink(f);$("#devimg").src=u;try{localStorage.setItem("yw_devimg",u)}catch{}};

/* ---------- load shared card ---------- */
async function boot(){
  applyLang();
  const q=new URLSearchParams(location.search).get("c"),h=location.hash.startsWith("#d=")?location.hash.slice(3):"";
  let d=null;
  try{
    if(q&&SB){const r=await fetch(C.SUPABASE_URL+"/rest/v1/cards?id=eq."+encodeURIComponent(q)+"&select=data",{headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:"Bearer "+C.SUPABASE_ANON_KEY}});const j=await r.json();d=j[0]&&j[0].data}
    else if(h)d=JSON.parse(decodeURIComponent(escape(atob(h))));
  }catch{}
  if(d){$("#creator").hidden=true;openViewer(d,false)}
  else if(q||h){$("#viewer").hidden=false;$("#viewer").innerHTML=`<div class="stage"><h2>${t("Card not found|কার্ড পাওয়া যায়নি")}</h2><p>${t("The link may be wrong or the backend is not connected.|লিংকটি ভুল হতে পারে বা ব্যাকএন্ড যুক্ত নেই।")}</p></div>`}
}
boot();
})();
