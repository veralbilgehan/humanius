const fs = require('fs');
const mdContent = fs.readFileSync('C:/Users/bilge/.gemini/antigravity/brain/9a2e8399-5dfe-4aac-9689-dff28ba904dd/humanius_brosur.md', 'utf8');

// A simple MD to HTML regex replace for our specific simple markdown
let htmlContent = mdContent
    .replace(/!\[.*?\]\((.*?)\)/g, '<img src="$1" alt="Image">')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/---/g, '<hr>')
    .replace(/### (.*?)\n/g, '<h3>$1</h3>\n')
    .replace(/#### (.*?)\n/g, '<h4>$1</h4>\n')
    .replace(/# (.*?)\n/g, '<h1>$1</h1>\n');

const finalHtml = `
<!DOCTYPE html>
<html lang='tr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Humanius - Tanıtım Broşürü</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fafafa; }
        .container { background-color: white; padding: 50px; max-width: 1000px; margin: 40px auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        img { max-width: 100%; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1, h2, h3, h4 { font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
        .cta:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class='container'>
        ${htmlContent}
    </div>
</body>
</html>
`;

fs.writeFileSync('humanius_brosur.html', finalHtml);
console.log('HTML created successfully.');
