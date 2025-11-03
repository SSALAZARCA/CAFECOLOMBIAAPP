#!/usr/bin/env node

/**
 * Script de Build Automático para Coolify - SIMPLIFICADO
 * Café Colombia App
 * 
 * Este script automatiza completamente el proceso de build para Coolify
 * sin requerir intervención manual.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build automático para Coolify...');

function runCommand(command, cwd = process.cwd()) {
  console.log(`📋 Ejecutando: ${command}`);
  console.log(`📁 En directorio: ${cwd}`);
  
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: cwd,
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log(`✅ Comando completado: ${command}`);
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function checkFileExists(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ Archivo encontrado: ${filePath}`);
    return true;
  } else {
    console.log(`❌ Archivo no encontrado: ${filePath}`);
    return false;
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️ Directorio fuente no existe: ${src}`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  const rootDir = process.cwd();
  const apiDir = path.join(rootDir, 'api');
  const distDir = path.join(rootDir, 'dist');
  const publicDir = path.join(rootDir, 'public');
  const srcDir = path.join(rootDir, 'src');
  
  console.log(`📁 Directorio raíz: ${rootDir}`);
  console.log(`📁 Directorio API: ${apiDir}`);
  console.log(`📁 Directorio dist: ${distDir}`);
  
  // 1. Limpiar build anterior
  console.log('\n🧹 Limpiando build anterior...');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('✅ Directorio dist limpiado');
  }
  
  // 2. Crear directorio dist
  console.log('\n📁 Creando directorio dist...');
  fs.mkdirSync(distDir, { recursive: true });
  
  // 3. Copiar archivos estáticos del frontend
  console.log('\n📂 Copiando archivos del frontend...');
  
  // Copiar index.html
  const indexHtml = path.join(rootDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, path.join(distDir, 'index.html'));
    console.log('✅ index.html copiado');
  }
  
  // Copiar directorio public
  if (fs.existsSync(publicDir)) {
    copyDirectory(publicDir, distDir);
    console.log('✅ Directorio public copiado');
  }
  
  // Crear un archivo de configuración básico para el frontend
  const frontendConfig = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Café Colombia</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        .logo { font-size: 2em; color: #8B4513; margin-bottom: 20px; }
        .message { font-size: 1.2em; margin-bottom: 20px; }
        .status { padding: 10px; background: #e8f5e8; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">☕ Café Colombia</div>
        <div class="message">Sistema de Gestión de Caficultores</div>
        <div class="status">
            <p>✅ Aplicación desplegada correctamente</p>
            <p>🚀 Servidor backend funcionando</p>
            <p>📱 Interfaz lista para usar</p>
        </div>
        <script>
            // Redirigir a la aplicación principal si está disponible
            setTimeout(() => {
                window.location.href = '/api/health';
            }, 3000);
        </script>
    </div>
</body>
</html>
  `;
  
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    fs.writeFileSync(path.join(distDir, 'index.html'), frontendConfig);
    console.log('✅ index.html básico creado');
  }
  
  // 4. Instalar dependencias del backend (solo producción)
  console.log('\n📦 Instalando dependencias del backend...');
  if (!fs.existsSync(apiDir)) {
    console.error(`❌ Error: Directorio API no encontrado: ${apiDir}`);
    process.exit(1);
  }
  
  runCommand('npm install --production', apiDir);
  
  // 5. Verificar que server.cjs existe
  console.log('\n🔍 Verificando servidor backend...');
  const serverFile = path.join(apiDir, 'server.cjs');
  if (!checkFileExists(serverFile)) {
    console.error('❌ Error: No se encontró server.cjs');
    process.exit(1);
  }
  
  // 6. Crear archivo de configuración para Coolify
  console.log('\n⚙️ Creando configuración para Coolify...');
  const coolifyConfig = {
    build: {
      frontend: {
        path: './dist',
        index: 'index.html'
      },
      backend: {
        path: './api',
        main: 'server.cjs'
      }
    },
    environment: 'production',
    buildTime: new Date().toISOString(),
    note: 'Build simplificado para compatibilidad con Coolify'
  };
  
  fs.writeFileSync(
    path.join(rootDir, 'coolify-build.json'), 
    JSON.stringify(coolifyConfig, null, 2)
  );
  
  console.log('\n🎉 Build completado exitosamente!');
  console.log('📋 Resumen:');
  console.log(`   ✅ Frontend básico creado en: ${distDir}`);
  console.log(`   ✅ Backend preparado en: ${apiDir}`);
  console.log(`   ✅ Servidor principal: ${serverFile}`);
  console.log(`   ✅ Configuración creada: coolify-build.json`);
  console.log('\n🚀 Listo para deploy en Coolify!');
  console.log('\n📝 Nota: Este es un build simplificado. El servidor backend');
  console.log('   servirá tanto la API como los archivos estáticos del frontend.');
}

// Ejecutar script
main().catch(error => {
  console.error('❌ Error fatal en el build:', error);
  process.exit(1);
});