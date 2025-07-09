@echo off
echo 🔄 Clonando repo...
git clone https://github.com/Jeep12/terra-web.git terra-web-clean
cd terra-web-clean

echo 🧹 Creando rama limpia...
git checkout --orphan clean-main

echo 🗑️ Borrando historial anterior...
git rm -rf .

echo 📥 Agregando archivos actuales...
git add .
git commit -m "🔥 Reset de historial - estado actual limpio"

echo 🔄 Borrando y renombrando ramas...
git branch -D main
git branch -m main

echo ☁️ Push forzado al repo remoto...
git push --force origin main

echo ✅ Listo. El repo ahora tiene un solo commit con el estado actual.
pause
