(() => {
"use strict";
const GH={};
/* On a page that does not contain an element, $() hands back a harmless stand-in so shared code never crashes. */
const $=(s,r=document)=>{const el=r.querySelector(s);if(el||r!==document)return el;return GH[s]||(GH[s]=document.createElement("div"));};
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PAGE=document.body.dataset.page||"home";
const PAGE_OF={home:"index.html",create:"create.html",notifs:"notifications.html",messages:"messages.html",profile:"profile.html",friends:"friends.html",editprofile:"edit-profile.html",settings:"settings.html",market:"market.html",ad:"ad.html"};
const later=msg=>{try{sessionStorage.setItem("slc-toast",msg);}catch(e){}};
const saveMe=()=>{try{localStorage.setItem("slc-me",JSON.stringify(ME));}catch(e){}};
const ic=(id,cls="")=>`<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

const LV={1:"#0f8fa0",2:"#2b7fd1",3:"#0f4fb4",4:"#4b48b8",5:"#7a3f9d"};
const HUES=[205,190,225,255,280,335,160];
const AUD={school:["school","My School"],other:["globe","Other Schools"],everyone:["globe","Everyone"],friends:["users","Friends"],selected:["users","Selected friends"],private:["lock","Only me"]};
const CTHEMES=[["classic","Classic","#0f4fb4"],["ocean","Ocean","#0a7482"],["sunset","Sunset","#c2410c"],["forest","Forest","#1f7a4d"],["rose","Rose","#be1e5a"],["midnight","Midnight","#3b3fb5"]];
const BGS=[1,2,3,4,5];
const BGCOL={1:"linear-gradient(135deg,#0f4fb4,#0f8fa0)",2:"linear-gradient(135deg,#4b48b8,#0f4fb4)",3:"linear-gradient(135deg,#0d6b5c,#0f4fb4)",4:"linear-gradient(135deg,#be1e5a,#7a3f9d)",5:"linear-gradient(135deg,#c2410c,#be1e5a)"};

const S={view:"home",prev:"home",tab:"school",profileOf:"me",profTab:"posts",chat:1,ct:"classic",inbox:"comfortable",level:null,dlDefault:false,refreshing:false,
  panel:false,tone:"chime",bs:"classic",wp:"none",wpImg:null,dim:0,flist:"friends",listOf:"me",rec:null,emoji:false,emojiTab:"face",attach:false,draft:{},reposts:[],mini:null,
  showReposts:true,receipts:true,priv:{msg:"friends",groups:"friends",photo:"everyone",seen:"friends",lists:"everyone",online:"friends"},blocked:["Emeka Obi"],wpCtx:"chat",mySticks:[],myGifs:[],cm:{emoji:false,tab:"face",text:"",rec:null},cmPost:null,pvhist:true,popups:true,sent:{},vmode:null,pm:null};

const ME={n:"Sample Student",u:"sample.student",d:"Computer Science",s:"UNILAG",lv:3,bio:"Building things between lectures. Ask me about CSC 208.",posts:12,fr:1240,fg:190,fs:96};
try{const sv=localStorage.getItem("slc-me");if(sv)Object.assign(ME,JSON.parse(sv));}catch(e){}
const PEOPLE=[
  {n:"Ada Okafor",u:"ada.okafor",d:"Computer Science",s:"UNILAG",lv:3,mutual:true,bio:"CSC 208 notes, library nights.",posts:41,fr:312,fg:280,fs:118},
  {n:"Tunde Bello",u:"tunde_b",d:"Mechanical Engineering",s:"UNILAG",lv:2,mutual:true,bio:"Workshop rat. Hydraulics and jollof.",posts:27,fr:190,fg:204,fs:77},
  {n:"Ngozi Eze",u:"ngozi.eze",d:"Law",s:"UNIBEN",lv:1,mutual:false,bio:"Fresher. Learning the law one case at a time.",posts:9,fr:120,fg:301,fs:31},
  {n:"Musa Ibrahim",u:"musa.ibrahim",d:"Architecture",s:"ABU",lv:5,mutual:false,bio:"Final year. Sketchbook always open.",posts:64,fr:540,fg:220,fs:150},
  {n:"Chiamaka Obi",u:"chiamaka.o",d:"Nursing",s:"UI",lv:2,mutual:false,bio:"Ward postings and late-night study.",posts:18,fr:210,fg:260,fs:64},
  {n:"Kelechi Nwosu",u:"kelechi.n",d:"Economics",s:"LASU",lv:3,mutual:true,bio:"Charts, coffee, group study.",posts:33,fr:260,fg:240,fs:101},
  {n:"Halima Sani",u:"halima.sani",d:"Statistics",s:"ABU",lv:2,mutual:true,bio:"R, Python, and a love of good data.",posts:22,fr:174,fg:188,fs:73},
  {n:"Zainab Yusuf",u:"zainab.y",d:"Accounting",s:"UNILAG",lv:4,mutual:false,bio:"Final year project season.",posts:48,fr:388,fg:301,fs:122}
];
const byName=Object.fromEntries(PEOPLE.map(p=>[p.n,p]));
const person=n=>n===ME.n?ME:byName[n];
Object.assign(byName["Musa Ibrahim"],{vis:"friends"});
Object.assign(byName["Zainab Yusuf"],{vis:"me",rp:false,pv:"friends"});
Object.assign(byName["Tunde Bello"],{nogroup:true,online:true});
Object.assign(byName["Ada Okafor"],{online:true});Object.assign(byName["Kelechi Nwosu"],{online:true});
Object.assign(byName["Zainab Yusuf"],{online:true});Object.assign(byName["Musa Ibrahim"],{online:true,hideOnline:true});
const isOnline=p=>!!p&&S.priv.online!=="nobody"&&!!p.online&&!p.hideOnline;
const STATUS={
  "Tunde Bello":{aud:"his school",items:[{hrs:5,bg:1,text:"Workshop day. The hydraulic press works!"},{hrs:4,bg:3,text:"Group photo at 4pm."}]},
  "Ada Okafor":{aud:"her school",items:[{hrs:22,bg:2,text:"CSC 208 notes tonight. Bring questions."},{hrs:20,bg:4,text:"Library seats are filling up."}]},
  "Kelechi Nwosu":{aud:"friends",items:[{hrs:1,bg:3,text:"Study group at 4pm. Library, third floor."}]},
  "Halima Sani":{aud:"friends",seen:true,items:[{hrs:9,bg:4,text:"My R script finally runs."}]},
  "Zainab Yusuf":{aud:"friends",items:[{hrs:3,bg:5,text:"Defence on Thursday. Prayers please."}]}
};
const canSeePhoto=p=>p===ME||(p.pv||"everyone")==="everyone"||(p.pv==="friends"&&!!p.mutual);
const canSeeLists=p=>p===ME||(p.vis||"everyone")==="everyone"||(p.vis==="friends"&&!!p.mutual);
const ini=n=>n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();

/* avatars */
function hue(n){let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%997;return HUES[h%HUES.length];}
function av(n,s,online){
  if(n===ME.n&&ME.avatarImg){return `<span class="av" style="${s?`--s:${s}px;`:""}padding:0;overflow:hidden;background:var(--surface-2)"><img src="${ME.avatarImg}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">${online?'<i class="on"></i>':""}</span>`;}
  const h=hue(n),l=h===160?28:h===190?30:36;
  const ini=n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  return `<span class="av" style="${s?`--s:${s}px;`:""}background:hsl(${h} 50% ${l}%)">${esc(ini)}${online?'<i class="on"></i>':""}</span>`;
}
const lv=n=>`<span class="lv" style="--lv:${LV[n]}"><i></i>Year ${n}</span>`;

/* sample photo art (no external images) */
let gid=0;
function scene(k){
  const P=[["#0f4fb4","#0f8fa0","#f5a524"],["#4b48b8","#0f4fb4","#ffd27a"],["#0d6b5c","#0f8fa0","#ffe08a"],["#7a3f9d","#4b48b8","#ffb3c1"]][k%4];
  const id="g"+(++gid);
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Sample photo"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[1]}"/></linearGradient></defs><rect width="320" height="200" fill="url(#${id})"/><circle cx="${230+(k%3)*18}" cy="52" r="24" fill="${P[2]}"/><path d="M0 140 L70 84 L122 128 L196 74 L262 134 L320 100 V200 H0Z" fill="rgba(6,20,45,.34)"/><path d="M0 164 L62 128 L134 160 L214 120 L320 166 V200 H0Z" fill="rgba(6,20,45,.55)"/></svg>`;
}

/* posts */
let uid=1000;const ALL=new Map();
const reg=p=>{p.id=p.id||++uid;p.saved=!!p.saved;if(!p.R){const L=p.likes||0,a=Math.ceil(L*.6),b=Math.floor(L*.25);p.R=L?{"❤️":a,"😂":b,"🔥":L-a-b}:{};Object.keys(p.R).forEach(k=>{if(p.R[k]<=0)delete p.R[k];});}if(p.shares==null)p.shares=Math.max(1,Math.round((p.likes||0)/5));if(p.saves==null)p.saves=Math.round((p.likes||0)/3);ALL.set(p.id,p);return p;};
const POSTS={
  school:[
    {own:true,name:ME.n,time:"Just now",aud:"friends",kind:"text",bg:1,text:"First post on SLC. Say hi if you see this.",cap:"",likes:4,comments:2,dl:false},
    {name:"Ada Okafor",time:"12 min",aud:"school",kind:"text",bg:2,text:"Sharing my CSC 208 notes tonight. Drop your questions below.",cap:"",likes:31,comments:9,dl:false},
    {name:"Tunde Bello",time:"1 hr",aud:"everyone",kind:"video",dur:"0:48",cap:"Our group's mini hydraulic press, tested in the workshop today.",likes:128,comments:24,dl:true},
    {name:"Zainab Yusuf",time:"3 hr",aud:"school",kind:"photo",photos:3,seed:0,cap:"Defence rehearsal in the lecture hall. Thursday, we are ready.",likes:57,comments:15,dl:false}
  ],
  other:[
    {name:"Ngozi Eze",time:"25 min",aud:"everyone",kind:"video",dur:"1:12",cap:"Orientation week at our faculty. Freshers, you are welcome.",likes:92,comments:18,dl:true},
    {name:"Musa Ibrahim",time:"2 hr",aud:"other",kind:"photo",photos:4,seed:1,cap:"Project boards are up. Come and see them before Friday.",likes:1245,comments:41,dl:true},
    {name:"Chiamaka Obi",time:"5 hr",aud:"everyone",kind:"text",bg:3,text:"Ward posting starts Monday. Any tips from Year 3 and above?",cap:"",likes:44,comments:27,dl:false}
  ],
  friends:[
    {name:"Kelechi Nwosu",time:"40 min",aud:"friends",kind:"text",bg:1,text:"Study group tomorrow at 4pm, main library. Bring past questions.",cap:"",likes:12,comments:6,dl:false},
    {name:"Halima Sani",time:"4 hr",aud:"selected",kind:"photo",photos:2,seed:2,cap:"Only for the study group. Our whiteboard from today.",likes:8,comments:3,dl:true}
  ]
};
const POOL={
  school:[
    {name:"Tunde Bello",aud:"school",kind:"text",bg:3,text:"Workshop stays open till 6pm today. Bring your safety boots.",cap:"",likes:3,comments:0,dl:false},
    {name:"Zainab Yusuf",aud:"everyone",kind:"photo",photos:2,seed:3,cap:"Library is full but the third floor still has seats.",likes:6,comments:1,dl:false},
    {name:"Ada Okafor",aud:"school",kind:"text",bg:4,text:"CSC 208 tutorial is moved to 2pm. Please share.",cap:"",likes:11,comments:2,dl:false}
  ],
  other:[
    {name:"Ngozi Eze",aud:"everyone",kind:"photo",photos:3,seed:1,cap:"Moot court practice went better than expected.",likes:9,comments:2,dl:true},
    {name:"Chiamaka Obi",aud:"other",kind:"text",bg:5,text:"Blood drive at our campus clinic this Saturday.",cap:"",likes:21,comments:4,dl:false},
    {name:"Musa Ibrahim",aud:"everyone",kind:"video",dur:"0:33",cap:"Timelapse of a model going up.",likes:34,comments:6,dl:true}
  ],
  friends:[
    {name:"Halima Sani",aud:"friends",kind:"text",bg:2,text:"Anyone free for a quick R session tonight?",cap:"",likes:2,comments:1,dl:false},
    {name:"Kelechi Nwosu",aud:"friends",kind:"photo",photos:1,seed:0,cap:"Today's whiteboard.",likes:5,comments:0,dl:false},
    {name:"Ada Okafor",aud:"selected",kind:"text",bg:1,text:"Sharing the marking scheme with the group only.",cap:"",likes:4,comments:2,dl:false}
  ]
};
POSTS.school[1].rp=["Kelechi Nwosu","Halima Sani","Ngozi Eze"];POSTS.school[1].repostTime="35 min ago";
POSTS.school[2].rp=["Ada Okafor","Musa Ibrahim","Zainab Yusuf","Ngozi Eze"];POSTS.school[2].repostTime="2h ago";
POSTS.other[0].rp=["Tunde Bello","Chiamaka Obi"];POSTS.other[0].repostTime="4h ago";
POSTS.other[1].rp=["Ada Okafor","Kelechi Nwosu","Ngozi Eze","Zainab Yusuf","Chiamaka Obi"];POSTS.other[1].repostTime="1 day ago";
Object.values(POSTS).forEach(a=>a.forEach(reg));Object.values(POOL).forEach(a=>a.forEach(reg));
const AD={by:"Chidi's Laptop Repairs",title:"Cracked screen or slow laptop?",body:"Bring it to the campus gate stall. 10% off when you show your SLC username.",cta:"See details"};

const knownSet=()=>new Set(FOLL.me.following.map(x=>x.n));
function fmtCount(n){
  n=Math.max(0,Math.floor(n));
  if(n<1000)return String(n);
  if(n<1000000){const v=Math.floor(n/100)/10;return (v%1===0?v.toFixed(0):v.toFixed(1))+"K";}
  const v=Math.floor(n/100000)/10;return (v%1===0?v.toFixed(0):v.toFixed(1))+"M";
}
const rsum=p=>Object.values(p.R||{}).reduce((a,b)=>a+b,0);
const canRepost=p=>(p.aud==="everyone"||p.aud==="other")&&!p.rpOff&&!p.own;
function setReaction(p,emo){
  if(p.myR){p.R[p.myR]=(p.R[p.myR]||1)-1;if(p.R[p.myR]<=0)delete p.R[p.myR];}
  if(emo&&emo!==p.myR){p.R[emo]=(p.R[emo]||0)+1;p.myR=emo;}else p.myR=null;
}
function refreshPost(p){
  $$(`.post[data-id="${p.id}"]`).forEach(el=>{const d=document.createElement("div");d.innerHTML=postHTML(p);el.replaceWith(d.firstElementChild);});
}
function rpLine(p){
  const rp=p.rp||[];if(!rp.length)return "";
  const known=knownSet(),kn=rp.filter(n=>known.has(n)||n===ME.n),others=rp.length-kn.length;
  const nm=kn.slice(0,2).map(n=>n===ME.n?"You":n.split(" ")[0]);
  let txt;
  if(kn.length){txt=(kn.length<=2?nm.join(" and "):nm.join(", ")+" and "+(kn.length-2)+" more")+(others?" + "+others+" other"+(others>1?"s":""):"")+" reposted";}
  else txt=rp.length+" repost"+(rp.length>1?"s":"");
  const stack=kn.slice(0,3).map(n=>av(n,22)).join("");
  const mine=rp.includes(ME.n);
  const rtime=p.repostTime?` <small style="color:var(--muted);font-weight:400">${esc(p.repostTime)}</small>`:"";
  return `<div class="rpline"><button class="rpnames" type="button" data-reposters="${p.id}">${stack?`<span class="stack">${stack}</span>`:ic("repost","sm")}<span>${esc(txt)}${rtime}</span></button>
    <button class="btn sm ${mine?"on":""}" type="button" data-repost="${p.id}" ${canRepost(p)?"":"disabled"} aria-label="${mine?"Undo repost":"Repost"}">${ic("repost","sm")} ${mine?"Reposted":"Repost"}</button></div>`;
}
function postHTML(p){
  const a=AUD[p.aud],pe=person(p.name)||ME;
  let media="";
  if(p.kind==="video")media=`<div class="media video" data-mopen><button class="playbtn" type="button" aria-label="Play video">${ic("play")}</button><span class="badge">${esc(p.dur||"0:00")}</span></div>`;
  else if(p.kind==="text")media=`<div class="media text bg${p.bg}">${esc(p.text)}</div>`;
  else if(p.kind==="photo")media=`<div class="media photo" data-mopen data-seed="${p.seed}" data-n="${p.photos}" data-i="0">${scene(p.seed)}${p.photos>1?`<span class="badge">1/${p.photos}</span><button class="pnext" type="button" aria-label="Next photo">${ic("back").replace('<svg','<svg style="transform:scaleX(-1)"')}</button>`:""}</div>`;
  else if(p.kind==="userphoto")media=`<div class="media photo" data-mopen><img src="${p.src}" alt="Photo posted by you">${p.photos>1?`<span class="badge">1/${p.photos}</span>`:""}</div>`;
  const qp=p.quote?ALL.get(p.quote):null;
  if(qp)media=`<div class="qcard" data-tile="${qp.id}" role="button" tabindex="0" aria-label="Open original post"><div class="qh">${av(qp.name,26)}<b>${esc(qp.name)}</b><small style="color:var(--muted)">${esc(qp.time)}</small></div><p>${esc(qp.text||qp.cap||(qp.kind==="video"?"Video":"Photo"))}</p></div>`;
  const menu=p.own
    ? `<button data-act="edit">Edit caption</button><button data-act="aud">Change audience</button><button data-act="comments">${p.cmOff?"Turn comments on":"Turn comments off"}</button><button data-act="dl">${p.dl?"Block download":"Allow download"}</button><button class="danger" data-act="del">Delete post</button>`
    : `<button data-act="save">Save post</button><button data-act="link">Copy link</button><button class="danger" data-act="report">Report or send feedback</button>`;
  const top=Object.entries(p.R||{}).sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>x[0]).join("");
  const rpd=(p.rp||[]).includes(ME.n);
  return `<article class="post" data-id="${p.id}">
    ${p.repostedBy?`<div class="rpby" style="color:var(--muted);margin:0 0 8px;display:flex;gap:6px;align-items:center;font-size:14px">${ic("repost","sm")}${esc(p.repostedBy===ME.n?"You":p.repostedBy)} reposted</div>`:""}
    <div class="head"><button class="avbtn ${STATUS[p.name]&&canSeePhoto(pe)&&!p.own?(STATUS[p.name].seen?"ring-seen":"ring-on"):""}" type="button" data-avatar="${esc(p.name)}" aria-label="View ${esc(p.name)} photo or status">${av(p.name)}</button>
      <div class="who"><div class="l1"><button class="lnk" type="button" data-profile="${esc(p.name)}">${esc(p.name)}</button>${lv(pe.lv)}</div>
        <div class="meta"><span>${esc(pe.d)}, ${esc(pe.s)}</span><span>${esc(p.time)}</span><span>${ic(a[0],"sm")}${a[1]}</span></div></div>
      <button class="iconbtn" data-menu aria-haspopup="menu" aria-expanded="false" aria-label="Post options">${ic("more")}</button>
    </div>
    <div class="menu" role="menu" hidden>${menu}</div>
    ${p.cap?`<p class="cap">${esc(p.cap)}</p>`:""}
    ${media}
    ${rpLine(p)}
    <div class="actions">
      <button class="iconbtn act ${p.myR?"liked":""}" data-like aria-pressed="${!!p.myR}" aria-label="${p.myR?"Remove your reaction":"Like. Hold to react with any emoji"}">${p.myR?`<span class="remo">${p.myR}</span>`:ic("heart")}<span class="n">${fmtCount(rsum(p))}</span></button>
      ${top?`<button class="iconbtn rsum" type="button" data-rsum="${p.id}" aria-label="See reactions">${top}</button>`:""}
      <button class="iconbtn" data-reactbtn aria-label="React with any emoji">${ic("smile","sm")}</button>
      <button class="iconbtn" data-comments aria-label="Comments">${ic("msg")}<span>${fmtCount(p.comments)}</span></button>
      <button class="iconbtn act ${rpd?"reposted":""}" data-repost="${p.id}" aria-label="${rpd?"Undo repost":"Repost"}" ${canRepost(p)?"":"disabled"}>${ic("repost")}<span>${fmtCount((p.rp||[]).length)}</span></button>
      <button class="iconbtn act ${p.saved?"saved":""}" data-save aria-pressed="${p.saved}" aria-label="Save. ${p.saves} people saved this">${ic("mark")}<span class="sn">${fmtCount(p.saves)}</span></button>
      <span class="sp"></span>
      <button class="iconbtn sharebtn" data-share aria-label="Share">${ic("fwd")}<span>${fmtCount(p.shares)}</span></button>
    </div>
    ${commentPreviewHTML(p)}
    </article>`;
}
function adCardHTML(p,forcePending){
  if(p.id&&window.SLCMarket)window.SLCMarket.stash(p);
  const pending=forcePending!=null?forcePending:p.pending;
  const tag=pending?"Sponsored by you \u2022 pending review":(p.by===ME.n?"Sponsored by you":"Sponsored by a student");
  const art=p.img?`<div class="adart" style="padding:0;overflow:hidden"><img src="${p.img}" alt="" style="width:100%;height:100%;object-fit:cover"></div>`:`<div class="adart" aria-hidden="true">${esc((p.title||"AD").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"AD")}</div>`;
  return `<article class="post ad ${pending?"adpreview":""}"><span class="tag">${tag}</span>
    <div class="adbody">${art}<div><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p><div class="adbtns">${p.id?`<button class="btn primary" type="button" data-addetail="my-${p.uid||p.id}">See details</button>`:""}${p.contact?`<button class="btn" type="button" data-adcontact="${p.id||""}">Contact</button>`:""}</div></div></div>
    <div style="margin-top:10px;color:var(--muted);font-size:14px">Posted by ${esc(p.by||ME.n)}</div></article>`;
}
const MYADS=[];
function saveMyAds(){
  try{localStorage.setItem("slc-myads",JSON.stringify(MYADS.map(p=>({uid:p.uid,title:p.title,body:p.body,contact:p.contact,img:p.img,by:p.by,tier:p.tier,price:p.price,views:p.views,contactTaps:p.contactTaps,pending:!!p.pending,rejected:!!p.rejected,paused:!!p.paused,payRef:p.payRef,payName:p.payName,payStatus:p.payStatus}))));}catch(e){}
}
function loadMyAds(){
  try{
    const a=JSON.parse(localStorage.getItem("slc-myads")||"[]");
    a.slice().reverse().forEach(o=>{const p=reg({...o,isAd:true});POSTS.school.splice(1,0,p);MYADS.unshift(p);});
  }catch(e){}
}
const AD_TIERS=[{id:"basic",name:"Basic",views:500,days:3,price:500},{id:"boost",name:"Boosted",views:2000,days:7,price:1500},{id:"premium",name:"Premium",views:6000,days:14,price:3000}];
const naira=n=>"₦"+Number(n).toLocaleString("en-NG");
const tierOf=p=>AD_TIERS.find(x=>x.id===(p&&p.tier))||AD_TIERS[0];
function renderTiers(){
  const box=$("#tierwrap");if(!box)return;
  box.innerHTML=AD_TIERS.map(t=>`<button type="button" class="tiercard ${AD_C.tier===t.id?"on":""}" data-tier="${t.id}" role="radio" aria-checked="${AD_C.tier===t.id}"><b>${t.name}</b><span class="tprice">${naira(t.price)}</span><small>${t.views.toLocaleString()}+ views, ${t.days} days</small></button>`).join("");
}
function adStatusBadge(p){
  if(p.rejected)return `<span class="adbadge rejected">Rejected</span>`;
  if(p.pending)return `<span class="adbadge pending">Pending review</span>`;
  if(p.paused)return `<span class="adbadge paused">Paused</span>`;
  return `<span class="adbadge approved">Live</span>`;
}
function incrementAdViews(){
  MYADS.forEach(p=>{
    if(p.pending||p.rejected||p.paused)return;
    const cap=Math.round(tierOf(p).views*1.4);
    if((p.views||0)<cap)p.views=(p.views||0)+Math.floor(Math.random()*9)+2;
  });
}
function renderMyAdRow(p){
  const thumb=p.img?`<img src="${p.img}" alt="">`:esc((p.title||"AD").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"AD");
  const stat=(!p.pending&&!p.rejected)?`<small style="color:var(--muted);display:block;margin-top:3px">${fmtCount(p.views||0)} views, ${fmtCount(p.contactTaps||0)} contact taps</small>`:"";
  const acts=p.pending?`<div class="adacts"><button class="btn sm" type="button" data-adapprove="${p.id}">Simulate approval</button><button class="btn sm" type="button" data-adreject="${p.id}">Simulate rejection</button></div>
     <p class="hint" style="margin:4px 0 0">These two buttons stand in for SLC.admin's review, just so you can see both outcomes here.</p>`:
    p.rejected?`<p class="hint" style="margin:4px 0 0">Reason: doesn't match SLC's ad guidelines (demo reason).</p>`:
    `<p class="hint" style="margin:4px 0 0">Tap to see full details and settings.</p>`;
  return `<div class="adrow" data-adopen="${p.id}" role="button" tabindex="0" style="cursor:pointer"><div class="adthumb">${thumb}</div><div class="adinfo"><b>${esc(p.title)}</b>${adStatusBadge(p)}${stat}${acts}</div></div>`;
}
function renderAdPreview(){
  const title=$("#adtitle").value.trim(),body=$("#adbody").value.trim(),contact=$("#adcontact").value.trim();
  const box=$("#adPreview");
  if(!title&&!body){box.innerHTML=`<div class="post ad adpreview adpv-empty">Fill in a title and description to see your ad here.</div>`;return;}
  const t=tierOf({tier:AD_C.tier});
  box.innerHTML=adCardHTML({title:title||"Your ad title",body:body||"Your ad description will show here.",contact,img:AD_C.img,by:ME.n},true)+
    `<p class="hint" style="margin:8px 2px 0">${t.name} package: ${naira(t.price)} for ${t.views.toLocaleString()}+ views over ${t.days} days.</p>`;
}
function adHTML(){
  return `<article class="post ad"><span class="tag">Sponsored by a student</span>
    <div class="adbody"><div class="adart" aria-hidden="true">CL</div><div><h3>${esc(AD.title)}</h3><p>${esc(AD.body)}</p><button class="btn primary" type="button" data-addetail="1">${esc(AD.cta)}</button></div></div>
    <div style="margin-top:10px;color:var(--muted);font-size:14px">Posted by ${esc(AD.by)}</div></article>`;
}
const feedEl=$("#feedlist");
function renderFeed(){
  saveMyAds();
  const list=POSTS[S.tab];let h="";
  list.forEach((p,i)=>{h+=p.isAd?((p.rejected||p.paused)?"":adCardHTML(p)):postHTML(p);if(i===1)h+=adHTML();});
  feedEl.innerHTML=h;feedEl.setAttribute("aria-labelledby","tab-"+S.tab);
}

