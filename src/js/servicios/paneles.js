var app = angular.module('app');

app.service('Paneles', function() {
    
    var panel_ayuda = document.getElementById('ayuda');
    
    this.alternar_ayuda = function() {
        panel_ayuda.classList.toggle('ayuda-invisible');
    }
    
});