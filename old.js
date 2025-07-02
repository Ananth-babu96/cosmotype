let data = {
   facts: [],
   eng1k: [],
   eng5k: [],
   eng10k: [],
   eng20k: [],
};
let newData = {
   short: [],
   medium: [],
   long: [],
   words: [],
   tricky: [],
};
const game = document.getElementById("words-container");
const words = document.getElementById("words");
const caret = document.getElementById("caret");
const resetBtn = document.getElementById("reset");
const timeLeft = document.getElementById("timeleft");
const wpm = document.getElementById("wpm");
const accuracy = document.getElementById("accuracy");
const durations = document.querySelectorAll(".duration");
const gameType = document.querySelectorAll(".game-type");
const themes = document.querySelectorAll(".theme");
const volumeBtn = document.getElementById("volume-btn");
const keySound = new Audio("audio/key-press-sound.wav");
const logo = document.getElementById("logo");

keySound.volume = 0.4;

let gameInterval = null;
let textData;
let selectedDuration = 15;
let selectedLength = "short";
let timer = selectedDuration;
let factsModeStartTime = null;
let gameStarted = false;
let gameOver = false;
let correctEntries = 0;
let totalTyped = 0;
let volume = true;

let currentGameMode = "facts";

//---------------------HELPER FUNCTIONS ---------------------------
const addClass = (el, cls) => {
   el.className += " " + cls;
};
const removeClass = (el, cls) => {
   el.className = el.className.replace(cls, "");
};

const calculateWpmAndAccuracy = () => {
   const minutes = selectedDuration / 60;
   const wordsperminute = Math.round(correctEntries / 5 / minutes);
   const acrcy = Math.round((correctEntries / totalTyped) * 100) || 0;
   wpm.textContent = wordsperminute;
   accuracy.textContent = `${acrcy}%`;
};
const calculateWpmAndAccuracyNoTimer = () => {
   const elapsedTimeInMinutes = (Date.now() - factsModeStartTime) / 1000 / 60;

   const wordsPerMinute =
      Math.round(correctEntries / 5 / elapsedTimeInMinutes) || 0;
   const acc = Math.round((correctEntries / totalTyped) * 100) || 0;

   wpm.textContent = wordsPerMinute;
   accuracy.textContent = `${acc}%`;
};

const updateCaretPosition = () => {
   const caret = document.getElementById("caret");
   const current = document.querySelector(".char.current");

   if (current) {
      const rect = current.getBoundingClientRect();
      const gameRect = game.getBoundingClientRect();

      caret.style.left = `${rect.left - gameRect.left}px`;
      caret.style.top = `${rect.top - gameRect.top}px`;
   }
};
const updateCharCounter = () => {
   if (currentGameMode === "facts") {
      const totalChars = document.querySelectorAll(".char").length;
      const typedChars = document.querySelectorAll(
         ".char.correct, .char.incorrect, .char.underline"
      ).length;

      timeLeft.textContent = `${typedChars} / ${totalChars}`;
   } else return;
};

words.addEventListener("click", () => {
   let typeMenu = document.getElementById("game-type-menu");
   let durMenu = document.getElementById("duration-menu");
   let themeMenu = document.getElementById("theme-menu");
   typeMenu.classList.remove("flex");
   typeMenu.classList.add("hidden");
   durMenu.classList.remove("grid");
   durMenu.classList.add("hidden");
   themeMenu.classList.remove("grid");
   themeMenu.classList.add("hidden");
});
//--------------------------CONENT LOAD----------------------------------//

window.addEventListener("DOMContentLoaded", async () => {
   const response = await fetch("./data.json");

   const list = await response.json();

   data.facts = await list.facts;
   data.english1k = await list.englishOneK;
   data.english5k = await list.englishFivek;
   data.english10k = await list.englishTenK;
   data.english20k = await list.englishTwentyK;

   const newRes = await fetch("./data/newdata.json");

   const newList = await newRes.json();

   newData.short = await newList.short;
   newData.medium = await newList.medium;
   newData.long = await newList.long;
   newData.words = await newList.words;
   newData.tricky = await newList.tricky;

   console.log(newData);

   await generateText();

   addClass(document.querySelector(".char"), "current");
   game.focus();
   console.log(selectedLength);
});
//-------------------------RANDOM TEXT GENERATION---------------------------------------

