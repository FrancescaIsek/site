const dialog = document.querySelector('.keepsake-dialog');
let selectedCard;
for (const card of document.querySelectorAll('.keepsake')) {
 card.addEventListener('click', () => {
  selectedCard = card;
  for (const kind of ['macbook','family','parent','afang']) dialog.classList.toggle('showing-' + kind, card.classList.contains(kind + '-card')); 
  const source = card.querySelector('img');
  const label = card.querySelector('span').textContent;
  const image = dialog.querySelector('img');
  image.src = source.src; image.alt = source.alt;
  dialog.querySelector('figcaption').textContent = label;
  dialog.setAttribute('aria-label', label);
  dialog.querySelector('button').setAttribute('aria-label', 'Close image');
  dialog.showModal();
 });
}
function closeCard() { dialog.close(); }
dialog.querySelector('button').addEventListener('click', closeCard);
dialog.addEventListener('click', e => { if(e.target === dialog) closeCard(); });
dialog.addEventListener('close', () => selectedCard?.focus({preventScroll:true}));
