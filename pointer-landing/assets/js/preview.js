// SIMULATION STATE MACHINE
let simRunning = false;
let simDone = false;
let simTimers = [];

const messages = [
  { from: 'patient', text: 'Olá, gostaria de agendar uma consulta para amanhã à tarde', time: '14:32' },
  { from: 'pointer', text: 'Olá! 👋 Sou o Pointer, assistente autônomo da clínica.<br><br>Tenho os seguintes horários disponíveis para amanhã:<br><br>🕐 14:00 — Dr. Henrique Carvalho<br>🕒 16:30 — Dra. Renata Figueiredo<br><br>Qual prefere?', time: '14:32' },
  { from: 'patient', text: '14h, por favor. Obrigado!', time: '14:33' },
  { from: 'pointer', text: '✅ Confirmado!<br><br><b>Ricardo Mendes</b><br>Consulta Avaliação — 30/09<br>14:00 · Dr. Henrique Carvalho<br>📍 Clínica Premium<br><br>Vou enviar um lembrete 24h antes. Até lá! 🎯', time: '14:33' }
];

function handleSimClick() {
  if (simDone) {
    resetSimulation();
    return;
  }
  if (simRunning) return;
  startSimulation();
}

function resetSimulation() {
  simTimers.forEach(clearTimeout);
  simTimers = [];
  simRunning = false;
  simDone = false;

  document.getElementById('chat-box').innerHTML = '<div id="chat-idle" class="flex-1 flex items-center justify-center py-12"><p class="text-white/20 text-[12px] text-center">Aguardando demonstração…</p></div>';
  document.getElementById('chat-typing').classList.add('hidden');

  const card = document.getElementById('card-lead');
  document.getElementById('drop-entrada').appendChild(card);
  card.className = 'rounded-xl border p-3 bg-blue-500/10 border-blue-500/20 text-blue-400 transition-all duration-300';
  document.getElementById('card-avatar').className = 'w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0';
  document.getElementById('card-status-badge').classList.add('hidden');
  document.getElementById('success-banner').classList.add('hidden');

  document.getElementById('btn-run-sim').className = 'flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-[14px] transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 active:scale-95';
  document.getElementById('btn-sim-label').textContent = '▶ Executar Demonstração em Tempo Real';
}

function startSimulation() {
  simRunning = true;
  document.getElementById('chat-idle')?.remove();
  document.getElementById('btn-run-sim').className = 'flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-[14px] transition-all bg-white/[0.04] border border-white/[0.08] text-white/25 cursor-not-allowed';
  document.getElementById('btn-sim-label').textContent = 'Simulando fluxo…';

  const schedule = (fn, ms) => {
    simTimers.push(setTimeout(fn, ms));
  };

  schedule(() => addMsg(0), 500);
  schedule(() => {
    document.getElementById('chat-typing').classList.remove('hidden');
    moveKanban('drop-qualificando', 'amber');
  }, 1600);
  schedule(() => {
    document.getElementById('chat-typing').classList.add('hidden');
    addMsg(1);
  }, 3400);
  schedule(() => addMsg(2), 5200);
  schedule(() => {
    document.getElementById('chat-typing').classList.remove('hidden');
  }, 6000);
  schedule(() => {
    document.getElementById('chat-typing').classList.add('hidden');
    addMsg(3);
    moveKanban('drop-agendado', 'emerald');
    document.getElementById('card-status-badge').classList.remove('hidden');
  }, 7400);
  schedule(() => {
    document.getElementById('success-banner').classList.remove('hidden');
    simRunning = false;
    simDone = true;
    document.getElementById('btn-run-sim').className = 'flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-[14px] transition-all bg-white/[0.04] border border-white/[0.12] text-white hover:bg-white/[0.07]';
    document.getElementById('btn-sim-label').textContent = 'Reiniciar Demonstração';
  }, 8400);
}

function addMsg(index) {
  const message = messages[index];
  const box = document.getElementById('chat-box');
  const div = document.createElement('div');
  const isBot = message.from === 'pointer';

  div.className = isBot ? 'flex justify-end' : 'flex justify-start';
  div.innerHTML = `
    <div class="chat-message--${isBot ? 'pointer' : 'patient'} text-white text-[12px] ${isBot ? 'rounded-tl-2xl' : 'rounded-tr-2xl'} rounded-b-2xl px-3 py-2 ${isBot ? 'max-w-[88%]' : 'max-w-[80%]'} shadow-sm leading-relaxed">
      <p>${message.text}</p>
      <p class="text-white/25 text-[9px] text-right mt-1">${message.time} ${isBot ? '✓✓' : ''}</p>
    </div>
  `;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function moveKanban(targetId, color) {
  const card = document.getElementById('card-lead');
  const target = document.getElementById(targetId);

  if (color === 'amber') {
    card.className = 'rounded-xl border p-3 bg-amber-500/10 border-amber-500/20 text-amber-400 transition-all duration-300 scale-95 opacity-0';
    document.getElementById('card-avatar').className = 'w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0';
  } else if (color === 'emerald') {
    card.className = 'rounded-xl border p-3 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 transition-all duration-300 scale-95 opacity-0';
    document.getElementById('card-avatar').className = 'w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0';
  }

  target.appendChild(card);
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
  }, 50);
}

function updateCalc() {
  const consultas = parseInt(document.getElementById('range-consultas').value, 10);
  const ticket = parseInt(document.getElementById('range-ticket').value, 10);

  document.getElementById('calc-val-consultas').textContent = consultas;
  document.getElementById('calc-val-ticket').textContent = `R$ ${ticket.toLocaleString('pt-BR')}`;

  const recovered = Math.round(consultas * 0.18);
  const monthly = recovered * ticket;
  const annual = monthly * 12;

  document.getElementById('calc-recovered').textContent = `${recovered} consultas`;
  document.getElementById('calc-monthly').textContent = `R$ ${monthly.toLocaleString('pt-BR')}`;
  document.getElementById('calc-annual').textContent = `R$ ${annual.toLocaleString('pt-BR')}`;
  document.getElementById('calc-badge-leads').textContent = `${recovered}/mês`;
  document.getElementById('calc-badge-monthly').textContent = `R$ ${monthly.toLocaleString('pt-BR')}`;

  const consultasPct = ((consultas - 50) / 450) * 100;
  const ticketPct = ((ticket - 150) / 1350) * 100;
  document.getElementById('range-consultas').style.setProperty('--progress', `${consultasPct}%`);
  document.getElementById('range-ticket').style.setProperty('--progress', `${ticketPct}%`);
}

document.getElementById('btn-run-sim').addEventListener('click', handleSimClick);
document.getElementById('range-consultas').addEventListener('input', updateCalc);
document.getElementById('range-ticket').addEventListener('input', updateCalc);
updateCalc();
