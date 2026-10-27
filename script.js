/* PillPal interactive front-end demo. No backend or real medical database is connected. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const today = new Date();
  const isoToday = () => `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const escapeHtml = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const seedMedicines = [
    {id:1,name:'Atenolol',dose:'1 pill',frequency:'Once a day',time:'10:00',duration:'1 month',start:isoToday(),status:'active',repeat:'No repeat',color:'blue',taken:false,info:'Atenolol is a beta blocker used for certain heart and blood-pressure conditions. Use only as prescribed by your healthcare professional.'},
    {id:2,name:'Vitamin D',dose:'1 capsule',frequency:'Once a day',time:'13:00',duration:'2 months',start:isoToday(),status:'active',repeat:'Every 3 months',color:'yellow',taken:true,info:'Vitamin D supports normal bone health. Dose and suitability depend on individual needs; follow professional advice.'},
    {id:3,name:'Magnesium',dose:'1 tablet',frequency:'Once a day',time:'20:00',duration:'2 weeks',start:isoToday(),status:'active',repeat:'No repeat',color:'pink',taken:false,info:'Magnesium is a mineral involved in normal body functions. Supplements may not be suitable for everyone.'}
  ];
  const defaultState = () => ({
    medicines: seedMedicines.map(x=>({...x})),
    feelings: [],
    events: [{id:1,type:'taken',title:'Vitamin D marked as taken',detail:'Today · 1:00 pm',date:isoToday()}],
    family: [
      {id:1,name:'Jamie Jones',role:'Partner',permission:'Missed doses only',delay:30},
      {id:2,name:'Anna Jones',role:'Family',permission:'Missed doses only',delay:30},
      {id:3,name:'Sam Jones',role:'Family',permission:'Full statistics',delay:60}
    ],
    profile:{name:'Mellison Jones',email:'mell.jones@example.com',mobile:'+44 7700 900 123',duration:'1 month',gender:'Prefer not to say',city:'London',avatar:'M'},
    settings:{dark:false,theme:'blue',font:16,vibration:true,volume:70,language:'English'},
    bannerVisible:true,
    inviteCode:'PILL-7K4M',
    selectedMood:'',
    plan:'yearly',
    trial:false,
    calendarMonth: new Date(today.getFullYear(),today.getMonth(),1).toISOString().slice(0,7),
    selectedDate:isoToday()
  });
  let state;
  try { state = JSON.parse(localStorage.getItem('pillpalDemo')) || defaultState(); } catch { state = defaultState(); }
  let nextId = Math.max(0,...state.medicines.map(x=>x.id),...state.events.map(x=>x.id),...state.family.map(x=>x.id))+1;
  let programTab='my', currentMedicineId=null;
  const save = () => { try { localStorage.setItem('pillpalDemo',JSON.stringify(state)); } catch {} };
  const toast = (message) => { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2600); };
  const addEvent = (type,title,detail='') => { state.events.unshift({id:nextId++,type,title,detail:detail||'Just now',date:isoToday()}); state.events=state.events.slice(0,30); };
  const medIcon = m => `<div class="pill-icon ${m.color==='yellow'?'yellow-pill':m.color==='pink'?'pink-pill':''}">💊</div>`;
  const dateText = (value) => { const d=new Date(`${value}T12:00:00`); return d.toLocaleDateString(undefined,{month:'short',day:'numeric'}); };
  const timeText = t => { const [h,m]=String(t||'09:00').split(':').map(Number); const d=new Date(); d.setHours(h,m||0); return d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}); };
  const activeMeds = () => state.medicines.filter(m=>m.status==='active');
  const todayMeds = () => activeMeds();
  const pageNames = {home:'Home',calendar:'Calendar',programs:'Programs',statistics:'Statistics',medicines:'Medicine list',family:'Family integration',premium:'Premium',settings:'Settings',profile:'Personal profile'};
  function go(page){
    if(!pageNames[page]) return;
    $$('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${page}`));
    $$('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
    $('#pageTitle').textContent=pageNames[page];
    $('#sidebar').classList.remove('open');
    renderPage(page);
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function renderHome(){
    const meds=todayMeds(), taken=meds.filter(m=>m.taken).length;
    $('#greetingName').textContent=(state.profile.name.split(' ')[0]||'Mell');
    $('#sideName').textContent=state.profile.name;
    $('#todayCount').textContent=meds.length;
    $('#takenCount').textContent=`${taken}/${meds.length}`;
    $('#streakCount').textContent='4 days';
    $('#todayDate').textContent=today.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
    $('#todayMedicines').innerHTML=meds.length?meds.map(m=>`<article class="medicine-card">
      <div class="medicine-card-top">${medIcon(m)}<span class="status-chip ${m.taken?'':'pending'}">${m.taken?'Taken':'Upcoming'}</span></div>
      <h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.dose)} · ${escapeHtml(m.frequency)}</p>
      <div class="medicine-card-bottom"><strong>◷ ${timeText(m.time)}</strong><button class="dose-btn ${m.taken?'taken':''}" data-dose="${m.id}">${m.taken?'✓ Taken':'+ Mark taken'}</button></div>
    </article>`).join(''):`<div class="panel empty-state">No active medicines yet. Add a medicine to build your schedule.</div>`;
    $('#inviteBanner').style.display=state.bannerVisible?'flex':'none';
    const percent=meds.length?Math.round(taken/meds.length*100):0;
    $('#donut').style.background=`conic-gradient(var(--blue) 0 ${percent}%,#e9eff9 ${percent}% 100%)`;
    $('#adherencePercent').textContent=`${percent}%`;
    $('#legendTaken').textContent=`${taken} doses`;
    $('#weekBars').innerHTML=[['M',45],['T',78],['W',63],['T',92],['F',taken?percent:32],['S',72],['S',58]].map(([d,v])=>`<div class="week-bar"><i style="height:${v}%"></i><small>${d}</small></div>`).join('');
    $$('#moodOptions button').forEach(b=>b.classList.toggle('selected',b.dataset.mood===state.selectedMood));
    $('#feelingNote').value=state.feelings[0]?.note||'';
  }
  function renderMedicineList(){
    const query=($('#medicineSearch')?.value||'').toLowerCase();
    const filter=$('#medicineFilter')?.value||'all';
    const list=state.medicines.filter(m=>(m.name.toLowerCase().includes(query)||m.info.toLowerCase().includes(query))&&(filter==='all'||(filter==='repeat'?m.repeat!=='No repeat':m.status===filter)));
    $('#medicineList').innerHTML=list.length?list.map(m=>`<article class="medicine-list-card">
      <div class="card-heading">${medIcon(m)}<div><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.dose)} · ${escapeHtml(m.frequency)}</p></div><span class="status-chip ${m.status==='active'?'':'pending'}">${m.status==='active'?'Active':m.status==='completed'?'Completed':'Paused'}</span></div>
      <div class="medicine-details"><div><small>Time</small><strong>${timeText(m.time)}</strong></div><div><small>Course</small><strong>${escapeHtml(m.duration)}</strong></div><div><small>Auto-repeat</small><strong>${escapeHtml(m.repeat)}</strong></div></div>
      <div class="card-actions"><button class="btn btn-secondary" data-info="${m.id}">Medicine info</button><button class="btn btn-secondary" data-edit="${m.id}">Edit</button><button class="btn btn-secondary" data-reschedule="${m.id}">Reschedule</button><button class="btn btn-secondary" data-delete="${m.id}">Delete</button></div>
    </article>`).join(''):`<div class="panel empty-state">No medicines match this view. Try another filter or add a medicine.</div>`;
  }
  function renderCalendar(){
    const [year,month]=state.calendarMonth.split('-').map(Number);
    const first=new Date(year,month-1,1), last=new Date(year,month,0);
    $('#monthLabel').textContent=first.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    const offset=(first.getDay()+6)%7;
    const total=Math.ceil((offset+last.getDate())/7)*7;
    let html='';
    for(let i=0;i<total;i++){
      const day=i-offset+1;
      if(day<1||day>last.getDate()){html+='<div class="calendar-day empty"></div>';continue;}
      const date=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const meds=state.medicines.filter(m=>m.status==='active');
      let cls='calendar-day';
      if(date===isoToday())cls+=' today';
      if(date===state.selectedDate)cls+=' selected';
      if(date<isoToday()&&meds.length){const seed=day%7;if(seed===0)cls+=' missed';else if(seed===1||seed===4)cls+=' partial';else cls+=' all-taken';}
      html+=`<button class="${cls}" data-date="${date}"><span class="day-num">${day}</span><span class="day-dots">${meds.slice(0,3).map(()=>'<i></i>').join('')}</span></button>`;
    }
    $('#calendarGrid').innerHTML=html;
    renderCalendarDay();
  }
  function renderCalendarDay(){
    $('#selectedDateLabel').textContent=state.selectedDate===isoToday()?"Today's medicines":`Medicines · ${dateText(state.selectedDate)}`;
    const meds=state.medicines.filter(m=>m.status==='active');
    $('#calendarDayList').innerHTML=meds.length?meds.map(m=>`<div class="list-row">${medIcon(m)}<div class="list-main"><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.dose)} · ${timeText(m.time)}</small></div><div class="list-actions"><button class="small-action" data-dose="${m.id}">${m.taken?'✓ Taken':'Mark taken'}</button></div></div>`).join(''):'<div class="empty-state">No scheduled medicines.</div>';
  }
  function renderPrograms(){
    const meds=state.medicines.filter(m=>programTab==='my'?true:false);
    if(programTab==='family'){
      $('#programList').innerHTML=`<article class="program-card">${medIcon({color:'blue'})}<div class="list-main"><h3>Anna's Calcium</h3><p>1 tablet/day · 2 months<br>Reminder time: 9:00 am</p><div class="program-meta"><span class="tag">Family demo</span><span class="tag">Read-only</span></div></div></article><article class="program-card">${medIcon({color:'yellow'})}<div class="list-main"><h3>Jamie's course</h3><p>Details shared with permission<br>Last updated yesterday</p><div class="program-meta"><span class="tag">Family demo</span></div></div></article>`;
      return;
    }
    $('#programList').innerHTML=meds.length?meds.map(m=>`<article class="program-card">${medIcon(m)}<div class="list-main"><h3>${escapeHtml(m.name)}</h3><p>Program: ${escapeHtml(m.dose)} · ${escapeHtml(m.frequency)}<br>Duration: ${escapeHtml(m.duration)}<br>Time: ${timeText(m.time)}</p><div class="program-meta"><span class="tag">${m.status}</span><span class="tag">${escapeHtml(m.repeat)}</span></div></div><button class="small-action" data-edit="${m.id}">Edit</button></article>`).join(''):'<div class="panel empty-state">No programs yet. Add a medicine to create your first program.</div>';
  }
  function renderStats(){
    const meds=activeMeds(), percent=meds.length?Math.round(meds.filter(m=>m.taken).length/meds.length*100):0;
    $('#statsAdherence').textContent=`${percent}%`;
    $('#statsTaken').textContent=meds.filter(m=>m.taken).length+12;
    const vals=[70,85,60,95,percent||42,72,82];
    $('#statsChart').innerHTML=vals.map((v,i)=>`<div class="chart-column"><i style="--bar:${v}%"></i><small>${['M','T','W','T','F','S','S'][i]}</small></div>`).join('');
    $('#moodHistory').innerHTML=state.feelings.length?state.feelings.slice(0,4).map(f=>`<div class="list-row"><div class="timeline-icon">♡</div><div class="list-main"><strong>${escapeHtml(f.mood)}</strong><small>${dateText(f.date)}${f.note?' · '+escapeHtml(f.note):''}</small></div></div>`).join(''):'<div class="empty-state">Your check-ins will appear here.</div>';
    $('#timeline').innerHTML=state.events.length?state.events.slice(0,8).map(e=>`<div class="timeline-item"><div class="timeline-icon">${e.type==='taken'?'✓':e.type==='added'?'＋':e.type==='feeling'?'♡':'◷'}</div><div><strong>${escapeHtml(e.title)}</strong><p>${escapeHtml(e.detail)} · ${dateText(e.date)}</p></div></div>`).join(''):'<div class="empty-state">No activity recorded yet.</div>';
  }
  function renderFamily(){
    $('#familyCount').textContent=`${state.family.length} ${state.family.length===1?'person':'people'} in your circle`;
    $('#familyList').innerHTML=state.family.length?state.family.map(f=>`<div class="list-row"><div class="avatar">${escapeHtml(f.name.charAt(0).toUpperCase())}</div><div class="list-main"><strong>${escapeHtml(f.name)}</strong><small>${escapeHtml(f.role)} · Alert after ${f.delay} minutes</small><select class="permission-select" data-permission="${f.id}"><option ${f.permission==='Missed doses only'?'selected':''}>Missed doses only</option><option ${f.permission==='Full statistics'?'selected':''}>Full statistics</option><option ${f.permission==='No sharing'?'selected':''}>No sharing</option></select></div><button class="small-action" data-remove-family="${f.id}">Remove</button></div>`).join(''):'<div class="empty-state">Your circle is empty. Invite someone you trust.</div>';
  }
  function renderSettings(){
    $('#darkMode').checked=!!state.settings.dark;$('#themeSelect').value=state.settings.theme;$('#fontSize').value=state.settings.font;$('#fontValue').textContent=`${state.settings.font} px`;$('#fontPreview').style.fontSize=`${state.settings.font}px`;
    $('#vibrationToggle').checked=state.settings.vibration;$('#volumeRange').value=state.settings.volume;$('#volumeValue').textContent=`${state.settings.volume}%`;$('#languageSelect').value=state.settings.language;
    document.body.classList.toggle('dark',!!state.settings.dark);document.documentElement.dataset.theme=state.settings.theme;document.documentElement.style.fontSize=`${state.settings.font}px`;
  }
  function renderProfile(){
    $('#profileName').value=state.profile.name;$('#profileEmail').value=state.profile.email;$('#profileMobile').value=state.profile.mobile;$('#profileDuration').value=state.profile.duration;$('#profileGender').value=state.profile.gender;$('#profileCity').value=state.profile.city;
    $('.profile-avatar-large').firstChild.textContent=state.profile.avatar;$('#openProfile').textContent=state.profile.avatar;
  }
  function renderPage(page){
    if(page==='home')renderHome();if(page==='calendar')renderCalendar();if(page==='programs')renderPrograms();if(page==='statistics')renderStats();if(page==='medicines')renderMedicineList();if(page==='family')renderFamily();if(page==='settings')renderSettings();if(page==='profile')renderProfile();
  }
  function openModal(content){
    $('#modalContent').innerHTML=content;$('#modalBackdrop').classList.add('open');$('#modalBackdrop').setAttribute('aria-hidden','false');
  }
  function closeModal(){$('#modalBackdrop').classList.remove('open');$('#modalBackdrop').setAttribute('aria-hidden','true');}
  function openMedicineForm(m=null){
    currentMedicineId=m?.id??null;
    openModal(`<span class="eyebrow">${m?'UPDATE YOUR ROUTINE':'BUILD YOUR ROUTINE'}</span><h2 id="modalTitle">${m?'Edit medicine':'Add a medicine'}</h2><p>Enter the schedule from your clinician or medicine packaging. This demo does not validate prescriptions.</p>
      <form id="medicineForm" class="modal-form">
        <label>Medicine name<input name="name" required placeholder="e.g. Atenolol" value="${escapeHtml(m?.name||'')}"></label>
        <div class="form-grid"><label>Amount / dose<input name="dose" required placeholder="1 pill" value="${escapeHtml(m?.dose||'1 pill')}"></label><label>Frequency<select name="frequency"><option ${m?.frequency==='Once a day'?'selected':''}>Once a day</option><option ${m?.frequency==='Twice a day'?'selected':''}>Twice a day</option><option ${m?.frequency==='Three times a day'?'selected':''}>Three times a day</option><option ${m?.frequency==='As prescribed'?'selected':''}>As prescribed</option></select></label></div>
        <div class="form-grid"><label>Reminder time<input name="time" type="time" required value="${escapeHtml(m?.time||'09:00')}"></label><label>Course duration<select name="duration"><option ${m?.duration==='7 days'?'selected':''}>7 days</option><option ${m?.duration==='2 weeks'?'selected':''}>2 weeks</option><option ${m?.duration==='1 month'?'selected':''}>1 month</option><option ${m?.duration==='2 months'?'selected':''}>2 months</option><option ${m?.duration==='3 months'?'selected':''}>3 months</option><option ${m?.duration==='Ongoing'?'selected':''}>Ongoing</option></select></label></div>
        <label>Automatic repeat<select name="repeat"><option ${m?.repeat==='No repeat'||!m?'selected':''}>No repeat</option><option ${m?.repeat==='Every 3 months'?'selected':''}>Every 3 months</option><option ${m?.repeat==='Every 6 months'?'selected':''}>Every 6 months</option><option ${m?.repeat==='Custom interval'?'selected':''}>Custom interval</option></select></label>
        <label>Notes (optional)<textarea name="info" rows="3" placeholder="Add information from a trusted source…">${escapeHtml(m?.info||'')}</textarea></label>
        <div class="medicine-info"><strong>Safety note</strong><p>Use medicines only as directed by a qualified healthcare professional. This prototype is not a substitute for medical advice.</p></div>
        <div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelMedicine">Cancel</button><button type="submit" class="btn btn-primary">${m?'Save changes':'Add medicine'}</button></div>
      </form>`);
    $('#cancelMedicine').addEventListener('click',closeModal);
    $('#medicineForm').addEventListener('submit',e=>{
      e.preventDefault();const fd=new FormData(e.currentTarget);
      const data={name:String(fd.get('name')).trim(),dose:fd.get('dose'),frequency:fd.get('frequency'),time:fd.get('time'),duration:fd.get('duration'),repeat:fd.get('repeat'),info:String(fd.get('info')||'').trim()||'No additional notes. Follow the instructions from your healthcare professional.'};
      if(!data.name){toast('Please enter a medicine name.');return;}
      if(currentMedicineId){const old=state.medicines.find(x=>x.id===currentMedicineId);Object.assign(old,data);addEvent('added',`${data.name} schedule updated`);}
      else{state.medicines.push({id:nextId++,...data,start:isoToday(),status:'active',color:['blue','yellow','pink'][state.medicines.length%3],taken:false});addEvent('added',`${data.name} added to your list`);}
      save();closeModal();renderPage('medicines');renderHome();toast(currentMedicineId?'Medicine updated':'Medicine added to your schedule');
    });
  }
  function openInfo(id){
    const m=state.medicines.find(x=>x.id===id);if(!m)return;
    openModal(`<span class="eyebrow">MEDICINE DETAILS</span><h2 id="modalTitle">${escapeHtml(m.name)}</h2><p>${escapeHtml(m.dose)} · ${escapeHtml(m.frequency)}</p><div class="medicine-info"><strong>General information</strong><p>${escapeHtml(m.info)}</p></div><div class="medicine-info"><strong>Your schedule</strong><p>Reminder: ${timeText(m.time)}<br>Course: ${escapeHtml(m.duration)}<br>Auto-repeat: ${escapeHtml(m.repeat)}</p></div><p class="fine-print">Medicine information here is user-entered demo content, not a verified medical database. Always confirm medicine use, contraindications and side effects with a pharmacist or clinician.</p><div class="modal-actions"><button class="btn btn-secondary" id="infoEdit">Edit schedule</button><button class="btn btn-primary" id="infoDone">Done</button></div>`);
    $('#infoDone').addEventListener('click',closeModal);$('#infoEdit').addEventListener('click',()=>openMedicineForm(m));
  }
  function openReschedule(id){
    const m=state.medicines.find(x=>x.id===id);if(!m)return;
    openModal(`<span class="eyebrow">UPDATE REMINDER</span><h2 id="modalTitle">Reschedule ${escapeHtml(m.name)}</h2><p>Choose a new reminder time for your demo schedule.</p><form id="rescheduleForm" class="modal-form"><label>Reminder time<input name="time" type="time" required value="${escapeHtml(m.time)}"></label><label>Course status<select name="status"><option value="active" ${m.status==='active'?'selected':''}>Active</option><option value="paused" ${m.status==='paused'?'selected':''}>Paused</option><option value="completed" ${m.status==='completed'?'selected':''}>Completed</option></select></label><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelReschedule">Cancel</button><button class="btn btn-primary">Save schedule</button></div></form>`);
    $('#cancelReschedule').addEventListener('click',closeModal);$('#rescheduleForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);m.time=fd.get('time');m.status=fd.get('status');addEvent('reschedule',`${m.name} schedule updated`);save();closeModal();renderAll();toast('Schedule updated');});
  }
  function openNotifications(){
    openModal(`<span class="eyebrow">STAY INFORMED</span><h2 id="modalTitle">Notifications</h2><div class="notification-item"><i></i><div><strong>Hey, ${escapeHtml(state.profile.name.split(' ')[0])}! It's time to take your medicine.</strong><small>5 minutes ago · Reminder demo</small></div></div><div class="notification-item"><i></i><div><strong>It looks like Max skipped his medicine time.</strong><small>Yesterday, 2:15 pm · Example notification</small></div></div><div class="notification-item"><i></i><div><strong>Mom added a new course to her schedule.</strong><small>Yesterday, 9:40 am · Family demo</small></div></div><p class="fine-print">These are sample notifications only. The prototype does not send real push notifications or alert family members.</p><div class="modal-actions"><button class="btn btn-primary" id="notificationDone">Got it</button></div>`);
    $('#notificationDone').addEventListener('click',closeModal);
  }
  function openInvite(){
    openModal(`<span class="eyebrow">FAMILY INTEGRATION</span><h2 id="modalTitle">Invite someone you trust</h2><p>Share this demo code with your partner or family member. No real account is connected in this prototype.</p><div class="invite-code"><span><small>Invite code</small><strong>${escapeHtml(state.inviteCode)}</strong></span><button class="btn btn-secondary" id="modalCopyCode">Copy</button></div><form class="modal-form" id="inviteForm"><label>Person's name<input name="name" required placeholder="e.g. Alex Jones"></label><label>Relationship<select name="role"><option>Partner</option><option>Family</option><option>Caregiver</option></select></label><label>What can they see?<select name="permission"><option>Missed doses only</option><option>Full statistics</option><option>No sharing</option></select></label><label>Alert after a missed dose<select name="delay"><option value="15">15 minutes</option><option value="30" selected>30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></label><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelInvite">Cancel</button><button class="btn btn-primary">Add demo connection</button></div></form>`);
    $('#modalCopyCode').addEventListener('click',copyInviteCode);$('#cancelInvite').addEventListener('click',closeModal);
    $('#inviteForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);state.family.push({id:nextId++,name:String(fd.get('name')).trim(),role:fd.get('role'),permission:fd.get('permission'),delay:Number(fd.get('delay'))});save();closeModal();renderFamily();toast('Demo connection added — no message sent');});
  }
  function copyInviteCode(){const code=state.inviteCode;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(code).then(()=>toast('Invite code copied')).catch(()=>toast(`Invite code: ${code}`));else toast(`Invite code: ${code}`);}
  function openScanner(){
    openModal(`<span class="eyebrow">SCAN PACKAGING</span><h2 id="modalTitle">Scan your medicine</h2><p>Camera and barcode recognition are not connected yet. You can still add a medicine manually.</p><div class="scan-box"><div><span>▱</span><p>Position the medicine package inside the frame</p></div></div><div class="modal-actions"><button class="btn btn-secondary" id="scannerCancel">Cancel</button><button class="btn btn-primary" id="manualFromScan">Enter manually</button></div>`);
    $('#scannerCancel').addEventListener('click',closeModal);$('#manualFromScan').addEventListener('click',()=>openMedicineForm());
  }
  function renderAll(){renderHome();renderMedicineList();renderCalendar();renderPrograms();renderStats();renderFamily();renderSettings();renderProfile();}
  // Navigation and delegated interactions
  $$('.nav-item[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  $$('[data-action="add"]').forEach(b=>b.addEventListener('click',()=>openMedicineForm()));
  $('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  $('#openNotifications').addEventListener('click',openNotifications);
  $('#openProfile').addEventListener('click',()=>go('profile'));
  $('#closeBanner').addEventListener('click',()=>{state.bannerVisible=false;save();renderHome();});
  $('#calendarAdd').addEventListener('click',()=>openMedicineForm());
  $('#prevMonth').addEventListener('click',()=>{const [y,m]=state.calendarMonth.split('-').map(Number);state.calendarMonth=new Date(y,m-2,1).toISOString().slice(0,7);save();renderCalendar();});
  $('#nextMonth').addEventListener('click',()=>{const [y,m]=state.calendarMonth.split('-').map(Number);state.calendarMonth=new Date(y,m,1).toISOString().slice(0,7);save();renderCalendar();});
  $('#calendarGrid').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(!b)return;state.selectedDate=b.dataset.date;save();renderCalendar();});
  $$('.segmented button').forEach(b=>b.addEventListener('click',()=>{$$('.segmented button').forEach(x=>x.classList.toggle('selected',x===b));programTab=b.dataset.programTab;renderPrograms();}));
  $('#medicineSearch').addEventListener('input',renderMedicineList);$('#medicineFilter').addEventListener('change',renderMedicineList);
  $('#invitePerson').addEventListener('click',openInvite);$('#orbitAdd').addEventListener('click',openInvite);$('#copyCode').addEventListener('click',copyInviteCode);
  $('#modalClose').addEventListener('click',closeModal);$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  document.body.addEventListener('click',e=>{
    const dose=e.target.closest('[data-dose]');if(dose){const m=state.medicines.find(x=>x.id===Number(dose.dataset.dose));if(!m)return;m.taken=!m.taken;addEvent(m.taken?'taken':'missed',`${m.name} marked as ${m.taken?'taken':'not taken'}`,`Today · ${timeText(m.time)}`);save();renderAll();toast(m.taken?'Dose marked as taken':'Dose marked as not taken');return;}
    const info=e.target.closest('[data-info]');if(info){openInfo(Number(info.dataset.info));return;}
    const edit=e.target.closest('[data-edit]');if(edit){openMedicineForm(state.medicines.find(x=>x.id===Number(edit.dataset.edit)));return;}
    const res=e.target.closest('[data-reschedule]');if(res){openReschedule(Number(res.dataset.reschedule));return;}
    const del=e.target.closest('[data-delete]');if(del){const m=state.medicines.find(x=>x.id===Number(del.dataset.delete));if(!m)return;openModal(`<span class="eyebrow">CONFIRM ACTION</span><h2 id="modalTitle">Delete ${escapeHtml(m.name)}?</h2><p>This removes the medicine from this browser's demo schedule.</p><div class="modal-actions"><button class="btn btn-secondary" id="keepMedicine">Keep medicine</button><button class="btn btn-primary" id="confirmDelete">Delete medicine</button></div>`);$('#keepMedicine').addEventListener('click',closeModal);$('#confirmDelete').addEventListener('click',()=>{state.medicines=state.medicines.filter(x=>x.id!==m.id);addEvent('deleted',`${m.name} removed`);save();closeModal();renderAll();toast('Medicine removed');});return;}
    const remove=e.target.closest('[data-remove-family]');if(remove){state.family=state.family.filter(f=>f.id!==Number(remove.dataset.removeFamily));save();renderFamily();toast('Connection removed from this demo');}
  });
  $('#familyList').addEventListener('change',e=>{const sel=e.target.closest('[data-permission]');if(!sel)return;const f=state.family.find(x=>x.id===Number(sel.dataset.permission));if(f){f.permission=sel.value;save();toast('Sharing permission updated');}});
  $$('#moodOptions button').forEach(b=>b.addEventListener('click',()=>{state.selectedMood=b.dataset.mood;$$('#moodOptions button').forEach(x=>x.classList.toggle('selected',x===b));save();}));
  $('#saveFeeling').addEventListener('click',()=>{if(!state.selectedMood){toast('Choose how you feel first.');return;}state.feelings.unshift({id:nextId++,mood:state.selectedMood,note:$('#feelingNote').value.trim(),date:isoToday()});state.feelings=state.feelings.slice(0,30);addEvent('feeling',`Feeling check-in: ${state.selectedMood}`);save();renderHome();renderStats();toast('Your check-in has been saved');});
  $('#darkMode').addEventListener('change',e=>{state.settings.dark=e.target.checked;save();renderSettings();});
  $('#themeSelect').addEventListener('change',e=>{state.settings.theme=e.target.value;save();renderSettings();});
  $('#fontSize').addEventListener('input',e=>{state.settings.font=Number(e.target.value);$('#fontValue').textContent=`${state.settings.font} px`;$('#fontPreview').style.fontSize=`${state.settings.font}px`;document.documentElement.style.fontSize=`${state.settings.font}px`;save();});
  $('#vibrationToggle').addEventListener('change',e=>{state.settings.vibration=e.target.checked;save();toast(`Vibration demo ${e.target.checked?'enabled':'disabled'}`);});
  $('#volumeRange').addEventListener('input',e=>{state.settings.volume=Number(e.target.value);$('#volumeValue').textContent=`${state.settings.volume}%`;save();});
  $('#languageSelect').addEventListener('change',e=>{state.settings.language=e.target.value;save();toast(`Language selected: ${e.target.value}. Full translations are not connected yet.`);});
  $('#soundPreview').addEventListener('click',()=>{try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx){toast('Sound preview is unavailable in this browser.');return;}const ctx=new Ctx();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=660;gain.gain.value=Math.max(.01,state.settings.volume/100*.08);osc.start();osc.stop(ctx.currentTime+.16);osc.onended=()=>ctx.close();toast('Reminder sound preview');}catch{toast('Sound preview is unavailable.');}});
  $('#saveProfile').addEventListener('click',()=>{state.profile.name=$('#profileName').value.trim()||'Mell';state.profile.email=$('#profileEmail').value.trim();state.profile.mobile=$('#profileMobile').value.trim();state.profile.duration=$('#profileDuration').value;state.profile.gender=$('#profileGender').value;state.profile.city=$('#profileCity').value.trim();save();renderHome();renderProfile();toast('Profile saved');});
  $('#changeAvatar').addEventListener('click',()=>{const options=['M','J','A','S','Z','♡'];const current=options.indexOf(state.profile.avatar);state.profile.avatar=options[(current+1)%options.length];save();renderProfile();renderHome();toast('Avatar changed');});
  $('#statsPeriod').addEventListener('change',()=>{renderStats();toast(`Showing ${$('#statsPeriod').value} view`);});
  $$('.price-option').forEach(b=>b.addEventListener('click',()=>{state.plan=b.dataset.plan;$$('.price-option').forEach(x=>x.classList.toggle('selected',x===b));$('#subscribeBtn').textContent=`Continue with ${state.plan} plan`;save();}));
  $('#trialToggle').addEventListener('change',e=>{state.trial=e.target.checked;save();toast(e.target.checked?'Demo trial selected':'Demo trial turned off');});
  $('#premiumStart').addEventListener('click',()=>document.querySelector('.pricing-panel').scrollIntoView({behavior:'smooth',block:'center'}));
  $('#subscribeBtn').addEventListener('click',()=>openModal(`<span class="eyebrow">PREMIUM DEMO</span><h2 id="modalTitle">${state.trial?'Your trial is ready to preview':'You selected the '+state.plan+' plan'}</h2><p>This is a front-end prototype. Payments, billing, trial activation and cancellation are not connected, and no money will be charged.</p><div class="medicine-info"><strong>Selected plan</strong><p>${state.trial?'Free trial preview':state.plan==='yearly'?'500,000 UZS per year':'50,000 UZS per month'}</p></div><div class="modal-actions"><button class="btn btn-primary" id="premiumClose">Got it</button></div>`));
  $('#clearData').addEventListener('click',()=>openModal(`<span class="eyebrow">LOCAL DEMO DATA</span><h2 id="modalTitle">Clear saved data?</h2><p>This resets medicines, profile edits, check-ins and settings in this browser.</p><div class="modal-actions"><button class="btn btn-secondary" id="keepData">Cancel</button><button class="btn btn-primary" id="confirmClear">Clear data</button></div>`));
  document.body.addEventListener('click',e=>{if(e.target.id==='premiumClose'||e.target.id==='keepData')closeModal();if(e.target.id==='confirmClear'){state=defaultState();save();closeModal();renderAll();go('home');toast('Demo data reset');}});
  $('#resetDemo').addEventListener('click',()=>openModal(`<span class="eyebrow">RESET PROTOTYPE</span><h2 id="modalTitle">Start the demo over?</h2><p>Your local changes will be reset to the sample data.</p><div class="modal-actions"><button class="btn btn-secondary" id="cancelReset">Cancel</button><button class="btn btn-primary" id="confirmReset">Reset demo</button></div>`));
  document.body.addEventListener('click',e=>{if(e.target.id==='cancelReset')closeModal();if(e.target.id==='confirmReset'){state=defaultState();save();closeModal();renderAll();go('home');toast('Demo reset complete');}});
  // Close Premium modal handlers are delegated above; this prevents accidental page reload.
  const originalOpenModal=openModal;
  // Start up
  renderAll();go('home');
})();
