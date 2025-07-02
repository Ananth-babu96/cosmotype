let user = {
   username: "",
   email: "",
   password: "",
};

document.getElementById("username").addEventListener("input", (e) => {
   user.username = e.target.value;
});
document.getElementById("email").addEventListener("input", (e) => {
   user.email = e.target.value;
});
document.getElementById("password").addEventListener("input", (e) => {
   user.password = e.target.value;
});
document
   .getElementById("sign-up-form")
   .addEventListener("submit", async (e) => {
      e.preventDefault();

      const res = await axios.post("http://localhost:3000/", {
         username: user.username,
         email: user.email,
         password: user.password,
      });
   });
