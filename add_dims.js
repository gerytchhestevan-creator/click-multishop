const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'products.js');
let content = fs.readFileSync(filePath, 'utf8');

// Match each product object inside the array.
const updatedContent = content.replace(/\{([^}]+?)\}/g, (match, innerText) => {
    // Only process if it looks like a product (has an id)
    if (innerText.includes('"id":')) {
        // Only add if it doesn't have dimensions yet
        if (!innerText.includes('"weight":')) {
            // Trim the end and add the dimensions before closing brace
            const trimmed = innerText.replace(/[\s\n\r]+$/, '');
            // Determine if we need to put it on a new line or not for formatting
            const needsNewLine = innerText.includes('\n');
            const suffix = needsNewLine
                ? `,\n        "weight": 0.5, "width": 20, "height": 15, "length": 25\n    }`
                : `, "weight": 0.5, "width": 20, "height": 15, "length": 25 }`;

            return `{${trimmed}${suffix}`;
        }
    }
    return match;
});

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Successfully added dimensions to products.js');
