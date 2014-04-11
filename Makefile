all:
	@echo "init           Instala todas las dependencias necesarias."
	@echo "test           Prueba la aplicación usando nodewebkit."
	@echo "test_mac       Prueba la aplicacion usando nodewebkit en mac osx."
	@echo "instalar       Instala node webkit para linux."
	@echo "instalar_mac   Instala node webkit para mac osx."
	@echo "build          Genera las versiones compiladas."
	@echo "upload         Genera las versiones compiladas y las sube a la web."


init:
	npm install
	cd ./src/; bower install


build:
	rm -f -r webkitbuilds/releases/
	grunt nodewebkit

# puede eliminarse y usar make test, ya que instala automágicamente node webkit.
test_mac:
	@echo "Cuidado - se está usando la version de nodewebkit del sistema."
	open -a /Applications/node-webkit.app src

test_npm:
	@echo "Iniciando node webkit..."
	npm test

instalar:
	cd dist; wget https://s3.amazonaws.com/node-webkit/v0.7.3/node-webkit-v0.7.3-linux-ia32.tar.gz
	cd dist; tar xf node-webkit-v0.7.3-linux-ia32.tar.gz 

instalar_mac:
	cd dist; wget https://s3.amazonaws.com/node-webkit/v0.7.5/node-webkit-v0.7.5-osx-ia32.zip
	cd dist; unzip -d ./ node-webkit-v0.7.5-osx-ia32.zip

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
