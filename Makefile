all:
	@echo "test           Prueba la aplicacion usando nodewebkit en linux."
	@echo "test_mac       Prueba la aplicacion usando nodewebkit en mac osx."
	@echo "instalar       Instala node webkit para linux."
	@echo "instalar_mac   Instala node webkit para mac osx."
	@echo "build          Genera las versiones compiladas."

test:
	./dist/node-webkit-v0.7.3-linux-ia32/nw src

build:
	grunt nodewebkit

test_mac:
	@echo "Cuidado - se está usando la version de nodewebkit del sistema."
	open -a node-webkit.app src

instalar:
	cd dist; wget https://s3.amazonaws.com/node-webkit/v0.7.3/node-webkit-v0.7.3-linux-ia32.tar.gz
	cd dist; tar xf node-webkit-v0.7.3-linux-ia32.tar.gz 

instalar_mac:
	cd dist; wget https://s3.amazonaws.com/node-webkit/v0.7.5/node-webkit-v0.7.5-osx-ia32.zip
	cd dist; unzip -d ./ node-webkit-v0.7.5-osx-ia32.zip
