
// Dictionary to map tabs to screenshots
var image_dict = {};


// These globals are to populate the pageAction in case of a detected attack
var current_img = null;
var current_pct = 0;


// The thread which will take screenshots at intervals
var screenshot_thread = null;
var delay_thread = null;


/*
 *
 * When a tab is selected one of two things can happen:
 * 	- It's not in the dictionary and an entry needs to be made.
 * 	- It's in the dictonary and the screenshot needs to be compared.
 *
 */
chrome.tabs.onActivated.addListener(function listener(activeInfo) {

	stop_screenshot_spam();
	
	chrome.tabs.get(activeInfo.tabId, function callback(tab){
		if(tab.url === undefined) {
			return;
		}

		var url = new URL(tab.url); 
		
		if(!(url.protocol == "https:" || url.protocol == "http:")){
                	return;
		}

		chrome.pageAction.hide(tab.id);

		try{
			record_page(tab, false);

		}catch(err){
			shark_log(err);

		}

	});
});


/*
 *
 * If a tab is deleted it's entry is removed the entry from the dictionary
 *
 */
chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {

	//theres a bug if you have the dev console open
	if(DEBUG){
		stop_screenshot_spam();
	}

	delete image_dict[tabId];
	shark_log(image_dict);
});



/*
 *
 * When there's a new page loaded put a new entry in the dictionary
 *
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

	if(tab.active && changeInfo.status=="complete"){
		stop_screenshot_spam();

		var url = new URL(tab.url);

		if(!(url.protocol == "https:" || url.protocol == "http:")){
                	return;
		}

		try{
			record_page(tab, true);
		}catch(err){
			shark_log(err);

		}
	}
});




