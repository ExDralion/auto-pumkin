/*
 * Rscripts Pumpkin Detector — finds hidden Halloween pumpkins and highlights them.
 *
 * What all pumpkins share (from the site's own PumpkinButton component):
 *   <button type="button" aria-label="Something is hiding here"
 *           class="pumpkin-module__<hash>__pumpkin ...">
 * The CSS-module hash can change between site builds, so we match on the stable
 * aria-label OR any class containing "__pumpkin" (but not the card/segment classes).
 *
 * Auto-tour (v1.1): walks through every spot with a fixed URL, scrolls to the
 * pumpkin and focuses it, so a single Enter press (a real user action) claims it,
 * then moves on to the next spot. No synthetic clicks, no network requests.
 */
(() => {
  "use strict";
  if (window.__rsPumpkinDetector) return;
  window.__rsPumpkinDetector = true;

  const LABEL = "Something is hiding here";
  const FOUND_EVENT = "rscripts:halloween-found";
  const MARK = "rspd-marked";
  const tracked = new Set();
  let badge = null;
  let toastShownFor = new WeakSet();

  function isPumpkinClass(el) {
    const cls = typeof el.className === "string" ? el.className : el.getAttribute?.("class") || "";
    return /pumpkin-module__[^\s]*__pumpkin(\s|$)/.test(cls);
  }

  function isPumpkin(el) {
    if (!el || el.tagName !== "BUTTON") return false;
    return el.getAttribute("aria-label") === LABEL || isPumpkinClass(el);
  }

  function findPumpkins(root = document) {
    const set = new Set();
    root.querySelectorAll(`button[aria-label="${LABEL}"]`).forEach((b) => set.add(b));
    root.querySelectorAll('button[class*="pumpkin-module__"]').forEach((b) => {
      if (isPumpkinClass(b)) set.add(b);
    });
    return [...set].filter((b) => b.isConnected && !b.closest("[hidden]") && !b.closest("template"));
  }

  function ensureBadge() {
    if (badge && badge.isConnected) return badge;
    badge = document.createElement("button");
    badge.type = "button";
    badge.className = "rspd-badge";
    badge.addEventListener("click", () => focusPumpkin(0));
    document.body.appendChild(badge);
    return badge;
  }

  function updateBadge() {
    const list = [...tracked].filter((b) => b.isConnected);
    tracked.clear();
    list.forEach((b) => tracked.add(b));
    if (!list.length) {
      if (badge) badge.remove();
      badge = null;
      return;
    }
    const b = ensureBadge();
    b.textContent = `🎃 Тыква на странице! Показать${list.length > 1 ? ` (${list.length})` : ""}`;
  }

  function focusPumpkin(index) {
    const list = [...tracked].filter((b) => b.isConnected);
    const el = list[index];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    el.classList.remove("rspd-pulse");
    void el.offsetWidth;
    el.classList.add("rspd-pulse");
    setTimeout(() => { try { el.focus({ preventScroll: true }); } catch {} }, 600);
    showToast("Жми Enter (или кликни по подсвеченной тыкве)");
  }

  function showToast(text) {
    const t = document.createElement("div");
    t.className = "rspd-toast";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  function mark(el) {
    if (tracked.has(el)) return;
    tracked.add(el);
    el.classList.add(MARK);
    if (!toastShownFor.has(el)) {
      toastShownFor.add(el);
      showToast("🎃 Найдена тыква на этой странице");
    }
    try {
      chrome.storage.local.get("rspd", (d) => {
        const s = (d && d.rspd) || {};
        s.lastSeen = { path: location.pathname, at: Date.now() };
        chrome.storage.local.set({ rspd: s });
      });
    } catch {}
  }

  function scan() {
    findPumpkins().forEach(mark);
    updateBadge();
  }

  let timer = 0;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(scan, 150);
  };

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "aria-label", "hidden"]
  });

  // Progress: the site fires this event after a successful claim.
  window.addEventListener(FOUND_EVENT, (e) => {
    const found = e && e.detail && e.detail.found;
    try {
      chrome.storage.local.get("rspd", (d) => {
        const s = (d && d.rspd) || {};
        if (typeof found === "number") s.found = found;
        s.claimedPaths = Array.from(new Set([...(s.claimedPaths || []), location.pathname]));
        chrome.storage.local.set({ rspd: s });
      });
    } catch {}
    showToast(typeof found === "number" ? `🎃 Засчитано! Найдено: ${found} из 10` : "🎃 Засчитано!");
    setTimeout(scan, 800);
  });

  // ---------- Auto-tour ----------
  const here = rspdPath(location.href);
  const tourIndex = TOUR.findIndex((t) => rspdPath(t.url) === here);
  let tourHandled = false;

  function getState(cb) {
    try { chrome.storage.local.get("rspd", (d) => cb((d && d.rspd) || {})); } catch { cb({}); }
  }
  function setState(s, cb) {
    try { chrome.storage.local.set({ rspd: s }, cb); } catch { cb && cb(); }
  }

  function goNext(s, reason) {
    const claimed = new Set((s.claimedPaths || []).map((p) => p.replace(/\/$/, "") || "/"));
    const skipped = new Set((s.tour && s.tour.skipped) || []);
    if (reason === "skip") skipped.add(here);
    const next = TOUR.find((t) => {
      const p = rspdPath(t.url);
      return p !== here && !claimed.has(p) && !skipped.has(p);
    });
    if (!next) {
      s.tour = { active: false };
      setState(s, () => {
        const manual = SPOTS.filter((x) => !x.url).map((x) => x.id).join(", ");
        showToast(`🎃 Авто-обход завершён. Вручную остались: ${manual}`);
      });
      return;
    }
    s.tour = { active: true, skipped: [...skipped] };
    setState(s, () => {
      showToast(reason === "skip" ? "Тыквы тут нет — иду дальше…" : "➡️ Следующая точка…");
      setTimeout(() => { location.href = next.url; }, 900);
    });
  }

  function runTour() {
    getState((s) => {
      if (!s.tour || !s.tour.active || tourIndex < 0) return;
      const claimed = new Set((s.claimedPaths || []).map((p) => p.replace(/\/$/, "") || "/"));
      if (claimed.has(here)) return goNext(s, "done");
      const started = Date.now();
      const waitForPumpkin = setInterval(() => {
        scan();
        if (tracked.size) {
          clearInterval(waitForPumpkin);
          setTimeout(() => focusPumpkin(0), 400);
        } else if (Date.now() - started > 10000) {
          clearInterval(waitForPumpkin);
          getState((s2) => goNext(s2, "skip"));
        }
      }, 500);
    });
  }

  window.addEventListener(FOUND_EVENT, () => {
    if (tourHandled) return;
    tourHandled = true;
    setTimeout(() => getState((s) => { if (s.tour && s.tour.active) goNext(s, "done"); }), 1500);
  });

  // Esc stops the tour.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    getState((s) => {
      if (!s.tour || !s.tour.active) return;
      s.tour = { active: false };
      setState(s, () => showToast("Авто-обход остановлен"));
    });
  });

  scan();
  runTour();
  setInterval(scan, 2500);
})();