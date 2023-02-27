var splashScreen = document.querySelector('.splash');
var appController = document.querySelector('.app-controller');
splashScreen.style.opacity = 0;
setTimeout(()=>{
  splashScreen.classList.add('hidden')
  appController.classList.add('visible')
},3100)
