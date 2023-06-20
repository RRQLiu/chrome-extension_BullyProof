const Selectors = {
    "tweet": `article[role="article"][data-testid="tweet"]`,
    "tweet_text": `[data-testid="tweetText"]`
};

//const for explanation of folded tweet
const HiddenHint = "One tweet has been hidden by BullyProof.";
let blockedOnThisPage = 0

class TweetManager {
    ele;
    isNegative = false;
    constructor(ele) {
        this.ele = ele;
    }
    async start() {
        await this.query();
        this.make();
    }
    query() {

        let text = this.ele.querySelector(Selectors.tweet_text)?.innerText || "";
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                type: "npi-negative-check",
                text
            /*get result from the function */
            }, result => {
                this.isNegative = result;
                resolve(result);
            });
        });
    }
    make() {
        this.ele.parentNode.classList.add("bullyproof-handled");
        /*if the result is negative:*/
        if (this.isNegative) {
            blockedOnThisPage += 1;
            this.ele.parentNode.classList.add("bullyproof-negative");

            let bar = document.createElement("div");
            bar.className = "bullyproof-tweet-status-bar";
            bar.innerHTML = html`
                <span class="bullyproof-bar-status"></span>
                <span style="flex-grow:1"></span>
                <span class="bullyproof-slide-button">
                    <svg style="fill: currentColor;" t="1665645131069" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="2556" xmlns:xlink="http://www.w3.org/1999/xlink" width="14"
                        height="20">
                        <path
                            d="M76.4 290.3c-17.5 17.5-17.5 45.8 0 63.3l370.2 370.2c35 35 91.7 35 126.6 0l372.9-372.9c17.3-17.3 17.5-45.3 0.5-62.8-17.4-17.9-46.1-18.1-63.8-0.5L541.6 628.9c-17.5 17.5-45.8 17.5-63.3 0L139.8 290.3c-17.5-17.4-45.9-17.4-63.4 0z"
                            p-id="2557"></path>
                    </svg>
                </span>
            `;
            this.ele.parentNode.insertBefore(bar, this.ele.nextSibling);
            /* displaying the hidden message */
            bar.querySelector(".bullyproof-bar-status").innerText = HiddenHint;
            this.hide();

            bar.querySelector(".bullyproof-slide-button").addEventListener("click", (e) => {
                if (this.isShow) {
                    bar.querySelector(".bullyproof-bar-status").style.opacity = 1;
                    e.currentTarget.classList.remove("bullyproof-slide-button-up");
                    this.hide();
                } else {
                    bar.querySelector(".bullyproof-bar-status").style.opacity = 0;
                    e.currentTarget.classList.add("bullyproof-slide-button-up");
                    this.show();
                }
            });

        } else {
            this.ele.parentNode.classList.add("bullyproof-positive");
        }
    }
    isShow = true;
    eleHeight;
    hide(animation = true) {
        if (!this.isShow) return;
        let startHeight = this.eleHeight = this.ele.clientHeight;
        this.ele.style.opacity = 0;
        if (animation) {
            this.ele.style.height = startHeight + "px";
            this.isShow = false;
            requestAnimationFrame(() => {
                if (this.isShow) return;
                this.ele.style.height = "0px";
                this.ele.addEventListener("transitionend", () => {
                    if (this.isShow) return;
                    this.ele.style.display = "none";
                });
            });
        } else {
            this.ele.style.display = "none";
        }
    }
    show() {
        if (this.isShow) return;
        this.isShow = true;
        this.ele.style.opacity = 1;
        this.ele.style.height = "0px";
        this.ele.style.display = "";
        requestAnimationFrame(() => {
            if (!this.isShow) return;
            this.ele.style.height = this.eleHeight + "px";
            this.ele.addEventListener("transitionend", () => {
                if (!this.isShow) return;
                this.ele.style.height = "";
            });
        });
    }
}
let handlingTweetEles = new Set();
watchBodyChange(() => {
    for (let ele of document.querySelectorAll(Selectors.tweet)) {
        if (handlingTweetEles.has(ele)) continue;
        handlingTweetEles.add(ele);
        new TweetManager(ele).start();
    }
    chrome.storage.local.set({blockedOnThisPage});
    console.log(blockedOnThisPage)
});

function watchBodyChange(onchange) {

    let timeout; //for time limitation 10ms

    let observer = new MutationObserver(() => {
        if (!timeout) {
            timeout = setTimeout(() => {
                timeout = null;
                onchange();
            }, 0);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

}
function html(n, ...args) {
    let re = [];
    for (let i = 0; i < n.length; i++) {
        re.push(n[i]);
        args[i] && re.push(args[i]);
    }
    return re.join(" ");
}