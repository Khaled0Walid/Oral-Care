const chatThread = document.querySelector("#chatThread");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const quickReplies = document.querySelector(".quick-replies");
const seedAppointment = document.querySelector("#seedAppointment");
const resetDemo = document.querySelector("#resetDemo");

const dashboard = {
  patientName: document.querySelector("#patientName"),
  requestedTreatment: document.querySelector("#requestedTreatment"),
  bookingStatus: document.querySelector("#bookingStatus"),
  dashboardStatus: document.querySelector("#dashboardStatus"),
  leadScore: document.querySelector("#leadScore"),
  scoreRing: document.querySelector("#scoreRing"),
  scoreSummary: document.querySelector("#scoreSummary"),
  activityList: document.querySelector("#activityList")
};

const initialMessages = [
  {
    sender: "ai",
    text:
      "Hi, welcome to Oral Care. I can help with pricing, appointments, opening hours, insurance, emergencies, and directions. How can I help today?"
  },
  {
    sender: "patient",
    text: "Hi, I am interested in teeth whitening."
  },
  {
    sender: "ai",
    text:
      "Absolutely. Professional teeth whitening starts from \u20ac180 after a quick suitability check. Would you like me to find a consultation time for you?"
  }
];

const responseRules = [
  {
    id: "emergency",
    keywords: ["emergency", "pain", "swollen", "swelling", "bleeding", "broken", "toothache", "urgent"],
    treatment: "Emergency dental care",
    status: "Urgent handoff",
    badge: "Priority Lead",
    score: 96,
    className: "status-urgent",
    summary: "High urgency. The AI should collect symptoms and alert front desk staff immediately.",
    response:
      "I am sorry you are dealing with that. If you have severe swelling, uncontrolled bleeding, or trauma, please call emergency services. I can also alert Oral Care now and request the earliest urgent appointment. What symptoms are you having?"
  },
  {
    id: "appointment",
    keywords: ["appointment", "book", "booking", "schedule", "available", "tomorrow", "today", "slot"],
    treatment: "Appointment request",
    status: "Booking in progress",
    badge: "Booking Intent",
    score: 88,
    className: "status-pending",
    summary: "Strong booking intent. The AI is collecting timing preferences before confirming a slot.",
    response:
      "Yes, I can help with that. We have consultation availability tomorrow at 10:30 or 15:00. Which time works better for you?"
  },
  {
    id: "pricing",
    keywords: ["price", "pricing", "cost", "how much", "whitening", "cleaning", "implant", "invisalign"],
    treatment: "Treatment pricing",
    status: "Qualified inquiry",
    badge: "Qualified Lead",
    score: 76,
    className: "status-pending",
    summary: "Pricing intent detected. The patient is comparing treatment options and may convert with a consultation offer.",
    response:
      "Here are typical starting prices: hygiene cleaning from \u20ac75, whitening from \u20ac180, Invisalign consultations from \u20ac60, and implant consultations from \u20ac90. Final pricing depends on your examination. Would you like a consultation?"
  },
  {
    id: "hours",
    keywords: ["hours", "open", "opening", "saturday", "weekend", "closed", "time"],
    treatment: "Opening hours",
    status: "Information provided",
    badge: "Active Lead",
    score: 58,
    className: "status-pending",
    summary: "The patient is checking availability. The AI can nudge toward a convenient appointment time.",
    response:
      "Oral Care is open Monday to Friday, 8:30 to 18:00, and Saturday from 9:00 to 13:00. Would you prefer a weekday or Saturday appointment?"
  },
  {
    id: "insurance",
    keywords: ["insurance", "covered", "cover", "plan", "claim", "reimbursement"],
    treatment: "Insurance question",
    status: "Needs plan details",
    badge: "Insurance Inquiry",
    score: 64,
    className: "status-pending",
    summary: "Insurance question detected. The AI should collect provider details and pass them to reception.",
    response:
      "We work with many insurance plans and can provide treatment invoices for reimbursement. If you share your provider and plan type, the reception team can advise what documentation you may need."
  },
  {
    id: "location",
    keywords: ["where", "location", "address", "directions", "parking", "near"],
    treatment: "Clinic location",
    status: "Directions sent",
    badge: "Active Lead",
    score: 54,
    className: "status-pending",
    summary: "Location intent detected. The patient may be close to visiting or booking.",
    response:
      "Oral Care is at 24 Willow Street, near Central Station. There is paid parking on Willow Street and a public car park two minutes away. Would you like directions sent by SMS?"
  },
  {
    id: "confirmed",
    keywords: ["yes", "confirm", "10:30", "15:00", "works", "book it", "sounds good"],
    treatment: "Consultation appointment",
    status: "Booked",
    badge: "Booked",
    score: 94,
    className: "status-booked",
    summary: "Appointment confirmed. The lead is now ready for calendar and CRM sync.",
    response:
      "Great, I have reserved that consultation request for you. The Oral Care team will confirm by SMS shortly. Could you share your full name and phone number?"
  }
];

