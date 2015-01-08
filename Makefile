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
	@echo "   $(V)init$(N)           Instala todas las dependencias necesarias."
	@echo "   $(V)test_linux$(N)     Prueba la aplicacion usando nodewebkit en linux."
	@echo "   $(V)test_mac$(N)       Prueba la aplicacion usando nodewebkit en osx."
	@echo ""
	@echo "  $(A)Solo para publicar: $(N)"
	@echo ""
	@echo "   $(V)version$(N)        Genera la informacion de versión actualizada."
	@echo "   $(V)ver_sync$(N)       Sube la nueva version al servidor."
	@echo "   $(V)build$(N)          Genera las versiones compiladas."
	@echo "   $(V)upload$(N)         Genera las versiones compiladas y las sube a la web."
	@echo ""

init:
	npm install
	sudo pip install bumpversion
	sudo pip install gitchangelog
	cd ./src/; bower install


build:
	rm -f -r webkitbuilds/releases/
	grunt nodewebkit

# puede eliminarse y usar make test, ya que instala automágicamente node webkit.
test_mac:
	@echo "Cuidado - se está usando la version de nodewebkit del sistema."
	open -a /Applications/node-webkit.app --args /Users/hugoruscitti/proyectos/huayra-stopmotion/src

test_linux:
	nw src

upload: build
	@mkdir -p dist
	@echo ""
	@echo "Empaquetando para windows..."
	zip -r dist/huayra-stopmotion_windows.zip webkitbuilds/releases/stop\ motion/win/stop\ motion
	@echo ""
	@echo "Empaquetando para linux (32 bits)..."
	zip -r dist/huayra-stopmotion_linux32.zip webkitbuilds/releases/stop\ motion/linux32/stop\ motion
	@echo ""
	@echo "Empaquetando para linux (64 bits)..."
	zip -r dist/huayra-stopmotion_linux64.zip webkitbuilds/releases/stop\ motion/linux32/stop\ motion
	@echo ""
	@echo "Empaquetando para mac ..."
	zip -r dist/huayra-stopmotion_mac.zip webkitbuilds/releases/stop\ motion/mac
	@echo ""
	scp dist/* digitalocean:~/dev-losersjuegos.com.ar/descargas/huayra-motion/

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

ver_sync:
	git tag '${VERSION}'
	make changelog
	python extras/generar_changelog_json.py
	git commit -am 'release ${VERSION}'
	git push
	git push --all
	git push --tags

.PHONY: changelog
