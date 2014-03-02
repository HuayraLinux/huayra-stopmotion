var app = angular.module('app');
var gui = require('nw.gui');

app.service('Menu', function() {
    var self = this;
    this.menubar = new gui.Menu({type: 'menubar'});
    this.menu_archivo = new gui.Menu();
    this.menu_ayuda = new gui.Menu();

    this.item_abrir = new gui.MenuItem({
        label: 'Abrir',
        click: function() {
            window.abrir_proyecto();
        }
    });

    this.item_guardar = new gui.MenuItem({
        label: 'Guardar',
        click: function() {
            window.guardar_proyecto();
        }
    });

    this.item_guardar_como = new gui.MenuItem({
        label: 'Guardar como ...',
        click: function() {
            window.guardar_proyecto_como();
        }
    });

    this.item_salir = new gui.MenuItem({
        label: 'Salir',
        click: function() {
            gui.App.closeAllWindows();
        }
    });

    this.item_generar_video = new gui.MenuItem({
        label: 'Generar video',
        click: function() {
            self.funcion_exportar.call(this);
        }
    });

    this.item_acerca_de = new gui.MenuItem({
        label: 'Acerca de ...',
        click: function() {
            self.funcion_acerca_de.call(this);
        }
    });

    this.alternar_ayuda = function() {
        panel_ayuda.classList.toggle('ayuda-invisible');
    }

    this.deshabilitar_guardado = function() {
        this.item_guardar.enabled = false;
        this.item_guardar_como.enabled = false;
    }

    this.deshabilitar_guardado();

    this.menu_archivo.append(this.item_abrir);
    this.menu_archivo.append(this.item_guardar);
    this.menu_archivo.append(this.item_guardar_como);
    this.menu_archivo.append(new gui.MenuItem({type: 'separator'}));
    this.menu_archivo.append(this.item_generar_video);
    this.menu_archivo.append(new gui.MenuItem({type: 'separator'}));
    this.menu_archivo.append(this.item_salir);

    this.menu_ayuda.append(this.item_acerca_de);

    this.menubar.append(new gui.MenuItem({
        label: 'Archivo',
        submenu: this.menu_archivo
    }));

    this.menubar.append(new gui.MenuItem({
        label: 'Ayuda',
        submenu: this.menu_ayuda
    }));

    this.agregar_a_ventana = function(ventana, funcion_exportar, funcion_acerca_de) {
        ventana.menu = this.menubar;
        this.funcion_exportar = funcion_exportar;
        this.funcion_acerca_de = funcion_acerca_de;
    }

    this.habilitar_guardado = function() {
        this.item_guardar.enabled = true;
        this.item_guardar_como.enabled = true;
    }
});
