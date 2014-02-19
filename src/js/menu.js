function Menu(gui) {
    var self= this;
    this.menubar = new gui.Menu({type: 'menubar'});

    this.menu_archivo = new gui.Menu();

    this.item_abrir = new gui.MenuItem({
        label: 'Abrir',
        click: function() {
            window.abrir_proyecto();
        }
    });

    this.item_guardar = new gui.MenuItem({
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

    this.deshabilitar_guardado();

    this.menu_archivo.append(this.item_abrir);
    this.menu_archivo.append(this.item_guardar);
    this.menu_archivo.append(new gui.MenuItem({type: 'separator'}));
    this.menu_archivo.append(this.item_generar_video);
    this.menu_archivo.append(new gui.MenuItem({type: 'separator'}));
    this.menu_archivo.append(this.item_salir);

    this.menubar.append(new gui.MenuItem({
        label: 'Archivo',
        submenu: this.menu_archivo
    }));
}

Menu.prototype.agregar_a_ventana = function(ventana, funcion_exportar) {
    ventana.menu = this.menubar;
    this.funcion_exportar = funcion_exportar;
    console.log("hey");
}


Menu.prototype.habilitar_guardado = function() {
    this.item_guardar.enabled = true;
}

Menu.prototype.deshabilitar_guardado = function() {
    this.item_guardar.enabled = false;
}



module.exports = Menu;