const KEY='neet_cc_v1';
const defaultData={
  streak:1, studySeconds:0,
  chapters:[
    {id:1,s:'Physics',n:'1D Motion',p:100},{id:2,s:'Physics',n:'2D Motion',p:100},{id:3,s:'Physics',n:'Laws of Motion',p:0},
    {id:4,s:'Chemistry',n:'Some Basic Concepts',p:100},{id:5,s:'Chemistry',n:'Thermodynamics',p:60},{id:6,s:'Chemistry',n:'Chemical Equilibrium',p:0},
    {id:7,s:'Biology',n:'The Living World',p:100},{id:8,s:'Biology',n:'Biological Classification',p:100},{id:9,s:'Biology',n:'Cell Cycle',p:80}
  ],
  tasks:[
    {id:1,n:'Thermodynamics DPP',s:'Chemistry',done:false,r:'Pending DPP'},
    {id:2,n:'Current chapter revision',s:'Physics',done:false,r:'Revision due'},
    {id:3,n:'Biology NCERT reading',s:'Biology',done:false,r:'Daily NCERT'}
  ],
  revisions:[],
  mocks:[],
  mistakes:[]
};
let data=JSON.parse(localStorage.getItem(KEY)||'null')||defaultData;
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function toast(t){let e=document.querySelector('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
function showPage(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active-page'));document.querySelector('#'+id).classList.add('active-page');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===id));document.querySelector('#pageTitle').textContent=id==='planner'?"Today's Plan":id[0].toUpperCase()+id.slice(1);window.scrollTo(0,0);render()}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelector('#menu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
document.querySelector('#reset').onclick=()=>{if(confirm('Reset all local data?')){localStorage.removeItem(KEY);location.reload()}};
function overall(){return Math.round(data.chapters.reduce((a,c)=>a+c.p,0)/(data.chapters.length||1))}
function render(){
 document.querySelector('#streak').textContent=data.streak+' day'+(data.streak===1?'':'s');
 document.querySelector('#overall').textContent=overall()+'%';
 let h=Math.floor(data.studySeconds/3600),m=Math.floor(data.studySeconds%3600/60);document.querySelector('#studyTime').textContent=`${h}h ${String(m).padStart(2,'0')}m`;
 let future=data.mocks.filter(x=>new Date(x.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
 document.querySelector('#nextMock').textContent=future?Math.ceil((new Date(future.date)-new Date())/86400000)+'d':'—';
 document.querySelector('#mockSub').textContent=future?esc(future.n):'Add a mock test';
 document.querySelector('#dashTasks').innerHTML=data.tasks.slice(0,5).map(taskHTML).join('')||'<p class="muted">No tasks. Add one from Today’s Plan.</p>';
 let subs=['Physics','Chemistry','Biology'];document.querySelector('#subjectProgress').innerHTML=subs.map(s=>{let a=data.chapters.filter(x=>x.s===s),p=Math.round(a.reduce((z,x)=>z+x.p,0)/(a.length||1));return `<div class="progress-row"><div class="progress-label"><b>${s}</b><span>${p}%</span></div><div class="bar"><div class="fill" style="width:${p}%"></div></div></div>`}).join('');
 renderChapters('All');renderTasks();renderRevisions();renderMocks();renderMistakes();renderAnalytics();
}
function taskHTML(t){return `<div class="task ${t.done?'done':''}"><input class="check" type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${t.id})"><div><b>${esc(t.n)}</b><div class="mini">${esc(t.r||t.s)}</div></div><span class="tag">${esc(t.s)}</span></div>`}
function renderTasks(){document.querySelector('#tasks').innerHTML=data.tasks.map(taskHTML).join('')||'<p class="muted">No tasks yet.</p>';let n=data.tasks.find(x=>!x.done);document.querySelector('#nextTaskTitle').textContent=n?n.n:'All tasks complete 🎉';document.querySelector('#nextTaskReason').textContent=n?(n.r||'Highest priority pending task'):'Add tomorrow’s tasks when ready.'}
function toggleTask(id){let t=data.tasks.find(x=>x.id===id);t.done=!t.done;if(t.done)toast('Task completed ✓');save()}
function addTask(){let n=prompt('Task name?');if(!n)return;let s=prompt('Subject? Physics / Chemistry / Biology','Physics')||'Other';data.tasks.push({id:Date.now(),n,s,done:false,r:'Added by you'});save()}
let chapterFilter='All';
function renderChapters(f){chapterFilter=f;let arr=data.chapters.filter(x=>f==='All'||x.s===f);document.querySelector('#chapters').innerHTML=arr.map(c=>`<div class="card chapter"><div class="chapter-main"><div class="chapter-name"><b>${esc(c.n)}</b><small>${esc(c.s)}</small></div><span>${c.p}%</span><input type="range" min="0" max="100" value="${c.p}" oninput="updateChapter(${c.id},this.value)" style="width:120px"><button class="link" onclick="deleteChapter(${c.id})">×</button></div></div>`).join('')}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderChapters(b.dataset.filter)});
function updateChapter(id,p){data.chapters.find(x=>x.id===id).p=+p;localStorage.setItem(KEY,JSON.stringify(data));document.querySelector('#overall').textContent=overall()+'%'}
function addChapter(){let n=prompt('Chapter name?');if(!n)return;let s=prompt('Subject?','Physics');data.chapters.push({id:Date.now(),n,s,p:0});save()}
function deleteChapter(id){data.chapters=data.chapters.filter(x=>x.id!==id);save()}
function renderRevisions(){document.querySelector('#revisions').innerHTML=data.revisions.map((r,i)=>`<div class="revision"><input class="check" type="checkbox" ${r.done?'checked':''} onchange="toggleRevision(${i})"><div><b>${esc(r.n)}</b><small>${esc(r.date)}</small></div><span class="tag">${r.done?'Done':'Due'}</span></div>`).join('')||'<p class="muted">No revision items yet.</p>'}
function toggleRevision(i){data.revisions[i].done=!data.revisions[i].done;save()}
function renderMocks(){document.querySelector('#mockCards').innerHTML='<div class="card">'+(data.mocks.map((m,i)=>`<div class="mock"><div><b>${esc(m.n)}</b><div class="mini">${esc(m.date)}</div></div><div><span class="mock-score">${m.score||'—'}</span> <button class="link" onclick="scoreMock(${i})">Score</button> <button class="link" onclick="deleteMock(${i})">×</button></div></div>`).join('')||'<p class="muted">No mocks added yet.</p>')+'</div>'}
function addMock(){let n=prompt('Mock name?','NEET Full Syllabus Mock');if(!n)return;let d=prompt('Date (YYYY-MM-DD)?');if(!d)return;data.mocks.push({n,date:d,score:null});save()}
function scoreMock(i){let s=prompt('Total score?');if(s===null)return;data.mocks[i].score=+s;save()}
function deleteMock(i){data.mocks.splice(i,1);save()}
let mistakeFilter='All';
function renderMistakes(){let arr=data.mistakes.filter(x=>mistakeFilter==='All'||x.t===mistakeFilter);document.querySelector('#mistakeList').innerHTML=arr.map((m,i)=>`<div class="mistake"><div style="flex:1"><b>${esc(m.q)}</b><small>${esc(m.s)} • ${esc(m.t)} • ${esc(m.note)}</small></div><button class="link" onclick="deleteMistake(${data.mistakes.indexOf(m)})">×</button></div>`).join('')||'<p class="muted">No mistakes saved. Add one after your next test.</p>'}
document.querySelectorAll('[data-mtype]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-mtype]').forEach(x=>x.classList.remove('active'));b.classList.add('active');mistakeFilter=b.dataset.mtype;renderMistakes()});
function addMistake(){let q=prompt('What question/concept did you get wrong?');if(!q)return;let s=prompt('Subject?','Physics');let t=prompt('Type? Concept / Silly / Calculation','Concept');let note=prompt('One-line reason?','Need to revise concept')||'';data.mistakes.push({q,s,t,note});save()}
function deleteMistake(i){data.mistakes.splice(i,1);save()}
function renderAnalytics(){let completed=data.tasks.filter(x=>x.done).length, total=data.tasks.length;document.querySelector('#analyticsStats').innerHTML=`<div class="card stat"><span>Overall syllabus</span><strong>${overall()}%</strong></div><div class="card stat"><span>Tasks completed</span><strong>${completed}/${total}</strong></div><div class="card stat"><span>Mocks recorded</span><strong>${data.mocks.length}</strong></div><div class="card stat"><span>Mistakes saved</span><strong>${data.mistakes.length}</strong></div>`}
let timerInt=null,remaining=3000;
function startFocus(){if(timerInt)return;remaining=3000;document.querySelector('#timer').classList.remove('hidden');timerInt=setInterval(()=>{remaining--;document.querySelector('#timerText').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;if(remaining<=0)stopFocus(true)},1000)}
function stopFocus(done=false){clearInterval(timerInt);timerInt=null;let used=3000-remaining;data.studySeconds+=used;document.querySelector('#timer').classList.add('hidden');toast(done?'50-minute focus complete 🎉':'Focus session saved');save()}
render();
