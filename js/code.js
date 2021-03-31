//set default if no other is defined
chrome.storage.sync.get(
  ["gradient", "websites", "searchEngine", "darkModeFont"],
  (data) => {
    if (data.gradient === undefined)
      chrome.storage.sync.set({ gradient: 1 }, () =>
        console.log("Gradient resetted")
      );
    if (data.websites === undefined)
      chrome.storage.sync.set(
        {
          websites: [
            {
              url: "https://www.youtube.de",
              icon: "https://s.ytimg.com/yts/img/favicon_144-vfliLAfaB.png",
            },
            {
              url: "https://www.docs.google.com/document/u/0/",
              icon:
                "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
            },
            {
              icon:
                "https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png",
              url: "https://calendar.google.com/calendar/b/0/r",
            },
            {
              url: "https://www.amazon.de",
              icon: "https://www.amazon.de/favicon.ico",
            },
          ],
        },
        () => console.log("Reseted websites")
      );
    if (data.darkModeFont === undefined)
      chrome.storage.sync.set({ darkModeFont: true }, () =>
        console.log("Reseted darkModeFont")
      );
    loadPage();
  }
);

const html = document.firstElementChild;
const content_wrapper = document.getElementById("content_wrapper");
const context_menu = document.getElementById("context_menu");
const overlay_elements = {
  button: document.getElementById("overlay_button"),
  header: document.querySelector("#add_website_overlay h1"),
};
const url = document.getElementById("add_website_url");
const icon = document.getElementById("add_website_icon");
const icon_span = document.querySelector(
  "#add_website_overlay span:nth-of-type(2)"
);
const small_icon = document.getElementById("add_website_small_icon");
const small_icon_span = document.querySelector(
  "#add_website_overlay span:nth-of-type(3)"
);

// update if setting change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.gradient !== undefined)
    changes.gradient.newValue === -1
      ? chrome.storage.sync.get("background", (data) =>
          changeGradient(changes.gradient.newValue, data.background)
        )
      : changeGradient(changes.gradient.newValue);
  if (changes.websites !== undefined) {
    websites = changes.websites.newValue;
    loadWebsites();
  }
  if (changes.darkModeFont !== undefined)
    changes.darkModeFont.newValue
      ? html.classList.remove("darkFont")
      : html.classList.add("darkFont");
});

let websites = [];
let show_seconds = false;

let context_menu_current_index = 0;

/*
Personal websites:
[{url:"https://youtube.de",icon:"https://s.ytimg.com/yts/img/favicon_144-vfliLAfaB.png"},{url:"https://www.docs.google.com/document/u/0/",icon:"https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",small_icon:"https://lh3.googleusercontent.com/ogw/ADGmqu_v6Drh4e2SmuHXMZBueFyVqFcQSDR4ngw98NvC=s83-c-mo"},{url:"https://www.docs.google.com/document/u/1/",icon:"https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",small_icon:"https://lh3.googleusercontent.com/ogw/ADGmqu9DDMABLPW9Ti4W1e-OHDuxcdg_DXdW1nR4VvmW=s83-c-mo"},{url:"https://docs.google.com/spreadsheets/u/0/",icon:"https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico"},{url:"https://keep.google.com/u/0/",icon:"https://ssl.gstatic.com/keep/keep.ico"},{url:"https://calendar.google.com/calendar/b/0/r",icon:"https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png",small_icon:"https://lh3.googleusercontent.com/ogw/ADGmqu_v6Drh4e2SmuHXMZBueFyVqFcQSDR4ngw98NvC=s83-c-mo"},{url:"https://bitbucket.org/dashboard/overview",icon:"https://d301sr5gafysq2.cloudfront.net/frontbucket/build-favicon-default.3b48bd21f29d.ico"},{url:"https://amazon.de",icon:"https://amazon.de/favicon.ico"},{url:"https://thomann.de",icon:"https://images.static-thomann.de/pics/images/common/favicon.ico"}]
*/