const generateText = async () => {
   if (currentGameMode === "facts") {
      let dataList =
         selectedLength === "short"
            ? newData.short
            : selectedLength === "medium"
            ? newData.medium
            : selectedLength === "long"
            ? newData.long
            : [];

      if (!dataList || dataList.length === 0) {
         console.warn("No data available for 'facts' mode");
         return;
      }

      let randIdx = Math.floor(Math.random() * dataList.length);
      document.getElementById("words").innerHTML = dataList[randIdx]
         .split("")
         .map((c) => `<span class="char">${c}</span>`)
         .join("");
   } else if (currentGameMode === "words" || currentGameMode === "tricky") {
      const modeData = newData[currentGameMode];

      if (!modeData || modeData.length === 0) {
         console.warn(`No data available for '${currentGameMode}' mode`);
         return;
      }

      let arrIdx = [...Array(modeData.length).keys()];
      let textList = [];

      for (let i = 0; i < 400; i++) {
         const randNum = Math.floor(Math.random() * arrIdx.length);
         textList.push(modeData[arrIdx[randNum]]);
         arrIdx.splice(randNum, 1);
      }

      document.getElementById("words").innerHTML = textList
         .join(" ")
         .split("")
         .map((c) => `<span class="char">${c}</span>`)
         .join("");
   }
};

//----------------------GAME MODE MENU LOGIC-----------------------------------.//

document.getElementById("game-type-btn").addEventListener("click", () => {
   let menu = document.getElementById("game-type-menu");
   if (menu.classList.contains("hidden")) {
      menu.classList.remove("hidden");
      menu.classList.add("flex");
   } else {
      menu.classList.remove("flex");
      menu.classList.add("hidden");
   }
   let durMenu = document.getElementById("duration-menu");
   let themeMenu = document.getElementById("theme-menu");
   durMenu.classList.remove("grid");
   durMenu.classList.add("hidden");
   themeMenu.classList.remove("grid");
   themeMenu.classList.add("hidden");
});
// gameType.forEach((btn) => {
//    btn.addEventListener("click", () => {
//       currentGameMode = btn.dataset.gamemode;
//       resetGame();
//       gameType.forEach((d) => removeClass(d, "current-type"));
//       addClass(btn, "current-type");
//       let menu = document.getElementById("game-type-menu");
//       menu.classList.remove("flex");
//       menu.classList.add("hidden");
//       document.getElementById("game-type-btn-txt").textContent =
//          setGameModeTxt(currentGameMode);
//    });
// });

// const setGameModeTxt = (curGmMd) => {
//    let txt = "";
//    switch (curGmMd) {
//       case "facts":
//          txt = "facts";
//          break;
//       case "english1k":
//          txt = "English 1k";
//          break;
//       case "english5k":
//          txt = "English 5k";
//          break;
//       case "english10k":
//          txt = "English 10k";
//          break;
//       case "english20k":
//          txt = "English 20k";
//          break;
//       default:
//          return;
//    }
//    return txt;
// };

//-----------------------MAIN GAME LOGIC-------------------------------------

