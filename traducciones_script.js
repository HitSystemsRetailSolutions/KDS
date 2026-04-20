const fs = require("fs");
const path = require("path");

const keyValues = [];
const rootDir = path.join(__dirname, "src");

let fetch;

async function loadFetch() {
    if (!fetch) {
        fetch = (await import("node-fetch")).default;
    }
}

function extractKeys(dir) {
    const files = fs.readdirSync(dir);
    const seenKeys = new Set();
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            extractKeys(filePath);
        } else if (stats.isFile() && (path.extname(file) === ".vue" || path.extname(file) === ".js")) {
            const data = fs.readFileSync(filePath, "utf8");

            const regex = /\b\$?t\s*\((['"])(.*?)\1\s*,\s*(['"])(.*?)\3(?:[\s\S]*?|)\)/g;

            let match;
            while ((match = regex.exec(data)) !== null) {
                const fullKey = match[2];
                const value = match[4];

                const dotIndex = fullKey.indexOf('.');

                let group, key;

                if (dotIndex !== -1) {
                    group = fullKey.substring(0, dotIndex);
                    key = fullKey.substring(dotIndex + 1);
                } else {
                    group = '';
                    key = fullKey;
                }

                const identifier = `${group}.${key}`;
                if (!seenKeys.has(identifier)) {
                    seenKeys.add(identifier);
                    keyValues.push({ group, key, value });
                }
            }
        }
    }
}

async function sendKeys() {
    await loadFetch();
    try {
        const response = await fetch("http://localhost:3000/traducciones/setTraduccionesKeys", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(keyValues),
        });
        const data = await response.json();
        console.log(`Enviadas ${keyValues.length} claves de traducción al backend.`);
        if (data && data.msg) {
            console.log(data.msg);
        }
        if (data && data.error) {
            console.error("Error del backend:", data.error);
        }
    } catch (err) {
        console.error("Error enviando traducciones:", err);
    }
}

extractKeys(rootDir);
console.log(`Encontradas ${keyValues.length} claves de traducción.`);
sendKeys();
