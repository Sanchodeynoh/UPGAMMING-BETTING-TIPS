// premium.js

const packageLabels = {
  starter: "Starter Pack — KES 500 (10+ Odds)",
  pro: "Pro Pack — KES 1,500 (20+ Odds)",
  elite: "Elite Pack — KES 2,500 (30+ Odds)"
};

let selectedPackage = null;

document.querySelectorAll(".package-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".package-card").forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    selectedPackage = card.dataset.package;
    document.getElementById("selectedPackageLabel").textContent = packageLabels[selectedPackage];
    document.getElementById("paymentSection").classList.add("visible");
    document.getElementById("paymentSection").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.getElementById("submitPaymentBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("submitMsg");
  msgEl.textContent = "";
  msgEl.className = "submit-msg";

  const name = document.getElementById("payerName").value.trim();
  const phone = document.getElementById("payerPhone").value.trim();
  const message = document.getElementById("paymentMessage").value.trim();

  if (!selectedPackage) {
    msgEl.textContent = "Please select a package first.";
    msgEl.classList.add("error");
    return;
  }
  if (!message) {
    msgEl.textContent = "Please paste your payment confirmation message.";
    msgEl.classList.add("error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/payment-inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: packageLabels[selectedPackage],
        name,
        phone,
        message
      })
    });

    const data = await res.json();

    if (!res.ok) {
      msgEl.textContent = data.error || "Something went wrong. Please try again.";
      msgEl.classList.add("error");
      return;
    }

    msgEl.textContent = "Thanks! We've received your payment details and will unlock your tips shortly.";
    msgEl.classList.add("success");
    document.getElementById("payerName").value = "";
    document.getElementById("payerPhone").value = "";
    document.getElementById("paymentMessage").value = "";
  } catch (err) {
    console.error(err);
    msgEl.textContent = "Could not connect to the backend. Please try again shortly.";
    msgEl.classList.add("error");
  }
});
