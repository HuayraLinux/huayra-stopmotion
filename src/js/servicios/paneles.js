var app = angular.module('app');

app.service('Paneles', function() {
    var panel_ayuda = document.getElementById('ayuda');
    var panel = document.getElementById('panel-lateral');
    var contenedor = document.getElementById('contenedor-layers');
    var controles = document.getElementById('contenedor-controles');

    this.alternar_ayuda = function() {
        panel_ayuda.classList.toggle('ayuda-invisible');
    }
    
    this.alternar_panel_lateral = function() {
        panel.classList.toggle('panel-lateral-invisible');
        contenedor.classList.toggle('contenedor-layers-expandido');
        controles.classList.toggle('contenedor-controles-expandido');
    }
});