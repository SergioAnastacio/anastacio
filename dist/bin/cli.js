#!/usr/bin/env node
import { Command } from 'commander';
import { startApp } from '../cli/start.js';
import { buildApp } from '../cli/build.js';
import { devApp } from '../cli/dev.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const program = new Command();
// Obtenemos la versión del paquete del package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));
program
    .name('anastacio')
    .description('CLI for the Anastacio framework')
    .version(packageJson.version); // Asignamos la versión
program
    .command('start')
    .description('Start the application in production mode')
    .option('-p, --port <port>', 'Specify a port number', '3000')
    .action((options) => {
    startApp(options);
});
program
    .command('build')
    .description('Build the application for production')
    .action(() => {
    buildApp();
});
program
    .command('dev')
    .description('Start the application in development mode')
    .option('-p, --port <port>', 'Specify a port number', '3000')
    .action((options) => {
    devApp(options);
});
program.parse(process.argv);