game.addEventListener("keydown", (e) => {
   if (gameOver) return;
   const pressedKey = e.key;
   const currentChar = document.querySelector(".char.current");
   const expected = currentChar.innerHTML;
   let letterOrSpace = pressedKey.length === 1 || pressedKey === " ";
   let backSpace = pressedKey === "Backspace";

   if (letterOrSpace) {
      if (!gameStarted) {
         gameStarted = true;
         factsModeStartTime = Date.now(); // REMOVE this line for words & tricky

         // START TIMER for modes other than 'facts'
         if (currentGameMode !== "facts") {
            gameInterval = setInterval(() => {
               timer -= 1;
               timeLeft.innerHTML = timer;
               if (timer <= 0) {
                  clearInterval(gameInterval);
                  gameOver = true;
                  caret.style.display = "none";
                  words.style.opacity = "0.5";
                  calculateWpmAndAccuracy(); // TIMER-BASED CALCULATION
               }
            }, 1000);
         }
      }

      if (currentGameMode === "facts") {
         if (!currentChar.nextSibling) {
            gameOver = true;
            caret.style.display = "none";
            words.style.opacity = "0.5";
            clearInterval(gameInterval); // Stop timer if user finishes early

            if (currentGameMode === "facts") {
               calculateWpmAndAccuracyNoTimer();
            } else {
               calculateWpmAndAccuracy();
            }
         }
      }

      removeClass(document.getElementById("caret"), "caret-animation");

      if (pressedKey === expected) {
         correctEntries++;
         addClass(currentChar, "correct");
      } else if (expected === " " && pressedKey !== " ") {
         addClass(currentChar, "underline");
      } else {
         addClass(currentChar, "incorrect");
      }
      totalTyped++;

      if (volume) {
         keySound.currentTime = 0;
         keySound.play();
      }
      if (currentGameMode === "facts") {
         updateCharCounter();
      }
      addClass(currentChar.nextSibling, "current");
      removeClass(currentChar, "current");
   }

   if (backSpace) {
      if (e.ctrlKey || e.metaKey) {
         // Ctrl+Backspace: delete previous word
         let current = document.querySelector(".char.current");
         if (!current.previousSibling) return;

         let target = current.previousSibling;
         let deleted = 0;

         // Go back and remove until space or start
         while (target && target.textContent !== " ") {
            removeClass(target, "correct");
            removeClass(target, "incorrect");
            removeClass(target, "underline");
            deleted++;
            target = target.previousSibling;
         }

         // Move caret to last deleted character
         let newCurrent = current;
         for (let i = 0; i < deleted; i++) {
            if (newCurrent.previousSibling) {
               newCurrent = newCurrent.previousSibling;
            }
         }

         document
            .querySelectorAll(".char.current")
            .forEach((el) => removeClass(el, "current"));
         addClass(newCurrent, "current");

         totalTyped = Math.max(0, totalTyped - deleted);

         //  Reposition the caret visually
         if (currentGameMode === "facts") {
            updateCaretPosition();
         }
         return;
      }

      // Normal Backspace
      if (!currentChar.previousSibling) return;

      removeClass(currentChar, "current");
      removeClass(currentChar.previousSibling, "correct");
      removeClass(currentChar.previousSibling, "incorrect");
      removeClass(currentChar.previousSibling, "underline");
      addClass(currentChar.previousSibling, "current");

      updateCaretPosition();
      updateCharCounter();
   }

   //-----------caret and line positioning------------
   const rect = currentChar.nextSibling.getBoundingClientRect().top;
   const gameRect = document
      .getElementById("words-container")
      .getBoundingClientRect().top;

   const currentHeight = rect - gameRect;
   if (currentHeight > 80) {
      const words = document.getElementById("words");
      const currentMargin = parseInt(words.style.marginTop || "0px");
      words.style.marginTop = currentMargin - 48 + "px";
   }

   if (!currentChar.nextSibling) return;

   const current = document.querySelector(".char.current");

   if (current) {
      const rect = current.getBoundingClientRect();
      const gameRect = document
         .getElementById("words-container")
         .getBoundingClientRect();

      caret.style.left = `${rect.left - gameRect.left}px`;
      caret.style.top = `${rect.top - gameRect.top}px`;
   }
});

//-------------------------------CHANGE GAME DURATION----------------------------//
document.getElementById("game-duration-btn").addEventListener("click", () => {
   let menu = document.getElementById("duration-menu");
   if (menu.classList.contains("hidden")) {
      menu.classList.remove("hidden");
      menu.classList.add("grid");
   } else {
      menu.classList.remove("grid");
      menu.classList.add("hidden");
   }
   let typeMenu = document.getElementById("game-type-menu");
   let themeMenu = document.getElementById("theme-menu");
   typeMenu.classList.remove("flex");
   typeMenu.classList.add("hidden");
   themeMenu.classList.remove("flex");
   themeMenu.classList.add("hidden");
});

