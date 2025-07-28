const feedbackForm = document.getElementById("feedback-form");
const loadingDots = document.getElementById("loading-dots");
const sendText = document.getElementById("send-text");

document.addEventListener("DOMContentLoaded", () => {
   const storedColorMode = window.localStorage.getItem("colormode");

   if (storedColorMode) {
      document.body.classList.add(storedColorMode);
   } else {
      document.body.classList.add("matrix");
   }
});

feedbackForm.addEventListener("submit", (e) => {
   e.preventDefault();
   sendText.classList.add("hidden");
   loadingDots.classList.remove("hidden");
   loadingDots.classList.add("flex");
   emailjs
      .sendForm("service_krg885k", "template_kiu2kib", feedbackForm, {
         publicKey: "kLT-SV_WOL0QSPbv8",
      })
      .then(
         () => {
            alert("Thanks! You're helping me improve the typing experience.");
            const inputs = feedbackForm.querySelectorAll("input, textarea");
            inputs.forEach((input) => (input.value = ""));
            sendText.classList.remove("hidden");
            loadingDots.classList.add("hidden");
            loadingDots.classList.remove("flex");
         },
         (error) => {
            alert("Feedback failed. Looks like a glitch — not your fault!");
            const inputs = feedbackForm.querySelectorAll("input, textarea");
            inputs.forEach((input) => (input.value = ""));
            sendText.classList.remove("hidden");
            loadingDots.classList.add("hidden");
            loadingDots.classList.remove("flex");
         }
      );
});
