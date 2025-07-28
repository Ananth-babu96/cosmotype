let factsList = {
   short: [],
   medium: [],
   long: [],
   eng200: [],
   eng1k: [],
   eng10k: [],
   numbers: [],
};
let tips = {
   below_40_wpm: [],
   from_40_60: [],
   above_60: [],
};
const game = document.getElementById("words-container");
const testResult = document.getElementById("test-result");
const words = document.getElementById("words");
const caret = document.getElementById("caret");
const resetBtn = document.getElementById("reset");
const timeLeft = document.getElementById("timeleft");
const wpm = document.getElementById("wpm");
const accuracy = document.getElementById("accuracy");
const wpmCircle = document.getElementById("wpm-circle");
const rawCircle = document.getElementById("raw-circle");
const accCircle = document.getElementById("accuracy-circle");
const raw = document.getElementById("raw");
const modes = document.querySelectorAll(".test-mode");
const volumeBtn = document.getElementById("volume-btn");
const volumeBtnMobile = document.getElementById("volume-btn-mobile");
const lengths = document.querySelectorAll(".text-length");
const keySound = new Audio("audio/key-press-sound.wav");
const mobileMenuOpenBtn = document.getElementById("mobile-menu-open-btn");
const mobileMenuCloseBtn = document.getElementById("mobile-menu-close-btn");
const volumeIcon = document.getElementById("volume-icon");
const volumeIconMobile = document.getElementById("volume-icon-mobile");
const tipForUser = document.getElementById("tip");
const keyOne = new Audio("audio/comboKyes/key1.wav");
const keyTwo = new Audio("audio/comboKyes/key2.wav");
const keyThree = new Audio("audio/comboKyes/key3.wav");
const keyFour = new Audio("audio/comboKyes/key4.wav");
const keyFive = new Audio("audio/comboKyes/key5.wav");
const keySix = new Audio("audio/comboKyes/key6.wav");

const playRandomSound = () => {
   // keySound.currentTime = 0;
   // keySound.play();
   const soundsArr = [keyOne, keyTwo, keyThree, keyFour, keyFive, keySix];
   let randomSound = Math.floor(Math.random() * soundsArr.length);
   soundsArr[randomSound].currentTime = 0;
   soundsArr[randomSound].play();
};

let gameInterval = null;
let textData;
let selectedDuration = 15;
let selectedLength = "long";
let timer = selectedDuration;
let gameStarted = false;
let gameOver = false;
let correctEntries = 0;
let totalTyped = 0;
let totalMistakes = 0;
let volume = true;
let gameStartTime = null;

let currentGameMode = "facts";

let selectedTestMode = "english200";
let selectedTestDuration = "short";

