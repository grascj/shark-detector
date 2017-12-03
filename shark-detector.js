
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
	stop_delay_thread();
	stop_screenshot_spam();
	
	chrome.tabs.get(activeInfo.tabId, function callback(tab){
		if(chrome.runtime.lastError) {
                	return;
        	}
		if(tab == undefined || tab.url === undefined) {
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
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	if(removeInfo.isWindowClosing) {
		stop_delay_thread();
		stop_screenshot_spam();		 
	}

	removeTab(tabId);
});



/*
 *
 * When there's a new page loaded put a new entry in the dictionary
 *
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

	if(tab.active && changeInfo.status=="complete"){
		stop_delay_thread();
		stop_screenshot_spam();

		if(tab == undefined || tab.url === undefined) {
                        return;
                }

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


chrome.windows.onFocusChanged.addListener(function (currWindowId) {
	stop_screenshot_spam();
	stop_delay_thread();
	
	if(currWindowId == chrome.windows.WINDOW_ID_NONE){
		return;
	}

	chrome.tabs.query({windowId : currWindowId, active : true}, function(tabs) {
		if(tabs == null)
			return; 
		updateState(tabs[0], false); 		
	});
});

chrome.windows.onRemoved.addListener(function(currWindowId) {
	shark_log("removing window " + currWindowId);	
	stop_delay_thread();
        stop_screenshot_spam();
});
