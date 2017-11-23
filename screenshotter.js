

var image_dict = {};

var INTERVAL = 5000;


function spamScreenShots(id){
		chrome.tabs.captureVisibleTab({format : "png"}, function(img){
			console.log("firing");
			image_dict[id][1] = img;
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

	chrome.tabs.get(activeInfo.tabId, function callback(tab){

		var url = new URL(tab.url); 
		
		if(!(url.protocol == "https:" || url.protocol == "http:")){
			return;
		}

		chrome.tabs.captureVisibleTab({format : "png"}, function(img) {
			
			//stop the old thread of spamming screenshots
			clearInterval(screenshot_thread);

			if(image_dict[tab.id] === undefined){
				image_dict[tab.id] = [tab.url,img];
				console.log(image_dict)
			}else{
				if(tab.active){
					resemble(img).compareTo(image_dict[tab.id][1]).onComplete(function(data) {

						console.log(data.misMatchPercentage + "% change in original page." + tab.active);

						//TODO DO SOMETHING WITH THIS PERCENTAGE
						image_dict[tab.id] = [tab.url,img];
						console.log(image_dict)
					});
				}
			}

			//start up the old screenshot spam thread
			screenshot_thread = setInterval(spamScreenShots,INTERVAL,tab.id);

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

		var url = new URL(tab.url);

		//stop the old thread of spamming screenshots
		clearInterval(screenshot_thread);

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





