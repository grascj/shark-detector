function imagePercentDiff(image1Path, image2Path, callback) {
    if((image1Path === undefined) || (image2Path === undefined) || (callback === undefined))
        throw "requires 2 arguments";
    if((typeof image1Path !== 'string') && !(image1Path instanceof String))
        throw "image1Path not a string";
    if((typeof image2Path !== 'string') && !(image2Path instanceof String))
        throw "image2Path not a string";
    if(!(callback instanceof Function))
        throw "callback is not a function";

    var percentDiff = 0;
    var diffImageData = resemble(image1Path).compareTo(image2Path).onComplete(function(data) {
        percentDiff = data.misMatchPercentage;
        console.log(percentDiff);
        callback(percentDiff);
    });
}

function addDiffImage(parentElement, image1Path, image2Path) {
    if((image1Path === undefined) || (image2Path === undefined) || (parentElement === undefined))
        throw "requires 3 arguments";
    if((typeof image1Path !== 'string') && !(image1Path instanceof String))
        throw "image1Path not a string";
    if((typeof image2Path !== 'string') && !(image2Path instanceof String))
        throw "image2Path not a string";
    if(!(parentElement instanceof HTMLElement))
        throw "parentElement not a HTML DOM element";

    var imageDiff = new Image();
    var diffImageData = resemble(image1Path).compareTo(image2Path).onComplete(function(data) {
        imageDiff.src = data.getImageDataUrl();
        parentElement.appendChild(imageDiff);
    });
}
