// this function is called when the Google Recaptcha
// System is first invoked. It passes in a token
// which need to be submitted to the server for
// verification
function onSubmit(token) {
  // place the token in the hidden field on the form
  document.getElementById("token").value = token;
  // submit the form like normal
  document.getElementById("location_form").submit();
}