const suggestionSets = {
  initial: [
    { label: "Teeth Whitening", prompt: "How much is teeth whitening?" },
    { label: "Book Appointment", prompt: "Can I book an appointment tomorrow?" },
    { label: "Opening Hours", prompt: "Are you open on Saturday?" },
    { label: "Insurance", prompt: "Do you accept insurance?" },
    { label: "Emergency", prompt: "I have a dental emergency" }
  ],
  pricing: [
    { label: "Book Consultation", prompt: "Can I book an appointment for a consultation?" },
    { label: "Payment Options", prompt: "What are the payment options for the whitening cost?" },
    { label: "Teeth Cleaning", prompt: "How much is teeth cleaning?" }
  ],
  appointment: [
    { label: "Tomorrow", prompt: "Tomorrow at 10:30 works for me" },
    { label: "Next Week", prompt: "Can I book an appointment next week?" },
    { label: "Cancel", prompt: "I need to cancel an appointment" }
  ],
  hours: [
    { label: "Book Saturday", prompt: "Can I book an appointment on Saturday?" },
    { label: "Before Work", prompt: "Do you have an appointment before work?" },
    { label: "Location", prompt: "Where is the clinic located?" }
  ],
  insurance: [
    { label: "Provider Details", prompt: "I can share my insurance provider details" },
    { label: "Book Checkup", prompt: "Can I book an appointment for a checkup?" },
    { label: "Pricing", prompt: "How much is teeth cleaning?" }
  ],
  emergency: [
    { label: "Tooth Pain", prompt: "I have severe tooth pain" },
    { label: "Book Urgent Visit", prompt: "Can I book an emergency appointment today?" },
    { label: "Opening Hours", prompt: "Are you open today?" }
  ],
  location: [
    { label: "Parking", prompt: "Is there parking near the clinic?" },
    { label: "Book Appointment", prompt: "Can I book an appointment tomorrow?" },
    { label: "Opening Hours", prompt: "What are your opening hours?" }
  ],
  confirmed: [
    { label: "Share Phone", prompt: "My phone number is 555 0182" },
    { label: "Change Time", prompt: "Can I book next week instead?" },
    { label: "Insurance", prompt: "Do you accept insurance?" }
  ],
  fallback: [
    { label: "Pricing", prompt: "How much is teeth whitening?" },
    { label: "Appointment", prompt: "Can I book an appointment tomorrow?" },
    { label: "Emergency", prompt: "I have a dental emergency" }
  ]
};

