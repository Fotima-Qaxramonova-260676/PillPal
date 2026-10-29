const GOAL = 780000;
let raised = Number(localStorage.getItem("smb_demo_raised") || 0);
let donors = Number(localStorage.getItem("smb_demo_donors") || 0);

const $ = (s) => document.querySelector(s);
const money = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);

function renderProgress(){
  const remaining = Math.max(GOAL-raised,0);
  const pct = Math.min(raised/GOAL*100,100);
  ["#raised","#heroRaised"].forEach(s=>{const el=$(s); if(el) el.textContent=money(raised)});
  ["#remaining","#heroRemaining"].forEach(s=>{const el=$(s); if(el) el.textContent=money(remaining)});
  ["#heroDonors"].forEach(s=>{const el=$(s); if(el) el.textContent=donors.toLocaleString()});
  ["#progressBar","#heroProgress"].forEach(s=>{const el=$(s); if(el) el.style.width=pct+"%"});
  const p=$("#progressPercent"); if(p) p.textContent=pct.toFixed(1)+"%";
}
renderProgress();

const modal=$("#donateModal");
document.querySelectorAll("[data-open-donate]").forEach(b=>b.addEventListener("click",()=>{modal.classList.add("open");modal.setAttribute("aria-hidden","false")}));
document.querySelectorAll("[data-close-donate]").forEach(b=>b.addEventListener("click",closeModal));
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

document.querySelectorAll("[data-amount]").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll("[data-amount]").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active"); $("#donationAmount").value=btn.dataset.amount;
}));

$("#demoDonate").addEventListener("click",()=>{
  const amount=Number($("#donationAmount").value);
  const country=$("#country").value;
  const first=$("#firstName").value.trim(), last=$("#lastName").value.trim(), email=$("#email").value.trim();
  if(!amount || amount<=0 || !country || !first || !last || !email){
    toast("Please complete the required donation fields.");
    return;
  }
  // DEMO ONLY: this simulates a successful donation and stores no real payment data.
  raised += amount; donors += 1;
  localStorage.setItem("smb_demo_raised",raised);
  localStorage.setItem("smb_demo_donors",donors);
  renderProgress(); closeModal();
  toast("Demo donation recorded. Real payment is not connected yet.");
});

function toast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3000)}

const translations = {
  en:{story:"Our purpose",progress:"Progress",transparency:"Transparency",updates:"Updates",donate:"Donate"},
  ru:{story:"Наша цель",progress:"Прогресс",transparency:"Прозрачность",updates:"Новости",donate:"Пожертвовать"},
  uz:{story:"Maqsadimiz",progress:"Jarayon",transparency:"Shaffoflik",updates:"Yangiliklar",donate:"Xayriya qilish"},
  fa:{story:"هدف ما",progress:"پیشرفت",transparency:"شفافیت",updates:"اخبار",donate:"کمک مالی"},
  ps:{story:"زموږ موخه",progress:"پرمختګ",transparency:"روڼتیا",updates:"تازه معلومات",donate:"مرسته"},
  ar:{story:"هدفنا",progress:"التقدم",transparency:"الشفافية",updates:"التحديثات",donate:"تبرع"},
  tr:{story:"Amacımız",progress:"İlerleme",transparency:"Şeffaflık",updates:"Güncellemeler",donate:"Bağış yap"},
  de:{story:"Unser Ziel",progress:"Fortschritt",transparency:"Transparenz",updates:"Updates",donate:"Spenden"},
  fr:{story:"Notre objectif",progress:"Avancement",transparency:"Transparence",updates:"Actualités",donate:"Faire un don"},
  es:{story:"Nuestro propósito",progress:"Progreso",transparency:"Transparencia",updates:"Actualizaciones",donate:"Donar"},
  pt:{story:"Nosso propósito",progress:"Progresso",transparency:"Transparência",updates:"Atualizações",donate:"Doar"},
  zh:{story:"项目目标",progress:"进展",transparency:"透明度",updates:"项目动态",donate:"捐赠"},
  ja:{story:"目的",progress:"進捗",transparency:"透明性",updates:"最新情報",donate:"寄付する"},
  ko:{story:"프로젝트 목적",progress:"진행 상황",transparency:"투명성",updates:"업데이트",donate:"기부하기"},
  hi:{story:"हमारा उद्देश्य",progress:"प्रगति",transparency:"पारदर्शिता",updates:"अपडेट",donate:"दान करें"},
  id:{story:"Tujuan kami",progress:"Kemajuan",transparency:"Transparansi",updates:"Pembaruan",donate:"Donasi"},
  ms:{story:"Tujuan kami",progress:"Kemajuan",transparency:"Ketelusan",updates:"Kemas kini",donate:"Derma"},
  it:{story:"Il nostro scopo",progress:"Progresso",transparency:"Trasparenza",updates:"Aggiornamenti",donate:"Dona"}
};
$("#language").addEventListener("change",e=>{
  const lang=e.target.value, tr=translations[lang]||translations.en;
  const nav=document.querySelectorAll(".nav nav a");
  if(nav.length>=4){nav[0].textContent=tr.story;nav[1].textContent=tr.progress;nav[2].textContent=tr.transparency;nav[3].textContent=tr.updates}
  document.querySelectorAll("[data-open-donate]").forEach(b=>{b.childNodes[0].textContent=tr.donate+" "});
});
