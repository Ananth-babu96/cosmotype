//---------------SIGN-UP-LOGIC--------------------------------------------

let signUpInfo = {
   username: "",
   email: "",
   password: "",
   passwordReEnter: "",
};
document.getElementById("sign-up-username").addEventListener("input", (e) => {
   signUpInfo.username = e.target.value;
});
document.getElementById("sign-up-email").addEventListener("input", (e) => {
   signUpInfo.email = e.target.value;
});
document.getElementById("sign-up-password").addEventListener("input", (e) => {
   signUpInfo.password = e.target.value;
});
document
   .getElementById("sign-up-password-re-enter")
   .addEventListener("input", (e) => {
      signUpInfo.passwordReEnter = e.target.value;
   });

document
   .getElementById("sign-up-form")
   .addEventListener("submit", async (e) => {
      e.preventDefault();
      const { username, password, passwordReEnter } = signUpInfo;
      const passwordRegex =
         /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

      if (!username || username.trim().length < 3 || /\s/.test(username)) {
         alert("Username must be at least 3 characters and contain no spaces.");
         return;
      }
      //!passwordRegex.test(password)
      if (password.length < 6) {
         alert(
            "Password must be at least 8 characters long and include at least one number and one special character."
         );
         return;
      }
      if (password !== passwordReEnter) {
         alert("Passwords do not match.");
         return;
      }
      try {
         const res = await axios.post("http://localhost:3000/signup", {
            signUpInfo,
         });
         if (res.data === "user created successfully!") {
            alert("Thank You for Joining !");
            localStorage.setItem("username", signUpInfo.username);
            localStorage.setItem("isLoggedIn", "true");

            window.location.href = "/index.html";
         }
      } catch (e) {
         if (e.response) {
            alert(e.response.data);
         } else {
            alert("oops something went wrong!");
         }
      }
   });

//---------------------------LOGIN LOGIC-----------------------------------------------

let loginInfo = {
   username: "",
   password: "",
};

document.getElementById("login-username").addEventListener("input", (e) => {
   loginInfo.username = e.target.value;
});
document.getElementById("login-password").addEventListener("input", (e) => {
   loginInfo.password = e.target.value;
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
   e.preventDefault();
   const { username, password } = loginInfo;

   if (!username || username.trim().length < 3 || /\s/.test(username)) {
      alert("please enter a valid username");
      return;
   }
   if (password.length < 6) {
      alert("please enter a valid password");
      return;
   }

   const res = await axios.post("http://localhost:3000/login", {
      loginInfo,
   });
   if (res.data === "user does not exist") {
      alert("user does not exist");
      return;
   }
   localStorage.setItem("username", res.data.username);
   localStorage.setItem("isLoggedIn", "true");
   window.location.href = "/index.html";
});