document.addEventListener("DOMContentLoaded", async () => {
   const tipsData = await fetch("./data/tips.json");
   const data = await tipsData.json();

   tips.below_40_wpm = await data.tips_below_40_wpm;
   tips.from_40_60 = await data.tips_40_60_wpm;
   tips.above_60 = await data.tips_above_60_wpm;

   const savedVolumeData = window.localStorage.getItem("volume");
   if (savedVolumeData) {
      if (savedVolumeData === "on") {
         volume = true;
         volumeIcon.classList.add("fa-volume-high");
         volumeIcon.classList.remove("fa-volume-xmark");
         volumeIconMobile.classList.add("fa-volume-high");
         volumeIconMobile.classList.remove("fa-volume-xmark");
      } else if (savedVolumeData === "off") {
         volume = false;
         volumeIcon.classList.remove("fa-volume-high");
         volumeIcon.classList.add("fa-volume-xmark");
         volumeIconMobile.classList.remove("fa-volume-high");
         volumeIconMobile.classList.add("fa-volume-xmark");
      }
   } else {
      volume = true;
   }
});
//---------------------HELPER FUNCTIONS ---------------------------
const addClass = (el, cls) => {
   el.className += " " + cls;
};
const removeClass = (el, cls) => {
   el.className = el.className.replace(cls, "");
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
   // const acc = Math.round((correctEntries / totalTyped) * 100) || 0;

   const totalAttempts = correctEntries + totalMistakes;
   const acc = Math.round((correctEntries / totalAttempts) * 100) || 0;

   const rawSpeed = Math.round(totalTyped / 5 / elapsedTimeInMinutes) || 0;
   const mistakes = totalMistakes;

   if (wpm) wpm.textContent = wordsPerMinute;
   if (accuracy) accuracy.textContent = `${acc}`;
   if (raw) raw.textContent = rawSpeed;
   // if (keyStrokes) keyStrokes.textContent = totalTyped;
   // if (cleanHits) cleanHits.textContent = correctEntries;
   // if (typos) typos.textContent = mistakes;

   wpmCircle.classList.remove("bad", "okay", "good", "great");
   rawCircle.classList.remove("bad", "okay", "good", "great");
   accCircle.classList.remove("bad", "okay", "good", "great");

   if (wordsPerMinute <= 30) {
      wpmCircle.classList.add("bad");

      tipForUser.textContent =
         tips.below_40_wpm[
            Math.floor(Math.random() * tips.below_40_wpm.length)
         ];
   } else if (wordsPerMinute <= 45) {
      wpmCircle.classList.add("okay");

      tipForUser.textContent =
         tips.below_40_wpm[
            Math.floor(Math.random() * tips.below_40_wpm.length)
         ];
   } else if (wordsPerMinute <= 60) {
      wpmCircle.classList.add("good");
      tipForUser.textContent =
         tips.from_40_60[Math.floor(Math.random() * tips.from_40_60.length)];
   } else {
      wpmCircle.classList.add("great");
      tipForUser.textContent =
         tips.above_60[Math.floor(Math.random() * tips.above_60.length)];
   }
   if (rawSpeed <= 40) {
      rawCircle.classList.add("bad");
   } else if (rawSpeed <= 55) {
      rawCircle.classList.add("okay");
   } else if (rawSpeed <= 70) {
      rawCircle.classList.add("good");
   } else {
      rawCircle.classList.add("great");
   }
   if (acc <= 85) {
      accCircle.classList.add("bad");
   } else if (acc <= 92) {
      accCircle.classList.add("okay");
   } else if (acc <= 96) {
      accCircle.classList.add("good");
   } else {
      accCircle.classList.add("great");
   }
};

//--------------------------CONENT LOAD----------------------------------//

window.addEventListener("DOMContentLoaded", async () => {
   const factData = await fetch("./data/newdata.json");
   const dataList = await factData.json();

   factsList.short = dataList.short;
   factsList.medium = dataList.medium;
   factsList.long = dataList.long;
   factsList.eng200 = dataList.eng200;
   factsList.eng1k = dataList.englishOneK;
   factsList.eng10k = dataList.englishTenK;

   // Load settings from localStorage or set defaults
   selectedTestDuration = localStorage.getItem("length") || "short";
   selectedTestMode = localStorage.getItem("testmode") || "facts";

   // Apply saved color mode
   const modeClass = window.localStorage.getItem("colormode");
   if (modeClass) {
      document.body.classList.add(modeClass);
   } else {
      document.body.classList.add("matrix");
   }

   // Apply current color mode button
   document.querySelectorAll(".colors").forEach((item) => {
      const itemColorModeData = item.dataset.color;
      if (itemColorModeData === (modeClass || "matrix")) {
         item.classList.add("current-color-mode");
      } else {
         item.classList.remove("current-color-mode");
      }
   });

   // Highlight current test length button
   lengths.forEach((btn) => {
      const lengthData = btn.dataset.length;
      btn.classList.remove("current-length");
      if (lengthData === selectedTestDuration) {
         btn.classList.add("current-length");
      }
   });

   // Highlight current test mode button
   modes.forEach((btn) => {
      const mode = btn.dataset.mode;
      btn.classList.remove("current-mode");
      if (mode === selectedTestMode) {
         btn.classList.add("current-mode");
      }
   });

   // Generate text and initialize
   await generateTxt();
   addClass(document.querySelector(".char"), "current");
   updateCharCounter();
   game.focus();
});

