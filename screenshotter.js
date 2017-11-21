
var image_dict = {};

var activeTab = 0;


console.log(resemble);

//Check if newly opened
//if not then we must compare to old screenshot
chrome.tabs.onActivated.addListener(function listener(activeInfo) {

	activeTab = activeInfo.tabId;

	chrome.tabs.get(activeInfo.tabId, function callback(tab){
		image_dict[tab.id] = tab.url;
		console.log(image_dict);
	});


});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

	//this is to avoid insane regexes
	var url = new URL(tab.url)
	console.log(url.protocol);

	if(!tab.active || changeInfo.status!="complete"){
		return;
	}

	image_dict[tab.id] = tab.url;
	console.log(image_dict);
});