/* toast */
let tt;
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{t.hidden=true;},2600);}

/* router */
const TITLES={home:"Home",notifs:"Notifications",messages:"Messages",profile:"Profile",settings:"Settings",friends:"Friends",create:"Create",editprofile:"Edit profile",market:"SLC Ads Market",ad:"Ad details"};
function go(view,opts={}){
  if(view!==PAGE&&PAGE_OF[view]&&!S.booting){
    if(view==="profile")S.profileOf=opts.who||"me";
    if(view==="friends"&&!opts.keep){S.listOf="me";S.flist="friends";}
    location.href=PAGE_OF[view]+(opts.q||"");return;
  }
  if(view!==S.view)S.prev=S.view;
  S.view=view;
  if(view==="profile"&&(opts.who||!S.booting))S.profileOf=opts.who||"me";
  if(view==="friends"&&!opts.keep&&!S.booting){S.listOf="me";S.flist="friends";}
  $$(".view").forEach(v=>{v.hidden=v.id!=="v-"+view;});
  $("#app").classList.toggle("two",view!=="home");
  document.body.dataset.view=view;
  $("#title").textContent=view==="profile"&&S.profileOf!=="me"?"Profile":TITLES[view];
  $$(".nav [data-go],.bottom [data-go]").forEach(b=>{
    const mine=b.hasAttribute("data-mine");
    const on=b.dataset.go===view&&(view!=="profile"||(mine&&S.profileOf==="me"));
    if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
  });
  if(view==="notifs")renderNotifs();
  if(view==="messages"){renderInbox();renderChat();}
  if(view==="profile")renderProfile();
  if(view==="friends")renderFriends();
  if(view==="settings")renderSettings();
  if(view==="editprofile")renderEditProfile();
  if(view==="market"&&window.SLCMarket)window.SLCMarket.showMarket();
  if(view==="ad"&&window.SLCMarket)window.SLCMarket.showAd();
  if(view!=="messages"){$("#msgs").classList.remove("open");document.body.classList.remove("chat-open");}
  window.scrollTo(0,0);
  document.body.classList.remove("bar-hidden");
}

/* badges */
const MYFIRST=POSTS.school[0],ADAPOST=POSTS.school[1],TUNDEPOST=POSTS.school[2];
const NOTIFS=[
  {id:"lv",type:"level",unread:true,time:"Just now"},
  {id:"pv",type:"views",text:"6 people viewed your profile",time:"Today",unread:true,action:"See who"},
  {id:"n1",type:"like",who:"Ada Okafor",text:"liked your post",time:"5 min",unread:true,postId:MYFIRST.id},
  {id:"n2",type:"follow",who:"Kelechi Nwosu",text:"started following you",time:"20 min",unread:true,action:"Follow back"},
  {id:"n3",type:"comment",who:"Tunde Bello",text:"commented: \"This is clean. Which software did you use?\"",time:"1 hr",unread:true,postId:ADAPOST.id,openComments:true},
  {id:"n4",type:"mutual",who:"Halima Sani",text:"followed you back. You can now message each other.",time:"3 hr",unread:true,action:"Message"},
  {id:"n5",type:"seen",text:"Your status was seen by 18 people",time:"5 hr"},
  {id:"n6",type:"like",who:"Musa Ibrahim",text:"liked your photo",time:"Yesterday",postId:TUNDEPOST.id},
  {id:"n7",type:"welcome",text:"Welcome to SLC. Add a profile photo so classmates can find you.",time:"2 days"}
];
function updateBadges(){
  const n=NOTIFS.filter(x=>x.unread).length;
  $$("[data-bell-count]").forEach(b=>{b.textContent=n;b.hidden=n===0;});
  $$(".bell").forEach(b=>b.setAttribute("aria-label",n?`Notifications, ${n} unread`:"Notifications"));
}
const NICON={views:"eye",share:"fwd",level:"trophy",like:"heart",follow:"uplus",comment:"msg",mutual:"users",seen:"eye",welcome:"user"};
let openLevel=false;
function levelPanel(){
  if(S.level==="agree")return `<div class="done">${ic("check")}<span>Thanks. Your profile now shows Year 3.</span></div>`;
  if(S.level==="carry")return `<div class="done">${ic("check")}<span>We will get back to you soon.</span></div>`;
  if(S.level&&S.level.startsWith("later"))return `<div class="done">${ic("check")}<span>We will ask you again on ${esc(S.level.slice(6))}. Your profile shows Year 2 until then.</span></div>`;
  return `<div class="lvpanel"><ul>
    <li>Your level goes up by one because your school started a new session.</li>
    <li>If you have a carryover or spillover, choose that option so you are not moved up by mistake.</li>
    <li>If you have finished your programme, your access ends after the grace period. Your old posts stay visible.</li>
    <li>False information can lead to your account being suspended.</li></ul>
    <div class="btnrow">
      <button class="btn primary" data-answer="agree" type="button">I agree, I've moved up</button>
      <button class="btn" data-answer="carry" type="button">I have a carryover</button>
      <button class="btn" data-answer="later" type="button">Not yet</button></div>
    <div class="later" id="later" hidden><label for="remind">Remind me on</label><input type="date" id="remind"><button class="btn primary" id="setremind" type="button">Set reminder</button>
      <span class="hint" id="remind-hint">Pick a date within the next 60 days. Your profile keeps showing Year 2 until then.</span></div></div>`;
}
function notifHTML(n){
  const dot=n.unread?'<span class="dot" aria-label="Unread"></span>':"";
  if(n.type==="level"){
    return `<div class="nt levelup ${n.unread?"unread":""}" data-nid="${n.id}"><span class="ico">${ic("trophy")}</span>
      <div class="txt"><b>The 2026/2027 session has started</b><div>Your level is now Year 3. ${S.level?"":(openLevel?"Read the conditions below and confirm.":"Tap to read the conditions and confirm.")}</div><div class="tm">${n.time}</div>
      ${openLevel||S.level?levelPanel():`<div class="btnrow" style="margin-top:10px"><button class="btn primary" type="button" data-open-level>Confirm my level</button></div>`}</div>${dot}</div>`;
  }
  const who=n.who?`<button class="lnk" type="button" data-profile="${esc(n.who)}">${esc(n.who)}</button> `:"";
  const act=n.action?`<div class="btnrow" style="margin-top:8px"><button class="btn" type="button" data-nact="${n.type}" data-who="${esc(n.who||"")}">${n.action}</button></div>`:"";
  const openable=n.postId!=null?` data-nopen="${n.postId}"`:"";
  return `<div class="nt ${n.unread?"unread":""}" data-nid="${n.id}"${openable}><span class="ico">${ic(NICON[n.type])}</span><div class="txt"><div>${who}${esc(n.text)}</div><div class="tm">${n.time}</div>${act}</div>${dot}</div>`;
}
function renderNotifs(){
  const fresh=NOTIFS.filter(n=>n.unread||n.type==="level"&&!S.level),old=NOTIFS.filter(n=>!fresh.includes(n));
  $("#notiflist").innerHTML=(fresh.length?`<div class="sectitle">New</div>`+fresh.map(notifHTML).join(""):"")+(old.length?`<div class="sectitle">Earlier</div>`+old.map(notifHTML).join(""):"");
  const r=$("#remind");if(r){const a=new Date();a.setDate(a.getDate()+1);const b=new Date();b.setDate(b.getDate()+60);r.min=a.toISOString().slice(0,10);r.max=b.toISOString().slice(0,10);}
  updateBadges();
}
function answerLevel(a){
  const n=NOTIFS.find(x=>x.id==="lv");
  if(a==="later"){$("#later").hidden=false;$("#remind").focus();return;}
  S.level=a;n.unread=false;
  if(a==="carry"){NOTIFS.splice(1,0,{id:"n8",type:"welcome",text:"Carryover request received. We will get back to you soon.",time:"Just now",unread:false});}
  renderNotifs();
}


/* ---------------- sign-in / sign-up / ID verification ---------------- */
const SCHOOLS=["Federal University of Technology Akure (FUTA)","University of Lagos (UNILAG)","University of Benin (UNIBEN)","Ahmadu Bello University (ABU)","University of Ibadan (UI)","Lagos State University (LASU)"];
const AS={tab:"login",step:1,d:{name:"",email:"",pass:"",school:SCHOOLS[0],dept:"",year:new Date().getFullYear(),programme:"4",idImg:null,scanned:false,matched:false}};
function authOpt(name,label,ctl){return `<div class="fld"><label for="${name}">${label}</label>${ctl}</div>`;}
function renderAuth(){
  const c=$("#authCard");
  if(AS.tab==="login"){
    c.innerHTML=`<div class="authtabs" role="tablist"><button type="button" data-authtab="login" aria-selected="true">Log in</button><button type="button" data-authtab="signup" aria-selected="false">Sign up</button></div>
     ${authOpt("liemail","School or personal email",`<input id="liemail" type="email" placeholder="you@example.com">`)}
     ${authOpt("lipass","Password",`<div class="pwfield"><input id="lipass" type="password" placeholder="Your password"><button type="button" class="pwtoggle" data-pwtoggle="lipass" aria-label="Show password" aria-pressed="false">${ic("eye","sm")}</button></div>`)}
     <div class="authfoot"><button class="btn primary" type="button" id="doLogin" style="flex:1">Log in</button></div>
     <p class="stepline" style="margin:14px 0 0;text-align:center">No account? <button class="authlink" type="button" data-authtab="signup">Sign up</button></p>`;
    return;
  }
  const bars=[1,2,3].map(n=>`<i class="${n<=AS.step?"on":""}"></i>`).join("");
  let body="";
  if(AS.step===1){
    body=`${authOpt("suname","Full name",`<input id="suname" value="${esc(AS.d.name)}" placeholder="Your full name">`)}
     ${authOpt("suemail","Email",`<input id="suemail" type="email" value="${esc(AS.d.email)}" placeholder="you@example.com">`)}
     ${authOpt("supass","Password",`<div class="pwfield"><input id="supass" type="password" value="${esc(AS.d.pass)}" placeholder="Create a password"><button type="button" class="pwtoggle" data-pwtoggle="supass" aria-label="Show password" aria-pressed="false">${ic("eye","sm")}</button></div>`)}
     <div class="authfoot"><button class="btn primary" type="button" id="authNext" style="flex:1">Continue</button></div>`;
  }else if(AS.step===2){
    body=`${authOpt("suschool","School",`<select id="suschool">${SCHOOLS.map(s=>`<option ${s===AS.d.school?"selected":""}>${esc(s)}</option>`).join("")}</select>`)}
     <div class="rowfld">${authOpt("sudept","Department",`<input id="sudept" value="${esc(AS.d.dept)}" placeholder="e.g. Computer Science">`)}${authOpt("suyear","Admission year",`<input id="suyear" type="number" min="2015" max="${new Date().getFullYear()}" value="${AS.d.year}">`)}</div>
     ${authOpt("suprog","Programme length",`<select id="suprog"><option value="4" ${AS.d.programme==="4"?"selected":""}>4 years</option><option value="5" ${AS.d.programme==="5"?"selected":""}>5 years</option><option value="6" ${AS.d.programme==="6"?"selected":""}>6 years</option></select>`)}
     <div class="authfoot"><button class="btn" type="button" id="authBack">Back</button><button class="btn primary" type="button" id="authNext">Continue</button></div>`;
  }else if(AS.step===3){
    if(!AS.warmed){AS.warmed=1;fetch("api/verify_id.php",{credentials:"same-origin"}).catch(()=>{});}
    const img=AS.d.idImg;
    body=`<p class="stepline" style="margin:0 0 14px">Upload your student ID card or admission letter. We scan it to check it matches the details you entered.</p>
     <div class="idbox" id="idbox">${img?`<img src="${img}" alt="Uploaded ID">${AS.scanning?`<span class="idscan"></span>`:""}`:`${ic("photo","lg")}<p style="margin:8px 0 0">No file chosen yet</p>`}</div>
     <div class="authfoot"><button class="chip" type="button" id="idpick" style="flex:1">${img?"Replace file":"Choose ID or admission letter"}</button>${img&&!AS.d.scanned?`<button class="btn primary" type="button" id="idscan" style="flex:1">Scan ID</button>`:""}</div>
     ${AS.d.scanned?`<div class="extract"><div class="row2"><b>Name on document</b><span>${esc(AS.d.name)}</span></div><div class="row2"><b>School</b><span>${esc(AS.d.school.split(" (")[0])}</span></div><div class="row2"><b>Admission no.</b><span>${esc(AS.d.matric)}</span></div></div>
       <div class="matchok">${ic("check","sm")} Matches the details you entered</div>`:""}
     ${AS.d.review?`<div class="extract"><p class="stepline" style="margin:0">We could not clearly match this picture to your details. That is common with photos, so a person at SLC will check it. You can create your account now.</p></div>`:""}
     <div class="authfoot"><button class="btn" type="button" id="authBack">Back</button><button class="btn primary" type="button" id="authNext" ${(AS.d.scanned||AS.d.review)?"":"disabled"}>Create account</button></div>
     ${(AS.d.scanned||AS.d.review)?"":`<p class="stepline" style="text-align:center">or <button class="authlink" type="button" id="idskip">skip for now, verify me later</button></p>`}`;
  }else{
    body=`<div class="donewrap">${ic("check")}<h2 style="margin:0 0 6px;font:700 20px/1.3 var(--font-display)">Account created</h2>
      <p class="stepline" style="margin:0 0 4px">${AS.d.scanned?"Your ID matched automatically, so you're verified and ready to go.":"You skipped ID verification, so SLC.admin will confirm your details before it's final."}</p></div>
      <div class="authfoot"><button class="btn primary" type="button" id="enterSLC" style="flex:1">Enter SLC</button></div>`;
  }
  c.innerHTML=`<div class="authtabs" role="tablist"><button type="button" data-authtab="login" aria-selected="false">Log in</button><button type="button" data-authtab="signup" aria-selected="true">Sign up</button></div>
   ${AS.step<4?`<div class="steps" aria-hidden="true">${bars}</div><p class="stepline">Step ${AS.step} of 3</p>`:""}
   ${body}`;
}
/* Talking to the PHP login. If the server cannot be reached, the visitor is told so. */
function authApi(path,body){
  return fetch("api/"+path,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(body)}).then(r=>{
    if(!(r.headers.get("content-type")||"").includes("json"))throw new Error("no server");
    return r.json().then(j=>({s:r.status,j}));
  });
}
const noServer=e=>e&&(e.message==="no server"||e instanceof TypeError);
function applyServerUser(u){AS.server=true;ME.n=u.name;ME.u=u.username;if(u.department)ME.d=u.department;}
function createAccount(){
  const d=AS.d;
  authApi("register.php",{name:d.name,email:d.email,password:d.pass,school:d.school,department:d.dept,year:d.year,programme:+d.programme}).then(({s,j})=>{
    if(s===201&&j.user){applyServerUser(j.user);AS.step=4;renderAuth();return;}
    toast(j.error||"Could not create your account.");
    if(s===409||s===422){AS.step=1;renderAuth();}
  }).catch(()=>{toast("Could not reach the server. Please try again.");});
}
function shrinkPicture(blob){   /* phone photos are huge: send at most 2000 px wide, which reads just as well and uploads faster */
  return new Promise(res=>{
    const url=URL.createObjectURL(blob),im=new Image();
    im.onload=()=>{
      const k=Math.min(1,2000/Math.max(im.width,im.height)),c=document.createElement("canvas");
      c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
      c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b=>res(b||blob),"image/jpeg",0.88);
    };
    im.onerror=()=>{URL.revokeObjectURL(url);res(blob);};
    im.src=url;
  });
}
function scanId(){
  return fetch(AS.d.idImg).then(r=>r.blob()).then(shrinkPicture).then(blob=>{
    const fd=new FormData();fd.append("file",blob,"id");fd.append("name",AS.d.name);fd.append("school",AS.d.school);
    return fetch("api/verify_id.php",{method:"POST",body:fd,credentials:"same-origin"});
  }).then(r=>{
    if(!(r.headers.get("content-type")||"").includes("json"))throw new Error("no server");
    return r.json().then(j=>({s:r.status,j}));
  }).then(({s,j})=>{
    if(s===200)return j;
    if(s===503)return {decision:"review",unavailable:true};
    throw new Error(j.error||"Could not check that picture.");
  }).catch(e=>{if(noServer(e))throw new Error("Could not reach the server. Please try again.");throw e;});
}
function finishAuth(){
  if(AS.d.name&&!AS.server){ME.n=AS.d.name;ME.u=AS.d.name.toLowerCase().split(/\s+/).join(".");}
  if(AS.d.dept&&!AS.server)ME.d=AS.d.dept;
  try{localStorage.setItem("slc-session","1");}catch(e){}
  saveMe();
  location.href="index.html";
}

