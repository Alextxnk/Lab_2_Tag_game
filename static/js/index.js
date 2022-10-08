'use strict';


const containerNode = document.getElementById('fifteen');
const itemNodes = Array.from(containerNode.querySelectorAll('.item'));
const countItems = 16;

// вывод ошибки в консоль
if (itemNodes.length !== 16) {
   throw new Error(`Должно быть ровно ${countItems} элементов в HTML`);
}

/** 1. Position */
itemNodes[countItems - 1].style.display = 'none'; // убираем 16 элемент 
// создаем матрицу 4х4
let matrix = getMatrix(
   itemNodes.map((item) => Number(item.dataset.matrixId))
);
console.log(matrix); // матрица 4х4
setPositionItems(matrix);

/** 2. Shuffle */
document.getElementById('shuffle').addEventListener('click', () => {
   const flatMatrix = matrix.flat(); // сделали одномерный массив из матрицы
   // console.log(flatMatrix); // одномерный массив

   const shufledArray = shuffleArray(flatMatrix);
   // console.log(shufledArray);
   matrix = getMatrix(shufledArray);
   console.log(matrix); // перемешанная матрица
   setPositionItems(matrix);
});

/** 3. Change position by click */
const blankNumber = 16; // пустой квадрат 
// делаем с помощью дилегирования событий
containerNode.addEventListener('click', (event) => {
   const buttonNode = event.target.closest('button');
   if (!buttonNode) {
      return;
   }

   const buttonNumber = Number(buttonNode.dataset.matrixId); // получаем номер, по которому кликнули

   const buttonCoords = findCoordinatesByNumber(buttonNumber, matrix);
   const blankCoords = findCoordinatesByNumber(blankNumber, matrix);

   const isValid = isValidForSwap(buttonCoords, blankCoords);
   // console.log(isValid);

   if (isValid) {
      swap(buttonCoords, blankCoords, matrix);
      setPositionItems(matrix);
   }
});

/** 4. Change position by arrows */
window.addEventListener('keydown', (event) => {
   // console.log(event.key);
   if (!event.key.includes('Arrow')) {
      return;
   }

   const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
   const buttonCoords = {
      x: blankCoords.x,
      y: blankCoords.y
   };
   const direction = event.key.split('Arrow')[1].toLowerCase();
   // console.log(direction);
   const maxIndexMatrix = matrix.length;

   switch (direction) {
      case 'up':
         buttonCoords.y += 1;
         break;
      case 'down':
         buttonCoords.y -= 1;
         break;
      case 'left':
         buttonCoords.x += 1;
         break;
      case 'right':
         buttonCoords.x -= 1;
         break;
   }

   if (buttonCoords.y >= maxIndexMatrix || buttonCoords.y < 0 ||
      buttonCoords.x >= maxIndexMatrix || buttonCoords.x < 0) {
      return;
   }

   // если все условия выполнились - меняем позицию
   swap(buttonCoords, blankCoords, matrix);
   setPositionItems(matrix);
});

/** 5. Show won */


/** Helpers */
// создаем матрицу из массива
function getMatrix(arr) {
   const matrix = [[], [], [], []];
   let y = 0;
   let x = 0;

   for (let i = 0; i < arr.length; i++) {
      if (x >= 4) {
         y++;
         x = 0;
      }

      matrix[y][x] = arr[i];
      x++;
   }

   return matrix;
}

function setPositionItems(matrix) {
   // пробегаемся циклами по двумерному массиву
   for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
         const value = matrix[y][x];
         const node = itemNodes[value - 1];
         setNodeStyles(node, x, y);
      }
   }
}

// в зависимости от координат матрицы будем устанавливать позицию 
function setNodeStyles(node, x, y) {
   const shiftPs = 100; // сдвиг на 100%
   node.style.transform = `translate3D(${x *shiftPs}%, ${y * shiftPs}%, 0)`;
}

function shuffleArray(arr) {
   return arr
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
}

function findCoordinatesByNumber(number, matrix) {
   for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
         if (matrix[y][x] === number) {
            return {x, y};
         }
      }
   }
   return null;
}

function isValidForSwap(coords1, coords2) {
   const diffX = Math.abs(coords1.x - coords2.x);
   const diffY = Math.abs(coords1.y - coords2.y);

   // нужно чтобы разница по x или y была 1 и одна из координат совпадала
   return (diffX === 1 || diffY === 1) && (coords1.x === coords2.x || coords1.y === coords2.y);
}

function swap(coords1, coords2, matrix) {
   const coords1Number = matrix[coords1.y][coords1.x];
   matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
   matrix[coords2.y][coords2.x] = coords1Number;

   if (isWon(matrix)) {
      addWonClass();
   }
}

const winFlatArr = new Array(16).fill(0).map((item, i) => i + 1);
console.log(winFlatArr);

function isWon(matrix) {
   const flatMatrix = matrix.flat();
   for (let i = 0; i < winFlatArr.length; i++) {
      if (flatMatrix[i] !== winFlatArr[i]) {
         return false;
      }
   }

   return true;
}

const wonClass = 'fifteenWon';
function addWonClass() {
   setTimeout(() => {
      containerNode.classList.add(wonClass);

      setTimeout(() => {
         containerNode.classList.remove(wonClass);
      }, 1000);
   }, 200);
}