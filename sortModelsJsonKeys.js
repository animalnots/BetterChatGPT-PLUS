import fs from 'fs/promises';
import https from 'https';
import path from 'path';

// Function to recursively sort object keys
function sortObjectKeys(obj) {
    if (Array.isArray(obj)) {
        // Check if the array contains objects with a 'name' field
        if (obj.length > 0 && typeof obj[0] === 'object' && 'name' in obj[0]) {
            // Sort the array by the 'name' field
            obj.sort((a, b) => a.name.localeCompare(b.name));
        }
        return obj.map(sortObjectKeys);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).sort().reduce((sortedObj, key) => {
            sortedObj[key] = sortObjectKeys(obj[key]);
            return sortedObj;
        }, {});
    }
    return obj;
}

// Function to download JSON from URL
function downloadJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Failed to parse JSON: ' + error.message));
                }
            });
        }).on('error', (error) => {
            reject(new Error('Failed to download JSON: ' + error.message));
        });
    });
}

// Function to bump version in package.json
async function bumpVersion() {
    try {
        const packageJsonPath = 'package.json';
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        
        // Parse current version
        const currentVersion = packageJson.version;
        const versionParts = currentVersion.split('.');
        
        // Increment minor version (middle number)
        versionParts[1] = (parseInt(versionParts[1], 10) + 1).toString();
        // Reset patch version to 0
        versionParts[2] = '0';
        const newVersion = versionParts.join('.');
        
        // Update version in package.json
        packageJson.version = newVersion;
        
        // Write updated package.json
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
        console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
        
        return newVersion;
    } catch (err) {
        console.error('Error bumping version:', err);
        throw err;
    }
}

// Download, process and sort the JSON file
async function downloadAndProcessJson() {
    try {
        // Define file paths
        const inputFilePath = 'models.json';
        const outputFilePath = 'public/models.json';
        const apiUrl = 'https://openrouter.ai/api/v1/models';
        
        console.log('Downloading JSON from OpenRouter API...');
        const jsonData = await downloadJson(apiUrl);
        
        // Write the downloaded JSON to models.json
        const jsonString = JSON.stringify(jsonData, null, 2);
        await fs.writeFile(inputFilePath, jsonString, 'utf8');
        console.log('Downloaded JSON has been saved to models.json');
        
        // Sort the JSON data
        const sortedJsonData = sortObjectKeys(jsonData);
        
        // Convert the sorted JSON data back to a string
        const sortedJsonString = JSON.stringify(sortedJsonData, null, 2);
        
        // Write the sorted JSON data to output file
        await fs.writeFile(outputFilePath, sortedJsonString, 'utf8');
        console.log('Sorted JSON has been saved to public/models.json');
        
        // Bump version in package.json
        const newVersion = await bumpVersion();
        console.log(`Package version updated to ${newVersion}`)
    } catch (err) {
        console.error('Error processing the file:', err);
    }
}

// Run the process
downloadAndProcessJson();