let toggleButton = document.querySelector("#toggle-button");
let settingsButton = document.querySelector("#settings-button");
let blockedCounter = document.querySelector('#blocked-counter');

let active = false;
let blockedOnThisPage = 0;

let setStatusUI = () => {
    if (active) {
        document.querySelector('#toggle-button img').src = "/images/ON_lock.svg";
    } else {
        document.querySelector('#toggle-button img').src = "/images/OFF_lock.svg";
    }
    chrome.action.setBadgeText({
        text: active ? "ON" : "OFF",
    });
    blockedCounter.innerHTML = blockedOnThisPage
};

chrome.storage.local.get(["active",'blockedOnThisPage'], local => {
    active = !!local.active;
    blockedOnThisPage = local.blockedOnThisPage
    setStatusUI()
});

toggleButton.addEventListener("click", () => {
    active = !active;
    chrome.storage.local.set({
        active
    });
    setStatusUI();
});

settingsButton.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL("options/options.html"));
    }
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    if(changes.hasOwnProperty('blockedOnThisPage')){
        blockedOnThisPage = changes.blockedOnThisPage.newValue
        setStatusUI()
    }
});

setStatusUI()