//-====================random text generation-----------------

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
const generateTxt = async () => {
   let test;

   if (selectedTestMode === "facts") {
      if (selectedTestDuration === "short") {
         let randIdx = Math.floor(Math.random() * factsList.short.length);
         test = factsList.short[randIdx];
      } else if (selectedTestDuration === "medium") {
         let randIdx = Math.floor(Math.random() * factsList.medium.length);
         test = factsList.medium[randIdx];
      } else {
         let randIdx = Math.floor(Math.random() * factsList.long.length);
         test = factsList.long[randIdx];
      }

      document.getElementById("words").innerHTML = test
         .split("")
         .map((c) => `<span class="char">${c}</span>`)
         .join("");
   } else if (
      selectedTestMode === "english200" ||
      selectedTestMode === "english1k" ||
      selectedTestMode === "english10k"
   ) {
      let wordPool =
         selectedTestMode === "english200"
            ? factsList.eng200
            : selectedTestMode === "english1k"
            ? factsList.eng1k
            : factsList.eng10k;

      let arrIdx = [...Array(wordPool.length).keys()];
      let textList = [];

      let wordCount =
         selectedTestDuration === "short"
            ? 10
            : selectedTestDuration === "medium"
            ? 30
            : 60;

      // prevent exceeding word pool
      wordCount = Math.min(wordCount, arrIdx.length);

      for (let i = 0; i < wordCount; i++) {
         const randNum = Math.floor(Math.random() * arrIdx.length);
         textList.push(wordPool[arrIdx[randNum]]);
         arrIdx.splice(randNum, 1);
      }

      test = textList;

      document.getElementById("words").innerHTML = test
         .join(" ")
         .split("")
         .map((c) => `<span class="char">${c}</span>`)
         .join("");
   } else if (selectedTestMode === "numbers") {
      let wordCount =
         selectedTestDuration === "short"
            ? 10
            : selectedTestDuration === "medium"
            ? 30
            : 60;

      const numberList = [];

      for (let i = 0; i < wordCount; i++) {
         // Random 3 to 6 digit numbers
         const numLength = Math.floor(Math.random() * 4) + 3;
         const num = Math.floor(
            Math.random() * Math.pow(10, numLength)
         ).toString();
         numberList.push(num);
      }

      test = numberList.join(" ");

      document.getElementById("words").innerHTML = test
         .split("")
         .map((c) => `<span class="char">${c}</span>`)
         .join("");
   }
};

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
         gameStartTime = Date.now();
      }
      document.body.classList.add("hide-cursor");
      if (!currentChar.nextSibling) {
         gameOver = true;
         clearInterval(gameInterval);
         totalTyped++;
         if (pressedKey === expected) {
            correctEntries++;
            addClass(currentChar, "correct");
         } else if (expected === " " && pressedKey !== " ") {
            addClass(currentChar, "underline");
         } else {
            addClass(currentChar, "incorrect");
         }
         calculateWpmAndAccuracyNoTimer();
         updateCharCounter();
         // removeClass(resultWrapper, "hidden");
         // addClass(resultWrapper, "flex");
         testResult.classList.remove("hidden");
         testResult.classList.add("flex");
         timeLeft.classList.add("hidden");
         game.classList.add("hidden");
         return;
      }
      if (pressedKey !== expected) {
         totalMistakes++;
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
         playRandomSound();
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

         let correctRemoved = 0;
         let totalRemoved = 0;

         // Go back and remove until space or start
         while (target && target.textContent !== " ") {
            if (target.classList.contains("correct")) {
               correctRemoved++;
               totalRemoved++;
            } else if (
               target.classList.contains("incorrect") ||
               target.classList.contains("underline")
            ) {
               totalRemoved++;
            }
            removeClass(target, "correct");
            removeClass(target, "incorrect");
            removeClass(target, "underline");
            deleted++;
            target = target.previousSibling;
         }

         correctEntries = Math.max(0, correctEntries - correctRemoved);
         totalTyped = Math.max(0, totalTyped - totalRemoved);

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

         // Reposition the caret visually
         updateCaretPosition();

         return;
      }

      // Normal Backspace
      if (!currentChar.previousSibling) return;

      const prevChar = currentChar.previousSibling;

      removeClass(currentChar, "current");

      // --- Adjust stats before removing classes ---
      if (prevChar.classList.contains("correct")) {
         correctEntries = Math.max(0, correctEntries - 1);
         totalTyped = Math.max(0, totalTyped - 1);
      }
      if (
         prevChar.classList.contains("incorrect") ||
         prevChar.classList.contains("underline")
      ) {
         totalTyped = Math.max(0, totalTyped - 1);
      }

      // --- Remove visual classes ---
      removeClass(prevChar, "correct");
      removeClass(prevChar, "incorrect");
      removeClass(prevChar, "underline");
      addClass(prevChar, "current");

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

