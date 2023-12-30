$(document).ready(function () {
  

  $('#logout').click(function () {
    if (confirm('Are you sure?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      location.href = '/login.html'
    }
  });
});