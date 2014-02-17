var app = angular.module('app');

app.service('Proyecto', function() {
	this.frame = null;
	this.sly = null;
	
	this.iniciar = function() {
	}
	
	this.abrir = function(ruta) {
	}
	
	this.guardar = function(ruta) {
	}
	
	this.definir_cuadros = function(frame) {
		this.frame = frame;
		this.sly = frame.data('sly');
	}
	
});