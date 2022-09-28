'use strict';


const containerNode = document.getElementById('fifteen');
const itemNodes = Array.from(containerNode.querySelectorAll('.item'));
const countItems = 16;

if (itemNodes.length !== 16) {
   throw new Error(`Должно быть ровно ${countItems} элементов в HTML`);
}

/** 1. Position */
let matrix = getMatrix(
   itemNodes.map((item) => Number(item.dataset.matrixId))
);

/** 2. Shuffle */
/** 3. Change position by click */
/** 4. Change position by keydown */

/** Helpers */
function getMatrix(arr) {
   
}