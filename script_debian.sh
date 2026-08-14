#!/bin/bash
echo "Actualizando repositorios..."
sudo apt update

echo "Instalando paquetes de Active Directory..."
sudo apt install -y realmd sssd sssd-tools libnss-sss libpam-sss adcli samba-common-bin oddjob oddjob-mkhomedir packagekit

echo "====================================="
echo "¡Instalación completada!"
echo "Ahora puedes ejecutar:"
echo "sudo realm discover corp.local"
echo "sudo realm join -U administrator corp.local"
echo "====================================="
