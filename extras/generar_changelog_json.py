# -*- encoding: utf-8 -*-
import re
import json
import collections

RUTA_DESTINO_JSON = 'src/changelog.json'

f = open('CHANGELOG', 'rt')
text = f.read();

lineas = [''.join(item.split('\n')) for item in text.split('\n\n')]

data = collections.OrderedDict()
ultima_clave = 'current (0-0-0)'
ultimo_tag = 'current'
data[ultimo_tag] = {'fecha': '', 'tag': ultimo_tag, 'changelog': []}

def limpiar_clave(mensaje):
    return mensaje.replace('--', '')

def limpiar_mensaje(mensaje):
    mensaje = mensaje.replace('- ', '')
    return re.sub('\s\[.*\]', '', mensaje)

def separar_version(version):
    tag, fecha = version.split(' ')
    fecha = fecha.replace('(', '').replace(')', '')
    return tag, fecha

for linea in lineas:
    if linea.startswith('Changelog') or linea.startswith('%%version%%'):
        continue

    if re.match('^\d\.\d.\d', linea):
        ultima_clave = limpiar_clave(linea)
        tag, fecha = separar_version(ultima_clave)
        ultimo_tag = tag
        data[ultimo_tag] = {"fecha": fecha, 'tag': tag, "changelog": []}

    if linea.startswith('- '):
        data[ultimo_tag]['changelog'].append(limpiar_mensaje(linea))

if 'current (0-0-0)' in data:
    del data['current (0-0-0)']

last_data = collections.OrderedDict()
last_data['last'] = data.keys()[0]

tags = data.keys()
tags.sort()

last_data['all_tags'] = tags
last_data['changelog'] = data

json_data = json.dumps(last_data, indent=4);

f2 = open(RUTA_DESTINO_JSON, 'wt')
f2.write(json_data)
f2.close()

print("Se ha creado el archivo: " + RUTA_DESTINO_JSON)
