const form = document.querySelector("#updateForm")
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button[type='submit']")
  updateBtn.removeAttribute("disabled")
})