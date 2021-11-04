
let canvas, ctx;
let baseImageMatrix;
let normalize = false;

window.onload = function () {
    canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
}

const toggleNormalize = (source) => normalize = source.srcElement.checked;

function loadAndConvolve() {
    let kernel = loadKernel();
    let result = convolve(baseImageMatrix, kernel);
    console.log(result.length, result[0].length);
    drawImageToCanvas(result);
    saveImage();
}

function loadKernel() {
    let kernel = []
    for (let i = 0; i < 3; i++) {
        kernel[i] = [];
        for (let j = 0; j < 3; j++) {
            kernel[i][j] = document.getElementById(`${i}${j}`).value;
        }
    }
    return kernel;
}

function convolve(matrix, kernel) {
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
        result[i] = [];
        for (let j = 0; j < matrix[i].length; j++) {
            result[i][j] = 0;
            for (let k = 0; k < kernel.length; k++) {
                for (let l = 0; l < kernel.length; l++) {
                    if (matrix[i + k - 1] && matrix[i + k - 1][j + l - 1]) {
                        result[i][j] += matrix[i + k - 1][j + l - 1] * kernel[k][l];
                    }
                }
            }
        }
    }
    return result;
}

function loadImage(evt) {
	let file = evt.target.files[0];
    let reader = new FileReader();
    reader.onload = (function() {
        return function(e) {
            getInfo(e.target.result);
        }
    })(file);
    reader.readAsDataURL(file)
}

function getInfo(pic) {
	let img = new Image;
	img.src = pic;

    img_elm = document.createElement('img');
    img_elm.src = pic;
    img_elm.id = 'base-image';
    document.getElementById("base-image-div").appendChild(img_elm);
    
	img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
		let data = ctx.getImageData(0, 0, img.width, img.height).data;
        createImageMatrix(data, canvas.width, canvas.height);
    }
}

function createImageMatrix(img, width, height) {
    matrix = [];
    for (let i = 0; i < width; i++) {
        matrix[i] = [];
        for (let j = 0; j < height; j++) {
            let index = (i * width + j) * 4;
            matrix[i].push(rgbToBw(img[index], img[index + 1], img[index + 2]));
        }
    }
    baseImageMatrix = matrix;
}

function drawImageToCanvas(image) {
    min = getArrayMin2D(image);
    max = getArrayMax2D(image);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < image.length; i++) {
        for (let j = 0; j < image[i].length; j++) {
            let value = image[i][j];
            if (normalize) {
                normalizedValue = (image[i][j] - min) / (max - min) * 255;
                value = Math.round(normalizedValue);
            }
            ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
            ctx.fillRect(j, i, 1, 1);
        }
    }
}

function saveImage() {
    let image_data = canvas.toDataURL('image/png');
    let img_elm = document.createElement('img');
    img_elm.src = image_data;
    img_elm.classList.add('edited-image');

    document.getElementById("edited-image-div").appendChild(img_elm);
}

function rgbToBw(r, g, b) {
    return Math.round((r + g + b) / 3);
}

const getArrayMin = array => array.reduce((a, b) => Math.min(a, b)); // Min of a single array
const getArrayMin2D = array2D => getArrayMin(array2D.map(getArrayMin)); // Min of a 2D array
const getArrayMax = array => array.reduce((a, b) => Math.max(a, b)); // Max of a single array
const getArrayMax2D = array2D => getArrayMax(array2D.map(getArrayMax)); // Max of a 2D array