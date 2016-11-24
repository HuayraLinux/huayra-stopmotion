import { test } from 'qunit';
import moduleForAcceptance from 'huayra-stopmotion/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | se puede crear un proyecto nuevo');

test('visiting /se-puede-crear-un-proyecto-nuevo', function(assert) {
  visit('/');

  andThen(function() {
    click('#crearNuevoProyecto');
  });

  andThen(function() {
    fillIn("#nombre", "");
  });

  andThen(function() {
    assert.equal($("#crear-proyecto").attr('disabled'), 'disabled', "Se desactiva la creación del proyecto cuando fallan las validaciones.");
    fillIn("#nombre", "demo");
  });

  andThen(function() {
    assert.equal($("#crear-proyecto").attr('disabled'), undefined, "Luego de cargar el nombre de proyecto regresa la habilitación del botón crear proyecto.");
    click("#crear-proyecto");
  });

  andThen(function() {
    assert.equal(currentURL(), "/editor/editar/%2Fpath%2Fdemo", "Pudo ingresar correctamente al editor.");
  });
});
