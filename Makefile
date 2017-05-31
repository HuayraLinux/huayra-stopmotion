VERSION=$(shell scripts/obtenerVersion.sh)
NOMBRE="huayra-stopmotion"

N=[0m
G=[01;32m
Y=[01;33m
B=[01;34m
L=[01;30m

npm_config_loglevel="warn"

all:
	npm install
	node_modules/.bin/bower install
	scripts/electron-rebuild
	node_modiles/.bin/ember build -prod

help:
	@echo ""
	@echo "${B}Comandos disponibles para ${G}${NOMBRE}${N} - ${Y} versión ${VERSION}${N}"
	@echo ""
	@echo "  ${Y}Para desarrolladores de la aplicación ember${N}"
	@echo ""
	@echo "    ${G}dependencias${N}      Instala dependencias."
	@echo "    ${G}compilar${N}          Genera los archivos compilados."
	@echo "    ${G}compilar_live${N}     Compila de forma contínua."
	@echo "    ${G}electron${N}          Ejecuta la aplicación sobre electron."
	@echo ""
	@echo "  ${Y}Para distribuir${N}"
	@echo ""
	@echo "    ${G}version_patch${N}     Genera una versión (0.0.PATCH)."
	@echo "    ${G}version_minor${N}     Genera una versión (0.MINOR.0)."
	@echo "    ${G}version_major${N}     Genera una versión (MAJOR.0.0)."
	@echo "    ${G}all${N}               Construye la aplicación para empaquetar."
	@echo ""
	@echo ""

dependencias:
	@echo "${G}Instalando dependencias${N}"
	@echo "  Recordá que este paquete depende de libv4l-dev y libudev-dev"
	@npm install
	@node_modules/.bin/bower install
	@scripts/electron-rebuild

compilar:
	node_modules/.bin/ember build

compilar_live:
	node_modules/.bin/ember build --watch

version_patch:
	node_modules/.bin/ember release

version_minor:
	node_modules/.bin/ember release --minor

version_major:
	node_modules/.bin/ember release --major

electron:
	@echo ""
	@echo "${G}CIUDADO, para que esto funcione tendrías que ejecutar previamente:${N}"
	@echo ""
	@echo "   ${G}make compilar o make compilar_live${N}"
	@echo ""
	@scripts/start-electron
