document.getElementById("inserter").src = chrome.extension.getBackgroundPage().current_img;
document.getElementById("msg").innerHTML = ""+chrome.extension.getBackgroundPage().current_pct+"% changes have been detected on this page.";