/* messages */
let mid=0,chid=10,AC;
const M=(w,type,o={})=>({id:++mid,w,type,seen:true,time:"10:00",...o});
const nowT=()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");};
const fmtT=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
const fmtSize=b=>b>1048576?(b/1048576).toFixed(1)+" MB":Math.max(1,Math.round(b/1024))+" KB";
const EM={
  face:["😀","😃","😄","😁","😆","😅","😂","🤣","🙂","😉","😊","😍","🥰","😘","😎","🤩","🥳","😇","🤔","😴","😭","😤","🤯","😬"],
  hand:["👍","👎","👏","🙌","🙏","🤝","💪","👌","✌️","🤞","👋","🫶","✍️","🤙","👀","🧠"],
  heart:["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💖","💯","🔥","✨","⭐","🎉","🎊","🏆"],
  campus:["📚","📖","✏️","📝","🎓","🏫","💻","🧪","🔬","📐","🧮","🕒","☕","🍕","🍚","🚌"]
};
const EMTABS=[["face","😀","Faces"],["hand","👍","Gestures"],["heart","❤️","Hearts"],["campus","🎓","Campus"],["stk","🖼️","Stickers"]];
const STK=[["🎉","Congrats!","#0f4fb4"],["📚","Study time","#0f8fa0"],["😂","Too funny","#e69500"],["👏","Well done","#7a3f9d"],["🔥","On fire","#c2410c"],["🥳","Party!","#be1e5a"],["😴","So tired","#3b3fb5"],["🤝","Deal","#1f7a4d"],["🙏","Thank you","#0a7482"]];
const BSTYLES=[["classic","Classic"],["round","Bubble"],["glow","Glow"],["flat","Minimal"],["corner","Corner"]];
const WPLIST=[["none","Plain"],["doodle","Doodles"],["dots","Dots"],["waves","Waves"],["night","Night"],["sunset","Sunset"],["forest","Forest"],["ocean","Ocean"]];
const TONES=[["chime","Chime"],["pop","Pop"],["bubble","Bubbles"],["ding","Ding"],["soft","Soft"],["silent","Silent"]];
function playTone(name){
  if(name==="silent")return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const seq={chime:[[880,0,.2],[1319,.14,.34]],pop:[[560,0,.1]],bubble:[[420,0,.09],[640,.08,.09],[860,.16,.14]],ding:[[1046,0,.7]],soft:[[392,0,.3],[494,.2,.4]]}[name];
    const t0=AC.currentTime+0.02;
    seq.forEach(([f,d,l])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=name==="bubble"?"triangle":"sine";o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t0+d);g.gain.exponentialRampToValueAtTime(0.22,t0+d+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+d+l);
      o.connect(g);g.connect(AC.destination);o.start(t0+d);o.stop(t0+d+l+0.05);});
  }catch(e){}
}
const CH=[
  {id:1,name:"Ada Okafor",online:true,mutual:true,unread:2,time:"2m",msgs:[
    M("Ada Okafor","text",{text:"Hey! Did you see the new CSC 208 questions?",time:"10:02"}),
    M("me","text",{text:"Yes. I'm on question 3 now.",time:"10:04"}),
    M("Ada Okafor","doc",{name:"CSC208_notes.pdf",size:"1.2 MB",time:"10:05"}),
    M("me","sticker",{e:"👏",text:"Well done",c:"#7a3f9d",time:"10:05"}),
    M("Ada Okafor","text",{text:"Nice. Are you coming to the library tonight?",time:"10:06"})]},
  {id:2,name:"Kelechi Nwosu",online:true,mutual:true,unread:1,time:"14m",msgs:[
    M("me","text",{text:"Study group is on for tomorrow?",time:"09:40"}),
    M("Kelechi Nwosu","text",{text:"Yes, 4pm. See the plan:",time:"09:52"}),
    M("Kelechi Nwosu","photo",{k:2,text:"Whiteboard plan",time:"09:53"}),
    M("Kelechi Nwosu","video",{dur:"0:14",time:"09:54"})]},
  {id:5,name:"Study Group",group:true,desc:"CSC 208 study plans",members:["Ada Okafor","Kelechi Nwosu","Halima Sani"],admins:["me"],creator:"me",onlyAdminsSend:false,onlyAdminsEdit:true,online:false,mutual:true,unread:0,time:"12m",msgs:[
    M("me","system",{text:"You created this group"}),
    M("Ada Okafor","text",{text:"Hi all. Library at 4pm?",time:"09:10"}),
    M("Kelechi Nwosu","voice",{dur:"0:09",time:"09:12"}),
    M("Halima Sani","emoji",{text:"👍",time:"09:13"}),
    M("me","text",{text:"See you there",time:"09:15"})]},
  {id:6,name:"CSC 208 Class",group:true,desc:"Official class updates",members:["Ada Okafor","Tunde Bello","Zainab Yusuf","Chiamaka Obi","Ngozi Eze"],admins:["Zainab Yusuf"],creator:"Zainab Yusuf",onlyAdminsSend:true,onlyAdminsEdit:true,online:false,mutual:true,unread:0,time:"Mon",msgs:[
    M("Zainab Yusuf","system",{text:"Zainab created this group"}),
    M("Zainab Yusuf","text",{text:"Tutorial moved to 2pm on Thursday.",time:"Mon"}),
    M("Zainab Yusuf","poll",{q:"Which day for the extra class?",multi:false,opts:[{t:"Wednesday",v:["Ada Okafor","Tunde Bello"]},{t:"Thursday",v:["Chiamaka Obi"]},{t:"Friday",v:[]}],time:"Mon"})]},
  {id:3,name:"Halima Sani",online:false,mutual:true,unread:0,time:"1h",msgs:[M("Halima Sani","text",{text:"Ok, see you tomorrow",time:"08:15"})]},
  {id:4,name:"Musa Ibrahim",online:false,mutual:false,unread:0,time:"Mon",msgs:[]},
  {id:7,name:"Ngozi Eze",online:false,mutual:false,request:true,unread:1,time:"3h",msgs:[M("Ngozi Eze","text",{text:"Hi! I saw your CSC 208 post. Can I ask a question?",time:"07:30"})]}
];
const CHAT_NOW=Date.now();
const CHAT_AGE={1:2,2:14,5:12,6:1500,3:60,4:1500,7:180};
CH.forEach(c=>{if(c.lastTs==null)c.lastTs=CHAT_NOW-(CHAT_AGE[c.id]||0)*60000;});
const sortedCH=()=>[...CH].sort((a,b)=>(b.lastTs||0)-(a.lastTs||0));
const chOnline=c=>!c.group&&isOnline(person(c.name));
const visibleCH=()=>sortedCH().filter(c=>!c.request||S.priv.msg==="everyone");
const iAmAdmin=c=>!!c.group&&c.admins.includes("me");
const canSend=c=>c.blocked?false:(c.group?(!c.onlyAdminsSend||iAmAdmin(c)):!!c.mutual);
const cav=(c,s,online)=>c.group?`<span class="av" style="--s:${s}px;background:var(--grad);color:var(--on-grad)">${ic("users")}</span>`:av(c.name,s,online);
const PV={text:m=>m.text,emoji:m=>m.text,sticker:()=>"Sticker",gif:()=>"GIF",photo:()=>"Photo",video:()=>"Video",doc:m=>"Document: "+m.name,voice:m=>"Voice note "+m.dur,poll:m=>"Poll: "+m.q,post:()=>"Shared a post",system:m=>m.text};
const last=c=>{const m=c.msgs[c.msgs.length-1];if(!m)return c.group?"No messages yet":"You follow "+c.name.split(" ")[0]+". Not followed back yet.";if(m.type==="system")return m.text;return (m.w==="me"?"You: ":(c.group?m.w.split(" ")[0]+": ":""))+PV[m.type](m);};
function msgBadge(){const n=visibleCH().reduce((s,x)=>s+(x.muted?0:x.unread),0);$$("[data-msg-count]").forEach(b=>{b.textContent=n;b.hidden=n===0;});}
function renderInbox(){
  $("#ilist").innerHTML=visibleCH().map(c=>`<button class="crow ${c.id===S.chat?"on":""}" data-chat="${c.id}" type="button">${cav(c,48,chOnline(c))}<span class="who"><b>${esc(c.name)}${c.request?`<span class="tag-req">Request</span>`:""}${c.muted?` <span class="mut" aria-label="Muted">${ic("bell","sm")}</span>`:""}</b><span class="pv">${inboxTick(c)}${esc(last(c))}</span></span><span><span class="tm">${c.time}</span>${c.unread?`<span class="ucount">${c.unread}</span>`:""}</span></button>`).join("");
  $("#inbox").classList.toggle("compact",S.inbox==="compact");
  $$("[data-inbox]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.inbox===S.inbox)));
}
function renderRail(){
  const on=PEOPLE.filter(x=>x.mutual&&isOnline(x));
  const act=S.priv.online==="nobody"?`<p class="sub" style="margin:0 0 8px">Your online status is hidden, so you can't see who is online.</p>`
    :(on.length?`<div class="actnow"><div class="sectitle" style="margin:6px 2px 8px">Active now</div><div class="online-row">${on.map(x=>`<button class="onl" type="button" data-openchatwith="${esc(x.n)}" aria-label="Chat with ${esc(x.n)}">${av(x.n,44,true)}<span>${esc(x.n.split(" ")[0])}</span></button>`).join("")}</div></div>`:"");
  $("#railchats").innerHTML=act+visibleCH().slice(0,4).map(c=>`<button class="row rowbtn" type="button" data-mini="${c.id}">${cav(c,42,chOnline(c))}<span class="who"><b>${esc(c.name)}</b><span class="pv">${inboxTick(c)}${esc(last(c))}</span></span><span><span class="tm">${c.time}</span>${c.unread&&!c.muted?`<span class="ucount">${c.unread}</span>`:""}</span></button>`).join("");
}
const wave=seed=>{let h="";for(let i=0;i<26;i++){h+=`<i style="height:${((Math.sin(i*1.7+seed)*.5+.5)*14+4).toFixed(0)}px"></i>`;}return h;};
function bubbleHTML(m,c){
  if(m.type==="system")return `<div class="day">${esc(m.text)}</div>`;
  const me=m.w==="me",cls=me?"mine":"theirs";
  const nm=(c.group&&!me)?`<span class="sn" style="color:color-mix(in srgb,hsl(${hue(m.w)} 70% 45%) 65%,var(--text))">${esc(m.w)}</span>`:"";
  const tk="";
  const tm=`<time>${m.time}${tk}</time>`,id=`data-mid="${m.id}"`;
  switch(m.type){
    case "sticker":{
      const inner=m.img?`<div class="stk stkimg" style="--c:${m.c||"#0f4fb4"}"><img src="${m.img}" alt="Sticker">${m.text?`<b>${esc(m.text)}</b>`:""}</div>`:`<div class="stk" style="--c:${m.c}"><span class="e">${m.e}</span><b>${esc(m.text)}</b></div>`;
      const save=cls==="theirs"?`<button class="savechip" type="button" data-savestk="${m.id}" aria-label="Save this sticker">${ic("mark","sm")}</button>`:"";
      return `<div class="stkwrap ${cls}" ${id}>${nm}<span class="stkbox">${inner}${save}</span>${tm}</div>`;
    }
    case "gif":{
      const save=cls==="theirs"?`<button class="savechip" type="button" data-savegif="${m.id}" aria-label="Save this GIF">${ic("mark","sm")}</button>`:"";
      return `<div class="stkwrap ${cls}" ${id}>${nm}<div class="gifwrap">${gifHTML(m.g)}<span class="gtag">GIF</span>${save}</div>${tm}</div>`;
    }
    case "emoji":return `<div class="b ${cls} big" ${id}>${nm}${esc(m.text)}${tm}</div>`;
    case "photo":return `<div class="b ${cls} med" ${id}>${nm}<button class="pic" type="button" data-open="${m.id}" aria-label="Open photo">${m.img?`<img src="${m.img}" alt="Photo">`:scene(m.k||0)}</button><button class="dlchip" type="button" data-dl="${m.id}" aria-label="Download photo">${ic("down","sm")}</button>${m.text?`<div class="cap">${esc(m.text)}</div>`:""}${tm}</div>`;
    case "video":return `<div class="b ${cls} med" ${id}>${nm}<button class="pic vid" type="button" data-open="${m.id}" aria-label="Open video"><span class="playbtn sm">${ic("play")}</span><span class="badge">${esc(m.dur||"Video")}</span></button><button class="dlchip" type="button" data-dl="${m.id}" aria-label="Download video">${ic("down","sm")}</button>${tm}</div>`;
    case "doc":{const ext=(m.name.split(".").pop()||"file").toUpperCase();return `<div class="b ${cls} doc" ${id}>${nm}<div class="dbox"><span class="dic">${ic("doc")}</span><span class="dn"><b>${esc(m.name)}</b><small>${esc(m.size)}, ${esc(ext)}</small></span><button class="iconbtn" type="button" data-dl="${m.id}" aria-label="Download document">${ic("down")}</button></div>${tm}</div>`;}
    case "voice":return `<div class="b ${cls} voice" ${id}>${nm}<button class="pbtn" type="button" data-play aria-label="Play voice note">${ic("play")}</button><span class="wave">${wave(m.id)}</span><span class="vd">${esc(m.dur)}</span>${tm}</div>`;
    case "post":{
      const sp=ALL.get(m.postId);
      if(!sp)return `<div class="b ${cls}" ${id}>${nm}Shared a post${tm}</div>`;
      let thumb;
      if(sp.kind==="video")thumb=`<span class="playbtn sm">${ic("play")}</span><span class="badge">${esc(sp.dur||"Video")}</span>`;
      else if(sp.kind==="photo")thumb=scene(sp.seed||0);
      else if(sp.kind==="userphoto")thumb=`<img src="${sp.src}" alt="">`;
      else thumb=`<div style="width:100%;height:100%;display:grid;place-items:center;padding:10px;text-align:center;color:#fff;font-weight:700;background:${BGCOL[sp.bg]||BGCOL[1]}">${esc(sp.text||sp.cap||"")}</div>`;
      const cap=sp.kind==="video"?"Video":sp.kind==="photo"||sp.kind==="userphoto"?"Photo":(sp.text||sp.cap||"");
      return `<div class="b ${cls} med sharecard" ${id}><button class="pic ${sp.kind==="video"?"vid":""}" type="button" data-tile="${sp.id}" aria-label="Open shared post">${thumb}</button><div class="cap"><b>${esc(sp.name)}</b><br>${esc(cap)}</div>${tm}</div>`;
    }
    case "poll":{const tot=m.opts.reduce((s,o)=>s+o.v.length,0);
      return `<div class="b ${cls} poll" ${id}>${nm}<div class="q">${ic("poll","sm")}<span>${esc(m.q)}</span></div><small>${m.multi?"Select one or more":"Select one"}</small>${m.opts.map((o,i)=>{const pc=tot?Math.round(o.v.length*100/tot):0,mine=o.v.includes("me");return `<button type="button" class="orow ${mine?"on":""}" data-vote="${m.id}:${i}" aria-pressed="${mine}"><i style="--p:${pc}%"></i><span><b>${mine?"✓ ":""}${esc(o.t)}</b><em>${o.v.length}</em></span></button>`;}).join("")}<small>${tot} vote${tot===1?"":"s"}</small>${tm}</div>`;}
    default:{
      const rq=m.replyStatus?`<div class="rquote" style="background:${BGCOL[m.replyStatus.bg]||BGCOL[1]}"><small>${cls==="mine"?"You replied to their status":"Replied to your status"}</small><div>${esc(m.replyStatus.text)}</div></div>`:"";
      return `<div class="b ${cls}" ${id}>${nm}${rq}${esc(m.text)}${tm}</div>`;
    }
  }
}
const eff=(c,k)=>c[k]!=null?c[k]:S[k];
const ctSwatches=cur=>CTHEMES.map(t=>`<button class="sw" type="button" data-ct="${t[0]}" style="background:${t[2]}" aria-label="${t[1]} chat colour" aria-pressed="${cur===t[0]}" title="${t[1]}"></button>`).join("");
const bsButtons=cur=>BSTYLES.map(b=>`<button type="button" data-bs="${b[0]}" aria-pressed="${cur===b[0]}">${b[1]}</button>`).join("");
function wpThumbs(cur,img){
  return `<div class="wps">`+WPLIST.map(w=>`<button type="button" class="wpt" data-wp="${w[0]}" aria-pressed="${cur===w[0]}" aria-label="${w[1]} wallpaper" title="${w[1]}"></button>`).join("")+
   `<button type="button" class="wpt" data-wp="upload" aria-pressed="${cur==="custom"}" aria-label="Use your own photo as wallpaper" title="Your own photo" ${img?`style="background-image:url(${img});background-size:cover"`:""}>${img?"":ic("photo")}</button></div>`;
}
function panelHTML(c){
  const wpImg=c.wp!=null?c.wpImg:S.wpImg;
  return `<div class="cpanel"><div class="prow"><b>Chat colour</b><div class="ctheme" role="group" aria-label="Chat colour">${ctSwatches(eff(c,"ct"))}</div></div>
   <div class="prow"><b>Bubble style</b><div class="seg" role="group" aria-label="Bubble style">${bsButtons(eff(c,"bs"))}</div></div>
   <div class="prow"><b>Wallpaper</b>${wpThumbs(eff(c,"wp"),wpImg)}</div>
   <div class="prow"><b>Dim wallpaper</b><input type="range" id="dim" min="0" max="60" value="${eff(c,"dim")}" aria-label="Dim wallpaper"></div>
   <div class="prow"><button class="btn" type="button" data-creset>Use my defaults for this chat</button></div></div>`;
}
const GIFS=[["🎉","Party","bounce"],["😂","LOL","wiggle"],["🔥","Fire","pulse"],["👏","Clap","bounce"],["😍","Love","pulse"],["😴","Sleepy","float"],["🤯","Mind blown","spin"],["👋","Hello","wiggle"]];
const gifHTML=g=>g.src?`<img class="gifimg" src="${g.src}" alt="GIF">`:`<span class="gif gif-${g.anim}" role="img" aria-label="${esc(g.label)} GIF"><span class="e">${g.em}</span></span>`;
function pickerHTML(cx){
  const tab=cx==="cm"?S.cm.tab:S.emojiTab;
  const tabs=EMTABS.concat([["gif","GIF","GIFs"]]).map(x=>`<button type="button" class="etab" data-etab="${x[0]}" aria-pressed="${tab===x[0]}" aria-label="${x[2]}">${x[1]}</button>`).join("");
  let body;
  if(tab==="stk"){
    body=`<div class="stkgrid"><button type="button" class="stkbtn mk" data-mkstk aria-label="Create your own sticker"><span class="e">${ic("plus")}</span><b>Create</b></button>`+
      S.mySticks.map((s,i)=>`<button type="button" class="stkbtn" data-mystk="${i}" aria-label="My sticker ${i+1}">${s.img?`<img src="${s.img}" alt="">`:`<span class="e" style="color:${s.c||"#0f4fb4"}">${s.e||"🙂"}</span>`}<b>${esc(s.text||s.label||"")}</b></button>`).join("")+
      STK.map((s,i)=>`<button type="button" class="stkbtn" data-stk="${i}" aria-label="${esc(s[1])} sticker"><span class="e">${s[0]}</span><b>${esc(s[1])}</b></button>`).join("")+`</div>`;
  }else if(tab==="gif"){
    body=`<div class="stkgrid"><button type="button" class="stkbtn mk" data-mkgif aria-label="Upload your own GIF"><span class="e">${ic("plus")}</span><b>Upload GIF</b></button>`+
      S.myGifs.map((g,i)=>`<button type="button" class="stkbtn" data-mygif="${i}" aria-label="My GIF ${i+1}">${g.src?`<img src="${g.src}" alt="">`:`<span class="gif gif-${g.anim||"bounce"}"><span class="e">${g.em||"🙂"}</span></span>`}<b>${esc(g.label||"My GIF")}</b></button>`).join("")+
      GIFS.map((g,i)=>`<button type="button" class="stkbtn" data-gif="${i}" aria-label="${esc(g[1])} GIF"><span class="gif gif-${g[2]}"><span class="e">${g[0]}</span></span><b>${esc(g[1])}</b></button>`).join("")+`</div>
      <p class="infoline">GIF search needs a GIF service. For now you can use these GIFs or upload your own.</p>`;
  }else body=`<div class="egrid">${EM[tab].map(e=>`<button type="button" data-emo="${e}" aria-label="${e}">${e}</button>`).join("")}</div>`;
  return `<div class="epanel" data-ctx="${cx}"><div class="etabs">${tabs}</div>${body}</div>`;
}
function sendRich(cx,o){if(cx==="cm"){S.cm.emoji=false;addComment(o);}else{S.emoji=false;pushMsg(ctx(),o);}}
function refreshPickers(){if(S.view==="messages"&&S.emoji)renderChat();if(!$("#drawer").hidden&&S.cm.emoji)renderDrawer();}
function stickerMaker(){
  S.mk={img:null,label:"",c:"#0f4fb4"};
  openSheet(`<h2 id="sh-title">Create a sticker</h2><p class="infoline" style="margin-top:0">Pick a photo and we turn it into a sticker with a rounded border.</p>
   <div class="mkprev" id="mkprev">${ic("photo","lg")}</div><div style="text-align:center;margin-bottom:10px"><button class="btn" type="button" data-mkpick>Choose photo</button></div>
   <label class="sr" for="mklabel">Caption</label><input id="mklabel" class="ginput" placeholder="Caption (optional)" maxlength="24">
   <div class="prow"><b>Border</b><div class="ctheme" role="group" aria-label="Border colour">${CTHEMES.map(x=>`<button class="sw" type="button" data-mkc="${x[2]}" style="background:${x[2]}" aria-label="${x[1]} border" aria-pressed="${x[2]==="#0f4fb4"}"></button>`).join("")}</div></div>
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Cancel</button><button class="btn primary" type="button" id="mksave" data-mksave disabled>Save sticker</button></div>`,document.activeElement);
}

function composerHTML(c){
  if(c.request)return `<div class="locked reqbar"><span>${esc(c.name.split(" ")[0])} is not your friend yet. Accept to reply.</span><button class="btn primary" type="button" data-req="accept">Accept</button><button class="btn" type="button" data-req="delete">Delete</button><button class="btn" type="button" data-req="block">Block</button></div>`;
  if(c.blocked)return `<div class="locked">${ic("block")}<span>You blocked ${esc(c.name)}. You can unblock in Settings.</span></div>`;
  if(!canSend(c))return `<div class="locked">${ic("lock")}<span>${c.group?"Only group admins can send messages here.":"You can message "+esc(c.name.split(" ")[0])+" once you both follow each other."}</span></div>`;
  if(S.rec)return `<div class="cin rec"><span class="recdot"></span><b>Recording</b><span id="rt">${fmtT(S.rec.t)}</span><span style="flex:1"></span><button class="btn" type="button" data-recx>Cancel</button><button class="btn primary" type="button" data-recsend>Send</button></div>`;
  const has=(S.draft[c.id]||"").trim().length>0;
  return `<div class="cwrap">${S.emoji?pickerHTML("chat"):""}${S.attach?`<div class="amenu" role="menu"><button type="button" data-att="doc">${ic("doc")}Document</button><button type="button" data-att="pic">${ic("photo")}Photo</button><button type="button" data-att="vid">${ic("video")}Video</button><button type="button" data-att="poll">${ic("poll")}Poll</button></div>`:""}
   <form class="cin" id="cform"><button class="iconbtn" type="button" data-emoji aria-label="Emojis and stickers" aria-pressed="${S.emoji}">${ic("smile")}</button><button class="iconbtn" type="button" data-attach aria-label="Attach">${ic("clip")}</button>
   <label class="sr" for="cmsg">Message</label><input id="cmsg" type="text" placeholder="Write a message" autocomplete="off" value="${esc(S.draft[c.id]||"")}">
   <button type="button" class="sendbtn" data-sendmic aria-label="${has?"Send":"Record a voice note"}">${ic(has?"send":"mic")}</button></form></div>`;
}
function syncSend(){const b=$(".sendbtn",$("#cform")||document),i=$("#cmsg");if(!b||!i)return;const has=i.value.trim().length>0;b.innerHTML=ic(has?"send":"mic");b.setAttribute("aria-label",has?"Send":"Record a voice note");}
function applyLook(c){
  const m=$("#msgs"),chat=$("#chat"),wp=eff(c,"wp"),img=c.wp!=null?c.wpImg:S.wpImg;
  m.dataset.ct=eff(c,"ct");m.dataset.bs=eff(c,"bs");chat.dataset.wp=wp;
  if(wp==="custom"&&img){chat.style.setProperty("--wp",`url(${img})`);chat.style.setProperty("--wpsize","cover");}
  else{chat.style.removeProperty("--wp");chat.style.removeProperty("--wpsize");}
  chat.style.setProperty("--wpdim",eff(c,"dim")/100);
}
function renderChat(){
  const c=CH.find(x=>x.id===S.chat),box=$("#chat");
  const th=c.msgs.length?`<div class="day">Today</div>`+c.msgs.map(m=>bubbleHTML(m,c)).join(""):`<div class="day">No messages yet</div>`;
  const sub=c.group?["You",...c.members.map(n=>n.split(" ")[0])].join(", "):(c.blocked?"Blocked":chOnline(c)?"Online":"Last seen recently");
  box.innerHTML=`<div class="ch"><button class="iconbtn back" type="button" data-back aria-label="Back to chats">${ic("back")}</button>
    <button class="hwho" type="button" data-chatinfo aria-label="Open ${esc(c.name)} info">${cav(c,40,chOnline(c))}<span class="who"><b>${esc(c.name)}</b><br><small>${esc(sub)}</small></span></button>
    <button class="iconbtn" type="button" data-colors aria-label="Chat colour and wallpaper" aria-expanded="${S.panel}">${ic("palette")}</button></div>
    ${S.panel?panelHTML(c):""}<div class="thread" id="thread">${th}${seenLineHTML(c)}</div>${composerHTML(c)}`;
  applyLook(c);
  const t=$("#thread");t.scrollTop=t.scrollHeight;
  c.unread=0;msgBadge();renderRail();
}
function seenSeenBool(seed){return seenOffset(seed)%3!==0;}
function inboxTick(c){
  if(!S.receipts)return "";
  const last=[...c.msgs].reverse().find(m=>m.type!=="system");
  if(!last||last.w!=="me")return "";
  return `<span class="itk ${last.seen?"seen":""}" aria-hidden="true">${ic("checks","sm")}</span>`;
}
function seenLineHTML(c){
  if(!S.receipts)return "";
  const last=[...c.msgs].reverse().find(m=>m.type!=="system");
  if(!last||last.w!=="me"||!last.seen)return "";
  if(c.group){
    const seenBy=c.members.filter(n=>seenSeenBool(n+last.id));
    if(!seenBy.length)return "";
    const label=seenBy.length===c.members.length?"Seen by everyone":"Seen by "+seenBy.slice(0,2).map(n=>n.split(" ")[0]).join(", ")+(seenBy.length>2?` +${seenBy.length-2}`:"");
    return `<button class="seenline" type="button" data-seenof="${last.id}">${esc(label)}</button>`;
  }
  return `<button class="seenline" type="button" data-seenof="${last.id}">Seen</button>`;
}
function refreshChatUI(){renderInbox();if(S.view==="messages")renderChat();renderMini();renderRail();msgBadge();}
function pushMsg(c,o){
  const m=M("me",o.type,{...o,time:nowT(),seen:false});
  c.msgs.push(m);c.time="now";c.lastTs=Date.now();refreshChatUI();
  setTimeout(()=>{m.seen=true;refreshChatUI();},1500);
}
function sendText(){
  const c=CH.find(x=>x.id===S.chat),i=$("#cmsg");if(!c||!i)return;const v=i.value.trim();if(!v)return;
  S.draft[c.id]="";
  const emo=/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(v)&&v.length<=14;
  pushMsg(c,{type:emo?"emoji":"text",text:v});
  const n=$("#cmsg");if(n)n.focus();
}
function startRec(){S.rec={t:0};S.recTimer=setInterval(()=>{S.rec.t++;const e=$("#rt");if(e)e.textContent=fmtT(S.rec.t);},1000);renderChat();}
function stopRec(send){
  clearInterval(S.recTimer);const t=S.rec?S.rec.t:0;S.rec=null;const c=CH.find(x=>x.id===S.chat);
  if(send)pushMsg(c,{type:"voice",dur:fmtT(Math.max(t,1))});else renderChat();
}
function findMsg(id){for(const c of CH){const m=c.msgs.find(x=>x.id===id);if(m)return [c,m];}return [null,null];}
function download(m){
  const src=m.img||m.blob;
  if(src){const a=document.createElement("a");a.href=src;a.download=m.name||(m.type==="photo"?"photo.png":"video");document.body.appendChild(a);a.click();a.remove();toast("Download started.");}
  else toast("Download started. (Sample file)");
}
function ctx(){return CH.find(x=>x.id===S.chat);}

function parseHM(s){const r=/^(\d{1,2}):(\d{2})$/.exec((s||"").trim());return r?{h:+r[1],m:+r[2]}:null;}
function addMin(s,delta){const t=parseHM(s);if(!t)return null;let total=((t.h*60+t.m+delta)%1440+1440)%1440;return String(Math.floor(total/60)).padStart(2,"0")+":"+String(total%60).padStart(2,"0");}
function seenOffset(seed){let h=0;for(const c of seed)h=(h*131+c.charCodeAt(0))%97;return 1+(h%9);}
function messageInfoSheet(c,m){
  if(!S.receipts){toast("Turn on read receipts in Settings to see who has read your messages.");return;}
  if(m.w!=="me")return;
  if(c.group){
    const rows=c.members.map(name=>{const seen=m.seen!==false;const at=seen?addMin(m.time,seenOffset(name+m.id)):null;return {name,at};});
    const read=rows.filter(r=>r.at),pending=rows.filter(r=>!r.at);
    openSheet(`<h2 id="sh-title">Message info</h2><p class="infoline" style="margin-top:0">Sent at ${esc(m.time)}</p>
     <div class="sectitle">Read by (${read.length})</div>${read.length?read.map(r=>`<div class="row">${av(r.name,36)}<span class="who"><b>${esc(r.name)}</b></span><small style="color:var(--muted)">${esc(r.at)}</small></div>`).join(""):`<div class="empty">Nobody has read it yet.</div>`}
     ${pending.length?`<div class="sectitle">Delivered, not yet read</div>${pending.map(r=>`<div class="row">${av(r.name,36)}<span class="who"><b>${esc(r.name)}</b></span></div>`).join("")}`:""}
     <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`,document.activeElement);
  }else{
    const at=m.seen?addMin(m.time,seenOffset(c.name+m.id)):null;
    openSheet(`<h2 id="sh-title">Message info</h2>
     <div class="row"><span class="who"><b>Sent</b></span><small style="color:var(--muted)">${esc(m.time)}</small></div>
     <div class="row"><span class="who"><b>Delivered</b></span><small style="color:var(--muted)">${esc(m.time)}</small></div>
     <div class="row"><span class="who"><b>Seen</b></span><small style="color:var(--muted)">${at?esc(at):"Not yet"}</small></div>
     <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`,document.activeElement);
  }
}


/* viewer: status, photos, videos, profile pictures */
let vTimer;
function closeViewer(){clearTimeout(vTimer);S.vmode=null;const v=$("#viewer");v.hidden=true;v.innerHTML="";if(!$("#v-home").hidden){renderStatusRow();renderFeed();}}
function vHead(name,sub,extra=""){return `<div class="vh"><span style="flex:1;line-height:1.25"><b>${esc(name)}</b><br><small>${esc(sub)}</small></span>${extra}<button class="iconbtn" style="color:#fff" type="button" data-vclose aria-label="Close">${ic("x")}</button></div>`;}
function showViewer(html){clearTimeout(vTimer);S.vmode=null;const v=$("#viewer");v.innerHTML=html;v.hidden=false;const b=$("[data-vclose]",v);if(b)b.focus();}
let vTimer2,stQ=[],stU=0,stI=0;
function statusQueue(){return [...(STATUS[ME.n]?[ME.n]:[]),"Tunde Bello","Ada Okafor","Kelechi Nwosu","Halima Sani"].filter(n=>STATUS[n]&&(n===ME.n||canSeePhoto(person(n))));}
function renderStatusRow(){
  const names=statusQueue();
  $("#statuses").innerHTML=`<button class="st" type="button" aria-label="Add status" data-add-status><span class="ring add"><span class="gap">${ic("plus")}</span></span><span class="n">Add</span></button>`+
   names.map(n=>{const s=STATUS[n];return `<button class="st" type="button" data-status="${esc(n)}" aria-label="View ${esc(n===ME.n?"your":n)} status"><span class="ring ${s.seen&&n!==ME.n?"seen":""}"><span class="gap">${av(n,52)}</span></span><span class="n">${n===ME.n?"You":n.split(" ")[0]}</span><span class="left">${s.items[0].hrs}h left</span></button>`;}).join("");
}
function openStatus(name){stQ=statusQueue();stU=Math.max(0,stQ.indexOf(name));stI=0;renderStatus();}
function renderStatus(){
  const n=stQ[stU],s=STATUS[n],it=s.items[stI];
  const bars=s.items.map((_,i)=>`<span class="sb"><i class="${i<stI?"full":i===stI?"run":""}"></i></span>`).join("");
  const back=ic("back"),fwd=ic("back").replace("<svg",'<svg style="transform:scaleX(-1)"');
  showViewer(`<div class="bars" aria-hidden="true">${bars}</div>${vHead(n===ME.n?"Your status":n,`${it.hrs}h left. Person ${stU+1} of ${stQ.length}`)}
   <div class="vb"><button class="tz l" type="button" data-sprev aria-label="Previous"></button><div class="vs bg${it.bg}">${esc(it.text)}</div><button class="tz r" type="button" data-snext aria-label="Next"></button>
   ${stU>0?`<button class="navb l2" type="button" data-uprev aria-label="Previous person">${back}</button>`:""}${stU<stQ.length-1?`<button class="navb r2" type="button" data-unext aria-label="Next person">${fwd}</button>`:""}</div>
   ${n===ME.n?`<div class="vf">Visible to ${esc(s.aud)}</div>`:`<form class="vreply" id="sreply"><label class="sr" for="srtxt">Reply</label><input id="srtxt" placeholder="Reply to ${esc(n.split(" ")[0])}" autocomplete="off"><button type="button" class="sendbtn" data-vmsg="${esc(n)}" aria-label="Message ${esc(n)} directly" style="background:rgba(255,255,255,.16)">${ic("msg","sm")}</button><button type="submit" class="sendbtn" aria-label="Send reply">${ic("send")}</button></form>`}`);
  S.vmode="status";clearTimeout(vTimer);vTimer=setTimeout(nextStatus,5000);
  if(stI===s.items.length-1)s.seen=true;
}
function statusReply(name,text,item){
  const x=person(name);if(!x)return;const c=ensureChat(x);
  pushMsg(c,{type:"text",text,replyStatus:item?{bg:item.bg,text:item.text}:null});
  toast("Reply sent to "+name.split(" ")[0]+".");
}
function nextStatus(){
  const s=STATUS[stQ[stU]];
  if(stI<s.items.length-1){stI++;renderStatus();}
  else if(stU<stQ.length-1){stU++;stI=0;renderStatus();}
  else closeViewer();
}
function prevStatus(){
  if(stI>0){stI--;renderStatus();}
  else if(stU>0){stU--;stI=0;renderStatus();}
  else renderStatus();
}
function jumpUser(d){const n=stU+d;if(n<0||n>=stQ.length)return;stU=n;stI=0;renderStatus();}
function openAvatar(p){
  const ok=canSeePhoto(p);
  showViewer(vHead(p.n,"Profile picture")+`<div class="vb">${ok?`<div class="bigav" style="background:hsl(${hue(p.n)} 50% 36%)">${esc(ini(p.n))}</div>`:`<div class="vs" style="background:#111a2c">${ic("lock","lg")}<span>${esc(p.n.split(" ")[0])} keeps their photo and status private.</span></div>`}</div>`);
}
function openAvatarOrStatus(name){
  const p=name==="me"?ME:person(name);if(!p)return;
  if(p!==ME&&STATUS[p.n]&&canSeePhoto(p)){openStatus(p.n);return;}
  if(p===ME&&STATUS[ME.n]){openStatus(ME.n);return;}
  openAvatar(p);
}
function openMedia(m){
  let body;
  if(m.type==="photo")body=m.img?`<img src="${m.img}" alt="Photo">`:`<div class="vphoto">${scene(m.k||0)}</div>`;
  else body=m.blob?`<video controls autoplay src="${m.blob}"></video>`:`<div class="vs bg1"><span class="playbtn">${ic("play")}</span><br>Sample video</div>`;
  showViewer(vHead(m.w==="me"?"You":m.w,m.time,`<button class="iconbtn" style="color:#fff" type="button" data-vdl="${m.id}" aria-label="Download">${ic("down")}</button>`)+`<div class="vb">${body}</div>`);
}

/* sheets: chat info, group info, media, new group, poll */
function setSheet(html){$("#sheet-body").innerHTML=html;focusSheet();}
function chatInfo(c){
  const p=person(c.name)||{};
  return `<h2 id="sh-title">Contact</h2><div class="cinfo">${av(c.name,72)}<b>${esc(c.name)}</b>${p.lv?lv(p.lv):""}<small>${esc(p.d||"")}${p.s?", "+esc(p.s):""}</small></div>
   <button class="sopt" data-ci="profile">${ic("user")}<span><b>View profile</b><small>Photo, status, posts and reposts</small></span></button>
   <button class="sopt" data-ci="media">${ic("photo")}<span><b>Photos, videos and documents</b><small>${c.msgs.filter(m=>["photo","video","doc"].includes(m.type)).length} shared</small></span></button>
   <button class="sopt" data-ci="mute">${ic("bell")}<span><b>${c.muted?"Unmute":"Mute"} notifications</b><small>${c.muted?"You will hear new messages again":"No sound for this chat"}</small></span></button>
   <button class="sopt" data-ci="look">${ic("palette")}<span><b>Chat colour and wallpaper</b><small>Only you see this look</small></span></button>
   <button class="sopt" data-ci="report">${ic("flag")}<span><b>Report</b><small>Tell SLC.admin about a problem</small></span></button>
   <button class="sopt danger" data-ci="block">${ic("block")}<span><b>Block ${esc(c.name.split(" ")[0])}</b><small>They cannot message you or see your profile picture</small></span></button>
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`;
}
function groupInfo(c){
  const adm=iAmAdmin(c),canEdit=adm||!c.onlyAdminsEdit;
  const rows=[{n:"You",k:"me"},...c.members.map(n=>({n,k:n}))].map(r=>{
    const isAdm=c.admins.includes(r.k),isCre=c.creator===r.k;
    const tag=isCre?`<span class="tagadm">Creator</span>`:isAdm?`<span class="tagadm">Admin</span>`:"";
    const acts=(adm&&r.k!=="me"&&!isCre)?`<span class="macts"><button type="button" class="linkbtn" data-gi="${isAdm?"unadmin":"admin"}:${esc(r.k)}">${isAdm?"Remove admin":"Make admin"}</button><button type="button" class="linkbtn danger" data-gi="rm:${esc(r.k)}">Remove from group</button></span>`:"";
    return `<div class="mrow">${av(r.k==="me"?ME.n:r.n,36)}<span class="who"><b>${esc(r.n)}</b></span>${tag}${acts}</div>`;
  }).join("");
  return `<h2 id="sh-title">Group info</h2><div class="cinfo">${cav(c,72)}<b>${esc(c.name)}</b><small>${esc(c.desc||"No description")}</small><small>${c.members.length+1} members. There is no limit on members.</small></div>
   ${canEdit?`<div class="rename"><label class="sr" for="gname2">Group name</label><input id="gname2" class="ginput" value="${esc(c.name)}"><button class="btn" type="button" data-gi="rename">Save</button></div>`:""}
   <div class="sectitle">Members</div>${adm?`<button class="sopt" data-gi="addpanel">${ic("uplus")}<span><b>Add members</b><small>Friends only</small></span></button>`:""}${rows}
   ${adm?`<div class="sectitle">Admin controls</div>
     <label class="frow"><span class="who"><b>Only admins can send messages</b><br><small style="color:var(--muted)">Good for announcements</small></span><input type="checkbox" data-gset="onlysend" ${c.onlyAdminsSend?"checked":""}></label>
     <label class="frow"><span class="who"><b>Only admins can edit group info</b><br><small style="color:var(--muted)">Name and description</small></span><input type="checkbox" data-gset="onlyedit" ${c.onlyAdminsEdit?"checked":""}></label>`:""}
   <div class="sectitle">Group</div>
   <button class="sopt" data-gi="media">${ic("photo")}<span><b>Photos, videos and documents</b><small>${c.msgs.filter(m=>["photo","video","doc"].includes(m.type)).length} shared</small></span></button>
   <button class="sopt" data-gi="mute">${ic("bell")}<span><b>${c.muted?"Unmute":"Mute"} notifications</b><small></small></span></button>
   <button class="sopt" data-gi="look">${ic("palette")}<span><b>Chat colour and wallpaper</b><small>Only you see this look</small></span></button>
   <button class="sopt" data-gi="report">${ic("flag")}<span><b>Report group</b><small>Tell SLC.admin about a problem</small></span></button>
   <button class="sopt danger" data-gi="leave">${ic("exit")}<span><b>Exit group</b><small></small></span></button>
   ${c.creator==="me"?`<button class="sopt danger" data-gi="delete">${ic("block")}<span><b>Delete group</b><small>Removes it for everyone</small></span></button>`:""}
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`;
}
function mediaHTML(c,back){
  const items=c.msgs.filter(m=>["photo","video","doc"].includes(m.type));
  const vis=items.filter(m=>m.type!=="doc"),docs=items.filter(m=>m.type==="doc");
  return `<h2 id="sh-title">Photos, videos and documents</h2>
   ${vis.length?`<div class="mgrid">${vis.map(m=>`<button type="button" data-open="${m.id}" aria-label="Open ${m.type}">${m.type==="photo"?(m.img?`<img src="${m.img}" alt="">`:scene(m.k||0)):ic("play","lg")}</button>`).join("")}</div>`:""}
   ${docs.map(m=>`<div class="mrow"><span class="dic" style="width:36px;height:36px;border-radius:10px;background:var(--accent);color:var(--surface);display:grid;place-items:center">${ic("doc")}</span><span class="who"><b>${esc(m.name)}</b><br><small style="color:var(--muted)">${esc(m.size)}</small></span><button class="iconbtn" type="button" data-dl="${m.id}" aria-label="Download ${esc(m.name)}">${ic("down")}</button></div>`).join("")}
   ${items.length?"":`<div class="empty">Nothing shared yet.</div>`}
   <div class="sheetfoot"><button class="btn" type="button" data-${back}="back">Back</button></div>`;
}
function newGroupSheet(){
  const fr=PEOPLE.filter(p=>p.mutual);
  openSheet(`<h2 id="sh-title">New group</h2><label class="sr" for="gname">Group name</label><input id="gname" class="ginput" placeholder="Group name, for example CSC 208 study group" maxlength="80">
   <p class="infoline" style="margin:0 0 8px">Only friends (people who follow you back) can be added. Groups have no member limit, and you will be the group admin.</p>
   ${fr.map(p=>`<label class="frow" ${p.nogroup?'style="opacity:.55;cursor:not-allowed"':""}>${av(p.n,40)}<span class="who"><b>${esc(p.n)}</b><br><small style="color:var(--muted)">${p.nogroup?"Does not accept group invites":esc(p.d)+", "+esc(p.s)}</small></span><input type="checkbox" data-gm="${esc(p.n)}" ${p.nogroup?"disabled":""}></label>`).join("")}
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Cancel</button><button class="btn primary" type="button" id="mkgroup">Create group</button></div>`,document.activeElement);
}
const updateGroupBtn=()=>{};
function pollSheet(){
  openSheet(`<h2 id="sh-title">Create poll</h2><label class="sr" for="pq">Question</label><input id="pq" class="ginput" placeholder="Ask a question">
   <div id="popts"><input class="ginput popt" placeholder="Option 1"><input class="ginput popt" placeholder="Option 2"></div>
   <button class="btn" type="button" data-poll="addopt">Add option</button>
   <label class="chk" style="margin:12px 0 0"><input type="checkbox" id="pmulti"> Allow more than one answer</label>
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Cancel</button><button class="btn primary" type="button" id="mkpoll" data-poll="create" disabled>Create poll</button></div>`,document.activeElement);
}
const updatePollBtn=()=>{const b=$("#mkpoll");if(b)b.disabled=!($("#pq").value.trim()&&$$(".popt").filter(i=>i.value.trim()).length>=2);};


/* post viewer, comments, reactions, quote, feedback, profile views */
function renderPM(){
  const p=ALL.get(S.pm.id),i=S.pm.i,n=p.kind==="photo"?p.photos:1;
  let body;
  if(p.kind==="photo")body=`<div class="vphoto">${scene(p.seed+i)}</div>`;
  else if(p.kind==="userphoto")body=`<img src="${p.src}" alt="">`;
  else body=`<div class="vs bg1"><span class="playbtn">${ic("play")}</span><br>Sample video ${esc(p.dur||"")}</div>`;
  const fwd=ic("back").replace("<svg",'<svg style="transform:scaleX(-1)"');
  showViewer(vHead(p.name,p.kind==="photo"||p.kind==="userphoto"?(n>1?`Photo ${i+1} of ${n}`:"Photo"):"Video",p.dl?`<button class="iconbtn" style="color:#fff" type="button" data-pdl="${p.id}" aria-label="Download">${ic("down")}</button>`:"")+
   `<div class="vb">${n>1?`<button class="navb l" type="button" data-pmnav="-1" aria-label="Previous photo">${ic("back")}</button><button class="navb r" type="button" data-pmnav="1" aria-label="Next photo">${fwd}</button>`:""}${body}</div>`);
}
function openPostMedia(p,i){S.pm={id:p.id,i:i||0};renderPM();}
function openPost(id){
  const p=ALL.get(id);if(!p)return;
  showViewer(vHead(p.name,"Post")+`<div class="vb"><div class="vpost">${postHTML(p)}</div></div>`);
}
const SAMPLE_CM=[
  {name:"Tunde Bello",type:"text",text:"This is clean. Which software did you use?",time:"1h",likes:4},
  {name:"Halima Sani",type:"sticker",e:"👏",text:"Well done",c:"#7a3f9d",time:"50m",likes:2},
  {name:"Ada Okafor",type:"gif",g:{em:"🎉",label:"Party",anim:"bounce"},time:"40m",likes:6},
  {name:"Kelechi Nwosu",type:"voice",dur:"0:07",time:"30m",likes:1},
  {name:"Ngozi Eze",type:"photo",k:1,text:"Same view here",time:"20m",likes:0}
];
let cmid=0;
function ensureCm(p){if(!p.cm)p.cm=SAMPLE_CM.slice(0,Math.min(5,Math.max(2,p.comments||0))).map(c=>({...c,id:++cmid}));}
function cmHTML(c){
  let body;
  switch(c.type){
    case "sticker":{
      const inner=c.img?`<span class="stk sm stkimg"><img src="${c.img}" alt=""></span>`:`<span class="stk sm" style="--c:${c.c}"><span class="e">${c.e}</span><b>${esc(c.text)}</b></span>`;
      const save=c.name!==ME.n?`<button class="savechip" type="button" data-savecmstk="${c.id}" aria-label="Save this sticker">${ic("mark","sm")}</button>`:"";
      body=`<span class="stkbox">${inner}${save}</span>`;break;
    }
    case "gif":{
      const save=c.name!==ME.n?`<button class="savechip" type="button" data-savecmgif="${c.id}" aria-label="Save this GIF">${ic("mark","sm")}</button>`:"";
      body=`<span class="gifwrap">${gifHTML(c.g)}<span class="gtag">GIF</span>${save}</span>`;break;
    }
    case "photo":body=`<button class="cmpic" type="button" data-cmopen="${c.id}" aria-label="Open photo">${c.img?`<img src="${c.img}" alt="Photo">`:scene(c.k||0)}</button>${c.text?`<div>${esc(c.text)}</div>`:""}`;break;
    case "voice":body=`<span class="voice inl"><button class="pbtn" type="button" data-play aria-label="Play voice note">${ic("play")}</button><span class="wave">${wave(c.id)}</span><span class="vd">${esc(c.dur)}</span></span>`;break;
    case "emoji":body=`<span class="bigemo">${esc(c.text)}</span>`;break;
    default:body=esc(c.text);
  }
  return `<div class="cm" data-cid="${c.id}">${av(c.name,34)}<div class="cmb"><b>${esc(c.name===ME.n?"You":c.name)}</b><div class="cmt">${body}</div><div class="cmm"><small>${c.time}</small><button class="linkbtn" type="button" data-cmlike="${c.id}">${c.liked?"Liked":"Like"}</button><small>${c.likes||0}</small></div></div></div>`;
}
function cmComposer(p){
  if(p.cmOff)return `<div class="locked">${ic("lock")}<span>Comments are turned off for this post.</span></div>`;
  const cm=S.cm;
  if(cm.rec)return `<div class="cin rec"><span class="recdot"></span><b>Recording</b><span id="cmrt">${fmtT(cm.rec.t)}</span><span style="flex:1"></span><button class="btn" type="button" data-cmrecx>Cancel</button><button class="btn primary" type="button" data-cmrecsend>Send</button></div>`;
  const has=cm.text.trim().length>0;
  return `<div class="cwrap">${cm.emoji?pickerHTML("cm"):""}<form class="cin" id="cmform"><button class="iconbtn" type="button" data-cmemoji aria-label="Emojis, stickers and GIFs">${ic("smile")}</button><button class="iconbtn" type="button" data-cmpic aria-label="Add a photo">${ic("photo")}</button>
   <label class="sr" for="cmtext">Comment</label><input id="cmtext" type="text" placeholder="Add a comment" autocomplete="off" value="${esc(cm.text)}"><button type="button" class="sendbtn" data-cmsend aria-label="${has?"Send":"Record a voice note"}">${ic(has?"send":"mic")}</button></form></div>`;
}
function renderDrawer(){
  const p=ALL.get(S.cmPost),d=$("#drawer");if(!p)return;
  d.innerHTML=`<div class="dh"><b>${p.comments} comment${p.comments===1?"":"s"}</b><button class="iconbtn" type="button" data-dclose aria-label="Close comments">${ic("x")}</button></div><div class="dbody" id="dbody">${p.cm.length?p.cm.map(cmHTML).join(""):`<div class="empty">Be the first to comment.</div>`}</div>${cmComposer(p)}`;
  const b=$("#dbody");b.scrollTop=b.scrollHeight;
}
function openComments(p){ensureCm(p);S.cmPost=p.id;S.cm={emoji:false,tab:"face",text:"",rec:null};renderDrawer();$("#scrim").hidden=false;$("#drawer").hidden=false;const f=$("#cmtext");if(f)f.focus();}
function closeDrawer(){if($("#drawer").hidden)return;if(S.cm.rec){clearInterval(S.cmTimer);S.cm.rec=null;}$("#drawer").hidden=true;if($("#sheet").hidden)$("#scrim").hidden=true;}
function addComment(o){
  const p=ALL.get(S.cmPost);if(!p)return;ensureCm(p);
  p.cm.push({id:++cmid,name:ME.n,time:"now",likes:0,...o});p.comments++;S.cm.text="";
  refreshPost(p);renderDrawer();
}
function syncCm(){const b=$("[data-cmsend]"),i=$("#cmtext");if(!b||!i)return;const has=i.value.trim().length>0;b.innerHTML=ic(has?"send":"mic");b.setAttribute("aria-label",has?"Send":"Record a voice note");}
function closeAllOverlays(){closeViewer();closeDrawer();closeSearch();if(!$("#sheet").hidden)closeSheet();$("#rpicker").hidden=true;}
function openReact(p,el){
  const b=$("#rpicker"),r=el.getBoundingClientRect();
  b.innerHTML=`<div class="rq">${["❤️","😂","😮","😢","🙏","🔥"].map(e=>`<button type="button" data-react="${p.id}|${e}" aria-label="React ${e}">${e}</button>`).join("")}<button type="button" class="more" data-react-more="${p.id}" aria-label="More emojis">${ic("plus")}</button></div>`;
  b.hidden=false;const w=b.offsetWidth||300;
  b.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+"px";b.style.top=Math.max(8,r.top-56)+"px";
}
function reactMoreSheet(p){
  openSheet(`<h2 id="sh-title">React with any emoji</h2>`+["face","hand","heart","campus"].map(k=>`<div class="egrid" style="margin-bottom:8px">${EM[k].map(e=>`<button type="button" data-react="${p.id}|${e}" aria-label="${e}" style="border:0;background:none;font-size:26px;padding:4px;border-radius:10px">${e}</button>`).join("")}</div>`).join("")+`<div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`,document.activeElement);
}
function reactionsSheet(p){
  const rows=Object.entries(p.R||{}).sort((a,b)=>b[1]-a[1]);
  openSheet(`<h2 id="sh-title">Reactions</h2>${rows.length?rows.map(([e,n])=>`<div class="mrow"><span style="font-size:26px">${e}</span><span class="who"><b>${fmtCount(n)}</b></span></div>`).join(""):`<div class="empty">No reactions yet.</div>`}<p class="infoline">${fmtCount(p.saves)} people saved this post.</p><div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`,document.activeElement);
}
function doRepost(p){
  if(!canRepost(p)){toast("This post can't be reposted.");return;}
  p.rp=p.rp||[];
  if(p.rp.includes(ME.n)){p.rp=p.rp.filter(n=>n!==ME.n);S.reposts=S.reposts.filter(x=>x!==p);p.repostTime=null;toast("Repost removed.");}
  else{p.rp.unshift(ME.n);p.shares=(p.shares||0)+1;p.repostTime="just now";S.reposts.unshift(p);toast(S.showReposts?"Reposted to your profile.":"Reposted. Only you can see it because your reposts are hidden.");}
  refreshPost(p);
}
function quoteSheet(p){
  openSheet(`<h2 id="sh-title">Quote</h2><label class="sr" for="qtext">Your comment</label><textarea id="qtext" class="ginput" rows="3" placeholder="Add your own comment"></textarea>
   <div class="qcard" style="cursor:default"><div class="qh">${av(p.name,26)}<b>${esc(p.name)}</b><small style="color:var(--muted)">${esc(p.time)}</small></div><p>${esc(p.text||p.cap||(p.kind==="video"?"Video":"Photo"))}</p></div>
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Cancel</button><button class="btn primary" type="button" data-quote="${p.id}">Post quote</button></div>`,document.activeElement);
}
function ensureChat(x){
  let c=CH.find(ch=>!ch.group&&ch.name===x.n);
  if(!c){c={id:++chid,name:x.n,online:!!x.online,mutual:true,unread:0,time:"now",lastTs:Date.now(),msgs:[]};CH.push(c);}
  return c;
}
function sendTo(name,p){
  const x=person(name);if(!x)return;const key=p.id+"|"+name;if(S.sent[key])return;S.sent[key]=1;
  if(x.mutual){pushMsg(ensureChat(x),{type:"post",postId:p.id});toast("Sent to "+name.split(" ")[0]+" in Messages.");}
  else toast("Sent to "+name.split(" ")[0]+". They will see it in their notifications.");
  $$(`[data-sendto="${name.replace(/"/g,"")}"].ppsend`).forEach(b=>{b.textContent="Sent";b.disabled=true;});
}
function feedbackSheet(about){
  openSheet(`<h2 id="sh-title">Send feedback</h2><p class="infoline" style="margin-top:0">About: ${esc(about)}</p>
   <label class="sr" for="fbcat">Type</label><select id="fbcat" class="ginput"><option>Report a problem</option><option>Report a post or person</option><option>Suggestion</option><option>Something else</option></select>
   <label class="sr" for="fbtxt">Your message</label><textarea id="fbtxt" class="ginput" rows="4" placeholder="Tell us what happened or what you would like to see"></textarea>
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Cancel</button><button class="btn primary" type="button" id="fbsend" data-fbsend disabled>Send feedback</button></div>`,document.activeElement);
}
const VIEWERS=[{n:"Ada Okafor",t:"2h ago"},{n:"Ngozi Eze",t:"5h ago"},{n:"Musa Ibrahim",t:"Yesterday"},{n:"Chiamaka Obi",t:"Yesterday"},{n:"Zainab Yusuf",t:"2 days ago"},{n:"Kelechi Nwosu",t:"2 days ago"}];
function visitorsSheet(){
  if(!S.pvhist){openSheet(`<h2 id="sh-title">Profile views</h2><p class="infoline" style="margin-top:0">Profile view history is off. Turn it on in Settings to see who visited your profile. While it is off, people also can't see when you visit theirs.</p><div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`,document.activeElement);return;}
  openSheet(`<h2 id="sh-title">Profile views</h2><p class="infoline" style="margin-top:0">${VIEWERS.length} people viewed your profile in the last 7 days.</p>
   ${VIEWERS.map(v=>{const x=person(v.n);return `<div class="row">${av(v.n,40)}<span class="who"><button class="lnk" type="button" data-profile="${esc(v.n)}">${esc(v.n)}</button> ${lv(x.lv)}<small>${esc(x.d)}, ${esc(x.s)}</small></span><small style="color:var(--muted)">${v.t}</small></div>`;}).join("")}
   <p class="infoline">Only people who have profile view history turned on appear here.</p><div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`,document.activeElement);
}
/* pop-up messages */
let popT;
function showPopup(c,m){
  const p=$("#popup");
  p.innerHTML=`<button class="pupbtn" type="button" data-popopen="${c.id}">${cav(c,40)}<span class="who"><b>${esc(c.name)}</b><span>${esc(PV[m.type](m))}</span></span></button><button class="iconbtn" type="button" data-popclose aria-label="Dismiss">${ic("x")}</button>`;
  p.hidden=false;clearTimeout(popT);popT=setTimeout(()=>{p.hidden=true;},6000);
}
function incoming(c,text){
  const m=M(c.group?c.members[0]:c.name,"text",{text,time:nowT()});
  c.msgs.push(m);c.unread++;c.time="now";c.lastTs=Date.now();
  const viewing=S.view==="messages"&&S.chat===c.id;
  refreshChatUI();playTone(S.tone);
  if(S.popups&&!c.muted&&!viewing)showPopup(c,m);
}

/* mini chat on the home page */
function renderMini(){
  const m=$("#mini");if(S.mini==null){m.hidden=true;m.innerHTML="";return;}
  const c=CH.find(x=>x.id===S.mini);if(!c){m.hidden=true;return;}
  m.hidden=false;
  m.innerHTML=`<div class="mh">${cav(c,36,chOnline(c))}<div class="who"><b>${esc(c.name)}</b><br><small style="color:var(--muted)">${c.group?"Group":chOnline(c)?"Online":"Offline"}</small></div><button class="iconbtn" type="button" data-mini-expand aria-label="Open in Messages">${ic("up")}</button><button class="iconbtn" type="button" data-mini-close aria-label="Close chat">${ic("x")}</button></div>
   <div class="thread" id="mthread">${c.msgs.slice(-8).map(x=>bubbleHTML(x,c)).join("")}${seenLineHTML(c)}</div>
   ${canSend(c)?`<form class="cin" id="mform"><label class="sr" for="mmsg">Message</label><input id="mmsg" type="text" placeholder="Write a message" autocomplete="off"><button type="submit" class="sendbtn" aria-label="Send">${ic("send")}</button></form>`:`<div class="locked">${ic("lock")}<span>${c.group?"Only admins can send here.":"Follow each other to message."}</span></div>`}`;
  const t=$("#mthread");t.scrollTop=t.scrollHeight;
}
function ctRefresh(){}

/* profile */
const mkr=m=>m?`<span class="mk">${ic("repost","sm")}</span>`:"";
function tilesFor(off,n,mark){
  const T=[["p",0],["t",1,"CSC 208 notes"],["v"],["p",2],["t",4,"Study group Friday"],["p",1],["v"],["t",3,"Final year loading"],["p",3]];
  let h="";for(let i=0;i<n;i++){const x=T[(i+off)%T.length];
    if(x[0]==="p")h+=`<div class="tile">${scene(x[1])}${mkr(mark)}</div>`;
    else if(x[0]==="t")h+=`<div class="tile t" style="background:${BGCOL[x[1]]}">${esc(x[2])}${mkr(mark)}</div>`;
    else h+=`<div class="tile v">${ic("play","lg")}${mkr(mark)}</div>`;}
  return h;
}
function tileOf(p){
  if(p.kind==="text"||p.kind==="plain")return `<div class="tile t" style="background:${BGCOL[p.bg]||BGCOL[1]}">${esc(p.text||p.cap||"")}${mkr(1)}</div>`;
  if(p.kind==="photo")return `<div class="tile">${scene(p.seed||0)}${mkr(1)}</div>`;
  if(p.kind==="userphoto")return `<div class="tile"><img src="${p.src}" alt="" style="width:100%;height:100%;object-fit:cover">${mkr(1)}</div>`;
  return `<div class="tile v">${ic("play","lg")}${mkr(1)}</div>`;
}
const PGEN={};
function genPosts(p,tab,n){
  const key=p.n+"|"+tab;if(PGEN[key])return PGEN[key];
  const T=[["photo",0,"Field trip photos"],["text",1,"CSC 208 notes"],["video",0,"Quick demo"],["photo",2,"Sunset at the library"],["text",4,"Study group Friday"],["photo",1,"Lab day"],["video",0,"Timelapse"],["text",3,"Final year loading"],["photo",3,"Weekend"]];
  const off=tab==="reposts"?3:tab==="likes"?4:tab==="saved"?2:(p.posts%3),authors=PEOPLE.filter(x=>x.n!==p.n),arr=[];
  for(let i=0;i<n;i++){
    const x=T[(i+off)%T.length],orig=tab==="posts"?p:authors[(i+hue(p.n))%authors.length];
    arr.push(reg({name:orig.n,time:(i+1)+"d ago",aud:"everyone",kind:x[0],likes:20+i*7,comments:3+i,dl:i%2===0,cap:x[0]==="text"?"":x[2],text:x[2],bg:x[1]||1,seed:x[0]==="photo"?x[1]:0,photos:x[0]==="photo"?2:1,dur:"0:"+(15+i*3),repostedBy:tab==="reposts"?p.n:null,rp:tab==="reposts"?[p.n]:[],repostTime:tab==="reposts"?(i+1)+"h ago":null}));
  }
  return PGEN[key]=arr;
}
function tileP(post,mark){
  const a=`data-tile="${post.id}"`,m=mark||post.repostedBy?mkr(1):"";
  const when=(mark||post.repostedBy)?(post.repostTime||"reposted"):post.time;
  const tago=when?`<span class="tago">${esc(when)}</span>`:"";
  if(post.kind==="text"||post.kind==="plain")return `<button class="tile t" type="button" ${a} style="background:${BGCOL[post.bg]||BGCOL[1]}" aria-label="Open post">${esc(post.text||post.cap||"")}${m}${tago}</button>`;
  if(post.kind==="photo")return `<button class="tile" type="button" ${a} aria-label="Open photo post">${scene(post.seed||0)}${m}${tago}</button>`;
  if(post.kind==="userphoto")return `<button class="tile" type="button" ${a} aria-label="Open photo post"><img src="${post.src}" alt="" style="width:100%;height:100%;object-fit:cover">${m}${tago}</button>`;
  return `<button class="tile v" type="button" ${a} aria-label="Open video post">${ic("play","lg")}${m}${tago}</button>`;
}
function renderProfile(){
  const mine=S.profileOf==="me",p=mine?ME:person(S.profileOf);
  const showRp=mine||p.rp!==false;
  const tabs=[["posts","Posts"]];if(showRp)tabs.push(["reposts","Reposts"]);if(mine)tabs.push(["likes","Likes"],["saved","Saved"]);
  if(!tabs.some(x=>x[0]===S.profTab))S.profTab="posts";
  const own=mine?[...POSTS.school,...POSTS.other,...POSTS.friends].filter(x=>x.own):[];
  let list;
  if(S.profTab==="posts")list=[...own,...genPosts(p,"posts",mine?9:6)];
  else if(S.profTab==="reposts")list=[...(mine?S.reposts:[]),...genPosts(p,"reposts",mine?2:3)];
  else if(S.profTab==="likes")list=genPosts(p,"likes",6);else list=genPosts(p,"saved",3);
  const grid=list.map(x=>tileP(x,S.profTab==="reposts")).join("");
  const note=(mine&&S.profTab==="reposts"&&!S.showReposts)?`<p class="hint" style="margin:10px 2px">Your reposts are hidden from other people. You can change this in Settings.</p>`:"";
  const st=STATUS[p.n]&&!mine&&canSeePhoto(p);
  const ring=st?(STATUS[p.n].seen?"ring-seen":"ring-on"):"";
  const f=p.mutual?"Following":"Follow";
  $("#v-profile").innerHTML=`
   ${mine?"":`<button class="btn" type="button" data-back-profile style="margin-bottom:12px">${ic("back","sm")} Back</button>`}
   <div class="pcard"><div class="pcover" aria-hidden="true"></div><div class="pmain">
     <div class="phead"><button class="avbtn ${ring}" type="button" data-avatar="${mine?"me":esc(p.n)}" aria-label="${st?"View status":"View profile picture"}">${av(p.n,96)}</button><div class="pn"><h2>${esc(p.n)}</h2><div class="u">@${esc(p.u)}${isOnline(p)&&!mine?` <span style="color:var(--ok);font-weight:600">Online</span>`:""}</div></div>
       <div class="pact">${mine?`<button class="btn" type="button" data-go="editprofile">Edit profile</button><button class="btn" type="button" data-toast="Profile link copied.">Share profile</button>`
        :`<button class="btn primary followbtn2" type="button" aria-pressed="${!!p.mutual}">${f}</button><button class="btn" type="button" data-msgto="${esc(p.n)}" ${p.mutual?"":'aria-disabled="true"'}>${ic("msg","sm")} Message</button>`}</div></div>
     <div class="pinfo">${lv(p.lv)}<span>${ic("school","sm")}${esc(p.d)}</span><span>${ic("globe","sm")}${esc(p.s)}</span>${mine&&S.pvhist?`<button class="chip" type="button" data-visitors>${ic("eye","sm")} ${fmtCount(VIEWERS.length)} profile views</button>`:""}</div>
     <p class="pbio">${esc(p.bio)}</p>
     ${(!mine&&!p.mutual)?`<p class="hint" style="margin:8px 0 0">You can message ${esc(p.n.split(" ")[0])} once you follow each other.</p>`:""}
     ${(!mine&&!canSeePhoto(p))?`<p class="hint" style="margin:8px 0 0">${esc(p.n.split(" ")[0])} keeps their profile picture and status private.</p>`:""}
     <div class="stats"><div><b>${fmtCount(p.posts)}</b><small>Posts</small></div>
       <button type="button" data-list="followers"><b>${fmtCount(p.fr)}</b><small>Followers</small></button>
       <button type="button" data-list="following"><b>${fmtCount(p.fg)}</b><small>Following</small></button>
       <button type="button" data-list="friends"><b>${fmtCount(p.fs)}</b><small>Friends</small></button></div>
     <div class="ptabs" role="tablist">${tabs.map(x=>`<button class="tab" role="tab" data-ptab="${x[0]}" aria-selected="${S.profTab===x[0]}">${x[1]}</button>`).join("")}</div>
   </div></div>${note}
   <div class="grid3">${grid}</div>`;
}

/* friends, followers, following */
const FOLL={me:{}};
FOLL.me.friends=PEOPLE.filter(x=>x.mutual);
FOLL.me.followers=[...FOLL.me.friends,byName["Ngozi Eze"],byName["Zainab Yusuf"]];
FOLL.me.following=[...FOLL.me.friends,byName["Musa Ibrahim"],byName["Chiamaka Obi"]];
function listFor(p,kind){
  const base=PEOPLE.filter(x=>x.n!==p.n),r=hue(p.n)%base.length,rot=[...base.slice(r),...base.slice(0,r)];
  if(kind==="friends")return rot.filter(x=>x.mutual).slice(0,3);
  return kind==="followers"?rot.slice(0,6):rot.slice(1,6);
}
function frRow(x){
  const btn=x.mutual?`<button class="btn" type="button" data-msgto="${esc(x.n)}">${ic("msg","sm")} Message</button>`:`<button class="followbtn" type="button" aria-pressed="false">Follow</button>`;
  return `<div class="row">${av(x.n,44)}<span class="who"><button class="lnk" type="button" data-profile="${esc(x.n)}">${esc(x.n)}</button> ${lv(x.lv)}<small>${esc(x.d)}, ${esc(x.s)}</small></span>${btn}</div>`;
}
function refreshAvatarsEverywhere(){
  $("#me-av").innerHTML=av(ME.n,40);$("#comp-av").innerHTML=av(ME.n,44);
  if(S.view==="home")renderFeed();
  if(S.view==="profile")renderProfile();
  if(S.view==="messages")renderChat();
  renderRail();renderMini();
}
function renderEditProfile(){
  $("#v-editprofile").innerHTML=`
   <div class="card" style="max-width:560px;padding:20px">
     <div style="display:flex;align-items:center;gap:16px;margin-bottom:18px">
       ${av(ME.n,84)}
       <div><button class="btn" type="button" id="epphoto">Change photo</button>${ME.avatarImg?`<button class="btn" type="button" id="epphotorm" style="margin-left:8px">Remove</button>`:""}
       <p class="hint" style="margin:8px 0 0">JPG or PNG works best. Your picture stays on this device until you post it.</p></div>
     </div>
     <label class="sr" for="epname">Full name</label><p class="hint" style="margin:0 0 4px">Full name</p><input id="epname" class="ginput" value="${esc(ME.n)}" maxlength="60">
     <p class="hint" style="margin:12px 0 4px">Username</p><input id="epuser" class="ginput" value="${esc(ME.u)}" maxlength="30">
     <p class="hint" style="margin:12px 0 4px">Department</p><input id="epdept" class="ginput" value="${esc(ME.d)}" maxlength="60">
     <p class="hint" style="margin:12px 0 4px">School <span style="opacity:.7">(set at sign-up, so this is read-only)</span></p><input class="ginput" value="${esc(ME.s)}" disabled>
     <p class="hint" style="margin:12px 0 4px">Bio</p><textarea id="epbio" class="ginput" rows="3" maxlength="150">${esc(ME.bio)}</textarea>
     <div class="btnrow" style="margin-top:16px"><button class="btn" type="button" data-go="profile">Cancel</button><button class="btn primary" type="button" id="epsave">Save changes</button></div>
   </div>`;
}
function renderFriends(){
  const mine=S.listOf==="me",p=mine?ME:person(S.listOf);
  const tabs=[["friends","Friends"],["followers","Followers"],["following","Following"]];
  if(!tabs.some(x=>x[0]===S.flist))S.flist="friends";
  const ok=mine||canSeeLists(p);
  const list=mine?FOLL.me[S.flist]:listFor(p,S.flist);
  const onl=PEOPLE.filter(x=>x.mutual&&isOnline(x));
  const onlHTML=mine?(S.priv.online==="nobody"?`<p class="hint" style="margin:0 2px 12px">Your online status is hidden, so you can't see who is online. Change it in Settings.</p>`:`<div class="sectitle" style="margin:0 2px 8px">Online now (${onl.length})</div>${onl.length?`<div class="online-row">${onl.map(x=>`<button class="onl" type="button" data-openchatwith="${esc(x.n)}" aria-label="Chat with ${esc(x.n)}">${av(x.n,48,true)}<span>${esc(x.n.split(" ")[0])}</span></button>`).join("")}</div>`:`<p class="hint" style="margin:0 2px 12px">None of your friends are online right now.</p>`}`):"";
  $("#v-friends").innerHTML=`${onlHTML}${mine?"":`<div class="fhead"><button class="btn" type="button" data-back-list>${ic("back","sm")} Back</button><h2>${esc(p.n)}</h2></div>`}
   <div class="seg" role="group" aria-label="Lists" style="margin-bottom:12px">${tabs.map(x=>`<button type="button" data-flist="${x[0]}" aria-pressed="${S.flist===x[0]}">${x[1]}</button>`).join("")}</div>
   <div class="card plist">${ok?(list.length?list.map(frRow).join(""):`<div class="empty">Nobody here yet.</div>`):`<div class="lockbox">${ic("lock")}<b>${esc(p.n.split(" ")[0])} keeps these lists private</b><span>${p.vis==="friends"?"Only their friends can see who they follow, who follows them and their friends.":"Only they can see who they follow, who follows them and their friends."}</span></div>`}</div>`;
}

/* settings */
const seg=(key,opts,cur)=>`<div class="seg" role="group">${opts.map(o=>`<button type="button" data-priv="${key}" data-val="${o[0]}" aria-pressed="${cur===o[0]}">${o[1]}</button>`).join("")}</div>`;
const sw=(key,label,on)=>`<button class="switch" type="button" role="switch" aria-checked="${on}" aria-label="${esc(label)}" data-switch="${key}"></button>`;
const opt=(title,sub,ctl)=>`<div class="opt"><div class="l"><b>${title}</b>${sub?`<small>${sub}</small>`:""}</div>${ctl}</div>`;
function renderSettings(){
  incrementAdViews();
  const three=[["everyone","Everyone"],["friends","Friends"],["nobody","Nobody"]];
  const msgSub=S.priv.msg==="everyone"?"Anyone can message you. Messages from people you don't follow back go to Requests.":S.priv.msg==="friends"?"Only friends (people you follow back)":"Nobody can start a chat with you";
  $("#setroot").innerHTML=`
   <div class="card sc"><h2>Appearance</h2>
    ${opt("Site theme","How SLC looks on this device",`<div class="seg" role="group" aria-label="Site theme"><button type="button" data-site-theme="light" aria-pressed="false">Light</button><button type="button" data-site-theme="dark" aria-pressed="false">Dark</button><button type="button" data-site-theme="system" aria-pressed="true">Match device</button></div>`)}</div>
   <div class="card sc"><h2>Privacy</h2>
    ${opt("Who can message me",msgSub,seg("msg",three,S.priv.msg))}
    ${opt("Who can add me to groups",S.priv.groups==="everyone"?"Anyone can add you to a group":S.priv.groups==="friends"?"Only friends can add you":"Nobody can add you",seg("groups",three,S.priv.groups))}
    ${opt("Who can see my profile picture and status","",seg("photo",[["everyone","Everyone"],["friends","Friends"],["me","Only me"]],S.priv.photo))}
    ${opt("Who can see my followers, following and friends","Everyone can see them unless you change this",seg("lists",[["everyone","Everyone"],["friends","Friends"],["me","Only me"]],S.priv.lists))}
    ${opt("Last seen","Who can see when you were last on SLC",seg("seen",three,S.priv.seen))}
    ${opt("Online status","Who can see when you are online. If you hide it, you also won't see when others are online.",seg("online",three,S.priv.online))}
    ${opt("Read receipts","Blue ticks when you have read a message",sw("receipts","Read receipts",S.receipts))}
    ${opt("Profile view history","When on, you can see who visited your profile and they can see when you visit theirs.",sw("pvhist","Profile view history",S.pvhist))}
    ${opt("Show my reposts on my profile","Turn off to keep your reposts to yourself",sw("showReposts","Show my reposts on my profile",S.showReposts))}
    <div class="opt" style="display:block"><div class="l"><b>Blocked accounts</b><small>They cannot message you or see your profile picture</small></div>
      ${S.blocked.length?S.blocked.map(n=>`<div class="blk">${av(n,36)}<span class="who"><b>${esc(n)}</b></span><button class="btn" type="button" data-unblock="${esc(n)}">Unblock</button></div>`).join(""):`<div class="empty" style="padding:8px 0">No blocked accounts.</div>`}</div></div>
   <div class="card sc"><h2>Notifications</h2>
    ${opt("Message pop-ups","Show a banner when a new message arrives",sw("popups","Message pop-ups",S.popups))}
    ${opt("Message tone","The sound for new messages",`<div class="btnrow"><select id="tonesel" aria-label="Message tone">${TONES.map(x=>`<option value="${x[0]}" ${S.tone===x[0]?"selected":""}>${x[1]}</option>`).join("")}</select><button class="btn" type="button" id="tonebtn">Play</button></div>`)}
    ${opt("Try it","See how a pop-up looks",`<button class="btn" type="button" data-testpopup>Send a test pop-up</button>`)}</div>
   <div class="card sc"><h2>Messages</h2>
    ${opt("Chat colour","The colour of your message bubbles",`<div class="ctheme" role="group" aria-label="Chat colour">${ctSwatches(S.ct)}</div>`)}
    ${opt("Bubble style","How message bubbles look",`<div class="seg" role="group" aria-label="Bubble style">${bsButtons(S.bs)}</div>`)}
    ${opt("Chat wallpaper","Your default. You can also set one for each chat.",wpThumbs(S.wp,S.wpImg))}
    ${opt("Inbox style","How your chat list is laid out",`<div class="seg" role="group" aria-label="Inbox style"><button type="button" data-inbox="comfortable" aria-pressed="${S.inbox==="comfortable"}">Comfortable</button><button type="button" data-inbox="compact" aria-pressed="${S.inbox==="compact"}">Compact</button></div>`)}
    ${opt("My stickers and GIFs",`${S.mySticks.length} stickers, ${S.myGifs.length} GIFs`,`<button class="btn" type="button" data-mkstk>Create a sticker</button>`)}</div>
   <div class="card sc"><h2>My ads</h2>
    ${MYADS.length?MYADS.map(renderMyAdRow).join(""):`<div class="empty">You haven't submitted any ads yet. Go to Create \u2192 Advertise.</div>`}</div>
   <div class="card sc"><h2>Posts</h2>
    ${opt("Allow downloads on my new posts","You can still change this on each post",sw("dlDefault","Allow downloads on my new posts",S.dlDefault))}</div>
   <div class="card sc"><h2>Account</h2>
    ${opt("Log out","Sign out of SLC on this device",`<button class="btn" type="button" data-logout>Log out</button>`)}</div>
   <div class="card sc"><h2>Help</h2>
    ${opt("Send feedback","Tell the SLC team about a problem or an idea",`<button class="btn" type="button" data-feedback="SLC in general">Send feedback</button>`)}</div>`;
  paintTheme();
}

/* share sheet */
let sheetFrom=null,sheetPost=null;
function openSheet(html,fromEl){sheetFrom=fromEl||document.activeElement;$("#sheet-body").innerHTML=html;$("#scrim").hidden=false;$("#sheet").hidden=false;const f=$("#sheet button:not([disabled])");if(f)f.focus();}
function focusSheet(){const f=$("#sheet button:not([disabled]), #sheet input");if(f)f.focus();}
function closeSheet(){$("#scrim").hidden=true;$("#sheet").hidden=true;if(sheetFrom&&sheetFrom.focus)sheetFrom.focus();}
function commentPreviewHTML(p){
  ensureCm(p);
  if(!p.cm.length)return "";
  const top=[...p.cm].sort((a,b)=>(b.likes||0)-(a.likes||0))[0];
  const PVc={text:c=>esc(c.text),emoji:c=>esc(c.text),sticker:()=>"Sent a sticker",gif:()=>"Sent a GIF",photo:()=>"Sent a photo",voice:()=>"Sent a voice note"};
  const line=`<button class="cmpreview" type="button" data-comments><b>${esc(top.name===ME.n?"You":top.name)}</b>${PVc[top.type](top)}</button>`;
  const more=p.comments>1?`<button class="viewall" type="button" data-comments>View all ${fmtCount(p.comments)} comments</button>`:"";
  return line+more;
}
function reposterSheet(p,fromEl){
  const rp=p.rp||[],known=knownSet(),kn=rp.filter(n=>known.has(n)||n===ME.n),others=rp.length-kn.length,mine=rp.includes(ME.n);
  openSheet(`<h2 id="sh-title">Reposted by</h2>${kn.map(n=>{const x=person(n)||ME;return `<div class="row">${av(n,40)}<span class="who"><button class="lnk" type="button" data-profile="${esc(n)}">${esc(n===ME.n?"You":n)}</button> ${lv(x.lv)}<small>${esc(x.d)}, ${esc(x.s)}</small></span></div>`;}).join("")}
   ${others?`<p class="infoline">${others} other${others>1?"s":""} reposted this. You only see the names of your friends and people you follow.</p>`:""}
   ${kn.length||others?"":`<div class="empty">No reposts yet.</div>`}
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button><button class="btn primary" type="button" data-repost="${p.id}" data-sh="close" ${canRepost(p)?"":"disabled"}>${ic("repost","sm")} ${mine?"Undo repost":"Repost"}</button></div>`,fromEl);
}
function shareMain(p){
  const open=canRepost(p)||((p.aud==="everyone"||p.aud==="other")&&!p.rpOff),rpd=(p.rp||[]).includes(ME.n);
  const ppl=[...FOLL.me.friends,...FOLL.me.following.filter(x=>!x.mutual)];
  const row=ppl.map(x=>`<div class="pp"><button class="ppb" type="button" data-sendto="${esc(x.n)}" aria-label="Send to ${esc(x.n)}">${av(x.n,52)}</button><span class="ppn">${esc(x.n.split(" ")[0])}</span><button class="ppsend" type="button" data-sendto="${esc(x.n)}" ${S.sent[p.id+"|"+x.n]?"disabled":""}>${S.sent[p.id+"|"+x.n]?"Sent":"Send"}</button></div>`).join("");
  return `<h2 id="sh-title">Share</h2>
   <div class="pplrow" role="group" aria-label="Friends and people you follow">${row}</div>
   <button class="sopt" data-sh="repost" ${open&&!p.own?"":"disabled"}>${ic("repost")}<span><b>${rpd?"Undo repost":"Repost"}</b><small>${open&&!p.own?"Show it on your profile":"Not available for this post"}</small></span></button>
   <button class="sopt" data-sh="quote" ${open&&!p.own?"":"disabled"}>${ic("msg")}<span><b>Quote</b><small>${open&&!p.own?"Repost with your own comment":"Not available for this post"}</small></span></button>
   <button class="sopt" data-sh="apps" ${open?"":"disabled"}>${ic("apps")}<span><b>Share to other apps</b><small>${open?"WhatsApp, Telegram and more":"Not available for this audience"}</small></span></button>
   ${p.dl?`<button class="sopt" data-sh="download">${ic("down")}<span><b>Download</b><small>The poster allows downloads</small></span></button>`:""}
   <button class="sopt" data-sh="link">${ic("link")}<span><b>Copy link</b><small>Only people who can see this post can open it</small></span></button>
   <p class="infoline">Friends get it in Messages. People you follow but who don't follow you back get it in their notifications.</p>
   <div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`;
}
function shareApps(){
  const A=[["WhatsApp","W","#1f9d55"],["Telegram","T","#2a8fd0"],["Facebook","F","#1b5fc4"],["X","X","#111827"],["Email","@","#5b6b80"],["More","...","#7a3f9d"]];
  return `<h2 id="sh-title">Share to other apps</h2><div class="apps">${A.map(a=>`<button class="app-i" type="button" data-app="${a[0]}"><i style="background:${a[2]}">${a[1]}</i>${a[0]}</button>`).join("")}</div>
   <p class="infoline">Anyone who opens the link still needs to be allowed to see this post.</p><div class="sheetfoot"><button class="btn" type="button" data-sh="main">Back</button></div>`;
}
function shareFriends(){
  const fr=PEOPLE.filter(p=>p.mutual);
  return `<h2 id="sh-title">Send to friends</h2>${fr.map(p=>`<label class="frow">${av(p.n,40)}<span class="who"><b>${esc(p.n)}</b><br><small style="color:var(--muted)">${esc(p.d)}, ${esc(p.s)}</small></span><input type="checkbox" data-friend="${esc(p.n)}"></label>`).join("")}
   <p class="infoline">Only people who follow you back are listed.</p>
   <div class="sheetfoot"><button class="btn" type="button" data-sh="main">Back</button><button class="btn primary" type="button" id="sendfr" disabled>Send</button></div>`;
}

/* composer state */
const C={photos:[],video:null,bg:0};
function renderPreview(){
  const pv=$("#preview");
  const items=C.photos.map((s,i)=>`<div class="pv"><img src="${s}" alt="Selected photo ${i+1}"><button class="rm" type="button" data-rmphoto="${i}" aria-label="Remove photo">${ic("x","sm")}</button></div>`);
  if(C.video)items.push(`<div class="pv">${ic("video")}<span style="display:block">${esc(C.video)}</span><button class="rm" type="button" data-rmvideo aria-label="Remove video">${ic("x","sm")}</button></div>`);
  pv.innerHTML=items.join("");pv.hidden=items.length===0;
  $("#swatches").hidden=items.length>0;$("#dllabel").hidden=items.length===0;
}
function renderSwatches(){
  $("#swatches").innerHTML=`<span>Colour</span><button class="sw none" type="button" data-bg="0" aria-pressed="${C.bg===0}" aria-label="No colour"></button>`+BGS.map(b=>`<button class="sw" type="button" data-bg="${b}" style="background:${BGCOL[b]}" aria-pressed="${C.bg===b}" aria-label="Colour ${b}"></button>`).join("");
}
function readFiles(files){
  [...files].slice(0,4-C.photos.length).forEach(f=>{if(!f.type.startsWith("image/"))return;const r=new FileReader();r.onload=()=>{C.photos.push(r.result);renderPreview();};r.readAsDataURL(f);});
}
function setTabUI(tab){S.tab=tab;$$("[data-tab]").forEach(x=>x.setAttribute("aria-selected",String(x.dataset.tab===tab)));}
const AD_C={img:null,tier:"basic"};
const PAYCFG=Object.assign({expiryMinutes:15,pollSeconds:5},window.SLC_PAYMENT||{});
const PAY={timer:null,poll:null,adId:null,acct:null};
function payClear(){clearInterval(PAY.timer);clearInterval(PAY.poll);PAY.timer=PAY.poll=null;}
function newPayRef(){
  const a=new Uint8Array(6);(window.crypto||{getRandomValues:x=>x.forEach((_,i)=>x[i]=Math.floor(Math.random()*256))}).getRandomValues(a);
  return "SLC-"+[...a].map(x=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[x%32]).join("");
}
function payApi(path,body){
  const opt=body?{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(body)}:{credentials:"same-origin"};
  return fetch("api/"+path,opt).then(r=>{
    if(!(r.headers.get("content-type")||"").includes("json"))throw new Error("no server");
    return r.json().then(j=>{j._status=r.status;return j;});
  });
}
const mmss=ms=>{const t=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");};
function bankRow(label,value,copy){
  return `<div class="row2 bankrow"><b>${label}</b><span>${esc(value)}</span>${copy?`<button class="copybtn" type="button" data-copy="${esc(copy)}" aria-label="Copy ${esc(label)}">${ic("copy","sm")}Copy</button>`:""}</div>`;
}
function payRender(inner,foot){
  const t=tierOf({tier:AD_C.tier});
  $("#sheet-body").innerHTML=`<h2 id="sh-title">Pay for your ad</h2>
   <div class="extract"><div class="row2"><b>Package</b><span>${t.name}</span></div><div class="row2"><b>Views included</b><span>${t.views.toLocaleString()}+</span></div><div class="row2"><b>Runs for</b><span>${t.days} days</span></div><div class="row2"><b>Amount</b><span><b style="color:var(--text)">${naira(t.price)}</b></span></div></div>
   ${inner}<div class="sheetfoot">${foot}</div>`;
  focusSheet();
}
const PAY_CANCEL='<button class="btn" type="button" data-sh="close">Cancel</button>';
function paySheet(){
  payClear();PAY.adId=null;
  openSheet("",document.activeElement);
  payRender('<p class="infoline" id="payWait">Getting a payment account for you...</p>',PAY_CANCEL);
  startPayment();
}
function startPayment(){
  const t=tierOf({tier:AD_C.tier});
  const draft={title:$("#adtitle").value.trim(),body:$("#adbody").value.trim(),contact:$("#adcontact").value.trim(),package:t.id,category:"services",business_name:ME.n};
  (PAY.adId?Promise.resolve({ok:true,ad_id:PAY.adId}):payApi("submit_ad.php",draft)).then(r=>{
    if(r.ok){PAY.adId=r.ad_id;return payApi("pay_start.php",{ad_id:PAY.adId});}
    if(r._status===422)return {_msg:r.error};
    throw new Error("not available");
  }).then(r=>{
    if(r._msg)return payError(r._msg);
    if(r.ok)return payShow(t,r);
    if(r._status===409||r._status===502)return payError(r.error||"Please try again.");
    throw new Error("not available");
  }).catch(()=>payError("Payments are not available right now. Please try again in a few minutes."));
}
function payError(msg){
  payClear();
  payRender(`<p class="infoline" id="payErr" role="alert">${esc(msg)}</p>`,`${PAY_CANCEL}<button class="btn primary" type="button" id="payRetry">Try again</button>`);
}
function payShow(t,a){
  payClear();PAY.acct=a;AD_C.ref=a.reference;
  const end=new Date(a.expires_at).getTime();
  payRender(`<div class="bankbox">
    <p class="bankhead">${ic("lock")}<b>Send exactly ${naira(a.amount)} to this account</b></p>
    ${bankRow("Bank",a.bank)}
    ${bankRow("Account number",a.account_number,a.account_number)}
    ${bankRow("Account name",a.account_name)}
    ${bankRow("Amount",naira(a.amount),String(a.amount))}
    <p class="paycount" id="payTimer"></p>
    <p class="infoline">This account was made just for this one payment. It stops working when the timer ends or once you have paid, so please do not save it or send money to it later.</p>
   </div>
   <p class="infoline" id="payState" role="status">Waiting for your transfer. This page updates by itself when the money arrives.</p>`,
   `${PAY_CANCEL}`);
  const tick=()=>{
    const el=document.getElementById("payTimer");
    if(!el){payClear();return;}
    const left=end-Date.now();
    if(left<=0){payExpire();return;}
    el.innerHTML=`Account expires in <b>${mmss(left)}</b>`;
  };
  tick();PAY.timer=setInterval(tick,1000);
  PAY.poll=setInterval(()=>{
    if(!document.getElementById("payTimer")){payClear();return;}
    payApi("pay_status.php?reference="+encodeURIComponent(a.reference)).then(r=>{
      if(r.status==="success")payPaid();
      else if(r.status==="failed")payError("Your transfer was rejected, usually because the amount was not exact. Please try again.");
    }).catch(()=>{});
  },PAYCFG.pollSeconds*1000);
}
function payExpire(){
  payClear();
  payRender(`<p class="infoline" id="payErr" role="status">This payment account has expired. If you already sent the money, do not worry: it will still reach us and we will match it to your ad. Otherwise, get a new account to pay.</p>`,`${PAY_CANCEL}<button class="btn primary" type="button" id="payRenew">Get a new account</button>`);
}
function payPaid(){
  payClear();closeSheet();submitAd();PAY.adId=null;
}
function submitAd(){
  const title=$("#adtitle").value.trim(),body=$("#adbody").value.trim(),contact=$("#adcontact").value.trim();
  const t=tierOf({tier:AD_C.tier});
  const p=reg({uid:"u"+Date.now().toString(36)+Math.floor(Math.random()*1e3),isAd:true,pending:true,payStatus:"paid",payRef:AD_C.ref||newPayRef(),title,body,contact,img:AD_C.img,by:ME.n,tier:t.id,price:t.price,views:Math.max(4,Math.floor(t.views*0.06)),contactTaps:0});
  POSTS[S.tab].splice(1,0,p);MYADS.unshift(p);setTabUI(S.tab);
  $("#adtitle").value="";$("#adbody").value="";$("#adcontact").value="";AD_C.img=null;AD_C.tier="basic";renderTiers();renderAdPreview();
  saveMyAds();
  later("Payment received. Your ad is saved and waiting for a quick review before it goes live.");
  go("home");renderFeed();
}
function adDetailSheet(p){
  const t=tierOf(p),views=p.views||0,pct=Math.min(100,Math.round(views*100/t.views));
  const state=p.rejected?"Rejected":p.pending?"Pending review":p.paused?"Paused":"Live";
  const controls=(p.pending||p.rejected)?`<div class="sheetfoot"><button class="btn" type="button" data-sh="close">Close</button></div>`:
   `<div class="sheetfoot" style="flex-wrap:wrap"><button class="btn" type="button" data-sh="close">Close</button><button class="btn" type="button" data-adpause="${p.id}">${p.paused?"Resume ad":"Pause ad"}</button><button class="btn" type="button" data-toast="Editing an ad opens here in the real site.">Edit</button><button class="btn" type="button" data-addelete="${p.id}" style="color:var(--danger);border-color:var(--danger)">Delete ad</button></div>`;
  openSheet(`<h2 id="sh-title">Ad details</h2>
   <div style="margin-bottom:14px">${adCardHTML(p)}</div>
   <div class="extract">
     <div class="row2"><b>Status</b><span>${state}</span></div>
     <div class="row2"><b>Package</b><span>${t.name}, ${naira(p.price||t.price)}</span></div>
     ${p.payRef?`<div class="row2"><b>Payment</b><span>${p.payStatus==="paid"?"Received":"Not paid yet"}</span></div><div class="row2"><b>Reference</b><span>${esc(p.payRef)}</span></div>`:""}
     <div class="row2"><b>Views so far</b><span>${views.toLocaleString()} of ${t.views.toLocaleString()}+</span></div>
     <div class="row2"><b>Contact taps</b><span>${(p.contactTaps||0).toLocaleString()}</span></div>
     <div class="row2"><b>Runs for</b><span>${t.days} days</span></div>
   </div>
   <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
   <p class="infoline">${pct}% of your purchased views delivered.</p>
   ${controls}`,document.activeElement);
}
function makePost(){
  const text=$("#say").value.trim(),aud=$("#aud").value,mode=$("#mode").value,dl=$("#allowdl").checked;
  if(!text&&!C.photos.length&&!C.video){toast("Write something or add a photo or video first.");return;}
  if(mode!=="post"){
    const h=+mode,it={hrs:h,bg:C.bg||1,text:text||"New status"};
    if(STATUS[ME.n]){STATUS[ME.n].items.push(it);}else STATUS[ME.n]={aud:AUD[aud][1],items:[it]};
    renderStatusRow();toast(`Status added. It disappears in ${h} hours.`);
  }else{
    const p={own:true,name:ME.n,time:"Just now",aud,likes:0,comments:0,dl,cap:text,cmOff:!$("#allowcm").checked,rpOff:!$("#allowrp").checked,shares:0,saves:0};
    if(C.photos.length){p.kind="userphoto";p.src=C.photos[0];p.photos=C.photos.length;}
    else if(C.video){p.kind="video";p.dur="New";}
    else if(C.bg){p.kind="text";p.bg=C.bg;p.text=text;p.cap="";}
    else{p.kind="plain";}
    reg(p);
    const tab=(aud==="other")?"other":(aud==="friends"||aud==="selected")?"friends":"school";
    POSTS[tab].unshift(p);setTabUI(tab);renderFeed();
    toast(`Posted to ${AUD[aud][1]}.`);
  }
  $("#say").value="";C.photos=[];C.video=null;C.bg=0;$("#allowdl").checked=S.dlDefault;renderPreview();renderSwatches();
  go("home");
}
  

/* refresh + new-post pill */
let pillTimer;
function schedulePill(ms){clearTimeout(pillTimer);pillTimer=setTimeout(()=>{if(S.view==="home"&&POOL[S.tab].length){const n=Math.min(3,POOL[S.tab].length);$("#pilltext").textContent=`${n} new post${n>1?"s":""}`;$("#pillwrap").hidden=false;}else schedulePill(8000);},ms);}
function refresh(){
  if(S.refreshing)return;S.refreshing=true;const b=$("#refresh");b.classList.add("spin");
  setTimeout(()=>{
    const add=POOL[S.tab].splice(0,2).map(p=>({...p,time:"Just now"}));
    if(add.length){POSTS[S.tab].unshift(...add);renderFeed();window.scrollTo({top:0});toast(`${add.length} new post${add.length>1?"s":""}`);}else toast("You're up to date.");
    b.classList.remove("spin");S.refreshing=false;$("#pillwrap").hidden=true;schedulePill(20000);
  },700);
}
function scrollToTabs(){const t=$("#tabs");const top=parseFloat(getComputedStyle(t).top)||0;const y=t.getBoundingClientRect().top+window.scrollY-top;if(window.scrollY>y)window.scrollTo({top:y});}

/* people rows + search */
function personRow(p){return `<div class="row">${av(p.n,42)}<span class="who"><button class="lnk" type="button" data-profile="${esc(p.n)}">${esc(p.n)}</button><small>${esc(p.d)}, ${esc(p.s)}</small></span><button class="followbtn" type="button" aria-pressed="false">Follow</button></div>`;}

/* events */
document.addEventListener("click",e=>{
  const t=e.target;
  let el;
  if((el=t.closest("[data-authtab]"))){AS.tab=el.dataset.authtab;if(AS.tab==="signup")AS.step=1;renderAuth();return;}
  if((el=t.closest("#doLogin"))){
    el.disabled=true;
    authApi("login.php",{email:$("#liemail").value.trim(),password:$("#lipass").value}).then(({s,j})=>{
      if(s===200&&j.user){applyServerUser(j.user);finishAuth();return;}
      el.disabled=false;toast(j.error||"Could not log in.");
    }).catch(()=>{el.disabled=false;toast("Could not reach the server. Please try again.");});
    return;
  }
  if(t.closest("[data-logout]")){
    const out=()=>{try{localStorage.removeItem("slc-session");}catch(e){}location.href="login.html";};
    fetch("api/logout.php",{method:"POST",credentials:"same-origin"}).then(out,out);return;
  }
  if(t.closest("#authNext")){
    if(AS.step===1){
      const nm=$("#suname").value.trim(),em=$("#suemail").value.trim(),pw=$("#supass").value;
      if(!nm){$("#suname").focus();toast("Enter your full name.");return;}
      if(!em){$("#suemail").focus();toast("Enter your email.");return;}
      if(!pw){$("#supass").focus();toast("Create a password.");return;}
      AS.d.name=nm;AS.d.email=em;AS.d.pass=pw;AS.step=2;renderAuth();return;
    }
    if(AS.step===2){
      const dept=$("#sudept").value.trim();
      if(!dept){$("#sudept").focus();toast("Enter your department.");return;}
      AS.d.school=$("#suschool").value;AS.d.dept=dept;AS.d.year=+$("#suyear").value||AS.d.year;AS.d.programme=$("#suprog").value;
      AS.step=3;renderAuth();return;
    }
    if(AS.step===3){createAccount();return;}
  }
  if(t.closest("#authBack")){AS.step=Math.max(1,AS.step-1);renderAuth();return;}
  if(t.closest("#idpick")){$("#fid").click();return;}
  if(t.closest("#idskip")){AS.d.scanned=false;createAccount();return;}
  if(t.closest("#idscan")){
    AS.scanning=true;renderAuth();
    scanId().then(r=>{
      AS.scanning=false;
      if(r.decision==="match"){AS.d.scanned=true;AS.d.matched=true;AS.d.matric=r.number||"";}
      else{AS.d.scanned=false;AS.d.review=true;toast(r.unavailable?"ID checking is not available right now. A person at SLC will check it later.":"We could not clearly match your ID, so a person at SLC will check it. You can carry on.");}
      renderAuth();
    }).catch(err=>{AS.scanning=false;toast(err.message||"Could not check that picture.");renderAuth();});
    return;
  }
  if(t.closest("#enterSLC")){finishAuth();return;}
  if(!t.closest("#rpicker")&&!t.closest("[data-reactbtn]")&&!t.closest("[data-like]"))$("#rpicker").hidden=true;
  if(t.closest("#viewer")&&!t.closest(".vpost")){
    if(t.closest("[data-vclose]")||t.id==="viewer"){closeViewer();return;}
    if((el=t.closest("[data-vdl]"))){const [,m]=findMsg(+el.dataset.vdl);if(m)download(m);return;}
    if((el=t.closest("[data-vmsg]"))){closeViewer();const x=person(el.dataset.vmsg),c=ensureChat(x);go("messages");S.chat=c.id;renderInbox();renderChat();$("#msgs").classList.add("open");document.body.classList.add("chat-open");return;}
    if((el=t.closest("[data-pdl]"))){const p=ALL.get(+el.dataset.pdl);if(p)toast("Download started. (Sample file)");return;}
    if((el=t.closest("[data-pmnav]"))){const p=ALL.get(S.pm.id),n=p.kind==="photo"?p.photos:1;S.pm.i=(S.pm.i+ +el.dataset.pmnav+n)%n;renderPM();return;}
    if(t.closest("[data-snext]")){nextStatus();return;}
    if(t.closest("[data-sprev]")){prevStatus();return;}
    if(t.closest("[data-unext]")){jumpUser(1);return;}
    if(t.closest("[data-uprev]")){jumpUser(-1);return;}
    return;
  }
  if((el=t.closest("[data-react]"))){const [id,emo]=el.dataset.react.split("|"),p=ALL.get(+id);if(p){setReaction(p,emo);refreshPost(p);}$("#rpicker").hidden=true;if(!$("#sheet").hidden)closeSheet();return;}
  if((el=t.closest("[data-react-more]"))){const p=ALL.get(+el.dataset.reactMore);$("#rpicker").hidden=true;if(p)reactMoreSheet(p);return;}
  if((el=t.closest("[data-reactbtn]"))){const p=ALL.get(+t.closest(".post").dataset.id);if(p)openReact(p,el);return;}
  if((el=t.closest("[data-rsum]"))){const p=ALL.get(+el.dataset.rsum);if(p)reactionsSheet(p);return;}
  if((el=t.closest("[data-repost]"))){const p=ALL.get(+el.dataset.repost);if(p)doRepost(p);if(el.dataset.sh==="close")closeSheet();return;}
  if((el=t.closest("[data-comments]"))){const p=ALL.get(+t.closest(".post").dataset.id);if(p)openComments(p);return;}
  if((el=t.closest("[data-tile]"))){openPost(+el.dataset.tile);return;}
  if(t.closest("[data-dclose]")){closeDrawer();return;}
  if((el=t.closest("[data-cmlike]"))){const p=ALL.get(S.cmPost),c=p.cm.find(x=>x.id===+el.dataset.cmlike);c.liked=!c.liked;c.likes=(c.likes||0)+(c.liked?1:-1);renderDrawer();return;}
  if((el=t.closest("[data-cmopen]"))){const p=ALL.get(S.cmPost),c=p.cm.find(x=>x.id===+el.dataset.cmopen);showViewer(vHead(c.name,c.time)+`<div class="vb">${c.img?`<img src="${c.img}" alt="Photo">`:`<div class="vphoto">${scene(c.k||0)}</div>`}</div>`);return;}
  if(t.closest("[data-cmemoji]")){S.cm.emoji=!S.cm.emoji;renderDrawer();return;}
  if(t.closest("[data-cmpic]")){$("#fcpic").click();return;}
  if(t.closest("[data-cmsend]")){const i=$("#cmtext");if(i&&i.value.trim())addComment({type:"text",text:i.value.trim()});else{S.cm.rec={t:0};S.cmTimer=setInterval(()=>{S.cm.rec.t++;const e=$("#cmrt");if(e)e.textContent=fmtT(S.cm.rec.t);},1000);renderDrawer();}return;}
  if(t.closest("[data-cmrecx]")){clearInterval(S.cmTimer);S.cm.rec=null;renderDrawer();return;}
  if(t.closest("[data-cmrecsend]")){clearInterval(S.cmTimer);const d=fmtT(Math.max(S.cm.rec.t,1));S.cm.rec=null;addComment({type:"voice",dur:d});return;}
  if((el=t.closest(".media[data-mopen]"))&&!t.closest(".pnext")&&!t.closest("#viewer")){const p=ALL.get(+t.closest(".post").dataset.id);if(p){openPostMedia(p,+(el.dataset.i||0));return;}}
  if((el=t.closest("[data-sendto]"))){const p=sheetPost;if(p)sendTo(el.dataset.sendto,p);return;}
  if((el=t.closest("[data-quote]"))){
    const o=ALL.get(+el.dataset.quote),txt=$("#qtext").value.trim();
    const np=reg({own:true,name:ME.n,time:"Just now",aud:"everyone",kind:"plain",cap:txt,quote:o.id,likes:0,comments:0,dl:false,shares:0,saves:0});
    POSTS.school.unshift(np);setTabUI("school");renderFeed();closeSheet();toast("Quote posted.");return;
  }
  if((el=t.closest("[data-feedback]"))){feedbackSheet(el.dataset.feedback);return;}
  if(t.closest("[data-fbsend]")){closeSheet();toast("Thanks! Your feedback has been sent. We will get back to you soon.");return;}
  if(t.closest("[data-visitors]")){visitorsSheet();return;}
  if(t.closest("[data-testpopup]")){incoming(CH.find(x=>x.id===1),"This is a test message.");return;}
  if((el=t.closest("[data-popopen]"))){$("#popup").hidden=true;const id=+el.dataset.popopen;go("messages");S.chat=id;renderInbox();renderChat();$("#msgs").classList.add("open");document.body.classList.add("chat-open");return;}
  if(t.closest("[data-popclose]")){$("#popup").hidden=true;return;}
  if((el=t.closest("[data-openchatwith]"))){const x=person(el.dataset.openchatwith),c=ensureChat(x);if(matchMedia("(max-width:1060px)").matches){go("messages");S.chat=c.id;renderInbox();renderChat();}else{S.mini=c.id;c.unread=0;renderMini();renderRail();msgBadge();}return;}
  if((el=t.closest("[data-req]"))){
    const c=ctx(),a=el.dataset.req;
    if(a==="accept"){c.request=false;c.mutual=true;renderInbox();renderChat();toast("Request accepted. You can reply now.");}
    else if(a==="delete"){CH.splice(CH.indexOf(c),1);S.chat=visibleCH()[0].id;$("#msgs").classList.remove("open");document.body.classList.remove("chat-open");renderInbox();renderChat();renderRail();toast("Request deleted.");}
    else{c.request=false;c.blocked=true;if(!S.blocked.includes(c.name))S.blocked.push(c.name);renderInbox();renderChat();toast(c.name+" blocked.");}
    return;
  }
  if(t.closest("#epphoto")){$("#fcpic2").click();return;}
  if(t.closest("#epphotorm")){ME.avatarImg=null;refreshAvatarsEverywhere();renderEditProfile();return;}
  if(t.closest("#epsave")){
    const nm=$("#epname").value.trim(),un=$("#epuser").value.trim().replace(/\s+/g,"").toLowerCase();
    if(!nm){$("#epname").focus();toast("Enter your full name.");return;}
    if(!un){$("#epuser").focus();toast("Enter a username.");return;}
    ME.n=nm;ME.u=un;ME.d=$("#epdept").value.trim()||ME.d;ME.bio=$("#epbio").value.trim();
    refreshAvatarsEverywhere();saveMe();later("Profile updated.");go("profile");return;
  }
  if((el=t.closest("[data-savestk]"))){const [,m]=findMsg(+el.dataset.savestk);if(m){S.mySticks.unshift({img:m.img,e:m.e,text:m.text,c:m.c});toast("Sticker saved to My stickers.");refreshPickers();if(S.view==="settings")renderSettings();}return;}
  if((el=t.closest("[data-savegif]"))){const [,m]=findMsg(+el.dataset.savegif);if(m){S.myGifs.unshift(m.g);toast("GIF saved to My GIFs.");refreshPickers();if(S.view==="settings")renderSettings();}return;}
  if((el=t.closest("[data-savecmstk]"))){const p=ALL.get(S.cmPost),c=p&&p.cm.find(x=>x.id===+el.dataset.savecmstk);if(c){S.mySticks.unshift({img:c.img,e:c.e,text:c.text,c:c.c});toast("Sticker saved to My stickers.");refreshPickers();}return;}
  if((el=t.closest("[data-savecmgif]"))){const p=ALL.get(S.cmPost),c=p&&p.cm.find(x=>x.id===+el.dataset.savecmgif);if(c){S.myGifs.unshift(c.g);toast("GIF saved to My GIFs.");refreshPickers();}return;}
  if((el=t.closest("[data-createmode]"))){
    const m=el.dataset.createmode;$$("[data-createmode]").forEach(b=>b.setAttribute("aria-pressed",String(b===el)));
    $("#postFields").hidden=m!=="post";$("#adFields").hidden=m!=="ad";
    if(m==="ad"){renderTiers();renderAdPreview();}
    return;
  }
  if(t.closest("#addadphoto")){$("#fadphoto").click();return;}
  if(t.closest("#adSubmit")){
    if(!$("#adtitle").value.trim()){$("#adtitle").focus();toast("Give your ad a title first.");return;}
    if(!$("#adbody").value.trim()){$("#adbody").focus();toast("Add a short description.");return;}
    paySheet();return;
  }
  if((el=t.closest("[data-tier]"))){AD_C.tier=el.dataset.tier;renderTiers();renderAdPreview();return;}
  if(t.closest("#payRenew")){payRender('<p class="infoline" id="payWait">Getting a new payment account...</p>',PAY_CANCEL);startPayment();return;}
  if(t.closest("#payRetry")){paySheet();return;}
  if((el=t.closest("[data-copy]"))){
    const v=el.dataset.copy;
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(()=>toast("Copied."),()=>toast("Could not copy. Select the text and copy it."));
    else toast("Could not copy. Select the text and copy it.");
    return;
  }
  if((el=t.closest("[data-pwtoggle]"))){
    const inp=document.getElementById(el.dataset.pwtoggle),show=inp.type==="password";
    inp.type=show?"text":"password";el.setAttribute("aria-pressed",String(show));el.setAttribute("aria-label",show?"Hide password":"Show password");
    el.innerHTML=ic(show?"eyeoff":"eye","sm");return;
  }
  if((el=t.closest("[data-adapprove]"))){const p=MYADS.find(x=>x.id===+el.dataset.adapprove);if(p){p.pending=false;p.rejected=false;renderFeed();renderSettings();toast("Approved. It now shows as a live ad in the feed.");}return;}
  if((el=t.closest("[data-adpause]"))){const p=MYADS.find(x=>x.id===+el.dataset.adpause);if(p){p.paused=!p.paused;closeSheet();renderFeed();renderSettings();toast(p.paused?"Ad paused. It is hidden from the feed.":"Ad resumed. It is back in the feed.");}return;}
  if((el=t.closest("[data-addelete]"))){const p=MYADS.find(x=>x.id===+el.dataset.addelete);if(p){MYADS.splice(MYADS.indexOf(p),1);for(const k in POSTS)POSTS[k]=POSTS[k].filter(x=>x!==p);closeSheet();renderFeed();renderSettings();toast("Ad deleted.");}return;}
  if((el=t.closest("[data-adcontact]"))){const p=MYADS.find(x=>x.id===+el.dataset.adcontact);if(p)p.contactTaps=(p.contactTaps||0)+1;toast("Noted. On the live site this lets people reach you"+(p&&p.contact?" at "+p.contact:"")+".");return;}
  if((el=t.closest("[data-adreject]"))){const p=MYADS.find(x=>x.id===+el.dataset.adreject);if(p){p.pending=false;p.rejected=true;for(const k in POSTS)POSTS[k]=POSTS[k].filter(x=>x!==p);renderFeed();renderSettings();toast("Rejected and removed from the feed.");}return;}
  if((el=t.closest("[data-adopen]"))){const p=MYADS.find(x=>x.id===+el.dataset.adopen);if(p)adDetailSheet(p);return;}
  if(t.closest("[data-mkstk]")){stickerMaker();return;}
  if(t.closest("[data-mkpick]")){$("#fstk").click();return;}
  if((el=t.closest("[data-mkc]"))){S.mk.c=el.dataset.mkc;$("#mkprev").style.setProperty("--mkc",S.mk.c);$$("[data-mkc]").forEach(b=>b.setAttribute("aria-pressed",String(b===el)));return;}
  if(t.closest("[data-mksave]")){S.mySticks.unshift({img:S.mk.img,label:($("#mklabel").value||"").trim(),c:S.mk.c});closeSheet();toast("Sticker saved to My stickers.");refreshPickers();if(S.view==="settings")renderSettings();return;}
  if(t.closest("[data-mkgif]")){$("#fgif").click();return;}
  if((el=t.closest("[data-avatar]"))){openAvatarOrStatus(el.dataset.avatar);return;}
  if((el=t.closest("[data-status]"))){openStatus(el.dataset.status);return;}
  if((el=t.closest("[data-reposters]"))){const p=ALL.get(+el.dataset.reposters);if(p)reposterSheet(p,el);return;}
  if((el=t.closest("[data-list]"))){S.listOf=S.profileOf;S.flist=el.dataset.list;go("friends",{keep:true});return;}
  if((el=t.closest("[data-flist]"))){S.flist=el.dataset.flist;renderFriends();return;}
  if(t.closest("[data-back-list]")){go("profile",{who:S.listOf});return;}
  if((el=t.closest("[data-mini]"))){
    const id=+el.dataset.mini,c=CH.find(x=>x.id===id);
    if(matchMedia("(max-width:1060px)").matches){go("messages");S.chat=id;renderInbox();renderChat();return;}
    S.mini=id;c.unread=0;renderMini();renderRail();msgBadge();const mi=$("#mmsg");if(mi)mi.focus();return;
  }
  if(t.closest("[data-mini-close]")){S.mini=null;renderMini();return;}
  if(t.closest("[data-mini-expand]")){const id=S.mini;S.mini=null;renderMini();go("messages");S.chat=id;renderInbox();renderChat();return;}
  if((el=t.closest("[data-priv]"))){S.priv[el.dataset.priv]=el.dataset.val;renderSettings();return;}
  if((el=t.closest("[data-switch]"))){const k=el.dataset.switch;S[k]=!S[k];if(k==="dlDefault")$("#allowdl").checked=S.dlDefault;if(k==="receipts")refreshChatUI();renderSettings();return;}
  if((el=t.closest("[data-unblock]"))){const n=el.dataset.unblock;S.blocked=S.blocked.filter(x=>x!==n);const c=CH.find(x=>x.name===n);if(c)c.blocked=false;renderSettings();toast(n+" unblocked.");return;}
  if(t.closest("#tonebtn")){playTone(S.tone);return;}
  if((el=t.closest("[data-go]"))){e.preventDefault();go(el.dataset.go,el.hasAttribute("data-mine")?{who:"me"}:{});return;}
  if((el=t.closest("[data-profile]"))){closeAllOverlays();go("profile",{who:el.dataset.profile===ME.n?"me":el.dataset.profile});return;}
  if(t.closest("[data-back-profile]")){go(S.prev==="profile"?"home":S.prev);return;}
  if((el=t.closest("[data-focus-search]"))){openSearch();return;}
  if((el=t.closest("[data-sotab]"))){S.sotab=el.dataset.sotab;soPaintTabs();soRender(qOverlay.value);qOverlay.focus();return;}
  if((el=t.closest("[data-soq]"))){qOverlay.value=el.dataset.soq;soRender(el.dataset.soq);return;}
  if(t.closest("[data-so-close]")){closeSearch();return;}
  if(t.closest("[data-focus-composer]")){go("create");$("#mode").value="post";$("[data-createmode=post]").click();$("#say").focus();return;}
  if(t.closest("[data-add-status]")){go("create",{q:"?status=1"});$("#mode").value="24";$("#say").focus();return;}
  if((el=t.closest("[data-toast]"))){toast(el.dataset.toast);return;}
  if((el=t.closest("[data-theme-toggle]"))){setTheme(effective()==="dark"?"light":"dark");return;}
  if((el=t.closest("[data-site-theme]"))){setTheme(el.dataset.siteTheme);return;}
  if((el=t.closest("[data-inbox]"))){S.inbox=el.dataset.inbox;renderInbox();return;}
  if((el=t.closest("button[data-ct]"))){if(t.closest("#msgs")){ctx().ct=el.dataset.ct;renderChat();}else{S.ct=el.dataset.ct;renderSettings();}return;}
  if((el=t.closest("button[data-bs]"))){if(t.closest("#msgs")){ctx().bs=el.dataset.bs;renderChat();}else{S.bs=el.dataset.bs;renderSettings();}return;}
  if((el=t.closest("button[data-wp]"))){
    const id=el.dataset.wp,inChat=!!t.closest("#msgs");
    if(id==="upload"){S.wpCtx=inChat?"chat":"default";$("#fwp").click();return;}
    if(inChat){ctx().wp=id;renderChat();}else{S.wp=id;renderSettings();}return;
  }
  if(t.closest("[data-creset]")){const c=ctx();delete c.ct;delete c.bs;delete c.wp;delete c.wpImg;delete c.dim;renderChat();return;}

  /* tabs */
  if((el=t.closest("[data-tab]"))){
    if(S.tab===el.dataset.tab){refresh();return;}
    S.tab=el.dataset.tab;$$("[data-tab]").forEach(x=>x.setAttribute("aria-selected",String(x===el)));renderFeed();scrollToTabs();$("#pillwrap").hidden=true;schedulePill(9000);return;
  }
  if(t.closest("#refresh")){refresh();return;}
  if(t.closest("#pill")){refresh();return;}
  if((el=t.closest("[data-ptab]"))){S.profTab=el.dataset.ptab;renderProfile();return;}

  /* posts */
  const post=t.closest(".post[data-id]"),p=post&&ALL.get(+post.dataset.id);
  if((el=t.closest("[data-like]"))&&p){if(lpFired){lpFired=false;return;}setReaction(p,p.myR?null:"❤️");refreshPost(p);return;}
  if((el=t.closest("[data-save]"))&&p){p.saved=!p.saved;p.saves+=p.saved?1:-1;refreshPost(p);toast(p.saved?"Saved to your profile.":"Removed from saved.");return;}
  if((el=t.closest("[data-share]"))&&p){sheetPost=p;openSheet(shareMain(p),el);return;}
  if((el=t.closest(".pnext"))){const m=el.closest(".media");const i=(+m.dataset.i+1)%(+m.dataset.n);m.dataset.i=i;$("svg",m).outerHTML=scene(+m.dataset.seed+i);$(".badge",m).textContent=`${i+1}/${m.dataset.n}`;return;}
  if((el=t.closest("[data-menu]"))&&post){const menu=$(".menu",post);const was=!menu.hidden;closeMenus();if(!was){menu.hidden=false;el.setAttribute("aria-expanded","true");}return;}
  if((el=t.closest("[data-act]"))&&p){
    const a=el.dataset.act;closeMenus();
    if(a==="del"){POSTS[S.tab]=POSTS[S.tab].filter(x=>x!==p);renderFeed();toast("Post deleted.");}
    else if(a==="dl"){p.dl=!p.dl;refreshPost(p);toast(p.dl?"Downloads allowed on this post.":"Downloads blocked on this post.");}
    else if(a==="comments"){p.cmOff=!p.cmOff;refreshPost(p);toast(p.cmOff?"Comments turned off.":"Comments turned on.");}
    else if(a==="save"){p.saved=true;p.saves++;refreshPost(p);toast("Saved to your profile.");}
    else if(a==="link"){copyLink(p);}
    else if(a==="report")feedbackSheet("this post by "+p.name);
    else toast("This opens an editor in the real site.");
    return;
  }
  if(!t.closest(".menu"))closeMenus();

  /* share sheet */
  if(t.closest("#scrim")){closeSheet();closeDrawer();return;}
  if((el=t.closest("[data-sh]"))){
    const a=el.dataset.sh;
    if(a==="close"){closeSheet();return;}
    if(!sheetPost){return;}
    if(a==="main"){$("#sheet-body").innerHTML=shareMain(sheetPost);$("#sheet button:not([disabled])").focus();}
    else if(a==="friends"){$("#sheet-body").innerHTML=shareFriends();focusSheet();}
    else if(a==="apps"){$("#sheet-body").innerHTML=shareApps();focusSheet();}
    else if(a==="repost"){closeSheet();doRepost(sheetPost);}
    else if(a==="quote"){quoteSheet(sheetPost);}
    else if(a==="download"){closeSheet();toast("Download started.");}
    else if(a==="link"){copyLink(sheetPost);closeSheet();}
    return;
  }
  if((el=t.closest("[data-app]"))){closeSheet();toast(`Opening ${el.dataset.app}...`);return;}
  if(t.closest("#sendfr")){const n=$$("[data-friend]:checked").length;closeSheet();toast(`Sent to ${n} friend${n>1?"s":""}.`);return;}

  /* composer */
  if(t.closest("#addphoto")){$("#fphoto").click();return;}
  if(t.closest("#addvideo")){$("#fvideo").click();return;}
  if((el=t.closest("[data-rmphoto]"))){C.photos.splice(+el.dataset.rmphoto,1);renderPreview();return;}
  if(t.closest("[data-rmvideo]")){C.video=null;renderPreview();return;}
  if((el=t.closest("[data-bg]"))){C.bg=+el.dataset.bg;renderSwatches();return;}
  if(t.closest("#postbtn")){makePost();return;}

  /* notifications */
  if(t.closest("[data-open-level]")){openLevel=true;renderNotifs();return;}
  if((el=t.closest("[data-answer]"))){answerLevel(el.dataset.answer);return;}
  if(t.closest("#setremind")){
    const r=$("#remind");if(!r.value||r.value<r.min||r.value>r.max){const h=$("#remind-hint");h.textContent="Pick a date within the next 60 days.";h.style.color="var(--danger)";return;}
    S.level="later "+r.value;NOTIFS.find(x=>x.id==="lv").unread=false;renderNotifs();return;}
  if(t.closest("#markall")){NOTIFS.forEach(n=>{if(n.type!=="level"||S.level)n.unread=false;});renderNotifs();return;}
  if((el=t.closest("[data-nact]"))){
    if(el.dataset.nact==="views"){visitorsSheet();}
    else if(el.dataset.nact==="mutual"){go("messages");S.chat=3;renderInbox();renderChat();}
    else{el.textContent="Following";el.disabled=true;}
    return;}
  const nt=t.closest(".nt[data-nid]");
  if(nt&&!t.closest(".btnrow")){
    const n=NOTIFS.find(x=>x.id===nt.dataset.nid);
    if(n&&n.type!=="level"&&n.unread){n.unread=false;}
    if(n&&n.postId!=null){const p=ALL.get(n.postId);if(p){if(n.openComments){openPost(p.id);setTimeout(()=>openComments(p),0);}else openPost(p.id);}}
    renderNotifs();return;
  }

  /* messages */
  if((el=t.closest("[data-chat]"))){if(S.rec)stopRec(false);S.chat=+el.dataset.chat;S.emoji=false;S.attach=false;S.panel=false;renderInbox();renderChat();$("#msgs").classList.add("open");document.body.classList.add("chat-open");return;}
  if(t.closest("[data-colors]")){S.panel=!S.panel;renderChat();return;}
  if(t.closest("[data-chatinfo]")){const c=ctx();openSheet(c.group?groupInfo(c):chatInfo(c),t.closest("[data-chatinfo]"));return;}
  if((el=t.closest("[data-open]"))){const [,m]=findMsg(+el.dataset.open);if(m)openMedia(m);return;}
  if((el=t.closest("[data-dl]"))){const [,m]=findMsg(+el.dataset.dl);if(m)download(m);return;}
  if(t.closest("[data-play]")){toast("Playing voice note (sample).");return;}
  if((el=t.closest("[data-seenof]"))){const [c,m]=findMsg(+el.dataset.seenof);if(c&&m)messageInfoSheet(c,m);return;}
  if((el=t.closest("[data-vote]"))){
    const [id,i]=el.dataset.vote.split(":").map(Number),[c,m]=findMsg(id);
    if(m){const o=m.opts[i];if(o.v.includes("me"))o.v=o.v.filter(x=>x!=="me");else{if(!m.multi)m.opts.forEach(x=>{x.v=x.v.filter(y=>y!=="me");});o.v.push("me");}refreshChatUI();}
    return;
  }
  if(t.closest("[data-emoji]")){S.emoji=!S.emoji;S.attach=false;renderChat();const n=$("#cmsg");if(n)n.focus();return;}
  if(t.closest("[data-attach]")){S.attach=!S.attach;S.emoji=false;renderChat();return;}
  if((el=t.closest("[data-att]"))){const a=el.dataset.att;S.attach=false;renderChat();if(a==="doc")$("#fdoc").click();else if(a==="pic")$("#fpic").click();else if(a==="vid")$("#fvid").click();else pollSheet();return;}
  if((el=t.closest("[data-etab]"))){const cx=t.closest("[data-ctx]").dataset.ctx;if(cx==="cm"){S.cm.tab=el.dataset.etab;renderDrawer();}else{S.emojiTab=el.dataset.etab;renderChat();}return;}
  if((el=t.closest("[data-emo]"))){
    const cx=t.closest("[data-ctx]").dataset.ctx,i=cx==="cm"?$("#cmtext"):$("#cmsg"),e2=el.dataset.emo;
    if(i){const s=i.selectionStart==null?i.value.length:i.selectionStart;i.value=i.value.slice(0,s)+e2+i.value.slice(s);if(cx==="cm"){S.cm.text=i.value;syncCm();}else{S.draft[S.chat]=i.value;syncSend();}i.focus();i.setSelectionRange(s+e2.length,s+e2.length);}
    return;
  }
  if((el=t.closest("[data-stk]"))){const cx=t.closest("[data-ctx]").dataset.ctx,s=STK[+el.dataset.stk];sendRich(cx,{type:"sticker",e:s[0],text:s[1],c:s[2]});return;}
  if((el=t.closest("[data-mystk]"))){const cx=t.closest("[data-ctx]").dataset.ctx,s=S.mySticks[+el.dataset.mystk];sendRich(cx,{type:"sticker",img:s.img,e:s.e,text:s.text||s.label,c:s.c});return;}
  if((el=t.closest("[data-gif]"))){const cx=t.closest("[data-ctx]").dataset.ctx,g=GIFS[+el.dataset.gif];sendRich(cx,{type:"gif",g:{em:g[0],label:g[1],anim:g[2]}});return;}
  if((el=t.closest("[data-mygif]"))){const cx=t.closest("[data-ctx]").dataset.ctx;sendRich(cx,{type:"gif",g:S.myGifs[+el.dataset.mygif]});return;}
  if(t.closest("[data-sendmic]")){const i=$("#cmsg");if(i&&i.value.trim())sendText();else startRec();return;}
  if(t.closest("[data-recx]")){stopRec(false);return;}
  if(t.closest("[data-recsend]")){stopRec(true);return;}
  if(t.closest("[data-newgroup]")){newGroupSheet();return;}
  if(t.closest("#mkgroup")){
    const gi=$("#gname"),name=gi.value.trim(),members=$$("[data-gm]:checked").map(x=>x.dataset.gm);
    if(!name){gi.focus();toast("Give your group a name first.");return;}
    if(!members.length){toast("Choose at least one friend to add.");return;}
    const c={id:++chid,name,group:true,desc:"",members,admins:["me"],creator:"me",onlyAdminsSend:false,onlyAdminsEdit:false,online:false,mutual:true,unread:0,time:"now",lastTs:Date.now(),msgs:[M("me","system",{text:`You created the group "${name}"`})]};
    CH.unshift(c);S.chat=c.id;closeSheet();go("messages");renderInbox();renderChat();$("#msgs").classList.add("open");document.body.classList.add("chat-open");toast("Group created. You are the group admin.");return;
  }
  if((el=t.closest("[data-poll]"))){
    if(el.dataset.poll==="addopt"){const box=$("#popts");if(box.children.length<12){const i=document.createElement("input");i.className="ginput popt";i.placeholder="Option "+(box.children.length+1);box.appendChild(i);i.focus();}return;}
    if(el.dataset.poll==="create"){const q=$("#pq").value.trim(),opts=$$(".popt").map(x=>x.value.trim()).filter(Boolean).map(x=>({t:x,v:[]}));closeSheet();pushMsg(ctx(),{type:"poll",q,opts,multi:$("#pmulti").checked});return;}
  }
  if((el=t.closest("[data-ci]"))){
    const c=ctx(),a=el.dataset.ci;
    if(a==="profile"){closeSheet();go("profile",{who:c.name});}
    else if(a==="media"){setSheet(mediaHTML(c,"ci"));}
    else if(a==="back"){setSheet(chatInfo(c));}
    else if(a==="mute"){c.muted=!c.muted;closeSheet();renderInbox();msgBadge();toast(c.muted?"Notifications muted.":"Notifications on.");}
    else if(a==="look"){closeSheet();S.panel=true;renderChat();}
    else if(a==="report"){feedbackSheet("your chat with "+c.name);}
    else if(a==="block"){c.blocked=true;if(!S.blocked.includes(c.name))S.blocked.push(c.name);closeSheet();renderInbox();renderChat();toast(c.name+" blocked.");}
    return;
  }
  if((el=t.closest("[data-gi]"))){
    const c=ctx(),[a,arg]=el.dataset.gi.split(/:(.*)/s);
    if(a==="admin"){c.admins.push(arg);setSheet(groupInfo(c));toast(arg+" is now a group admin.");}
    else if(a==="unadmin"){c.admins=c.admins.filter(x=>x!==arg);setSheet(groupInfo(c));}
    else if(a==="rm"){c.members=c.members.filter(x=>x!==arg);c.admins=c.admins.filter(x=>x!==arg);c.msgs.push(M("me","system",{text:"You removed "+arg}));setSheet(groupInfo(c));refreshChatUI();}
    else if(a==="rename"){const v=$("#gname2").value.trim();if(v){c.name=v;setSheet(groupInfo(c));refreshChatUI();toast("Group name updated.");}}
    else if(a==="addpanel"){
      const cand=PEOPLE.filter(p=>p.mutual&&!c.members.includes(p.n)&&!p.nogroup);
      setSheet(`<h2 id="sh-title">Add members</h2>${cand.length?cand.map(p=>`<label class="frow">${av(p.n,40)}<span class="who"><b>${esc(p.n)}</b><br><small style="color:var(--muted)">${esc(p.d)}, ${esc(p.s)}</small></span><input type="checkbox" data-addm="${esc(p.n)}"></label>`).join(""):`<div class="empty">All your friends are already here.</div>`}<div class="sheetfoot"><button class="btn" type="button" data-gi="back">Back</button><button class="btn primary" type="button" data-gi="addgo">Add</button></div>`);
    }
    else if(a==="addgo"){const add=$$("[data-addm]:checked").map(x=>x.dataset.addm);add.forEach(n=>c.members.push(n));if(add.length)c.msgs.push(M("me","system",{text:"You added "+add.join(", ")}));setSheet(groupInfo(c));refreshChatUI();}
    else if(a==="back"){setSheet(groupInfo(c));}
    else if(a==="media"){setSheet(mediaHTML(c,"gi"));}
    else if(a==="mute"){c.muted=!c.muted;closeSheet();renderInbox();msgBadge();toast(c.muted?"Notifications muted.":"Notifications on.");}
    else if(a==="look"){closeSheet();S.panel=true;renderChat();}
    else if(a==="report"){feedbackSheet("the group "+c.name);}
    else if(a==="leave"||a==="delete"){CH.splice(CH.indexOf(c),1);S.chat=CH[0].id;closeSheet();$("#msgs").classList.remove("open");document.body.classList.remove("chat-open");renderInbox();renderChat();renderRail();toast(a==="delete"?"Group deleted.":"You left the group.");}
    return;
  }
  if(t.closest("[data-back]")){$("#msgs").classList.remove("open");document.body.classList.remove("chat-open");return;}
  if((el=t.closest("[data-msgto]"))){
    if(el.getAttribute("aria-disabled")==="true"){toast("Follow each other first to send messages.");return;}
    const c=CH.find(x=>x.name===el.dataset.msgto);go("messages");if(c){S.chat=c.id;renderInbox();renderChat();$("#msgs").classList.add("open");document.body.classList.add("chat-open");}return;}
  if((el=t.closest(".followbtn2"))){const on=el.getAttribute("aria-pressed")==="true";el.setAttribute("aria-pressed",String(!on));el.textContent=on?"Follow":"Following";return;}
  if((el=t.closest(".followbtn"))){const on=el.getAttribute("aria-pressed")==="true";el.setAttribute("aria-pressed",String(!on));el.textContent=on?"Follow":"Following";return;}

});
let lpT=null,lpFired=false;
document.addEventListener("pointerdown",e=>{const b=e.target.closest("[data-like]");if(!b)return;lpFired=false;clearTimeout(lpT);lpT=setTimeout(()=>{lpFired=true;const post=b.closest(".post"),p=post&&ALL.get(+post.dataset.id);if(p)openReact(p,b);},450);});
["pointerup","pointercancel"].forEach(ev=>document.addEventListener(ev,()=>clearTimeout(lpT)));
document.addEventListener("focusin",e=>{if(e.target.id==="srtxt")clearTimeout(vTimer);});
document.addEventListener("submit",e=>{
  if(e.target.id==="sreply"){e.preventDefault();const i=$("#srtxt"),n=stQ[stU];if(i&&i.value.trim()){statusReply(n,i.value.trim(),STATUS[n].items[stI]);i.value="";}clearTimeout(vTimer);vTimer=setTimeout(nextStatus,3000);return;}
  if(e.target.id==="cmform"){e.preventDefault();const i=$("#cmtext");if(i&&i.value.trim())addComment({type:"text",text:i.value.trim()});return;}
  if(e.target.id==="cform"){e.preventDefault();sendText();return;}
  if(e.target.id==="mform"){
    e.preventDefault();const i=$("#mmsg"),v=i.value.trim();if(!v)return;const c=CH.find(x=>x.id===S.mini);if(c)pushMsg(c,{type:"text",text:v});const n=$("#mmsg");if(n)n.focus();
  }
});
document.addEventListener("change",e=>{
  if(e.target.id==="fphoto"){readFiles(e.target.files);e.target.value="";}
  if(e.target.id==="fvideo"&&e.target.files[0]){C.video=e.target.files[0].name;renderPreview();e.target.value="";}
  const f=e.target.files&&e.target.files[0];
  if(f&&e.target.id==="fdoc"){pushMsg(ctx(),{type:"doc",name:f.name,size:fmtSize(f.size),blob:URL.createObjectURL(f)});e.target.value="";}
  if(f&&e.target.id==="fpic"){const r=new FileReader();r.onload=()=>pushMsg(ctx(),{type:"photo",img:r.result,name:f.name});r.readAsDataURL(f);e.target.value="";}
  if(f&&e.target.id==="fvid"){pushMsg(ctx(),{type:"video",dur:"Video",name:f.name,blob:URL.createObjectURL(f)});e.target.value="";}
  if(f&&e.target.id==="fadphoto"){const r=new FileReader();r.onload=()=>{AD_C.img=r.result;renderAdPreview();};r.readAsDataURL(f);e.target.value="";}
  if(f&&e.target.id==="fwp"){const r=new FileReader();r.onload=()=>{if(S.wpCtx==="chat"){const c=ctx();c.wp="custom";c.wpImg=r.result;renderChat();}else{S.wp="custom";S.wpImg=r.result;renderSettings();}};r.readAsDataURL(f);e.target.value="";}
  if(e.target.id==="tonesel"){S.tone=e.target.value;playTone(S.tone);}
  if(f&&e.target.id==="fcpic"){const r=new FileReader();r.onload=()=>addComment({type:"photo",img:r.result});r.readAsDataURL(f);e.target.value="";}
  if(f&&e.target.id==="fcpic2"){const r=new FileReader();r.onload=()=>{ME.avatarImg=r.result;refreshAvatarsEverywhere();renderEditProfile();};r.readAsDataURL(f);e.target.value="";}
  if(f&&e.target.id==="fstk"){const r=new FileReader();r.onload=()=>{S.mk.img=r.result;$("#mkprev").innerHTML=`<img src="${r.result}" alt="Sticker preview">`;$("#mksave").disabled=false;};r.readAsDataURL(f);e.target.value="";}
  if(f&&e.target.id==="fgif"){const r=new FileReader();r.onload=()=>{S.myGifs.unshift({src:r.result});toast("GIF added to My GIFs.");refreshPickers();};r.readAsDataURL(f);e.target.value="";}
  if(f&&e.target.id==="fid"){if(!/^image\/(jpeg|png|webp)$/.test(f.type)){toast("Use a JPG, PNG or WEBP picture. PDFs and iPhone HEIC photos are not supported.");e.target.value="";return;}const r=new FileReader();r.onload=()=>{AS.d.idImg=r.result;AS.d.scanned=false;renderAuth();};r.readAsDataURL(f);e.target.value="";}
  if(e.target.matches("[data-gm],#gname"))updateGroupBtn();
  if(e.target.matches("[data-friend]"))$("#sendfr").disabled=!$$("[data-friend]:checked").length;
});
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.id==="cmsg"){S.draft[S.chat]=t.value;syncSend();}
  else if(t.id==="dim"){const c=ctx();c.dim=+t.value;$("#chat").style.setProperty("--wpdim",c.dim/100);}
  else if(t.matches("#pq,.popt"))updatePollBtn();
  else if(t.matches("#adtitle,#adbody,#adcontact"))renderAdPreview();
  else if(t.id==="cmtext"){S.cm.text=t.value;syncCm();}
  else if(t.id==="fbtxt"){const b=$("#fbsend");if(b)b.disabled=!t.value.trim();}
  else if(t.id==="gname")updateGroupBtn();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeMenus();$("#rpicker").hidden=true;if(!$("#searchOverlay").hidden)closeSearch();else if(!$("#viewer").hidden)closeViewer();else if(!$("#drawer").hidden)closeDrawer();else if(!$("#sheet").hidden)closeSheet();}
  if(S.vmode==="status"&&!$("#viewer").hidden&&e.target.id!=="srtxt"){if(e.key==="ArrowRight"){nextStatus();}else if(e.key==="ArrowLeft"){prevStatus();}}
  if(e.target.closest&&e.target.closest("#tabs .scroll")&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){
    const tabs=$$("#tabs [data-tab]"),i=tabs.indexOf(document.activeElement);if(i<0)return;
    const n=tabs[(i+(e.key==="ArrowRight"?1:tabs.length-1))%tabs.length];n.focus();n.click();}
});
function closeMenus(){$$(".menu").forEach(m=>{m.hidden=true;});$$("[data-menu]").forEach(b=>b.setAttribute("aria-expanded","false"));}
function copyLink(p){const url="https://slc.example/post/"+p.id;try{navigator.clipboard.writeText(url);}catch(e){}toast("Link copied.");}

const comp=$("#composer");
comp.addEventListener("focusin",()=>comp.classList.add("open"));
document.addEventListener("click",e=>{
  if(comp.contains(e.target)||e.target.closest("[data-focus-composer]"))return;

});
const SO_TABS=[["all","All","Search posts, videos and students"],["users","Students","Search students by name or username"],["posts","Posts","Search posts"],["videos","Videos","Search videos"],["ads","Ads","Search ads"]];
S.sotab="all";
const qOverlay=$("#qOverlay");
function soTabsHTML(){return SO_TABS.map(t=>`<button class="chip" type="button" data-sotab="${t[0]}" aria-pressed="${S.sotab===t[0]}">${t[1]}</button>`).join("");}
function soPaintTabs(){
  $("#soTabs").innerHTML=soTabsHTML();
  const t=SO_TABS.find(x=>x[0]===S.sotab);qOverlay.placeholder=t[2];
}
function openSearch(){const o=$("#searchOverlay");S.sotab="all";o.hidden=false;qOverlay.value="";soPaintTabs();soRender("");setTimeout(()=>qOverlay.focus(),40);}
function closeSearch(){$("#searchOverlay").hidden=true;}
const hl=(t,q)=>{t=String(t);const i=q?t.toLowerCase().indexOf(q):-1;return i<0?esc(t):esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+q.length))+"</mark>"+esc(t.slice(i+q.length));};
const snip=(t,q)=>{t=String(t);const i=Math.max(0,t.toLowerCase().indexOf(q)-30);return (i>0?"\u2026":"")+t.slice(i,i+110)+(t.length>i+110?"\u2026":"");};
function soLocal(q){
  const v=q.toLowerCase(),starts=p=>p.u.toLowerCase().startsWith(v)||p.n.toLowerCase().startsWith(v);
  const users=PEOPLE.filter(p=>p.u.toLowerCase().includes(v)||p.n.toLowerCase().includes(v)||(p.d||"").toLowerCase().includes(v)).sort((a,b)=>starts(b)-starts(a));
  const hit=[...ALL.values()].filter(p=>!p.isAd&&`${p.text||""} ${p.cap||""} ${p.name||""}`.toLowerCase().includes(v));
  return {users,videos:hit.filter(p=>p.kind==="video"),posts:hit.filter(p=>p.kind!=="video")};
}
function soServer(q){
  return fetch("api/search.php?q="+encodeURIComponent(q)+"&limit=20",{credentials:"same-origin"}).then(r=>{
    if(!(r.headers.get("content-type")||"").includes("json")||!r.ok)throw new Error("no server");
    return r.json();
  }).then(j=>({users:(j.users||[]).map(u=>({n:u.name,u:u.username,d:u.department||"",s:u.school||""})),posts:(j.posts||[]).map(x=>({id:x.id,name:x.author,time:x.created_at?new Date(x.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short"}):"",kind:"text",text:x.body,remote:true})),videos:(j.videos||[]).map(x=>({id:x.id,name:x.author,time:x.created_at?new Date(x.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short"}):"",kind:"video",dur:x.duration||"",cap:x.title,remote:true}))}));
}
function soPostRow(p,q){
  const body=p.kind==="video"?(p.cap||p.text||""):(p.text||p.cap||"");
  const kind=p.kind==="video"?"Video":p.kind==="photo"?"Photo":"Post";
  const thumb=p.kind==="video"?`<span class="sothumb">${ic("play")}<i>${esc(p.dur||"")}</i></span>`:av(p.name,40);
  const inner=`${thumb}<span class="who"><b>${esc(p.name)}</b><small>${kind}${p.time?" \u00b7 "+esc(p.time):""}</small><span class="snip">${hl(snip(body,q),q)}</span></span>`;
  return ALL.has(p.id)?`<button class="srow" type="button" data-tile="${p.id}">${inner}</button>`:`<div class="srow">${inner}</div>`;
}
function soAdRow(a,q){
  const price=a.price!=null&&a.price!==""?"\u20A6"+Number(a.price).toLocaleString("en-NG")+(a.price_note?" "+a.price_note:""):"";
  return `<a class="srow" href="ad.html?id=${encodeURIComponent(a.id)}"><span class="sothumb ad">${ic("store")}</span><span class="who"><b>${hl(a.title,q)}</b><small>${esc(a.seller_name||"")}${price?" \u00b7 "+esc(price):""}</small><span class="snip">${hl(snip(a.body||"",q),q)}</span></span></a>`;
}
function soHint(){
  return `<div class="sohint"><p>Search the whole of SLC. Pick where to look:</p>
   <button class="srow" type="button" data-sotab="users"><span class="sothumb">${ic("users")}</span><span class="who"><b>Students</b><small>Find people by name or username</small></span></button>
   <button class="srow" type="button" data-sotab="posts"><span class="sothumb">${ic("msg")}</span><span class="who"><b>Posts</b><small>Words inside posts and photo captions</small></span></button>
   <button class="srow" type="button" data-sotab="videos"><span class="sothumb">${ic("play")}</span><span class="who"><b>Videos</b><small>Video captions and titles</small></span></button>
   <button class="srow" type="button" data-sotab="ads"><span class="sothumb ad">${ic("store")}</span><span class="who"><b>Ads</b><small>Things students are selling</small></span></button>
   <p class="sotry">Try: <button class="chip" type="button" data-soq="hydraulic">hydraulic</button> <button class="chip" type="button" data-soq="notes">notes</button> <button class="chip" type="button" data-soq="orientation">orientation</button> <button class="chip" type="button" data-soq="laptop">laptop</button></p></div>`;
}
let soReq=0;
function soRender(q){
  const box=$("#resultsOverlay");
  q=q.trim().toLowerCase();
  if(!q){box.innerHTML=soHint();return;}
  const my=++soReq;
  box.innerHTML='<div class="empty">Searching\u2026</div>';
  const ads=window.SLCMarket&&window.SLCMarket.searchAds?window.SLCMarket.searchAds(q):Promise.resolve([]);
  Promise.all([soServer(q).catch(()=>soLocal(q)),ads]).then(([r,adList])=>{
    if(my!==soReq)return;
    const sec=(key,title,items,row)=>{
      if(S.sotab!=="all"&&S.sotab!==key)return "";
      if(!items.length)return S.sotab===key?`<div class="empty">No ${title.toLowerCase()} found for \u201C${esc(q)}\u201D.</div>`:"";
      const cap=S.sotab==="all"?3:20,more=S.sotab==="all"&&items.length>cap?`<button class="btn sm" type="button" data-sotab="${key}">See all ${items.length}</button>`:"";
      return `<h3 class="soh">${title} <small>${items.length}</small></h3>${items.slice(0,cap).map(row).join("")}${more}`;
    };
    const html=sec("users","Students",r.users,personRow)+sec("videos","Videos",r.videos,x=>soPostRow(x,q))+sec("posts","Posts",r.posts,x=>soPostRow(x,q))+sec("ads","Ads",adList,x=>soAdRow(x,q));
    box.innerHTML=html||`<div class="empty">Nothing found for \u201C${esc(q)}\u201D. Try a different word, or check the spelling.</div>`;
  });
}
let soTimer=0;
qOverlay.addEventListener("input",()=>{clearTimeout(soTimer);soTimer=setTimeout(()=>soRender(qOverlay.value),180);});

/* scroll behaviour: auto-hide top bar on phones, tab shadow */
let lastY=0;
addEventListener("scroll",()=>{
  const y=window.scrollY;
  if(matchMedia("(max-width:720px)").matches){
    if(y>lastY+6&&y>90)document.body.classList.add("bar-hidden");
    else if(y<lastY-6||y<=90)document.body.classList.remove("bar-hidden");
  }
  lastY=y;
  if(S.view==="home"){const t=$("#tabs");const top=parseFloat(getComputedStyle(t).top)||0;t.classList.toggle("stuck",t.getBoundingClientRect().top<=top+1&&y>0);}
},{passive:true});

/* theme */
const root=document.documentElement;
function effective(){return root.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");}
function paintTheme(){
  const dark=effective()==="dark";
  $$("[data-theme-icon] use").forEach(u=>u.setAttribute("href",dark?"#i-sun":"#i-moon"));
  const l=$("[data-theme-label]");if(l)l.textContent=dark?"Light theme":"Dark theme";
  const mode=root.getAttribute("data-theme")||"system";
  $$("[data-site-theme]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.siteTheme===mode)));
}
function setTheme(m){
  if(m==="system")root.removeAttribute("data-theme");else root.setAttribute("data-theme",m);
  try{if(m==="system")localStorage.removeItem("slc-theme");else localStorage.setItem("slc-theme",m);}catch(e){}
  paintTheme();
}
try{const s=localStorage.getItem("slc-theme");if(s==="dark"||s==="light")root.setAttribute("data-theme",s);}catch(e){}

/* hooks used by js/market.js */
window.SLC={go,$,$$,esc,ic,av,S,toast,openSheet,closeSheet,PAGE};

/* carry a little state from page to page */
try{
  const h=JSON.parse(sessionStorage.getItem("slc-s")||"null");
  if(h){if(h.chat!=null)S.chat=h.chat;if(h.profileOf)S.profileOf=h.profileOf;if(h.listOf)S.listOf=h.listOf;if(h.flist)S.flist=h.flist;S.prev=h.prev||"home";S.openChat=!!h.open;}
}catch(e){}
addEventListener("pagehide",()=>{
  try{sessionStorage.setItem("slc-s",JSON.stringify({prev:PAGE,chat:S.chat,profileOf:S.profileOf,listOf:S.listOf,flist:S.flist,open:$("#msgs").classList.contains("open")||document.body.classList.contains("chat-open")}));}catch(e){}
});
loadMyAds();
/* init */
$("#me-av").innerHTML=av(ME.n,40);$("#comp-av").innerHTML=av(ME.n,44);
renderStatusRow();

$("#people").innerHTML=PEOPLE.slice(2,5).map(personRow).join("");
$("#pymk").innerHTML=`<div class="sectitle" style="margin:0 2px 8px">People you may know</div><div class="pcards">`+PEOPLE.slice(2,7).map(p=>`<div class="pc">${av(p.n,56)}<button class="lnk" type="button" data-profile="${esc(p.n)}">${esc(p.n)}</button><small>${esc(p.d)}, ${esc(p.s)}</small><button class="followbtn" type="button" aria-pressed="false">Follow</button></div>`).join("")+`</div>`;
renderRail();
renderAuth();renderSwatches();renderPreview();ctRefresh();renderFeed();renderNotifs();updateBadges();paintTheme();
msgBadge();
if(PAGE!=="login"){
  S.view=PAGE;S.booting=true;go(PAGE);S.booting=false;
  const qs=new URLSearchParams(location.search);
  if(PAGE==="create"){
    const m=qs.get("mode");
    if(m&&/^[a-z0-9]+$/.test(m)){const b=$('[data-createmode="'+m+'"]');if(b)b.click();}
    if(qs.get("status"))$("#mode").value="24";
  }
  if(PAGE==="messages"&&S.openChat&&matchMedia("(max-width:1060px)").matches){$("#msgs").classList.add("open");document.body.classList.add("chat-open");}
  try{const tm=sessionStorage.getItem("slc-toast");if(tm){sessionStorage.removeItem("slc-toast");setTimeout(()=>toast(tm),350);}}catch(e){}
  if(PAGE!=="login"){
    const CHECK_MS=60000;   /* how often an open page asks the server "is my account still active?" */
    const stillIn=()=>{if(document.hidden)return;fetch("api/me.php",{credentials:"same-origin",cache:"no-store"}).then(r=>r.status===401?r.json().catch(()=>({})):null).then(j=>{if(!j)return;try{localStorage.removeItem("slc-session");sessionStorage.setItem("slc-toast",j.removed?"Your account was not approved and has been removed.":"You have been signed out.");}catch(e){}location.replace("login.html");}).catch(()=>{});};
    setInterval(stillIn,CHECK_MS);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)stillIn();});
  }
  schedulePill(9000);setTimeout(()=>{const c=CH.find(x=>x.id===2);if(c)incoming(c,"Bring the past questions tonight.");},20000);
}
})();
