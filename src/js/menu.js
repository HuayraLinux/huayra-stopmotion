
function crear(gui) {
    var menubar = new gui.Menu({type: 'menubar'});

    var menu_archivo = new gui.Menu();

    var item_abrir = new gui.MenuItem({
             label: 'Abrir',
             click: function() {
                      window.abrir_proyecto();
             }
    });

    var item_guardar = new gui.MenuItem({
             label: 'Guardar como ...',
             click: function() {
                      window.guardar_proyecto();
             }
    });

    var item_salir = new gui.MenuItem({
             label: 'Salir',
             click: function() {
                      gui.App.closeAllWindows();
             }
    });

    var item_generar_video = new gui.MenuItem({
             label: 'Generar video',
             click: function() {
                      $scope.exportar();	
                      $scope.$apply();
             }
    });

    item_guardar.enabled = false;

    menu_archivo.append(item_abrir);
    menu_archivo.append(item_guardar);
    menu_archivo.append(new gui.MenuItem({type: 'separator'}));
    menu_archivo.append(item_generar_video);
    menu_archivo.append(new gui.MenuItem({type: 'separator'}));
    menu_archivo.append(item_salir);

    menubar.append(new gui.MenuItem({
             label: 'Archivo',
             submenu: menu_archivo
    }));
    
    return menubar;
}

module.exports = {crear: crear};