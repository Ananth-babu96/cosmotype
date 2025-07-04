let data = {
   facts: [],
   eng1k: [],
   eng5k: [],
   eng10k: [],
   eng20k: [],
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
const volumeBtnMobile = document.getElementById("volume-btn-mobile");
const lengths = document.querySelectorAll(".text-length");
const keySound = new Audio("audio/key-press-sound.wav");
const resultWrapper = document.getElementById("result-box-wrapper");
const mobileMenuOpenBtn = document.getElementById("mobile-menu-open-btn");
const mobileMenuCloseBtn = document.getElementById("mobile-menu-close-btn");

keySound.volume = 0.4;

let gameInterval = null;
let textData;
let selectedDuration = 15;
let selectedLength = "short";
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
   // const minutes = selectedDuration / 60;
   // const wordsperminute = Math.round(correctEntries / 5 / minutes);
   // const acrcy = Math.round((correctEntries / totalTyped) * 100) || 0;
   // wpm.textContent = wordsperminute;
   // accuracy.textContent = `${acrcy}%`;
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
const updateCharCounter = () => {
   const totalChars = document.querySelectorAll(".char").length;
   const typedChars = document.querySelectorAll(
      ".char.correct, .char.incorrect, .char.underline"
   ).length;

   timeLeft.textContent = `${typedChars} / ${totalChars}`;
};

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
   const response = await fetch("./data.json");

   const list = await response.json();

   data.facts = await list.facts;
   data.english1k = await list.englishOneK;
   data.english5k = await list.englishFivek;
   data.english10k = await list.englishTenK;
   data.english20k = await list.englishTwentyK;

   const factData = await fetch("./data/newdata.json");
   const dataList = await factData.json();

   factsList.short = dataList.short;
   factsList.medium = dataList.medium;
   factsList.long = dataList.long;
   selectedLength = localStorage.getItem("length") || "short";
   const modeClass = window.localStorage.getItem("mode");
   if (modeClass) {
      document.body.classList.add(modeClass);
   } else {
      document.body.classList.add("matrix");
   }
   await generateText();

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
   lengths.forEach((btn) => {
      btn.classList.remove("current-length");
      const lengthData = btn.dataset.length;
      const savedLengthData = localStorage.getItem("length");
      if (savedLengthData) {
         if (lengthData === savedLengthData) {
            btn.classList.add("current-length");
         }
      } else {
         if (lengthData === "short") {
            btn.classList.add("current-length");
         }
      }
   });

   updateCharCounter();
   game.focus();
});
//-------------------------RANDOM TEXT GENERATION---------------------------------------

const generateText = async () => {
   let dataList =
      selectedLength === "short"
         ? factsList.short
         : selectedLength === "medium"
         ? factsList.medium
         : selectedLength === "long"
         ? factsList.long
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
      // if (!gameStarted) {
      //    gameStarted = true;
      //    gameInterval = setInterval(() => {
      //       timer -= 1;
      //       timeLeft.innerHTML = timer;
      //       if (timer <= 0) {
      //          clearInterval(gameInterval);
      //          gameOver = true;
      //          caret.style.display = "none";
      //          words.style.opacity = "0.5";
      //          calculateWpmAndAccuracy();
      //       }
      //    }, 1000);
      // }
      if (!gameStarted) {
         gameStarted = true;
         gameStartTime = Date.now();
      }
      if (!currentChar.nextSibling) {
         gameOver = true;
         clearInterval(gameInterval); // Stop timer if user finishes early
         calculateWpmAndAccuracyNoTimer();
         removeClass(resultWrapper, "hidden");
         addClass(resultWrapper, "flex");
         // if (currentGameMode === "facts") {
         //    calculateWpmAndAccuracyNoTimer();
         // } else {
         //    calculateWpmAndAccuracy();
         // }
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
      updateCharCounter();
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

//-------------------------------CHANGE GAME LENGTH----------------------------//
lengths.forEach((item) => {
   item.addEventListener("click", () => {
      // Remove 'current-length' from all buttons
      lengths.forEach((btn) => btn.classList.remove("current-length"));

      // Add 'current-length' to the clicked one
      item.classList.add("current-length");

      // Set selected length and reset
      selectedLength = item.dataset.length;
      localStorage.setItem("length", item.dataset.length);
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

   updateCharCounter();

   game.focus();
};

document.getElementById("reset").addEventListener("click", () => {
   resetGame();
});

//-----------------VOLUME BTN LOGIC ----------------------------------------//
volumeBtn.addEventListener("click", () => {
   let volumeIcon = document.getElementById("volume-icon");
   let volumeIconMobile = document.getElementById("volume-icon-mobile");

   if (volume) {
      volume = false;
      volumeIcon.classList.remove("fa-volume-high");
      volumeIcon.classList.add("fa-volume-xmark");
      volumeIconMobile.classList.remove("fa-volume-high");
      volumeIconMobile.classList.add("fa-volume-xmark");
   } else {
      volume = true;
      volumeIcon.classList.remove("fa-volume-xmark");
      volumeIcon.classList.add("fa-volume-high");
      volumeIconMobile.classList.remove("fa-volume-xmark");
      volumeIconMobile.classList.add("fa-volume-high");
   }
});
volumeBtnMobile.addEventListener("click", () => {
   let volumeIcon = document.getElementById("volume-icon");
   let volumeIconMobile = document.getElementById("volume-icon-mobile");
   if (volume) {
      volume = false;
      volumeIcon.classList.remove("fa-volume-high");
      volumeIcon.classList.add("fa-volume-xmark");
      volumeIconMobile.classList.remove("fa-volume-high");
      volumeIconMobile.classList.add("fa-volume-xmark");
   } else {
      volume = true;
      volumeIcon.classList.remove("fa-volume-xmark");
      volumeIcon.classList.add("fa-volume-high");
      volumeIconMobile.classList.remove("fa-volume-xmark");
      volumeIconMobile.classList.add("fa-volume-high");
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
//-----------------------------ham menu logic----------------------------------------------------

mobileMenuOpenBtn.addEventListener("click", () => {
   const mobileMenu = document.getElementById("mobile-nav");
   mobileMenu.classList.remove("hidden");
   mobileMenu.classList.add("fixed");
});
mobileMenuCloseBtn.addEventListener("click", () => {
   const mobileMenu = document.getElementById("mobile-nav");
   mobileMenu.classList.remove("fixed");
   mobileMenu.classList.add("hidden");
});
