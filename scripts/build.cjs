#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script de build multiplataforma para Café Colombia App
 * Funciona en Windows, Linux y macOS
 */

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function main() {
  console.log('🔨 Iniciando build del servidor...');
  
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist');
  
  try {
    // Crear directorio dist si no existe
    if (!fs.existsSync(distDir)) {
      console.log('📁 Creando directorio dist...');
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Copiar directorio api
    const apiSrc = path.join(rootDir, 'api');
    const apiDest = path.join(distDir, 'api');
    
    if (fs.existsSync(apiSrc)) {
      console.log('📂 Copiando directorio api...');
      copyRecursive(apiSrc, apiDest);
    } else {
      console.warn('⚠️  Directorio api no encontrado');
    }
    
    // Copiar directorio scripts
    const scriptsSrc = path.join(rootDir, 'scripts');
    const scriptsDest = path.join(distDir, 'scripts');
    
    if (fs.existsSync(scriptsSrc)) {
      console.log('📂 Copiando directorio scripts...');
      copyRecursive(scriptsSrc, scriptsDest);
    } else {
      console.warn('⚠️  Directorio scripts no encontrado');
    }
    
    console.log('✅ Build del servidor completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante el build:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { copyRecursive, main };