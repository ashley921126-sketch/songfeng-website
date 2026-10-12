const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', (event) => { if (event.target.closest('a,button')) closeMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
  const dialog = document.getElementById(button.dataset.open);
  dialog.showModal();
  document.body.classList.add('dialog-open');
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
});
const checkin = document.querySelector('#checkin');
const checkout = document.querySelector('#checkout');
const form = document.querySelector('#inquiry-form');
const result = document.querySelector('#inquiry-result');
const message = document.querySelector('#message');
const error = document.querySelector('#form-error');
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
function nextDay(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return date.toISOString().slice(0, 10);
}
checkin.min = today;
checkout.min = nextDay(today);
function invalidateMessage() { result.hidden = true; error.textContent = ''; document.querySelector('#copy-status').textContent = ''; }
form.addEventListener('input', invalidateMessage);
form.addEventListener('change', invalidateMessage);
checkin.addEventListener('change', () => { checkout.min = nextDay(checkin.value || today); });
document.querySelectorAll('[data-room]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#room').value = link.dataset.room;
  invalidateMessage();
}));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!checkin.value || !checkout.value || checkin.value < today || checkout.value <= checkin.value) {
    error.textContent = '請選擇有效的入住日期，退房日期須晚於入住日期。';
    result.hidden = true;
    return;
  }
  const nights = Math.round((Date.parse(checkout.value) - Date.parse(checkin.value)) / 86400000);
  const notes = document.querySelector('#notes').value.trim();
  message.value = `阿彬您好，我想詢問松風民宿的空房：\n入住日期：${checkin.value}\n退房日期：${checkout.value}（${nights} 晚）\n入住人數：${document.querySelector('#guests').value} 位\n房型：${document.querySelector('#room').value}${notes ? '\n其他需求：' + notes : ''}\n請問這段時間有合適的房型嗎？謝謝！`;
  error.textContent = '';
  result.hidden = false;
  document.querySelector('#copy-status').textContent = '詢問文字已產生，尚未送出。';
  message.focus();
});
document.querySelector('#copy-message').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(message.value);
    status.textContent = '已複製。您可以貼到與松風的對話中；本頁未送出訊息。';
  } catch {
    message.focus(); message.select();
    status.textContent = '請長按選取文字，或按 Ctrl+C（Mac：⌘C）複製。';
  }
});
