(() => {
  "use strict";

  const STORAGE_KEY = "pillmate-demo-medications-v1";
  const palette = ["mint", "lavender", "orange", "blue"];
  let medications = loadMedications();
  let activeView = "overview";
  let toastTimer;

  const $ = (id) => document.getElementById(id);
  const views = {
    overview: $("overviewView"),
    medications: $("medicationsView"),
    schedule: $("scheduleView"),
    settings: $("settingsView")
  };

  function loadMedications() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveMedications() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
    } catch (error) {
      showToast("Could not save in this browser. Try another browser or device.");
    }
  }

  function todayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function formatTime(value) {
    if (!value) return "Time not set";
    const [hours, minutes] = value.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }

  function formatDate(date) {
    return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function medColor(med, index) {
    return palette[(Number.isFinite(med.colorIndex) ? med.colorIndex : index) % palette.length];
  }

  function symbolClass(color) {
    return color === "mint" ? "" : color;
  }

  function getDosesForToday() {
    return medications.map((med) => ({
      ...med,
      isTaken: med.takenOn === todayKey()
    })).sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setView(viewName) {
    if (!views[viewName]) return;
    activeView = viewName;
    Object.entries(views).forEach(([name, element]) => element.classList.toggle("hidden", name !== viewName));
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
    const labels = { overview: "Overview", medications: "My medications", schedule: "Daily schedule", settings: "Settings" };
    $("breadcrumbCurrent").textContent = labels[viewName];
    $("sidebar").classList.remove("open");
    if (viewName === "medications") renderMedications();
    if (viewName === "schedule") renderSchedule();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openModal(med = null) {
    $("medicationForm").reset();
    $("medId").value = med ? med.id : "";
    $("medName").value = med ? med.name : "";
    $("medDose").value = med ? med.dose : "";
    $("medTime").value = med ? med.time : "09:00";
    $("medNotes").value = med ? med.notes : "";
    $("modalTitle").textContent = med ? "Edit medication" : "Add medication";
    const submit = $("medicationForm").querySelector('button[type="submit"]');
    submit.innerHTML = med ? "Save changes" : '<span class="plus">＋</span> Save medication';
    $("medicationModal").classList.remove("hidden");
    setTimeout(() => $("medName").focus(), 50);
  }

  function closeModal() {
    $("medicationModal").classList.add("hidden");
  }

  function renderScheduleItem(med, index, full = false) {
    const color = medColor(med, index);
    const taken = med.takenOn === todayKey();
    return `<div class="schedule-item">
      <div class="time-block">${escapeHTML(formatTime(med.time))}</div>
      <div class="time-line"></div>
      <div class="med-symbol ${symbolClass(color)}" aria-hidden="true">${color === "orange" ? "✚" : color === "lavender" ? "✧" : color === "blue" ? "◈" : "✚"}</div>
      <div class="schedule-copy"><strong>${escapeHTML(med.name)}</strong><span>${escapeHTML(med.dose || "Dose not specified")}${med.notes ? " · " + escapeHTML(med.notes) : ""}</span></div>
      <button class="taken-button ${taken ? "taken" : ""}" data-action="toggle-taken" data-id="${escapeHTML(med.id)}" aria-pressed="${taken}">${taken ? "✓ Taken" : "Mark taken"}</button>
    </div>`;
  }

  function renderMedRow(med, index, compact = false) {
    const color = medColor(med, index);
    const symbol = color === "orange" ? "✚" : color === "lavender" ? "✧" : color === "blue" ? "◈" : "✚";
    if (compact) {
      return `<div class="med-row"><div class="med-symbol ${symbolClass(color)}" aria-hidden="true">${symbol}</div><div class="med-copy"><strong>${escapeHTML(med.name)}</strong><span>${escapeHTML(med.dose || "Dose not specified")}</span></div><div class="med-meta">${escapeHTML(formatTime(med.time))}</div></div>`;
    }
    return `<div class="all-med-row"><div class="med-symbol ${symbolClass(color)}" aria-hidden="true">${symbol}</div><div class="med-copy"><strong>${escapeHTML(med.name)}</strong><span>${escapeHTML(med.dose || "Dose not specified")} · ${escapeHTML(formatTime(med.time))}</span><div class="med-details">${med.notes ? escapeHTML(med.notes) : "No personal note added."}</div></div><div class="row-actions"><button class="small-action" data-action="edit" data-id="${escapeHTML(med.id)}">Edit</button><button class="small-action delete" data-action="delete" data-id="${escapeHTML(med.id)}">Delete</button></div></div>`;
  }

  function renderOverview() {
    const doses = getDosesForToday();
    const taken = doses.filter((med) => med.isTaken).length;
    $("totalMeds").textContent = medications.length;
    $("todayDoses").textContent = doses.length;
    $("takenDoses").textContent = taken;
    $("takenPercent").textContent = ` / ${doses.length}`;
    $("progressBar").style.width = doses.length ? `${(taken / doses.length) * 100}%` : "0%";
    $("navMedCount").textContent = medications.length;
    $("dateLabel").textContent = new Date().toLocaleDateString(undefined, { weekday: "long" }).toUpperCase() + " CHECK-IN";
    $("shortDate").textContent = formatDate(new Date());
    $("todaySchedule").innerHTML = doses.length
      ? doses.slice(0, 4).map((med, i) => renderScheduleItem(med, i)).join("")
      : emptyMarkup("No reminders yet", "Add a medication to start building your daily schedule.");
    $("recentMedications").innerHTML = medications.length
      ? medications.slice().sort((a, b) => (a.time || "").localeCompare(b.time || "")).slice(0, 4).map((med, i) => renderMedRow(med, i, true)).join("")
      : emptyMarkup("Your list is ready", "Add your first medication to see it here.");
  }

  function emptyMarkup(title, description) {
    return `<div class="empty-state"><div class="empty-illustration">✦</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(description)}</p></div>`;
  }

  function renderMedications() {
    const query = $("medSearch").value.trim().toLowerCase();
    const filtered = medications.filter((med) => `${med.name} ${med.dose || ""} ${med.notes || ""}`.toLowerCase().includes(query));
    $("medResultCount").textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`;
    $("allMedications").innerHTML = filtered.length ? filtered.map((med, i) => renderMedRow(med, i)).join("") : "";
    $("emptySearch").classList.toggle("hidden", filtered.length > 0);
    if (!medications.length && !query) {
      $("allMedications").innerHTML = emptyMarkup("Nothing here yet", "Add a medication to create your personal list.");
      $("emptySearch").classList.add("hidden");
    }
  }

  function renderSchedule() {
    const doses = getDosesForToday();
    $("scheduleDateTitle").textContent = "Today, " + new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" });
    $("scheduleDateSub").textContent = formatDate(new Date()) + " · " + doses.length + (doses.length === 1 ? " reminder" : " reminders");
    $("fullSchedule").innerHTML = doses.length
      ? doses.map((med, i) => renderScheduleItem(med, i, true)).join("")
      : emptyMarkup("A clear day starts here", "Add a medication and its reminder time to see your schedule.");
  }

  function renderAll() {
    renderOverview();
    if (activeView === "medications") renderMedications();
    if (activeView === "schedule") renderSchedule();
  }

  function findMedication(id) {
    return medications.find((med) => med.id === id);
  }

  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  ["addMedicationTop", "addMedicationMini", "addMedicationPage", "addMedicationSchedule"].forEach((id) => $(id).addEventListener("click", () => openModal()));
  $("manageMedsButton").addEventListener("click", () => setView("medications"));
  $("allScheduleButton").addEventListener("click", () => setView("schedule"));
  $("viewScheduleButton").addEventListener("click", () => setView("schedule"));
  $("closeModal").addEventListener("click", closeModal);
  $("cancelModal").addEventListener("click", closeModal);
  $("medicationModal").addEventListener("click", (event) => {
    if (event.target === $("medicationModal")) closeModal();
  });
  $("medSearch").addEventListener("input", renderMedications);
  $("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));

  $("medicationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("medName").value.trim();
    if (!name) {
      $("medName").focus();
      return;
    }
    const existingId = $("medId").value;
    const existing = existingId ? findMedication(existingId) : null;
    const med = {
      id: existingId || (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)),
      name,
      dose: $("medDose").value.trim(),
      time: $("medTime").value,
      notes: $("medNotes").value.trim(),
      colorIndex: existing ? existing.colorIndex : medications.length % palette.length,
      takenOn: existing ? existing.takenOn : ""
    };
    if (existing) {
      medications = medications.map((item) => item.id === existingId ? med : item);
      showToast("Medication details updated.");
    } else {
      medications.push(med);
      showToast("Medication added to your list.");
    }
    saveMedications();
    closeModal();
    renderAll();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    const med = findMedication(id);
    if (!med) return;
    if (action === "edit") openModal(med);
    if (action === "delete") {
      if (window.confirm(`Delete "${med.name}" from your demo list?`)) {
        medications = medications.filter((item) => item.id !== id);
        saveMedications();
        renderAll();
        showToast("Medication deleted.");
      }
    }
    if (action === "toggle-taken") {
      med.takenOn = med.takenOn === todayKey() ? "" : todayKey();
      saveMedications();
      renderAll();
      showToast(med.takenOn === todayKey() ? "Marked as taken for today." : "Marked as not taken.");
    }
  });

  $("helpButton").addEventListener("click", () => $("helpModal").classList.remove("hidden"));
  $("closeHelp").addEventListener("click", () => $("helpModal").classList.add("hidden"));
  $("gotItButton").addEventListener("click", () => $("helpModal").classList.add("hidden"));
  $("helpModal").addEventListener("click", (event) => {
    if (event.target === $("helpModal")) $("helpModal").classList.add("hidden");
  });

  $("resetDataButton").addEventListener("click", () => {
    if (window.confirm("Remove all medication entries saved in this browser? This cannot be undone.")) {
      medications = [];
      saveMedications();
      renderAll();
      showToast("Demo data reset.");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      $("helpModal").classList.add("hidden");
      $("sidebar").classList.remove("open");
    }
  });

  renderAll();
})();