document.querySelectorAll(".text-duration").forEach((btn) => {
   btn.addEventListener("click", () => {
      if (gameStarted) return;
      // let menu = document.getElementById("duration-menu");

      selectedDuration = Number(btn.dataset.duration);
      timer = selectedDuration;
      timeLeft.textContent = selectedDuration;
      game.focus();
      addClass(document.getElementById("caret"), "caret-animation");

      durations.forEach((d) => removeClass(d, "current-duration"));
      addClass(btn, "current-duration");
      // menu.classList.remove("grid");
      // menu.classList.add("hidden");
   });
});

//--------------------------------RESET GAME---------------------------------------//

const resetGame = async () => {
   clearInterval(gameInterval);

   await generateText();

   timer = selectedDuration;
   wpm.textContent = "";
   accuracy.textContent = "";

   gameOver = false;
   gameStarted = false;
   totalTyped = 0;
   correctEntries = 0;

   words.style.opacity = "1";
   words.style.marginTop = "0px";
   caret.style.display = "block";
   addClass(document.getElementById("caret"), "caret-animation");

   document.querySelectorAll(".char").forEach((el) => {
      el.classList.remove("current", "correct", "incorrect", "underline");
   });

   const firstChar = document.querySelector(".char");
   if (firstChar) addClass(firstChar, "current");

   const rect = firstChar.getBoundingClientRect();
   const gameRect = game.getBoundingClientRect();
   caret.style.left = `${rect.left - gameRect.left}px`;
   caret.style.top = `${rect.top - gameRect.top + 4}px`;

   if (currentGameMode === "facts") {
      factsModeStartTime = Date.now();
      updateCharCounter(); // show 0 / total initially
      timeLeft.style.visibility = "visible"; // make sure it's shown
   } else {
      timeLeft.textContent = selectedDuration;
      timeLeft.style.visibility = "visible";
   }

   game.focus();
};

document.getElementById("reset").addEventListener("click", () => {
   resetGame();
});

//-----------------VOLUME BTN LOGIC ----------------------------------------//

volumeBtn.addEventListener("click", () => {
   let volumeIcon = document.getElementById("volume-icon");
   if (volume) {
      volume = false;
      removeClass(volumeIcon, "fa-volume-high");
      addClass(volumeIcon, "fa-volume-xmark");
   } else {
      volume = true;
      removeClass(volumeIcon, "fa-volume-xmark");
      addClass(volumeIcon, "fa-volume-high");
   }
});

//-------------------------SWITCH THEMES------------------------------------//

//----------------------------------------SELECT LENGTH ----------------------------------------------------

document.querySelectorAll(".text-length").forEach((btn) => {
   btn.addEventListener("click", () => {
      selectedLength = btn.dataset.length;
      resetGame();
   });
});

//-----------------------------------SELECT GAME MODES ----------------------------------
document.querySelectorAll(".mode").forEach((item) => {
   item.addEventListener("click", () => {
      const currentGameMode = item.dataset.mode;
      const lengthMenu = document.getElementById("length-menu");
      const durMenu = document.getElementById("duration-menu");

      if (currentGameMode === "facts") {
         // Show length menu
         lengthMenu.classList.remove("hidden");
         lengthMenu.classList.add("grid");

         // Hide duration menu
         durMenu.classList.add("hidden");
         durMenu.classList.remove("grid-cols-4");
      } else if (currentGameMode === "words" || currentGameMode === "tricky") {
         // Hide length menu
         lengthMenu.classList.add("hidden");
         lengthMenu.classList.remove("grid");

         // Show duration menu
         durMenu.classList.remove("hidden");
         durMenu.classList.add("grid-cols-4");
      }

      resetGame(); // make sure this function exists
   });
});
