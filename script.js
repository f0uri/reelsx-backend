const API_BASE = "";

function nativeDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const clockTimeEl = document.getElementById("clockTime");
const clockDateEl = document.getElementById("clockDate");
const arDays = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const arMonths = ["يناير","فبراير","مارس","أبريل","ماي","يونيو","يوليوز","غشت","شتنبر","أكتوبر","نونبر","دجنبر"];

function tickClock(){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  clockTimeEl.textContent = `${hh}:${mm}:${ss}`;
  clockDateEl.textContent = `${arDays[now.getDay()]}، ${now.getDate()} ${arMonths[now.getMonth()]}`;
}
tickClock();
setInterval(tickClock, 1000);

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

function setBusy(button, busy) {
  button.disabled = busy;
  button.querySelector(".btn-label").classList.toggle("hidden", busy);
  button.querySelector(".btn-spinner").classList.toggle("hidden", !busy);
}

function setStatus(el, text, kind) {
  el.textContent = text;
  el.className = "status-line" + (kind ? ` ${kind}` : "");
}

function formatCount(n) {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

const reelUrlInput = document.getElementById("reelUrl");
const fetchReelBtn = document.getElementById("fetchReelBtn");
const reelStatus = document.getElementById("reelStatus");
const reelPreview = document.getElementById("reelPreview");
const reelThumb = document.getElementById("reelThumb");
const reelUsername = document.getElementById("reelUsername");
const reelCaption = document.getElementById("reelCaption");
const downloadReelBtn = document.getElementById("downloadReelBtn");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");

let currentVideoUrl = null;

fetchReelBtn.addEventListener("click", async () => {
  const url = reelUrlInput.value.trim();
  if (!url) { setStatus(reelStatus, "❌ ضع الرابط أولاً", "error"); return; }

  setBusy(fetchReelBtn, true);
  setStatus(reelStatus, "⏳ جاري استخراج الفيديو...", "");
  reelPreview.classList.add("hidden");
  progressWrap.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/api/reel?postUrl=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (!data.success || !data.data?.videoUrl) {
      setStatus(reelStatus, `❌ ${data.error || "لم يتم العثور على الفيديو"}`, "error");
      return;
    }

    currentVideoUrl = data.data.videoUrl;
    reelThumb.src = data.data.thumbnail || "";
    reelUsername.textContent = data.data.username ? `@${data.data.username}` : "@—";
    reelCaption.textContent = data.data.caption || "";

    reelPreview.classList.remove("hidden");
    setStatus(reelStatus, "✅ تم العثور على الفيديو", "success");
    saveHistory(url);
  } catch (e) {
    setStatus(reelStatus, `❌ خطأ: ${e.message}`, "error");
  } finally {
    setBusy(fetchReelBtn, false);
  }
});

downloadReelBtn.addEventListener("click", () => {
  if (!currentVideoUrl) return;
  progressWrap.classList.remove("hidden");
  progressBar.style.width = "100%";
  progressLabel.textContent = "جاري بدء التحميل...";
  nativeDownload(currentVideoUrl, `reel_${Date.now()}.mp4`);
});

function saveHistory(url) {
  const list = JSON.parse(localStorage.getItem("history") || "[]");
  if (list[0] !== url) list.unshift(url);
  localStorage.setItem("history", JSON.stringify(list.slice(0, 10)));
  loadHistory();
}
function loadHistory() {
  const box = document.getElementById("history");
  box.innerHTML = "";
  JSON.parse(localStorage.getItem("history") || "[]").forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    box.appendChild(li);
  });
}
loadHistory();

const usernameInput = document.getElementById("usernameInput");
const fetchProfileBtn = document.getElementById("fetchProfileBtn");
const profileStatus = document.getElementById("profileStatus");
const profileCard = document.getElementById("profileCard");
const profileAvatar = document.getElementById("profileAvatar");
const profileFullName = document.getElementById("profileFullName");
const profileUsername = document.getElementById("profileUsername");
const verifiedBadge = document.getElementById("verifiedBadge");
const profileBio = document.getElementById("profileBio");
const statPosts = document.getElementById("statPosts");
const statFollowers = document.getElementById("statFollowers");
const statFollowing = document.getElementById("statFollowing");
const downloadAvatarBtn = document.getElementById("downloadAvatarBtn");

let currentAvatarUrl = null;
let currentUsername = null;

fetchProfileBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim().replace(/^@/, "");
  if (!username) { setStatus(profileStatus, "❌ ضع اسم المستخدم", "error"); return; }

  setBusy(fetchProfileBtn, true);
  setStatus(profileStatus, "⏳ جاري البحث...", "");
  profileCard.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/api/profile?username=${encodeURIComponent(username)}`);
    const data = await res.json();

    if (!data.success) {
      setStatus(profileStatus, `❌ ${data.error || "الحساب غير موجود"}`, "error");
      return;
    }

    const u = data.data;
    currentAvatarUrl = u.avatar;
    currentUsername = u.username;

    profileAvatar.src = u.avatar || "";
    profileFullName.textContent = u.fullName || u.username;
    profileUsername.textContent = `@${u.username}`;
    verifiedBadge.classList.toggle("hidden", !u.isVerified);
    profileBio.textContent = u.bio || "";
    statPosts.textContent = formatCount(u.posts);
    statFollowers.textContent = formatCount(u.followers);
    statFollowing.textContent = formatCount(u.following);

    profileCard.classList.remove("hidden");
    setStatus(profileStatus, u.isPrivate ? "⚠️ هذا الحساب خاص" : "✅ تم العثور على الحساب", u.isPrivate ? "" : "success");
  } catch (e) {
    setStatus(profileStatus, `❌ خطأ: ${e.message}`, "error");
  } finally {
    setBusy(fetchProfileBtn, false);
  }
});

downloadAvatarBtn.addEventListener("click", () => {
  if (!currentAvatarUrl) return;
  nativeDownload(currentAvatarUrl, `${currentUsername || "avatar"}_${Date.now()}.jpg`);
});