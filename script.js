const KEY="growday_v3";
const pillars=["skill","language","reading","world"];
const $=id=>document.getElementById(id);

function todayKey(){return new Date().toISOString().slice(0,10)}
function blankDay(){return {done:{skill:false,language:false,reading:false,world:false},skillName:"",skillNote:"",skillLevel:0,languageName:"",languageLesson:"",wordCount:"",readingTitle:"",readingAmount:"",readingNote:"",worldTopic:"",worldNote:"",reflection:""}}
let store=JSON.parse(localStorage.getItem(KEY)||"{}");
if(!store.days) store.days={};
if(!store.days[todayKey()]) store.days[todayKey()]=blankDay();

function day(){return store.days[todayKey()]}
function save(){localStorage.setItem(KEY,JSON.stringify(store))}
function setVal(id,val){$(id).value=val??""}
function getVal(id){return $(id).value}

function load(){
  const d=day();
  ["skillName","skillNote","languageName","languageLesson","wordCount","readingTitle","readingAmount","readingNote","worldTopic","worldNote","reflection"].forEach(id=>setVal(id,d[id]));
  $("skillLevel").value=d.skillLevel||0;
  updateSkillText();
  pillars.forEach(k=>renderCard(k));
  renderSummary(); renderWeek(); renderStats();
  const now=new Date();
  $("dateLabel").textContent=now.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"}).toUpperCase();
}
function renderCard(k){
  const c=document.querySelector(`[data-key="${k}"]`), d=day(), done=d.done[k];
  c.classList.toggle("done",done);
  $("check-"+k).textContent=done?"✓":"○";
  const btn=c.querySelector(".complete-btn");
  btn.textContent=done?"Completed ✓":"Mark "+k+" complete";
}
function renderSummary(){
  const d=day(), n=pillars.filter(k=>d.done[k]).length, p=Math.round(n/4*100);
  $("percent").textContent=p+"%"; $("ringText").textContent=p+"%"; $("completedText").textContent=`${n} of 4 areas completed`; $("counter").textContent=`${n} / 4`;
  $("progressBar").style.width=p+"%"; $("ring").style.background=`conic-gradient(var(--accent) ${p*3.6}deg,#28313a 0deg)`;
  $("streakValue").textContent=calcStreak();
}
function calcStreak(){
  let count=0, d=new Date();
  while(true){
    const k=d.toISOString().slice(0,10), x=store.days[k];
    if(!x || !pillars.every(p=>x.done[p])) break;
    count++; d.setDate(d.getDate()-1);
  }
  return count;
}
function growthFor(x){return x?Math.round(pillars.filter(k=>x.done[k]).length/4*100):0}
function renderWeek(){
  const wrap=$("week"); wrap.innerHTML="";
  const now=new Date(); now.setHours(0,0,0,0);
  const start=new Date(now); start.setDate(now.getDate()-6);
  for(let i=0;i<7;i++){
    const d=new Date(start); d.setDate(start.getDate()+i);
    const k=d.toISOString().slice(0,10), x=store.days[k], el=document.createElement("div");
    el.className="day "+(k===todayKey()?"active ":"")+(growthFor(x)===100?"done":"");
    el.innerHTML=`<small>${d.toLocaleDateString(undefined,{weekday:"short"})}</small><b>${growthFor(x)}%</b>`;
    wrap.appendChild(el);
  }
}
function renderStats(){
  const vals=[];
  for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);vals.push(growthFor(store.days[d.toISOString().slice(0,10)]))}
  $("avgGrowth").textContent=Math.round(vals.reduce((a,b)=>a+b,0)/7)+"%";
  let best=0,run=0, keys=Object.keys(store.days).sort();
  for(const k of keys){if(growthFor(store.days[k])===100){run++;best=Math.max(best,run)}else run=0}
  $("bestStreak").textContent=best;
  $("totalCompletions").textContent=Object.values(store.days).reduce((s,x)=>s+pillars.filter(k=>x.done[k]).length,0);
  $("totalDays").textContent=Object.values(store.days).filter(x=>pillars.some(k=>x.done[k])).length+" active days";
}
function persistField(id){
  day()[id]=getVal(id); save();
}
["skillName","skillNote","languageName","languageLesson","wordCount","readingTitle","readingAmount","readingNote","worldTopic","worldNote","reflection"].forEach(id=>{
  $(id).addEventListener("input",()=>persistField(id));
});
$("skillLevel").addEventListener("input",()=>{
  day().skillLevel=+$("skillLevel").value; updateSkillText(); save();
});
function updateSkillText(){$("skillLevelText").textContent=`Day ${$("skillLevel").value} / 30`}
document.querySelectorAll(".complete-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const k=btn.dataset.complete; day().done[k]=!day().done[k]; save(); renderCard(k); renderSummary(); renderWeek(); renderStats();
  });
});
$("saveReflection").addEventListener("click",()=>{persistField("reflection"); $("saveReflection").textContent="Saved ✓"; setTimeout(()=>$("saveReflection").textContent="Save reflection",1200)});
$("resetBtn").addEventListener("click",()=>{
  if(confirm("Reset today's four pillars? Your other dates stay saved.")){store.days[todayKey()]=blankDay();save();load()}
});
$("themeBtn").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("growday_theme",document.body.classList.contains("light")?"light":"dark")});
if(localStorage.getItem("growday_theme")==="light") document.body.classList.add("light");
load();
