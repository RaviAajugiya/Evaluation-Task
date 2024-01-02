function showToastOnLoad(){
  ToastMessage = localStorage.getItem('ToastMessage');
  console.log(ToastMessage);
  if(ToastMessage){
    showToast(ToastMessage);
    localStorage.removeItem('ToastMessage');
  }
}

function showToast(message, options = {}) {
  Toastify({
      text: message,
      duration: options.duration || 2000,
      newWindow: options.newWindow || true,
      close: options.close || true,
      gravity: options.gravity || 'top',
      position: options.position || 'right',
      backgroundColor: options.backgroundColor || 'green',
      stopOnFocus: options.stopOnFocus || true,
      progressBar: options.progressBar || true
  }).showToast();
}


$(document).ready(function () {
  showToastOnLoad();

  $('#logout').click(function () {
    if (confirm('Are you sure?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      location.href = '/login.html'
    }
  });
});