// load / update website
function loadWebsites() {
  let tempEles = "";
  websites.forEach((ele) => {
    const urlRoot = ele.url.replace(/^(.*\/\/[^\/?#]*).*$/, "$1");
    const urlWithoutProtocol = urlRoot.startsWith("http://")
      ? urlRoot.slice(7)
      : urlRoot.startsWith("https://")
      ? urlRoot.slice(8)
      : urlRoot;
    const shortURL = urlWithoutProtocol.startsWith("www.")
      ? urlWithoutProtocol.slice(4)
      : urlWithoutProtocol.startsWith("www1.")
      ? urlWithoutProtocol.slice(5)
      : urlWithoutProtocol;
    tempEles +=
      '<a class="website_icon hover_highlight" href="' +
      ele.url +
      '"><img alt="' +
      shortURL +
      '" SameSite="Strict" src="' +
      ele.icon +
      '" />' +
      (ele.small_icon === undefined
        ? ""
        : '<img class="website_icon_small" alt="' +
          shortURL +
          '" SameSite="Strict" src="' +
          ele.small_icon +
          '" />') +
      "<p>" +
      shortURL +
      "</p>" +
      "</a>";
  });

  document.getElementById("website_icon_wrapper").innerHTML =
    tempEles +
    '<div class="website_icon hover_highlight" id="add_website"><svg version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="var(--font-color)"><path d="m196.32 66.641c-11.121 1.523-20.336 10.124-22.564 21.061-0.595 2.915-0.629 5.436-0.633 45.856l-3e-3 39.558-83.6 0.091-1.6 0.366c-14.938 3.413-24.046 17.618-20.689 32.267 2.3 10.036 10.618 18.097 20.791 20.149 2.689 0.542 4.748 0.568 44.973 0.57l40.115 1e-3 0.11 82.64 0.344 1.76c3.922 20.053 26.608 28.866 42.711 16.593 5.881-4.482 9.61-11.346 10.28-18.925 0.104-1.172 0.163-16.221 0.164-41.945l1e-3 -40.116 82.8-0.102 1.84-0.356c18.452-3.572 27.69-24.026 18.113-40.109-3.707-6.226-10.064-10.727-17.57-12.439l-1.583-0.361-83.6-0.084v-40.381c0-40.733-0.018-42.1-0.577-44.895-2.746-13.713-15.951-23.099-29.823-21.199" fill-rule="evenodd"/></svg></div>';

  // display url when icon can't be loaded
  document
    .querySelectorAll(".website_icon img:not(.website_icon_small)")
    .forEach((ele) =>
      ele.addEventListener("error", (e) =>
        e.target.parentElement.classList.add("error")
      )
    );

  document.getElementById("add_website").addEventListener("click", () => {
    edit_website = false;
    openOverlay(addWebsite, "Add", "Add Website");
  });
}

let last_confirm_fct;
function openOverlay(
  confirmFct,
  buttonText,
  header,
  displayIconInput = true,
  displaySmallIconInput = true
) {
  url.value = "";
  icon.value = "";
  small_icon.value = "";
  if (last_confirm_fct !== undefined)
    overlay_elements.button.removeEventListener("click", last_confirm_fct);
  overlay_elements.button.innerHTML = buttonText;
  overlay_elements.button.addEventListener("click", confirmFct);
  overlay_elements.header.innerHTML = header;
  icon.style.display = displayIconInput ? null : "none";
  icon_span.style.display = displayIconInput ? null : "none";
  small_icon.style.display = displaySmallIconInput ? null : "none";
  small_icon_span.style.display = displaySmallIconInput ? null : "none";
  html.classList.add("overlay");
  last_confirm_fct = confirmFct;
}

function closeOverlay() {
  html.classList.remove("overlay");
}

function addWebsite() {
  if (url.value !== "" && icon.value !== "") {
    chrome.storage.sync.set(
      {
        websites: [
          ...websites,
          ...[
            {
              url: url.value,
              icon: icon.value,
              small_icon:
                small_icon.value === "" ? undefined : small_icon.value,
            },
          ],
        ],
      },
      () => {
        console.log("Added website", {
          url: url.value,
          icon: icon.value,
          small_icon: small_icon.value === "" ? undefined : small_icon.value,
        });
        closeOverlay();
        reloadPage();
      }
    );
  }
}

function removeWebsite() {
  chrome.storage.sync.set(
    {
      websites: [
        ...websites.slice(0, context_menu_current_index),
        ...websites.slice(context_menu_current_index + 1),
      ],
    },
    () => console.log("Removed website", websites[context_menu_current_index])
  );
}

function editWebsite() {
  if (url.value !== "" && icon.value !== "") {
    websites[context_menu_current_index] =
      small_icon.value === ""
        ? {
            url: url.value,
            icon: icon.value,
          }
        : {
            url: url.value,
            icon: icon.value,
            small_icon: small_icon.value,
          };
    chrome.storage.sync.set(
      {
        websites: websites,
      },
      () => {
        console.log("Edited website", {
          url: url.value,
          icon: icon.value,
          small_icon: small_icon.value === "" ? undefined : small_icon.value,
        });
        closeOverlay();
        reloadPage();
      }
    );
  }
}

const settings = document.getElementById("settings");
const gradientIconsWrapper = document.getElementById(
  "gradient_options_wrapper"
);
const gradientIcons = document.getElementById("gradient_options");
function loadSettings() {
  const gradientIconsHTML = Array.from({ length: gradientAmount }, (x, i) => i)
    .map((index) => `<div class="gradient${index} gradient_option"></div>`)
    .join("");

  gradientIcons.innerHTML +=
    gradientIconsHTML +
    '<div class="gradient_option random"><svg viewBox="100 100 525 525" xmlns="http://www.w3.org/2000/svg"><path d="m397.1 116.08c-1.4883-0.033752-3.0974 0.33585-5.1365 1.0259l-225.97 66.354c-1.8803 0.43985-1.7721 0.9458-0.2066 2.1572l200.6 160.13c3.6932 3.0622 5.4316 3.443 10.579 1.8494l224.94-77.961c5.1604-1.8958 5.5187-2.3567 0.2052-5.8546l-197.42-144.42c-3.0468-2.1473-5.1196-3.2393-7.6-3.2856zm-25.782 19.412c4.4999-0.032333 9.2513 0.46237 14.176 1.5416 19.696 4.3186 33.666 16.355 31.122 26.808-2.5451 10.453-20.568 15.412-40.264 11.094-19.697-4.3186-33.666-16.254-31.122-26.707 1.907-7.8389 12.59-12.669 26.088-12.736zm-127.36 38.724c4.4999-0.032288 9.3539 0.46097 14.278 1.5402 19.696 4.3186 33.564 16.253 31.018 26.706-2.5437 10.453-20.567 15.515-40.263 11.196-19.697-4.3186-33.564-16.355-31.02-26.808 1.907-7.8403 12.486-12.568 25.986-12.634zm193 9.8598c4.4999-0.032303 9.3538 0.56496 14.278 1.6443 19.696 4.3186 33.564 16.253 31.018 26.706-2.5436 10.453-20.567 15.411-40.263 11.092-19.697-4.3172-33.564-16.253-31.02-26.706 1.907-7.8389 12.486-12.669 25.986-12.736zm-285.13 12.429c-0.41174 0.10535-0.54526 0.75043-0.82074 2.0545l-50.946 254.83c-0.59446 2.6504-0.49047 3.3068 1.9506 5.4428l193.51 166.81c4.5013 4.3017 5.447 4.2455 6.0598-1.0273l56.39-258.43c1.1819-3.5204-0.035126-5.4583-2.0546-7.0871l-202.04-161.36c-1.04-0.87689-1.6414-1.3364-2.0546-1.2324zm157.15 29.068c4.5013-0.032349 9.3538 0.46097 14.278 1.5416 19.696 4.3186 33.564 16.253 31.02 26.706-2.5436 10.453-20.567 15.411-40.264 11.094-19.697-4.3186-33.564-16.254-31.02-26.707 1.9084-7.8389 12.488-12.566 25.986-12.634zm195.05 8.5261c4.4999-0.032288 9.3539 0.46094 14.278 1.5402 19.696 4.3186 33.564 16.253 31.02 26.706-2.545 10.453-20.568 15.515-40.264 11.196-19.697-4.3186-33.564-16.355-31.02-26.808 1.907-7.8404 12.486-12.568 25.986-12.634zm-339.68 9.3468c0.75891-0.075867 1.5908-0.042145 2.3624 0 9.2696 0.49048 19.306 9.1768 25.165 23.111 7.8108 18.577 5.2068 39.426-5.752 46.529-10.959 7.1025-26.187-2.1713-33.998-20.748-7.8123-18.577-5.2082-39.426 5.752-46.529 2.0546-1.3322 4.1935-2.1375 6.4701-2.3624zm211.69 33.485c4.4998-0.032318 9.3525 0.46091 14.277 1.5402 19.697 4.3186 33.564 16.253 31.02 26.706-2.5436 10.453-20.567 15.412-40.264 11.094-19.697-4.3186-33.564-16.253-31.02-26.706 1.9084-7.8404 12.488-12.568 25.987-12.634zm236.34 7.0871c-0.4314 0.088501-1.0385 0.2403-1.7454 0.51291l-231 80.118c-4.705 1.9365-4.5645 2.7277-5.3416 6.2649l-56.288 257.61c-0.1911 3.793-1.588 5.5187 2.8767 3.4922l227.61-85.046c4.4169-2.1136 5.263-2.4846 5.752-6.7792l59.06-254.01c0.48901-1.7904 0.37097-2.427-0.92474-2.1571zm-37.49 41.804c6.5039 0.10541 11.608 3.2688 13.866 9.3469 4.5153 12.156-4.1808 31.612-19.516 43.448-15.336 11.836-31.434 11.539-35.95-0.61691-4.5167-12.156 4.1795-31.612 19.514-43.447 7.6689-5.9192 15.58-8.8367 22.085-8.7313zm-280 22.288c9.3862 0.2403 19.627 9.063 25.576 23.215 7.8122 18.577 5.3107 39.426-5.6494 46.529-10.959 7.1026-26.187-2.2738-33.998-20.851-7.8108-18.578-5.2067-39.324 5.752-46.426 2.0546-1.3322 4.1935-2.1375 6.4716-2.3638 0.61694-0.063263 1.2227-0.11807 1.848-0.10123v-0.001373zm-82.479 29.787c9.3862 0.24033 19.625 9.063 25.576 23.213 7.8108 18.578 5.3093 39.426-5.6494 46.53-10.959 7.1025-26.187-2.2739-33.998-20.851-7.8122-18.578-5.2067-39.325 5.752-46.428 2.0546-1.3308 4.1935-2.1361 6.4702-2.3623 0.61691-0.063232 1.224-0.11804 1.8494-0.1012v-0.001404zm-81.246 29.48c0.75885-0.075928 1.5894-0.039398 2.3624 0 9.2681 0.49045 19.202 9.2794 25.061 23.213 7.8123 18.577 5.3108 39.324-5.6494 46.426-10.959 7.1025-26.187-2.1712-33.998-20.748-7.8108-18.577-5.2068-39.426 5.752-46.529 2.0546-1.3322 4.1935-2.1375 6.4716-2.3623zm357.03 24.651c6.3648 0.2066 11.438 3.3644 13.66 9.3469 4.5167 12.156-4.282 31.612-19.618 43.448-15.335 11.836-31.433 11.539-35.95-0.61688-4.5154-12.156 4.2834-31.612 19.618-43.447 6.7105-5.1786 13.55-8.0638 19.516-8.6287 0.95984-0.09137 1.8649-0.13068 2.7741-0.10117v-0.001434zm-230.8 82.48c0.75891-0.075867 1.5894-0.039307 2.3624 0 9.2696 0.49042 19.306 9.1768 25.165 23.109 7.8108 18.578 5.2067 39.428-5.752 46.53-10.959 7.1026-26.084-2.1711-33.896-20.748-7.8108-18.578-5.3094-39.426 5.6494-46.53 2.0546-1.3308 4.195-2.1361 6.4716-2.361zm136.71 26.706c6.5052 0.10394 11.609 3.1662 13.866 9.2442 4.5154 12.155-4.1794 31.611-19.516 43.447-15.335 11.837-31.434 11.643-35.95-0.51294-4.5153-12.156 4.1809-31.613 19.516-43.448 7.6675-5.9178 15.58-8.8353 22.083-8.7299z" fill="var(--font-color)"/></svg></div>' +
    '<div class="gradient_option add_background"><svg version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="var(--font-color)"><path d="m196.32 66.641c-11.121 1.523-20.336 10.124-22.564 21.061-0.595 2.915-0.629 5.436-0.633 45.856l-3e-3 39.558-83.6 0.091-1.6 0.366c-14.938 3.413-24.046 17.618-20.689 32.267 2.3 10.036 10.618 18.097 20.791 20.149 2.689 0.542 4.748 0.568 44.973 0.57l40.115 1e-3 0.11 82.64 0.344 1.76c3.922 20.053 26.608 28.866 42.711 16.593 5.881-4.482 9.61-11.346 10.28-18.925 0.104-1.172 0.163-16.221 0.164-41.945l1e-3 -40.116 82.8-0.102 1.84-0.356c18.452-3.572 27.69-24.026 18.113-40.109-3.707-6.226-10.064-10.727-17.57-12.439l-1.583-0.361-83.6-0.084v-40.381c0-40.733-0.018-42.1-0.577-44.895-2.746-13.713-15.951-23.099-29.823-21.199" fill-rule="evenodd"/></svg></div>' +
    Array.from({ length: 16 }, (x, i) => i)
      .map(() => `<div class="gradient_option_filler"></div>`)
      .join("");

  document
    .querySelectorAll(".gradient_option:not(.add_background, .random)")
    .forEach((ele, index) =>
      ele.addEventListener("click", () =>
        chrome.storage.sync.set({ gradient: index }, () =>
          console.log("Changed gradient to " + index)
        )
      )
    );

  document
    .querySelector(".gradient_option.add_background")
    .addEventListener("click", () =>
      openOverlay(
        () => {
          if (url.value === "") return;
          chrome.storage.sync.set({
            background: url.value,
            gradient: -1,
          });
          closeOverlay();
        },
        "Apply",
        "Change Background",
        false,
        false
      )
    );

  document
    .querySelector("#settings>svg")
    .addEventListener("click", (e) =>
      settings.classList.contains("open")
        ? settings.classList.remove("open")
        : settings.classList.add("open")
    );
}

function closeSettings() {
  settings.classList.remove("open");
}

const background_element = document.getElementById("background");
function changeGradient(index, background = "") {
  for (let i = 0; i < gradientAmount; i++) {
    html.classList.remove("gradient" + i);
  }
  if (index === -1) {
    background_element.style.backgroundImage = "url('" + background + "')";
  } else {
    background_element.style.backgroundImage = "var(--background)";
    html.classList.add("gradient" + index);
    settings.classList.remove("open");
  }
}

async function loadPage() {
  /*----- add eventListener ------*/
  //close overlay on esc press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeOverlay();
      closeSettings();
    }
  });
  //close overlay on click
  document.addEventListener("click", (e) =>
    e.target.id === "add_website_overlay" ? closeOverlay() : null
  );

  //overlay submit on enter
  document.addEventListener("keypress", (e) =>
    e.key === "Enter" ? (edit_website ? editWebsite() : addWebsite()) : null
  );

  //context menu to delete websites
  document.addEventListener("contextmenu", (e) => {
    if (
      e.target.parentElement.id !== "website_icon_wrapper" ||
      e.target.id === "add_website"
    )
      return html.classList.remove("context_menu");
    html.classList.add("context_menu");
    e.preventDefault();

    let top = e.y;
    let left = e.x;

    if (top > window.innerHeight / 2)
      top -= context_menu.getBoundingClientRect().height;
    if (left > window.innerWidth / 2)
      left -= context_menu.getBoundingClientRect().width;

    context_menu.style.left = left + "px";
    context_menu.style.top = top + "px";

    context_menu_current_index = websites.findIndex(
      (website) => website.url === e.target.getAttribute("href")
    );
  });

  //blur context menu
  document.addEventListener("click", () =>
    html.classList.remove("context_menu")
  );

  //add event handler
  document
    .querySelectorAll(".remove_website")
    .forEach((ele) => ele.addEventListener("click", () => removeWebsite()));
  document.getElementById("edit_website").addEventListener("click", () => {
    openOverlay(editWebsite, "Confirm", "Edit Website");
    url.value = websites[context_menu_current_index].url;
    icon.value = websites[context_menu_current_index].icon;
    small_icon.value =
      websites[context_menu_current_index].small_icon === undefined
        ? ""
        : websites[context_menu_current_index].small_icon;
  });

  document
    .getElementById("close_overlay_svg")
    .addEventListener("click", () => closeOverlay());

  const data = await getStorageValue(["websites", "gradient", "darkModeFont"]);

  //load websites
  websites = data.websites;
  loadWebsites();

  //load gradient
  data.gradient === -1
    ? chrome.storage.sync.get("background", (bg) =>
        changeGradient(data.gradient, bg.background)
      )
    : changeGradient(data.gradient);

  //load show seconds
  show_seconds = data.showSeconds;

  //load font color
  if (!data.darkModeFont) html.classList.add("lightFont");

  reloadPage();
}

function reloadPage() {
  loadSettings();
}