//----------------------GEENRATE RAMDOM TEXT-------------------------------------//
const generateText = async (data, currentGameMode) => {
   let arrIdx = [...Array(data[currentGameMode].length).keys()];
   const maxItems = currentGameMode === "facts" ? 6 : 300;
   const totalItems = Math.min(data[currentGameMode].length, maxItems);
   let textList = [];
   for (let i = 0; i < totalItems; i++) {
      const randNum = Math.floor(Math.random() * arrIdx.length);
      textList.push(data[currentGameMode][arrIdx[randNum]]);
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
//------------------------------DOMContentLoaded------------------------------//
const loadContent = async (data, currentGameMode) => {
   const response = await fetch("../data.json");

   const list = await response.json();

   data.facts = await list.facts;
   data.eng1k = await list.englishOneK;
   data.eng5k = await list.englishFivek;
   data.eng10k = await list.englishTenK;
   data.eng20k = await list.englishTwentyK;
   await generateText(data, currentGameMode);
   //    document.getElementById("timeleft").textContent = timer;
};

//---------------------------GAME MODE BTN LOGIC -----------------------------//
const openGameTypesMenu = () => {
   let menu = document.getElementById("game-type-menu");
   if (menu.classList.contains("hidden")) {
      menu.classList.remove("hidden");
      menu.classList.add("flex");
   } else {
      menu.classList.remove("flex");
      menu.classList.add("hidden");
   }
};

//---------------------SWITCH GAME TYPES---------------------------------//
const switchGameTypes = (btn, currentGameMode, data) => {
   currentGameMode = btn.dataset.gamemode;
   generateText(data, currentGameMode);
   let menu = document.getElementById("game-type-menu");
   menu.classList.remove("flex");
   menu.classList.add("hidden");
};

//-------------------KEYPRESS LOGIC -------------------------------------------//
const keyPressLogic = (e) => {};
export { loadContent, openGameTypesMenu, switchGameTypes, keyPressLogic };
