// ===== IMAGE PREVIEW =====
document.getElementById("imageUpload").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("preview").innerHTML =
        `<img src="${e.target.result}" alt="Crop image preview" style="max-width:200px;border-radius:8px;margin:10px;">`;
      document.getElementById("preview").dataset.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ===== VOICE TO TEXT =====
const questionBox = document.getElementById("question");
const voiceBtn = document.getElementById("voice-btn");

if (voiceBtn) {
  voiceBtn.addEventListener("click", () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser doesn’t support speech recognition.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = (event) => {
      questionBox.value = event.results[0][0].transcript;
    };

    recognition.onerror = (err) => {
      console.error("Voice error:", err);
      alert("Voice recognition failed. Try again.");
    };
  });
}

// ===== ASK BUTTON =====
document.getElementById("ask-btn").addEventListener("click", async function() {
  const question = questionBox.value.trim();
  const answerDiv = document.getElementById("answer");
  const image = document.getElementById("preview").dataset.image || null;

  if (!question && !image) {
    answerDiv.innerHTML = "<p>Please type or upload something first.</p>";
    return;
  }

  answerDiv.innerHTML = "<p>Thinking...</p>";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, image })
    });

    const data = await res.json();
    const answer = data.answer;

    answerDiv.innerHTML = `<p><strong>AI Suggestion:</strong> ${answer}</p>`;

    // ===== TEXT TO SPEECH =====
    const speech = new SpeechSynthesisUtterance(answer);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);

  } catch (err) {
    answerDiv.innerHTML = "<p>Error connecting to AI.</p>";
    console.error(err);
  }
});
