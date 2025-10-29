// Elements
const questionEl = document.getElementById('question');
const askBtn = document.getElementById('askBtn');
const voiceBtn = document.getElementById('voiceBtn');
const imageInput = document.getElementById('imageUpload');
const previewEl = document.getElementById('preview');
const answerEl = document.getElementById('answer');
const autoRead = document.getElementById('autoRead');
const langSelect = document.getElementById('langSelect');

// Image preview
imageInput.addEventListener('change', (e) => {
  previewEl.innerHTML = '';
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.createElement('img');
    img.src = reader.result;
    img.alt = 'Uploaded crop image preview';
    previewEl.appendChild(img);
  };
  reader.readAsDataURL(f);
});

// Speech-to-text (browser Web Speech API)
voiceBtn.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser. Use Chrome on desktop or Android.');
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = langSelect.value === 'hi' ? 'hi-IN' : 'en-IN';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.start();
  rec.onresult = (ev) => {
    const text = ev.results[0][0].transcript;
    questionEl.value = (questionEl.value ? questionEl.value + ' ' : '') + text;
  };
  rec.onerror = () => { alert('Voice recognition error. Try again.'); };
});

// Utility: speak text
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  if (!autoRead.checked) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langSelect.value === 'hi' ? 'hi-IN' : 'en-IN';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// Ask button — collects question and optional image, posts to /api/chat
askBtn.addEventListener('click', async () => {
  const question = questionEl.value.trim();
  const file = imageInput.files[0];

  if (!question && !file) {
    answerEl.textContent = 'Please type, speak, or upload an image.';
    return;
  }

  answerEl.textContent = 'Analyzing...';

  let base64Image = null;
  if (file) {
    base64Image = await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(file);
    });
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, image: base64Image, lang: langSelect.value })
    });

    if (!res.ok) {
      const txt = await res.text();
      answerEl.textContent = 'Server error. See console.';
      console.error('Server responded:', res.status, txt);
      return;
    }

    const data = await res.json();
    const reply = data.answer || 'No answer returned.';
    answerEl.innerHTML = '<strong>Assistant:</strong><div>' + reply + '</div>';
    speakText(reply);
  } catch (err) {
    console.error(err);
    answerEl.textContent = 'Network error. Try again.';
  }
});
