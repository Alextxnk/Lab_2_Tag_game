'use strict';


const gameNode = document.getElementById('game');
const containerNode = document.getElementById('fifteen');
const itemNodes = Array.from(containerNode.querySelectorAll('.item'));
const countItems = 16;

// Timer fields 
const minuteElement = document.querySelector('.minuteVal');
const secondElement = document.querySelector('.secondVal');

// Variables
let minute = 0;
let second = 0;
let millisecond = 0;
let interval;

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
const maxShuffleCount = 5;
let timer;
let shuffled = false;
const shuffledClassName = 'gameShuffle';

document.getElementById('shuffle').addEventListener('click', () => {
   if (shuffled) {
      return;
   }

   shuffled = true;
   let shuffleCount = 0;
   clearInterval(timer);
   gameNode.classList.add(shuffledClassName);

   if (shuffleCount === 0) {
      timer = setInterval(() => {
         randomSwap(matrix);
         setPositionItems(matrix);

         shuffleCount++;

         if (shuffleCount >= maxShuffleCount) {
            clearInterval(interval);
            clearFields();
            interval = setInterval(startTimer, 10);

            gameNode.classList.remove(shuffledClassName);
            clearInterval(timer);
            shuffled = false;
         }
      }, 70);
   }
});

/** 3. Change position by click */
const blankNumber = 16; // пустой квадрат 
// делаем с помощью дилегирования событий
containerNode.addEventListener('click', (event) => {
   if (shuffled) {
      return;
   }
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
   if (shuffled) {
      return;
   }

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


/** Helpers */
let blockedCoords = null;

function randomSwap(matrix) {
   const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
   // console.log(blankCoords);

   const validCoords = findValidCoords({
      blankCoords,
      matrix,
      blockedCoords
   });

   // console.log(validCoords);
   // console.log(Math.floor(Math.random() * validCoords.length));
   const swapCoords = validCoords[
      Math.floor(Math.random() * validCoords.length)
   ];

   swap(blankCoords, swapCoords, matrix);
   blockedCoords = blankCoords; // блокируем, уже сдвинутую кнопку
}

function findValidCoords({ blankCoords, matrix, blockedCoords }) {
   const validCoords = [];

   for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
         if (isValidForSwap({x, y}, blankCoords)) {
            if (!blockedCoords || !(
               blockedCoords.x === x && blockedCoords.y === y
            )) {
               validCoords.push({x, y});
            }
         }
      }
   }

   return validCoords;
}

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

let resultCount = 0;

function swap(coords1, coords2, matrix) {
   const coords1Number = matrix[coords1.y][coords1.x];
   matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
   matrix[coords2.y][coords2.x] = coords1Number;

let result;
let name;
   if (isWon(matrix)) {
      if (second <= 9) {
         result = "00:0" + second;
      }
      if (second > 9 && second <= 59) {
         result = "00:" + second;
      }
      if (minute <= 9 && second <= 9) {
         result = "0" + minute + ":0" + second;
      }
      if ((minute > 9 && minute <= 59) && second <= 9) {
         result = minute + ":0" + second;
      }
      if (minute <= 9 && (second > 9 && second <= 59)) {
         result = "0" + minute + ":" + second;
      }
      if ((minute > 9 && minute <= 59) && (second > 9 && second <= 59)) {
         result = minute + ":" + second;
      }
      console.log(result);

      clearInterval(interval);
      clearFields();

      let resultInterval;
      
      if (result !== '00:00') {
         resultCount++;
         resultInterval = setTimeout(() => {
            name = prompt('Поздравляю, вы победили, введите ваше имя:');
            console.log(name);

            localStorage.setItem(name, result);
         }, 200);
         
         addWonClass();
         // addTableResult();
      }
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


// Timer
// Listeners 
const claearLocalStorageButton =  document.getElementById('claear_local_storage');
const showTableButton = document.getElementById('show_table');
const table = document.querySelector('.table');

showTableButton.addEventListener('click', () => {
   if (table.classList.value === 'table') {
      table.classList.add('table__show');
      table.classList.remove('table');
      showTableButton.textContent = 'Скрыть таблицу рекордов';
      claearLocalStorageButton.classList.remove('button_hide');
   } else if (table.classList.value === 'table__show') {
      table.classList.add('table');
      table.classList.remove('table__show');
      showTableButton.textContent = 'Таблица рекордов';
      claearLocalStorageButton.classList.add('button_hide');
   }
});

claearLocalStorageButton.addEventListener('click', () => {
   let ask = confirm('Вы действительно хотите очистить таблицу?');
   if (ask === true) {
      localStorage.clear();
   }
});

const tbody = document.querySelector('.tbody');
const tr = document.querySelector('.tr');

const hideThClass = 'hideTh'

function addTableResult() {
   for (let i = 0; i < localStorage.length; i++) {
      tbody.innerHTML += `<tr><th>${i + 1}</th><th>${localStorage.key(i)}</th><th>${localStorage.getItem(localStorage.key(i))}</th><th class="${hideThClass}">${i}</th></tr>`;
   }
}
addTableResult();
console.log(tbody);

function startTimer() {
   millisecond++;

   if (millisecond > 99) {
      second++;
      millisecond = 0;
   }

   // Seconds
   if (second <= 9) {
      secondElement.innerText = "0" + second;
   } 
   if (second > 9) {
      secondElement.innerText = second;
   } 
   if (second > 59) {
      minute++;
      minuteElement.innerText = "0" + minute;
      second = 0;
      secondElement.innerText = "0" + second;
   }

   // Minutes
   if (minute <= 9) {
      minuteElement.innerText = "0" + minute;
   } 
   if (minute > 9) {
      minuteElement.innerText = minute;
   } 
   if (minute > 59) {
      return;
   }
}

function clearFields() {
   minute = 0;
   second = 0;
   millisecond = 0;
   minuteElement.textContent = "00";
   secondElement.textContent = "00";
}