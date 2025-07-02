let data = {
   eng200: [],
   eng1k: [],
   eng10k: [],
};
let factsList = {
   short: [],
   medium: [],
   long: [],
};
const game = document.getElementById("words-container");
const words = document.getElementById("words");
const caret = document.getElementById("caret");
const resetBtn = document.getElementById("reset");
const timeLeft = document.getElementById("timeleft");
const wpm = document.getElementById("wpm");
const accuracy = document.getElementById("accuracy");
const raw = document.getElementById("raw");
const keyStrokes = document.getElementById("keystrokes");
const cleanHits = document.getElementById("cleanHits");
const typos = document.getElementById("typos");
const volumeBtn = document.getElementById("volume-btn");
const lengths = document.querySelectorAll(".text-length");
const keySound = new Audio("../audio/key-press-sound.wav");
const resultWrapper = document.getElementById("result-box-wrapper");

keySound.volume = 0.4;

let gameInterval = null;
let textData;
let selectedDuration = 15;
let selectedLength = "short";
let selectedWordsCategory = "eng200";
let timer = selectedDuration;
let gameStarted = false;
let gameOver = false;
let correctEntries = 0;
let totalTyped = 0;
let volume = true;
let gameStartTime = null;

let currentGameMode = "facts";

//---------------------HELPER FUNCTIONS ---------------------------
const addClass = (el, cls) => {
   el.className += " " + cls;
};
const removeClass = (el, cls) => {
   el.className = el.className.replace(cls, "");
};

