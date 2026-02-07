
import { storageService } from './services/StorageService';
import { projectService } from './services/ProjectService';
import * as path from 'path';
import * as fs from 'fs';

// Initialize storage root (mocking/using default)
// Note: In a script, we might not have the exact same userData path as the Electron app if not careful,
// but storageService uses 'electron-store' or explicit paths.
// Let's rely on projectService.listProjects() which uses storageService.

console.log('--- Checking Project Configs ---');
console.log('Storage Root:', storageService.getStorageRoot());

const projects = projectService.listProjects();

if (projects.length === 0) {
    console.log('No projects found.');
} else {
    projects.forEach(p => {
        console.log(`\nProject: [${p.name}]`);
        console.log(`  Path: ${p.path}`);
        console.log(`  excludeLunchBreak: ${p.config.excludeLunchBreak}`);
        console.log(`  Raw Config File Content:`);
        
        const configPath = path.join(p.path, 'config.json');
        if (fs.existsSync(configPath)) {
            const raw = fs.readFileSync(configPath, 'utf-8');
            const parsed = JSON.parse(raw);
            console.log(`    JSON on disk: excludeLunchBreak = ${parsed.excludeLunchBreak}`);
        } else {
            console.log('    Config file not found!');
        }
    });
}

