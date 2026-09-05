(function () {
  const log = document.getElementById("chat-log");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const hint = document.getElementById("chat-hint");
  const suggestions = document.getElementById("chat-suggestions");

  let history = [];
  let sending = false;

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = "msg " + (role === "user" ? "msg-user" : role === "error" ? "msg-error" : "msg-bot");
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement("div");
    div.className = "msg msg-bot msg-typing";
    div.textContent = "thinking...";
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  async function sendMessage(text) {
    if (sending || !text.trim()) return;
    sending = true;
    sendBtn.disabled = true;
    hint.textContent = "";

    addMessage("user", text);
    history.push({ role: "user", content: text });

    const typingEl = addTyping();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json().catch(() => ({}));
      typingEl.remove();

      if (!res.ok) {
        addMessage("error", data.error || "Something went wrong. Try again in a moment.");
        return;
      }

      addMessage("bot", data.reply);
      history.push({ role: "assistant", content: data.reply });
    } catch (err) {
      typingEl.remove();
      addMessage(
        "error",
        "Couldn't reach the AI backend. If you're viewing this locally, the chat only works once it's deployed to Vercel with an API key set."
      );
    } finally {
      sending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = "";
    sendMessage(text);
  });

  suggestions.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    sendMessage(btn.dataset.q);
  });
})();