const calculateWpmAndAccuracy = () => {
   const elapsedTimeInMinutes = selectedDuration / 60;

   const minutes = selectedDuration / 60;
   const wordsperminute = Math.round(correctEntries / 5 / minutes);
   const acrcy = Math.round((correctEntries / totalTyped) * 100) || 0;
   const rawSpeed = Math.round(totalTyped / 5 / elapsedTimeInMinutes) || 0;
   const mistakes = totalTyped - correctEntries;

   if (wpm) wpm.textContent = wordsperminute;
   if (accuracy) accuracy.textContent = `${acrcy}%`;
   if (raw) raw.textContent = rawSpeed;
   if (keyStrokes) keyStrokes.textContent = totalTyped;
   if (cleanHits) cleanHits.textContent = correctEntries;
   if (typos) typos.textContent = mistakes;
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
// const updateCharCounter = () => {
//    const totalChars = document.querySelectorAll(".char").length;
//    const typedChars = document.querySelectorAll(
//       ".char.correct, .char.incorrect, .char.underline"
//    ).length;

//    timeLeft.textContent = `${typedChars} / ${totalChars}`;
// };

const calculateWpmAndAccuracyNoTimer = () => {
   const elapsedTimeInMinutes = (Date.now() - gameStartTime) / 1000 / 60;

   const wordsPerMinute =
      Math.round(correctEntries / 5 / elapsedTimeInMinutes) || 0;
   const acc = Math.round((correctEntries / totalTyped) * 100) || 0;
   const rawSpeed = Math.round(totalTyped / 5 / elapsedTimeInMinutes) || 0;
   const mistakes = totalTyped - correctEntries;

   // Safely update DOM if elements exist
   if (wpm) wpm.textContent = wordsPerMinute;
   if (accuracy) accuracy.textContent = `${acc}%`;
   if (raw) raw.textContent = rawSpeed;
   if (keyStrokes) keyStrokes.textContent = totalTyped;
   if (cleanHits) cleanHits.textContent = correctEntries;
   if (typos) typos.textContent = mistakes;
};

//--------------------------CONENT LOAD----------------------------------//

window.addEventListener("DOMContentLoaded", async () => {
   const response = await fetch("../data.json");

   const list = await response.json();

   data.eng200 = await list.eng200;
   data.eng1k = await list.englishOneK;
   data.eng10k = await list.englishTenK;

   const factData = await fetch("../data/newdata.json");
   const dataList = await factData.json();

   factsList.short = dataList.short;
   factsList.medium = dataList.medium;
   factsList.long = dataList.long;
   console.log(factsList);
   const savedWordsCat = localStorage.getItem("words-list");
   if (savedWordsCat) {
      selectedWordsCategory = savedWordsCat;
   } else {
      selectedWordsCategory = "eng200";
   }
   const savedDuration = localStorage.getItem("duration");
   if (savedDuration) {
      selectedDuration = Number(savedDuration);
   } else {
      selectedDuration = 15;
   }
   timer = selectedDuration;
   timeLeft.textContent = timer;
   await generateText();
   const modeClass = window.localStorage.getItem("mode");
   if (modeClass) {
      document.body.classList.add(modeClass);
   } else {
      document.body.classList.add("matrix");
   }
   addClass(document.querySelector(".char"), "current");
   document.querySelectorAll(".colors").forEach((item) => {
      const itemColorModeData = item.dataset.color;
      if (modeClass) {
         if (itemColorModeData === modeClass) {
            item.classList.add("current-color-mode");
         }
      } else {
         if (itemColorModeData === "matrix") {
            item.classList.add("current-color-mode");
         }
      }
   });
   document.querySelectorAll(".wordsFrom").forEach((item) => {
      const dataAttr = item.dataset.words;
      const savedInLocalStrg = window.localStorage.getItem("words-list");

      if (savedInLocalStrg) {
         if (dataAttr === savedInLocalStrg) {
            item.classList.add("current-words-list");
         }
      } else {
         if (dataAttr === "eng200") {
            item.classList.add("current-words-list");
         }
      }
   });
   lengths.forEach((btn) => {
      btn.classList.remove("current-length");
      const lengthData = btn.dataset.duration;
      const savedDurationData = localStorage.getItem("duration");
      if (savedDurationData) {
         if (lengthData === savedDurationData) {
            btn.classList.add("current-length");
         }
      } else {
         if (lengthData === "15") {
            btn.classList.add("current-length");
         }
      }
   });

   game.focus();
});
//-------------------------RANDOM TEXT GENERATION---------------------------------------

const generateText = async () => {
   let selectedWordsArr =
      selectedWordsCategory === "eng200"
         ? data.eng200
         : selectedWordsCategory === "eng1k"
         ? data.eng1k
         : selectedWordsCategory === "eng10k"
         ? data.eng10k
         : [];

   let arrIdx = [...Array(selectedWordsArr.length).keys()];
   //    const maxItems = currentGameMode === "facts" ? 6 : 300;
   //    const totalItems = Math.min(data[currentGameMode].length, maxItems);
   let textList = [];
   for (let i = 0; i < 300; i++) {
      const randNum = Math.floor(Math.random() * arrIdx.length);
      textList.push(selectedWordsArr[arrIdx[randNum]]);
      arrIdx.splice(randNum, 1);
   }
   document.getElementById("words").innerHTML = textList
      .join(" ")
      .split("")
      .map((c, _) => {
         return `<span class="char">${c}</span>`;
      })
      .join("");
};

//----------------------GAME MODE MENU LOGIC-----------------------------------.//

// document.getElementById("game-type-btn").addEventListener("click", () => {
//    let menu = document.getElementById("game-type-menu");
//    if (menu.classList.contains("hidden")) {
//       menu.classList.remove("hidden");
//       menu.classList.add("flex");
//    } else {
//       menu.classList.remove("flex");
//       menu.classList.add("hidden");
//    }
//    let durMenu = document.getElementById("duration-menu");
//    let themeMenu = document.getElementById("theme-menu");
//    durMenu.classList.remove("grid");
//    durMenu.classList.add("hidden");
//    themeMenu.classList.remove("grid");
//    themeMenu.classList.add("hidden");
// });
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
         gameInterval = setInterval(() => {
            timer -= 1;
            timeLeft.innerHTML = timer;
            if (timer <= 0) {
               clearInterval(gameInterval);
               gameOver = true;
               words.style.opacity = "0.5";
               clearInterval(gameInterval); // Stop timer if user finishes early
               calculateWpmAndAccuracy();
               removeClass(resultWrapper, "hidden");
               addClass(resultWrapper, "flex");
            }
         }, 1000);
      }
      //   if (!gameStarted) {
      //      gameStarted = true;
      //      gameStartTime = Date.now();
      //   }
      // if (!currentChar.nextSibling) {
      //    gameOver = true;
      //    caret.style.display = "none";
      //    words.style.opacity = "0.5";
      //    clearInterval(gameInterval);
      //    calculateWpmAndAccuracyNoTimer();
      //    removeClass(resultWrapper, "hidden");
      //    addClass(resultWrapper, "flex");
      //    if (currentGameMode === "facts") {
      //       calculateWpmAndAccuracyNoTimer();
      //    } else {
      //       calculateWpmAndAccuracy();
      //    }
      // }
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
      if (currentChar.nextSibling) {
         addClass(currentChar.nextSibling, "current");
         removeClass(currentChar, "current");
      }
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

         // 🧿 Reposition the caret visually
         updateCaretPosition();

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
lengths.forEach((item) => {
   item.addEventListener("click", () => {
      // Remove 'current-length' from all buttons
      lengths.forEach((btn) => btn.classList.remove("current-length"));

      // Add 'current-length' to the clicked one
      item.classList.add("current-length");

      // Set selected length and reset
      selectedDuration = Number(item.dataset.duration);
      timeLeft.textContent = selectedDuration;
      localStorage.setItem("duration", item.dataset.duration);
      resetGame();
   });
});

