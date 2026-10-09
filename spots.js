// All 10 spots, taken from the site's own PUMPKIN_SPOTS list (halloween-2026).
var SPOTS = [
  { id: "ember", url: "https://rscripts.net/", where: "Главная, рядом с заголовком «Hot games»", hint: "Where the games burn hottest." },
  { id: "shelf", url: "https://rscripts.net/scripts", where: "/scripts, в шапке рядом со счётчиком live", hint: "Every script ever made, one endless shelf." },
  { id: "climb", url: "https://rscripts.net/scripts/trending", where: "/scripts/trending, в конце чипов в шапке", hint: "Climbing the charts tonight." },
  { id: "forge", url: "https://rscripts.net/executors", where: "/executors, у заголовка FAQ внизу", hint: "The tools get questioned at the bottom of their page." },
  { id: "hearth", url: "https://rscripts.net/hubs", where: "/hubs, в конце чипов в шапке", hint: "Every crew needs a home." },
  { id: "whisper", url: null, where: "Любая страница скрипта, под комментариями", hint: "Scroll past the code and listen to what people say." },
  { id: "arena", url: null, where: "Любая страница игры, правый нижний угол баннера", hint: "Pick a game. Any game. Check the corners." },
  { id: "mirror", url: null, where: "Твой профиль, рядом с соцсетями", hint: "Take a good look at yourself." },
  { id: "vault", url: "https://rscripts.net/dashboard", where: "/dashboard (нужен вход), слева от аватара", hint: "Behind the login, right next to your face." },
  { id: "fine-print", url: "https://rscripts.net/privacy", where: "/privacy, под блоком контактов", hint: "Nobody reads the fine print. Maybe you should." }
];

function rspdPath(url) {
  try { return new URL(url, location.href).pathname.replace(/\/$/, "") || "/"; } catch { return ""; }
}
// Spots that have a fixed URL and can be visited automatically, in tour order.
var TOUR = SPOTS.filter((s) => s.url);
