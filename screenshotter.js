//TODO ORGANIZE THIS MESS

var image_dict = {};

var INTERVAL = 5000;

var current_img = null;
var current_pct = 0;

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

//var screenshot_thread = setInterval(spamScreenShots,INTERVAL,1,"test");
var screenshot_thread = null;


//imagePercentDiff("People.jpg","People2.jpg", function(percentdiff) {
//  console.log(percentdiff);
//});
//addDiffImage(document.body,"People.jpg","People2.jpg");
	



/*
 *
 * When a tab is selected one of two things can happen:
 * 	- It's not in the dictionary and an entry needs to be made.
 * 	- It's in the dictonary and the screenshot needs to be compared.
 *
 */
chrome.tabs.onActivated.addListener(function listener(activeInfo) {

	//stop the screenshot spam
	clearInterval(screenshot_thread);
	
	
	chrome.tabs.get(activeInfo.tabId, function callback(tab){
		if(tab.url === undefined) {
			return;
		}

		var url = new URL(tab.url); 
		
		if(!(url.protocol == "https:" || url.protocol == "http:")){
                	return;
		}

		chrome.pageAction.hide(tab.id);

		chrome.tabs.captureVisibleTab({format : "png"}, function(img) {
			clearInterval(screenshot_thread);

			if(image_dict[tab.id] === undefined){
				image_dict[tab.id] = [tab.url,img];
				console.log(image_dict);
				screenshot_thread = setInterval(spamScreenShots,INTERVAL,tab.id);
			}else{
				if(tab.active){
					resemble(img).compareTo(image_dict[tab.id][1]).onComplete(function(data) {

						console.log(data.misMatchPercentage + "% change in original page." + tab.active);

						if(data.misMatchPercentage > 0) {
							current_img = data.getImageDataUrl();
							current_pct = data.misMatchPercentage;

							//pop up
							chrome.pageAction.show(tab.id);
							chrome.pageAction.setIcon({tabId:tab.id, path : {"32":"/icons/glyphicons-532-hazard.png"}});

							delete image_dict[tab.id];
							return;
						}
						image_dict[tab.id] = [tab.url,img];
						console.log(image_dict);
						screenshot_thread = setInterval(spamScreenShots,INTERVAL,tab.id);
					});
				}
			}
		});
	});
});


/*
 *
 * If a tab is deleted it's entry is removed the entry from the dictionary
 *
 */
chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {

	delete image_dict[tabId];
	console.log(image_dict);
});



/*
 *
 * When there's a new page loaded put a new entry in the dictionary
 *
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

	if(tab.active && changeInfo.status=="complete"){
		clearInterval(screenshot_thread);

		var url = new URL(tab.url);

		//stop the old thread of spamming screenshots

		if(url.protocol == "https:" || url.protocol == "http:"){
			chrome.tabs.captureVisibleTab({format : "png"}, function(img) {
				image_dict[tab.id] = [tab.url,img];
				console.log(image_dict)

				//start up the old screenshot spam thread
				screenshot_thread = setInterval(spamScreenShots,INTERVAL,tab.id);
			});
		}
	}
});