//----------------------------BRING BACK CURSOR-----------------------------------------//
document.body.addEventListener("mousemove", () => {
   document.body.classList.remove("hide-cursor");
});

//-----------------------------CLICK ENTER TO FOCUS-----------------------------------//
document.addEventListener("keydown", (e) => {
   const activeElement = document.activeElement;

   const isInteractive =
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.tagName === "BUTTON" ||
      activeElement.isContentEditable;

   if (!isInteractive) {
      game.focus();
   }
});

//-------------------------------CHANGE GAME LENGTH----------------------------//
lengths.forEach((item) => {
   const setLength = () => {
      lengths.forEach((btn) => btn.classList.remove("current-length"));
      item.classList.add("current-length");
      selectedTestDuration = item.dataset.length;
      localStorage.setItem("length", item.dataset.length);
      resetGame(true);
   };

   item.addEventListener("click", setLength);
   item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         setLength();
      }
   });
});

//--------------------------------RESET GAME---------------------------------------//

const resetGame = async (newTest) => {
   clearInterval(gameInterval);
   if (newTest) {
      await generateTxt();
   }

   timer = selectedDuration;
   timeLeft.textContent = selectedDuration;
   // wpm.textContent = "";
   // accuracy.textContent = "";

   gameOver = false;
   gameStarted = false;
   totalTyped = 0;
   correctEntries = 0;
   totalMistakes = 0;
   gameStartTime = null;
   words.style.marginTop = "0px";

   testResult.classList.remove("flex");
   testResult.classList.add("hidden");
   timeLeft.classList.remove("hidden");
   game.classList.remove("hidden");
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
const resetSameGame = async () => {
   clearInterval(gameInterval);

   timer = selectedDuration;
   timeLeft.textContent = selectedDuration;
   // wpm.textContent = "";
   // accuracy.textContent = "";

   gameOver = false;
   gameStarted = false;
   totalTyped = 0;
   correctEntries = 0;
   totalMistakes = 0;
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
   resetGame(true);
});
document.getElementById("wait").addEventListener("click", () => {
   resetGame(false);
});
//-----------------VOLUME BTN LOGIC ----------------------------------------//
volumeBtn.addEventListener("click", () => {
   if (volume) {
      volume = false;
      localStorage.setItem("volume", "off");
      volumeIcon.classList.remove("fa-volume-high");
      volumeIcon.classList.add("fa-volume-xmark");
      volumeIconMobile.classList.remove("fa-volume-high");
      volumeIconMobile.classList.add("fa-volume-xmark");
   } else {
      volume = true;
      localStorage.setItem("volume", "on");
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
      localStorage.setItem("volume", "off");
      volumeIcon.classList.remove("fa-volume-high");
      volumeIcon.classList.add("fa-volume-xmark");
      volumeIconMobile.classList.remove("fa-volume-high");
      volumeIconMobile.classList.add("fa-volume-xmark");
   } else {
      volume = true;
      localStorage.setItem("volume", "on");
      volumeIcon.classList.remove("fa-volume-xmark");
      volumeIcon.classList.add("fa-volume-high");
      volumeIconMobile.classList.remove("fa-volume-xmark");
      volumeIconMobile.classList.add("fa-volume-high");
   }
});

//-------------------------SWITCH THEMES------------------------------------//

document.querySelectorAll(".colors").forEach((btn) => {
   const setColorMode = () => {
      const mode = btn.dataset.color;
      document.body.classList.remove(
         "matrix",
         "quantum",
         "void",
         "ghostline",
         "suncode"
      );
      document.querySelectorAll(".colors").forEach((item) => {
         item.classList.remove("current-color-mode");
      });
      btn.classList.add("current-color-mode");
      document.body.classList.add(mode);
      localStorage.setItem("colormode", mode);
      game.focus();
   };

   btn.addEventListener("click", setColorMode);
   btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         setColorMode();
      }
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

//=----------------------swith test modes------------------------------------

modes.forEach((mode) => {
   const activateMode = () => {
      modes.forEach((md) => md.classList.remove("current-mode"));
      const userSelectedMode = mode.dataset.mode;
      localStorage.setItem("testmode", userSelectedMode);
      selectedTestMode = userSelectedMode;
      mode.classList.add("current-mode");
      resetGame(true);
   };

   mode.addEventListener("click", activateMode);
   mode.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         activateMode();
      }
   });
});
