$(document).ready(function () {
  $('#logout').click(function () {
    localStorage.removeItem('token'); 
    console.log('Logged out'); 
  });
});