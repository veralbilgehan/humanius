const fs = require('fs');
const mdContent = fs.readFileSync('C:/Users/bilge/.gemini/antigravity/brain/9a2e8399-5dfe-4aac-9689-dff28ba904dd/humanius_kilavuz.md', 'utf8');

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
    <title>Humanius - Kullanım Kılavuzu</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { background-color: white; padding: 60px; max-width: 900px; margin: 40px auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        img { max-width: 100%; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        h1, h2, h3, h4 { font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
        hr { border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0; }
    </style>
</head>
<body>
    <div class='container'>
        ${htmlContent}
    </div>
</body>
</html>
`;

fs.writeFileSync('humanius_kilavuz.html', finalHtml);
console.log('HTML created successfully.');
