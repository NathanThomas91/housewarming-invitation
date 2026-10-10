const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwVNga_Xl2NeB1FuGFx_jP6JG-Ds9gcblsWQ-JLtC19lzu_xFuCytbx7ObqoyAMYU_x/exec';

const statusField = document.getElementById('status');
const paxArea = document.getElementById('paxArea');
const paxField = document.getElementById('pax');
const form = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');

let requestScript = null;
let requestTimeout = null;

statusField.addEventListener('change', () => {
  const attending = statusField.value === 'Yes';

  paxArea.hidden = !attending;
  paxField.required = attending;

  if (!attending) paxField.value = '';
});

window.handleRsvpResponse = function (result) {
  clearTimeout(requestTimeout);

  if (requestScript) {
    requestScript.remove();
    requestScript = null;
  }

  submitBtn.disabled = false;
  feedback.textContent = result.message ||
    'Your response could not be processed.';

  if (result.success) {
    form.reset();
    paxArea.hidden = true;
    paxField.required = false;
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (submitBtn.disabled) return;

  submitBtn.disabled = true;
  feedback.textContent = 'Submitting your response…';

  const params = new URLSearchParams({
    action: 'rsvp',
    callback: 'handleRsvpResponse',
    name: document.getElementById('name').value.trim(),
    status: statusField.value,
    pax: paxField.value,
    message: document.getElementById('messageBox').value.trim()
  });

  requestScript = document.createElement('script');
  requestScript.src = APPS_SCRIPT_URL + '?' + params.toString();

  requestScript.onerror = () => {
    clearTimeout(requestTimeout);
    submitBtn.disabled = false;
    feedback.textContent =
      'Connection failed. Please try again.';
    requestScript?.remove();
    requestScript = null;
  };

  requestTimeout = setTimeout(() => {
    submitBtn.disabled = false;
    feedback.textContent =
      'No response received. Check your tracker before retrying.';
    requestScript?.remove();
    requestScript = null;
  }, 20000);

  document.body.appendChild(requestScript);
});