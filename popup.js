


chrome.storage.local.get("rspd", (d) => {
  const s = (d && d.rspd) || {};
  const claimed = new Set((s.claimedPaths || []).map((p) => p.replace(/\/$/, "") || "/"));
  document.getElementById("stat").textContent =
    typeof s.found === "number" ? `Найдено: ${s.found} из ${SPOTS.length}` : `Найдено: — из ${SPOTS.length} (обновится после первой тыквы)`;

  const list = document.getElementById("list");
  for (const spot of SPOTS) {
    const li = document.createElement("li");
    const done = spot.url && claimed.has(rspdPath(spot.url));
    const title = document.createElement(spot.url ? "a" : "span");
    title.textContent = (done ? "✓ " : "") + spot.id;
    if (done) title.className = "done";
    if (spot.url) {
      title.href = spot.url;
      title.addEventListener("click", (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: spot.url });
      });
    }
    const where = document.createElement("div");
    where.className = "where";
    where.textContent = spot.where;
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = spot.hint;
    li.append(title, where, hint);
    list.appendChild(li);
  }
});
document.getElementById("tour").addEventListener("click", () => {
  chrome.storage.local.get("rspd", (d) => {
    const s = (d && d.rspd) || {};
    const claimed = new Set((s.claimedPaths || []).map((p) => p.replace(/\/$/, "") || "/"));
    const next = TOUR.find((t) => !claimed.has(rspdPath(t.url)));
    if (!next) {
      document.getElementById("stat").textContent = "Все автоматические точки уже собраны ✓";
      return;
    }
    s.tour = { active: true, skipped: [] };
    chrome.storage.local.set({ rspd: s }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (tab && /^https:\/\/(www\.)?rscripts\.net\//.test(tab.url || "")) chrome.tabs.update(tab.id, { url: next.url });
        else chrome.tabs.create({ url: next.url });
        window.close();
      });
    });
  });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.storage.local.get("rspd", (d) => {
    const s = (d && d.rspd) || {};
    s.tour = { active: false };
    chrome.storage.local.set({ rspd: s }, () => window.close());
  });
});
