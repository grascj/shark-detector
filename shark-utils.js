
/*
 *	This is the thread to keep taking screenshots for some interval of time.
 *
 *	id - the tab id to take screenshots of.
 */
function spamScreenShots(id){

	chrome.tabs.executeScript(id, {code:"document.hasFocus();"}, function(results){

		if(results[0]){//page has focus

			chrome.tabs.captureVisibleTab({format : "png"}, function(img){
				console.log("firing");
				image_dict[id][1] = img;
			});
		}
	});
}



/*
 *	This is a wrapper starting a screenshot thread, by setting the thread variable to null we can use it as a mutex in some way.
 *
 *	tab_id - the id of the tab to take screenshots of.
 */
function start_screenshot_spam(tab_id){
	if(screenshot_thread!=null){
		clearInterval(screenshot_thread);
		screenshot_thread=null;
	}
	screenshot_thread = setInterval(spamScreenShots,INTERVAL,tab_id);
}


/*
 *	Kills a screenshot thread.
 */
function stop_screenshot_spam(){
	clearInterval(screenshot_thread);
	screenshot_thread=null;
}



/*
 *	Record a page.
 *
 *	tab - the current tab
 *	isNewRequest - boolean for whether of not the caller is just a new GET request.
 */
function record_page(tab, isNewRequest){
	console.log(tab.id);
	setTimeout(function(){
		console.log(tab.id+" : " + tab.active);
		if(!tab.active){
			return;
		}

		chrome.tabs.captureVisibleTab({format : "png"}, function(img) {

			if(!tab.active){
				return;
			}

			if(isNewRequest || image_dict[tab.id] === undefined){

				image_dict[tab.id] = [tab.url,img];
				console.log(image_dict);
				start_screenshot_spam(tab.id);

			}else{
				if(tab.active){
					checkPageDiff(img,tab);
					console.log(image_dict);
				}
			}
		});

	},START_DELAY);
}


/*
 *	Compare the old image to the new one, set the pageAction pop up accordingly.
 *	
 *	img - new image to check with the old.
 *	tab - current tab.
 */
function checkPageDiff(img, tab){
	resemble(img).compareTo(image_dict[tab.id][1]).onComplete(function(data) {

		console.log(data.misMatchPercentage + "% change in original page." + tab.active);

		current_img = data.getImageDataUrl();
		current_pct = data.misMatchPercentage;

		if(data.misMatchPercentage < 20) {
			chrome.pageAction.setIcon({tabId:tab.id, path : ICON_SAFE });
		}else if(data.misMatchPercentage < 50) {
			chrome.pageAction.setIcon({tabId:tab.id, path : ICON_WARNING });
		}else{
			chrome.pageAction.setIcon({tabId:tab.id, path : ICON_HAZARD });
		}
		chrome.pageAction.show(tab.id);



		image_dict[tab.id] = [tab.url,img];
		start_screenshot_spam(tab.id);
	});
}