//--------------------------------RESET GAME---------------------------------------//

const resetGame = async () => {
   clearInterval(gameInterval);

   await generateText();

   timer = selectedDuration;
   timeLeft.textContent = selectedDuration;
   // wpm.textContent = "";
   // accuracy.textContent = "";

   gameOver = false;
   gameStarted = false;
   totalTyped = 0;
   correctEntries = 0;
   gameStartTime = null;
   words.style.opacity = "1";
   words.style.marginTop = "0px";
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
      volumeIcon.classList.remove("fa-volume-high");
      volumeIcon.classList.add("fa-volume-xmark");
   } else {
      volume = true;
      volumeIcon.classList.remove("fa-volume-xmark");
      volumeIcon.classList.add("fa-volume-high");
   }
});

//-------------------------SWITCH THEMES------------------------------------//
document.getElementById("restart-button").addEventListener("click", () => {
   removeClass(resultWrapper, "flex");
   addClass(resultWrapper, "hidden");
   resetGame();
});

document.querySelectorAll(".colors").forEach((btn) => {
   btn.addEventListener("click", () => {
      const mode = btn.dataset.color;
      document.body.classList.remove("matrix");
      document.body.classList.remove("quantum");
      document.body.classList.remove("void");
      document.body.classList.remove("ghostline");
      document.body.classList.remove("suncode");

      document.querySelectorAll(".colors").forEach((item) => {
         item.classList.remove("current-color-mode");
      });
      btn.classList.add("current-color-mode");

      document.body.classList.add(mode);
      localStorage.setItem("mode", mode);
      game.focus();
   });
});

//-------------------------switch words modes------------------------------------------
document.querySelectorAll(".wordsFrom").forEach((words) => {
   words.addEventListener("click", () => {
      const dataAttr = words.dataset.words;
      selectedWordsCategory = dataAttr;
      document.querySelectorAll(".wordsFrom").forEach((item) => {
         item.classList.remove("current-words-list");
      });
      words.classList.add("current-words-list");
      localStorage.setItem("words-list", dataAttr);
      resetGame();
   });
});
