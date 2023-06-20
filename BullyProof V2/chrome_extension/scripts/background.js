import { v4 as uuidv4 } from "uuid";

/* Filter function: */
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // console.log(msg);
  if (msg && msg.type == "npi-negative-check") {
    chrome.storage.local.get(null, async function (local) {
      if (local.active) {
        // console.error("active and running");
        /*detect if the keywords is in the tweet before the sentiment Analysis*/
        for (let keyword of local.keywords_custom || []) {
          if (msg.text.toLowerCase().includes(keyword.toLowerCase())) {
            console.log(keyword);
            /*RETURN TRUE if contain keywords*/
            sendResponse(true);
            return;
          }
        }
        if (local.useSmartFilter) {
          let uuid = uuidv4();
          let response = await get_prediction(uuid, msg.text);
          let { id, sentiment } = response[0];
          if (sentiment == 1) {
            // tweet classified as hate speech
            sendResponse(true);
            return;
          }
          // tweet not classified as hate speech
          sendResponse(false);
          return;
        }
      } else {
        sendResponse(false);
      }
    });
    return true;
  }
});

// write logic that uses nlp api to filter negative tweets
async function get_prediction(uuid, message) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify([
    {
      id: uuid,
      text: message,
    },
  ]);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  let response = await fetch(
    "https://inference-api-v7hjlveoxa-ue.a.run.app/predict/",
    requestOptions
  );
  let data = response.json();
  return data;
}

console.error("running in background");
chrome.runtime.onInstalled.addListener(async () => {
  console.error("running on runtime");
  console.error(uuidv4());
  chrome.action.setBadgeText({
    text: "ON",
  });
  // chrome.storage.local.set({ user_id: 123 });

  chrome.action.setBadgeBackgroundColor({ color: [0, 255, 0, 0] }, () => {});
  chrome.storage.local.set({
    keywords_custom: [],
    useSmartFilter: true,
    user_id: uuidv4(),
    logged_in:false,
    blocked_profiles:[]
  });
});