function timeStamp() {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function addMessage(sender, text) {
  if (!chatThread) return;
  const group = document.createElement("div");
  group.className = `message-group ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  const stamp = document.createElement("span");
  stamp.className = "timestamp";
  stamp.textContent = timeStamp();

  group.append(bubble, stamp);
  chatThread.appendChild(group);
  chatThread.scrollTo({ top: chatThread.scrollHeight, behavior: "smooth" });
}

function showTyping() {
  if (!chatThread) return;
  const typing = document.createElement("div");
  typing.className = "typing-row";
  typing.id = "typingIndicator";
  typing.innerHTML = "<span></span><span></span><span></span>";
  chatThread.appendChild(typing);
  chatThread.scrollTo({ top: chatThread.scrollHeight, behavior: "smooth" });
}

function hideTyping() {
  document.querySelector("#typingIndicator")?.remove();
}

function renderSuggestions(suggestions) {
  if (!quickReplies) return;
  quickReplies.innerHTML = "";

  suggestions.forEach((suggestion, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.prompt = suggestion.prompt;
    button.textContent = suggestion.label;
    button.style.animationDelay = `${index * 45}ms`;
    quickReplies.appendChild(button);
  });
}

function suggestionsFor(rule) {
  return suggestionSets[rule.id] || suggestionSets.fallback;
}

function matchResponse(text) {
  const normalized = text.toLowerCase();
  return (
    responseRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword))) || {
      id: "fallback",
      treatment: "General inquiry",
      status: "Needs follow-up",
      badge: "New Lead",
      score: 46,
      className: "status-pending",
      summary: "General patient question. The AI can keep qualifying before handing off.",
      response:
        "I can help with that. Are you looking for pricing, an appointment, opening hours, insurance details, emergency care, or directions to the clinic?"
    }
  );
}

function updateDashboard(rule) {
  if (dashboard.requestedTreatment) dashboard.requestedTreatment.textContent = rule.treatment;
  if (dashboard.bookingStatus) dashboard.bookingStatus.textContent = rule.status;
  if (dashboard.dashboardStatus) {
    dashboard.dashboardStatus.textContent = rule.badge;
    dashboard.dashboardStatus.className = rule.className;
  }
  if (dashboard.leadScore) dashboard.leadScore.textContent = rule.score;
  if (dashboard.scoreRing) dashboard.scoreRing.style.setProperty("--score", rule.score);
  if (dashboard.scoreSummary) dashboard.scoreSummary.textContent = rule.summary;
  addActivity(`${rule.badge}: ${rule.treatment}`);
}

function addActivity(text) {
  if (!dashboard.activityList) return;
  const item = document.createElement("li");
  item.innerHTML = `<span></span>${text}`;
  dashboard.activityList.prepend(item);

  while (dashboard.activityList.children.length > 5) {
    dashboard.activityList.lastElementChild.remove();
  }
}

function handlePatientMessage(text) {
  const cleanText = text.trim();
  if (!cleanText) return;

  addMessage("patient", cleanText);
  if (messageInput) messageInput.value = "";

  const rule = matchResponse(cleanText);
  updateDashboard(rule);
  showTyping();

  const delay = Math.min(1400, 620 + rule.response.length * 8);
  window.setTimeout(() => {
    hideTyping();
    addMessage("ai", rule.response);
    renderSuggestions(suggestionsFor(rule));
  }, delay);
}

function resetConversation() {
  if (chatThread) chatThread.innerHTML = "";
  if (dashboard.patientName) dashboard.patientName.textContent = "Emma Carter";
  if (dashboard.requestedTreatment) dashboard.requestedTreatment.textContent = "General inquiry";
  if (dashboard.bookingStatus) dashboard.bookingStatus.textContent = "Not booked yet";
  if (dashboard.dashboardStatus) {
    dashboard.dashboardStatus.textContent = "New Lead";
    dashboard.dashboardStatus.className = "";
  }
  if (dashboard.leadScore) dashboard.leadScore.textContent = "38";
  if (dashboard.scoreRing) dashboard.scoreRing.style.setProperty("--score", 38);
  if (dashboard.scoreSummary) {
    dashboard.scoreSummary.textContent =
      "Waiting for intent. DentalFlow AI will qualify the patient as the conversation develops.";
  }
  if (dashboard.activityList) {
    dashboard.activityList.innerHTML =
      "<li><span></span>Conversation opened</li><li><span></span>Clinic knowledge base loaded</li><li><span></span>Ready to qualify patient</li>";
  }
  renderSuggestions(suggestionSets.initial);

  initialMessages.forEach((message, index) => {
    window.setTimeout(() => addMessage(message.sender, message.text), index * 360);
  });
}

// Global Event Handlers
if (messageForm) {
  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (messageInput) handlePatientMessage(messageInput.value);
  });
}

if (quickReplies) {
  quickReplies.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.classList.contains("is-removing")) return;

    const prompt = button.dataset.prompt;
    button.classList.add("is-removing");
    window.setTimeout(() => handlePatientMessage(prompt), 170);
  });
}

if (seedAppointment) {
  seedAppointment.addEventListener("click", () => {
    handlePatientMessage("Can I book an appointment tomorrow for teeth whitening?");
  });
}

if (resetDemo) {
  resetDemo.addEventListener("click", resetConversation);
}

// Floating Chat Widget Logic (homepage only)
const chatWidget = document.querySelector("#chatWidget");
const chatBubbleToggle = document.querySelector("#chatBubbleToggle");
const chatDrawer = document.querySelector("#chatDrawer");
const closeChatBtn = document.querySelector("#closeChatBtn");
const openChatButton = document.querySelector("#openChatButton");
const serviceCtas = document.querySelectorAll(".service-cta");

if (chatWidget && chatBubbleToggle && chatDrawer) {
  function toggleChatDrawer() {
    const isActive = chatDrawer.classList.toggle("is-active");
    chatDrawer.setAttribute("aria-hidden", !isActive);
    
    // Hide unread dot when chat is opened
    const unreadDot = chatBubbleToggle.querySelector(".bubble-unread-dot");
    if (unreadDot && isActive) {
      unreadDot.style.display = "none";
    }
  }

  chatBubbleToggle.addEventListener("click", toggleChatDrawer);

  if (closeChatBtn) {
    closeChatBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Avoid triggering toggle listener on bubble
      chatDrawer.classList.remove("is-active");
      chatDrawer.setAttribute("aria-hidden", "true");
    });
  }

  // Open chat from Hero CTA
  if (openChatButton) {
    openChatButton.addEventListener("click", () => {
      chatDrawer.classList.add("is-active");
      chatDrawer.setAttribute("aria-hidden", "false");
      if (messageInput) messageInput.focus();
    });
  }

  // Handle service CTAs
  serviceCtas.forEach(cta => {
    cta.addEventListener("click", () => {
      const action = cta.dataset.action;
      let promptText = "";
      if (action === "whitening") {
        promptText = "How much is teeth whitening?";
      } else if (action === "implants") {
        promptText = "Can I book a consultation for dental implants?";
      } else if (action === "invisalign") {
        promptText = "Do you do Invisalign and how much is it?";
      } else if (action === "emergency") {
        promptText = "I have a dental emergency";
      }

      if (promptText) {
        // Open the drawer
        chatDrawer.classList.add("is-active");
        chatDrawer.setAttribute("aria-hidden", "false");
        // Simulate sending this query
        handlePatientMessage(promptText);
      }
    });
  });
}

// Initialise Conversation
resetConversation();
