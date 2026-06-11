const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav a")];
const progressBar = document.querySelector("#progressBar");
const revealItems = [...document.querySelectorAll(".reveal")];
const presenterButton = document.querySelector("#presentMode");
const form = document.querySelector("#commitmentForm");
const promptText = document.querySelector("#promptText");
const copyPrompt = document.querySelector("#copyPrompt");

const storageKey = "daz-goal-2026-commitment";

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { threshold: [0.35, 0.55, 0.75] },
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

revealItems.forEach((item) => revealObserver.observe(item));

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.width = `${Math.min(progress * 100, 100)}%`;
}

function getFormData() {
  const data = new FormData(form);
  return {
    strength: data.get("strength")?.trim() || "",
    mission: data.get("mission")?.trim() || "",
    value: data.get("value")?.trim() || "",
  };
}

function renderPrompt() {
  const { strength, mission, value } = getFormData();
  promptText.textContent = `ช่วยฉันสรุป commitment สำหรับ DAZ Goal 2026 Workshop จากข้อมูลนี้:

My Strength:
${strength || "[ใส่จุดแข็ง]"}

My Mission:
${mission || "[ใส่ภารกิจ]"}

My Value to Telemedicine Team:
${value || "[ใส่คุณค่าต่อทีม]"}

บริบท:
DAZ ต้องการเป็น No.1 Telemedicine System สำหรับคลินิกเฉพาะทางในประเทศไทย เป้าหมายคือ 100 clinics ในปี 2026 และ 1,000 clinics ในปี 2027 ระบบต้องช่วย consult, follow-up, connected health data, clinic workflow และ revenue growth ทีมต้องใช้ AI เป็นคู่คิดเพื่อเพิ่มความเร็ว ความชัด และการพัฒนาต่อเนื่อง

ขอผลลัพธ์เป็น 3 ส่วน:
1. ประโยค commitment สั้นและชัด
2. 30-day experiment ที่ฉันทำได้จริง
3. workflow metric ที่ใช้วัดว่าฉันช่วย Telemedicine System ดีขึ้นจริง`;
}

function restoreForm() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    form.elements.strength.value = data.strength || "";
    form.elements.mission.value = data.mission || "";
    form.elements.value.value = data.value || "";
    renderPrompt();
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function getCurrentSectionIndex() {
  const middle = window.scrollY + window.innerHeight * 0.42;
  const index = sections.findIndex((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    return middle >= top && middle < bottom;
  });
  return index === -1 ? 0 : index;
}

function goToSection(direction) {
  const current = getCurrentSectionIndex();
  const next = Math.max(0, Math.min(sections.length - 1, current + direction));
  sections[next].scrollIntoView({ behavior: "smooth", block: "start" });
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

presenterButton?.addEventListener("click", () => {
  document.body.classList.toggle("presenter");
  presenterButton.textContent = document.body.classList.contains("presenter") ? "Exit" : "Presenter";
});

window.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("presenter")) return;
  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    goToSection(1);
  }
  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    goToSection(-1);
  }
});

form?.addEventListener("input", () => {
  renderPrompt();
  localStorage.setItem(storageKey, JSON.stringify(getFormData()));
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  localStorage.setItem(storageKey, JSON.stringify(getFormData()));
  const button = form.querySelector("button[type='submit']");
  const original = button.textContent;
  button.textContent = "Saved";
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
});

copyPrompt?.addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptText.textContent);
  const original = copyPrompt.textContent;
  copyPrompt.textContent = "Copied";
  setTimeout(() => {
    copyPrompt.textContent = original;
  }, 1200);
});

restoreForm();
