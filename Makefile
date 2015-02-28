VERSION=0.4.15

N=[0m
V=[01;32m
A=[01;33m

all:
	@echo ""
	@echo "Comando disponibles"
	@echo ""
	@echo "  $(A)De uso para desarrollo: $(N)"
	@echo ""
	@echo "   $(V)iniciar$(N)        Instala todas las dependencias necesarias."
	@echo "   $(V)test_linux$(N)     Prueba la aplicacion usando nodewebkit en linux."
	@echo "   $(V)test_mac$(N)       Prueba la aplicacion usando nodewebkit en osx."
	@echo "   $(V)watch$(N)          Recompila la aplicación constantemente."
	@echo ""
	@echo "  $(A)Solo para publicar: $(N)"
	@echo ""
	@echo "   $(V)version$(N)        Genera la informacion de versión actualizada."
	@echo "   $(V)ver_sync$(N)       Sube la nueva version al servidor."
	@echo "   $(V)build$(N)          Genera las versiones compiladas."
	@echo "   $(V)upload$(N)         Genera las versiones compiladas y las publica."
	@echo ""

iniciar:
	npm install
	bower install

test_mac:
	/Applications/nwjs.app/Contents/MacOS/nwjs --args src

test_linux:
	nw dist

install:
	echo "haciendo make install..."

clean:
	echo "haciendo make clean...."


version:
	# patch || minor
	@bumpversion patch --list --current-version ${VERSION} Makefile src/js/directives/huayra-version.js src/package.json
	@echo "Es recomendable escribir el comando que genera los tags y sube todo a github:"
	@echo ""
	@echo "make ver_sync"

changelog:
	gitchangelog > CHANGELOG

watch:
	grunt watch

ver_sync:
	git tag '${VERSION}'
	make changelog
	python extras/generar_changelog_json.py
	git commit -am 'release ${VERSION}'
	git push
	git push --all
	git push --tags

.PHONY: changelog
