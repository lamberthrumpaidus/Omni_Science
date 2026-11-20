const LAB_KEY = "omni-science-v3";
const LAB_LIMIT = 30;
let labHistory = [];
let labStars = [];
let labTerm = "";
let labTheme = localStorage.getItem(LAB_KEY + "-theme") || "dark";
const lab = {
  search: document.getElementById("lab-search"),
  history: document.getElementById("lab-history"),
  historyCount: document.getElementById("lab-history-count"),
  recent: document.getElementById("lab-recent"),
  export: document.getElementById("lab-export"),
  copy: document.getElementById("lab-copy"),
  favorite: document.getElementById("lab-favorite"),
  theme: document.getElementById("lab-theme"),
  status: document.getElementById("lab-status"),
  clear: document.getElementById("lab-clear"),
  reset: document.getElementById("lab-reset")
};
function labStorageRead(key, fallback) {
  try {
    const item = JSON.parse(localStorage.getItem(LAB_KEY + key));
    return Array.isArray(item) ? item : fallback;
  } catch {
    return fallback;
  }
}
function labStorageSave() {
  try {
    localStorage.setItem(LAB_KEY + "-history", JSON.stringify(labHistory));
    localStorage.setItem(LAB_KEY + "-stars", JSON.stringify(labStars));
  } catch {}
}
function labNotify(text, error = false) {
  lab.status.textContent = text;
  lab.status.dataset.error = String(error);
}
function labFingerprint() {
  return currentCategory + " :: " + currentFormula;
}
function labRenderHistory() {
  lab.history.replaceChildren();
  lab.historyCount.textContent = String(labHistory.length);
  lab.recent.textContent = labHistory.length ? labHistory[0].formula : "Belum ada";
  for (const item of labHistory.slice(0, LAB_LIMIT)) {
    const li = document.createElement("li");
    const name = document.createElement("strong");
    name.textContent = item.formula;
    const result = document.createElement("span");
    result.textContent = item.result;
    const date = document.createElement("time");
    date.textContent = new Date(item.time).toLocaleString("id-ID");
    const restore = document.createElement("button");
    restore.type = "button";
    restore.textContent = "Buka";
    restore.setAttribute("aria-label", "Buka " + item.formula);
    restore.addEventListener("click", () => labRestore(item));
    li.append(name, result, date, restore);
    lab.history.append(li);
  }
}
function labRestore(item) {
  const category = [...document.querySelectorAll(".cat-btn")].find(x => x.dataset.category === item.category);
  if (!category) return;
  category.click();
  DOM.subSelect.value = item.formula;
  DOM.subSelect.dispatchEvent(new Event("change", {bubbles:true}));
  for (const [key, val] of Object.entries(item.values)) {
    const input = document.getElementById(key);
    if (input) input.value = String(val);
  }
  DOM.output.textContent = item.result;
  labNotify("Perhitungan dipulihkan.");
  document.getElementById("workspace").scrollTop = 0;
}
function labFilterCategories() {
  const query = labTerm.trim().toLocaleLowerCase("id-ID");
  for (const button of document.querySelectorAll(".cat-btn")) {
    const category = button.dataset.category || button.textContent;
    const formulas = Object.keys(DB[category] || {});
    button.hidden = !!query && !category.toLocaleLowerCase("id-ID").includes(query) &&
      !formulas.some(form => form.toLocaleLowerCase("id-ID").includes(query));
  }
}
function labDecorate() {
  document.querySelectorAll(".cat-btn").forEach(button => {
    button.dataset.category = button.textContent.trim();
    button.setAttribute("aria-pressed", String(button.classList.contains("active")));
    button.title = button.textContent;
  });
  for (const group of DOM.dynamicForm.querySelectorAll(".input-group")) {
    const label = group.querySelector("label");
    const input = group.querySelector("input,select");
    if (!input) continue;
    if (label) label.htmlFor = input.id;
    input.setAttribute("autocomplete", "off");
    input.setAttribute("aria-required", "true");
    if (input.type === "number") input.inputMode = "decimal";
  }
  const isStar = labStars.includes(labFingerprint());
  lab.favorite.setAttribute("aria-pressed", String(isStar));
  lab.favorite.textContent = isStar ? "★ Tersimpan" : "☆ Favorit";
  DOM.output.setAttribute("role", "status");
  DOM.output.setAttribute("aria-live", "polite");
  DOM.btnCalc.type = "button";
  DOM.btnCalc.title = "Hitung (Ctrl + Enter)";
  labFilterCategories();
}
function labSetupObserver() {
  const observer = new MutationObserver(() => {
    if (lab._decorationPending) return;
    lab._decorationPending = true;
    queueMicrotask(() => {
      lab._decorationPending = false;
      labDecorate();
    });
  });
  observer.observe(DOM.sidebar, {subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  observer.observe(DOM.dynamicForm, {subtree:true,childList:true});
}
function labCalculate() {
  const definition = DB[currentCategory][currentFormula];
  const values = {};
  for (const field of definition.inputs) {
    const input = document.getElementById(field.id);
    const raw = input?.value?.trim() ?? "";
    if (raw === "") {
      input?.focus();
      labNotify("Semua input wajib diisi.", true);
      DOM.output.textContent = "ERROR: Input kosong";
      DOM.output.style.color = "#fb7287";
      return;
    }
    const parsed = field.t === "number" ? Number(raw) : raw;
    if (field.t === "number" && !Number.isFinite(parsed)) {
      input.focus();
      labNotify("Gunakan angka yang valid.", true);
      return;
    }
    values[field.id] = parsed;
  }
  const started = performance.now();
  try {
    const result = definition.calc(values);
    const printed = String(result);
    if (!printed || printed === "undefined" || printed === "NaN" || printed === "Infinity" || printed === "-Infinity" || /^(error|fatal error)/i.test(printed)) {
      throw new Error(printed || "Hasil tidak valid");
    }
    DOM.output.textContent = printed;
    DOM.output.style.color = "#47f0ca";
    labNotify("Selesai • " + Math.round(performance.now() - started) + " ms");
    labHistory.unshift({category:currentCategory, formula:currentFormula, values, result:printed, time:new Date().toISOString()});
    labHistory = labHistory.slice(0, LAB_LIMIT);
    labStorageSave();
    labRenderHistory();
  } catch (e) {
    DOM.output.textContent = "ERROR: " + (e?.message || "Perhitungan gagal");
    DOM.output.style.color = "#fb7287";
    labNotify("Periksa rumus dan input Anda.", true);
  }
}
function labCopy() {
  const value = DOM.output.textContent.trim();
  if (!value || value.includes("MENUNGGU INPUT")) return labNotify("Belum ada hasil untuk disalin.", true);
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(value).then(() => labNotify("Hasil disalin."), () => labNotify("Clipboard tidak tersedia.", true));
  } else {
    labNotify("Clipboard membutuhkan HTTPS.", true);
  }
}
function labDownload() {
  if (!labHistory.length) return labNotify("Riwayat masih kosong.", true);
  const rows = [["Waktu","Kategori","Rumus","Input","Hasil"], ...labHistory.map(x => [x.time,x.category,x.formula,JSON.stringify(x.values),x.result])];
  const csv = rows.map(row => row.map(x => '"' + String(x).replaceAll('"','""') + '"').join(",")).join("\r\n");
  const link = document.createElement("a");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], {type:"text/csv;charset=utf-8"}));
  link.href = url;
  link.download = "omni-science-history.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 250);
  labNotify("CSV berhasil dibuat.");
}
function labInit() {
  labHistory = labStorageRead("-history", []).slice(0, LAB_LIMIT).filter(x=>x&&x.category&&x.formula&&x.values);
  labStars = labStorageRead("-stars", []).filter(x=>typeof x==="string");
  document.documentElement.dataset.labTheme = labTheme;
  lab.theme.textContent = labTheme === "light" ? "☀ Terang" : "☾ Gelap";
  labRenderHistory();
  labDecorate();
  labSetupObserver();
  DOM.btnCalc.removeEventListener("click", executeCalculation);
  DOM.btnCalc.addEventListener("click", labCalculate);
  lab.search.addEventListener("input", e => { labTerm = e.target.value; labFilterCategories(); });
  lab.copy.addEventListener("click", labCopy);
  lab.export.addEventListener("click", labDownload);
  lab.clear.addEventListener("click", () => { DOM.dynamicForm.querySelectorAll("input").forEach(x=>x.value=""); DOM.output.textContent="MENUNGGU INPUT..."; labNotify("Input dibersihkan."); });
  lab.reset.addEventListener("click", () => { if (!confirm("Hapus seluruh riwayat komputasi?")) return; labHistory=[];labStorageSave();labRenderHistory();labNotify("Riwayat dihapus."); });
  lab.favorite.addEventListener("click", () => {const key=labFingerprint();labStars=labStars.includes(key)?labStars.filter(x=>x!==key):[...labStars,key];labStorageSave();labDecorate(); });
  lab.theme.addEventListener("click", () => { labTheme = labTheme === "light" ? "dark" : "light";localStorage.setItem(LAB_KEY + "-theme", labTheme);document.documentElement.dataset.labTheme=labTheme;lab.theme.textContent=labTheme === "light" ? "☀ Terang" : "☾ Gelap";});
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey||e.metaKey) && e.key === "Enter"){e.preventDefault();labCalculate();}
    if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === "k"){e.preventDefault();lab.search.focus();}
    if (e.key === "Escape" && document.activeElement === lab.search){lab.search.value="";labTerm="";labFilterCategories();}
  });
  DOM.dynamicForm.addEventListener("keydown", e => {if(e.key==="Enter"&&!e.shiftKey&&e.target.tagName!=="BUTTON"){e.preventDefault();labCalculate();}});
  labNotify("Lab siap. Ctrl + K untuk mencari rumus.");
}
window.addEventListener("DOMContentLoaded", () => setTimeout(labInit,0));
