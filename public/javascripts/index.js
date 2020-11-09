document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".login_link").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".login").style.display = "block";
    document.querySelector(".register").style.display = "none";
  });
  document.querySelector(".signup_link").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".login").style.display = "none";
    document.querySelector(".register").style.display = "block";
  });
});
