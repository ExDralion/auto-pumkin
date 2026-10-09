# 🎃 Rscripts Pumpkin Detector

**Version / Версия:** `1.1.0` · **Manifest V3**

[Русский](#русский) · [English](#english)

---

## Русский

Расширение для браузеров на базе Chromium, которое находит и подсвечивает кнопки тыкв Halloween-ивента на [rscripts.net](https://rscripts.net/).

**Авто-обход — не автоматический сбор:** расширение открывает страницы, прокручивает к тыкве и устанавливает на неё фокус. Чтобы собрать тыкву, нужно самостоятельно нажать **Enter** или кликнуть по ней. Засчитывание выполняет сам сайт.

> Список из 10 точек взят из `spots.js` в этом архиве; в комментарии указан ивент Halloween 2026. Актуальность расположений на действующем сайте не проверена. Интерфейс расширения — на русском; этот README доступен на двух языках.

### Возможности

- Подсвечивает найденные кнопки тыкв контуром и свечением.
- Показывает кнопку **«🎃 Тыква на странице! Показать»**, которая прокручивает к первой найденной тыкве и фокусирует её.
- Повторно сканирует страницу при изменениях DOM и каждые 2,5 секунды.
- Показывает список всех 10 точек с подсказками.
- Автоматически обходит **7 точек с фиксированными URL**.
- Сохраняет локально прогресс, полученный от сайта, и пути страниц, на которых зарегистрирован успешный сбор.

### Установка

Сборка, Node.js и дополнительные зависимости не нужны.

1. Распакуйте ZIP-архив.
2. Откройте страницу расширений:
   - **Chrome:** `chrome://extensions`
   - **Edge:** `edge://extensions`
   - **Brave:** `brave://extensions`
3. Включите **режим разработчика / Developer mode**.
4. Нажмите **«Загрузить распакованное расширение / Load unpacked»**.
5. Выберите папку **`pumpkin`**, внутри которой находится `manifest.json`, а не ZIP-файл или родительскую папку.
6. Откройте или обновите страницу `https://rscripts.net/`.

Расширение использует API Chromium и Manifest V3. Совместимость с каждым браузером отдельно не проверялась; Firefox и Safari этой инструкцией не охвачены.

### Использование

#### Обычный поиск

1. Откройте нужную страницу rscripts.net.
2. Если расширение обнаружит тыкву, появятся подсветка и кнопка **«Показать»** в правом нижнем углу.
3. Нажмите **«Показать»**, затем **Enter**, либо кликните по самой тыкве.
4. После события успешного сбора от сайта расширение покажет уведомление и сохранит прогресс.

#### Авто-обход

1. Откройте всплывающее окно расширения через его значок.
2. Нажмите **«▶ Авто-обход»**.
3. На каждой странице дождитесь прокрутки и фокусировки тыквы, затем нажмите **Enter** или кликните по ней.
4. После подтверждения от сайта расширение перейдёт к следующей точке.

Если текущая активная вкладка уже открыта на rscripts.net, авто-обход использует её; иначе создаёт новую. Точки, отмеченные локально как собранные, пропускаются. Если тыква не найдена примерно за **10 секунд**, точка пропускается на время текущего обхода.

Для остановки нажмите **«■ Стоп»** в окне расширения или **Esc** на странице сайта. Уже запланированный переход может ещё произойти. Три точки без фиксированных URL нужно посетить вручную.

### Точки поиска

Места ниже соответствуют списку в архиве, а не результатам проверки текущего сайта.

| ID | Страница | Где искать | Режим |
| --- | --- | --- | --- |
| `ember` | [Главная](https://rscripts.net/) | Рядом с заголовком «Hot games» | Авто |
| `shelf` | [/scripts](https://rscripts.net/scripts) | В шапке рядом со счётчиком live | Авто |
| `climb` | [/scripts/trending](https://rscripts.net/scripts/trending) | В конце чипов в шапке | Авто |
| `forge` | [/executors](https://rscripts.net/executors) | У заголовка FAQ внизу страницы | Авто |
| `hearth` | [/hubs](https://rscripts.net/hubs) | В конце чипов в шапке | Авто |
| `whisper` | Любая страница скрипта | Под комментариями | Вручную |
| `arena` | Любая страница игры | В правом нижнем углу баннера | Вручную |
| `mirror` | Ваш профиль | Рядом с соцсетями | Вручную |
| `vault` | [/dashboard](https://rscripts.net/dashboard) | Слева от аватара; нужен вход | Авто |
| `fine-print` | [/privacy](https://rscripts.net/privacy) | Под блоком контактов | Авто |

### Разрешения и приватность

В `manifest.json` указаны:

- **`storage`** — локальное сохранение состояния в `chrome.storage.local` под ключом `rspd`.
- **`https://rscripts.net/*` и `https://www.rscripts.net/*`** — доступ для работы расширения на этих страницах.

Локальное состояние включает последний обнаруженный путь и время, счётчик сбора от сайта, пути успешного сбора и состояние авто-обхода.

Код расширения не содержит собственных `fetch`/XHR-запросов или отправки телеметрии. Однако открытие страниц и сбор тыкв выполняются на сайте, который может отправлять свои обычные сетевые запросы. Расширение не имитирует клики и не обходит авторизацию.

### Как это работает

`detector.js` ищет элементы `<button>`:

- с `aria-label="Something is hiding here"`; или
- с классом вида `pumpkin-module__…__pumpkin`.

Прогресс обновляется по событию сайта **`rscripts:halloween-found`**. Числовое значение `detail.found`, если оно есть, используется как счётчик. Локальные отметки страниц — вспомогательная информация, а не независимая проверка прогресса аккаунта.

### Если что-то не работает

- **Нет подсветки:** проверьте HTTPS-адрес rscripts.net, активность расширения и обновите вкладку после установки. Тыква должна присутствовать в DOM страницы; завершённый ивент или изменения разметки могут нарушить обнаружение.
- **Авто-обход пропустил точку:** страница могла загружаться дольше 10 секунд, требовать входа или не содержать тыкву. Откройте её вручную; новый запуск обхода очищает список пропусков.
- **Enter не собирает тыкву:** нажмите «Показать», дождитесь фокуса либо кликните по тыкве. Условия сбора определяет сайт.
- **Счётчик показывает `—`:** он обновится после получения события успешного сбора с числовым `found`; расширение не запрашивает прогресс аккаунта отдельно.
- **Прогресс отличается от аккаунта:** состояние локально для этого профиля браузера и не синхронизируется между устройствами или аккаунтами сайта.

Структура проекта приведена в конце документа.

---

## English

A Chromium browser extension that detects and highlights pumpkin buttons from the Halloween event on [rscripts.net](https://rscripts.net/).

**Auto-tour is not automatic claiming:** the extension opens pages, scrolls to a pumpkin, and focuses it. You must press **Enter** or click the pumpkin yourself. The website handles the actual claim.

> The 10-location list comes from `spots.js` in the supplied archive, whose comment references Halloween 2026. Locations have not been verified against the live website. The extension UI is in Russian; this README is bilingual.

### Features

- Highlights detected pumpkin buttons with an outline and glow.
- Displays a **“🎃 Тыква на странице! Показать”** (“Pumpkin on this page! Show”) button that scrolls to and focuses the first detected pumpkin.
- Rescans on DOM changes and every 2.5 seconds.
- Lists all 10 locations with hints.
- Automatically tours **7 locations with fixed URLs**.
- Locally stores progress reported by the website and page paths where successful claims were registered.

### Installation

No build step, Node.js, or additional dependencies are required.

1. Extract the ZIP archive.
2. Open your browser's extensions page:
   - **Chrome:** `chrome://extensions`
   - **Edge:** `edge://extensions`
   - **Brave:** `brave://extensions`
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the **`pumpkin`** folder containing `manifest.json`, not the ZIP file or its parent folder.
6. Open or reload `https://rscripts.net/`.

The extension uses Chromium APIs and Manifest V3. Browser-by-browser compatibility has not been tested; these instructions do not cover Firefox or Safari.

### Usage

#### Regular detection

1. Open a relevant rscripts.net page.
2. When a pumpkin is detected, the extension highlights it and displays the **“Показать”** (“Show”) button in the bottom-right corner.
3. Click **Show**, then press **Enter**, or click the pumpkin directly.
4. When the website emits its successful-claim event, the extension displays a notification and saves progress.

#### Auto-tour

1. Open the extension popup using its toolbar icon.
2. Click **“▶ Авто-обход”** (“Auto-tour”).
3. On each page, wait for the pumpkin to be scrolled into view and focused, then press **Enter** or click it.
4. After the website confirms the claim, the extension moves to the next location.

If the active tab is already on rscripts.net, the tour reuses it; otherwise, it opens a new tab. Locations locally marked as claimed are skipped. If no pumpkin is detected within approximately **10 seconds**, that location is skipped for the current tour.

To stop, click **“■ Стоп”** (“Stop”) in the popup or press **Esc** on the website. An already scheduled navigation may still occur. The three locations without fixed URLs must be visited manually.

### Pumpkin locations

These locations reflect the archive's list, not a verification of the current website.

| ID | Page | Location | Mode |
| --- | --- | --- | --- |
| `ember` | [Home](https://rscripts.net/) | Next to the “Hot games” heading | Auto |
| `shelf` | [/scripts](https://rscripts.net/scripts) | In the header, next to the live counter | Auto |
| `climb` | [/scripts/trending](https://rscripts.net/scripts/trending) | At the end of the header chips | Auto |
| `forge` | [/executors](https://rscripts.net/executors) | Near the FAQ heading at the bottom | Auto |
| `hearth` | [/hubs](https://rscripts.net/hubs) | At the end of the header chips | Auto |
| `whisper` | Any script page | Below the comments | Manual |
| `arena` | Any game page | Bottom-right corner of the banner | Manual |
| `mirror` | Your profile | Next to the social links | Manual |
| `vault` | [/dashboard](https://rscripts.net/dashboard) | To the left of the avatar; sign-in required | Auto |
| `fine-print` | [/privacy](https://rscripts.net/privacy) | Below the contact section | Auto |

### Permissions and privacy

The manifest declares:

- **`storage`** — saves local state in `chrome.storage.local` under the `rspd` key.
- **`https://rscripts.net/*` and `https://www.rscripts.net/*`** — allows the extension to operate on those pages.

Local state includes the last detected path and timestamp, the website-reported claim count, successful-claim paths, and auto-tour state.

The extension code contains no custom `fetch`/XHR requests or telemetry uploads. Opening pages and claiming pumpkins still use the website, which may make its own normal network requests. The extension does not simulate clicks or bypass authentication.

### How it works

`detector.js` looks for `<button>` elements:

- with `aria-label="Something is hiding here"`; or
- with a class matching `pumpkin-module__…__pumpkin`.

Progress is updated using the website's **`rscripts:halloween-found`** event. A numeric `detail.found`, when provided, supplies the counter. Local page checkmarks are a convenience, not an independent verification of account progress.

### Troubleshooting

- **No highlighting:** check the HTTPS rscripts.net address, ensure the extension is enabled, and reload the tab after installation. A pumpkin must exist in the page DOM; an ended event or markup changes may prevent detection.
- **A tour location was skipped:** the page may have taken over 10 seconds to load, required sign-in, or contained no pumpkin. Visit it manually; restarting the tour clears its skipped-location list.
- **Enter does not claim the pumpkin:** click Show and wait for focus, or click the pumpkin directly. Claim requirements are controlled by the website.
- **The counter displays `—`:** it updates after a successful-claim event with a numeric `found`; the extension does not separately request account progress.
- **Progress differs from your account:** state is local to this browser profile and is not synchronized across devices or website accounts.

---

## Структура проекта / Project structure

```text
pumpkin/
├── manifest.json   # Manifest V3: метаданные и разрешения / metadata and permissions
├── spots.js        # 10 точек и маршрут авто-обхода / 10 locations and tour route
├── detector.js     # Поиск, подсветка, прогресс и обход / detection, progress and tour
├── detector.css    # Стили подсветки и уведомлений / highlight and notification styles
├── popup.html      # Окно расширения / extension popup
├── popup.js        # Список точек и управление обходом / location list and tour controls
└── README.md       # Документация на русском и английском / Russian and English documentation
```
