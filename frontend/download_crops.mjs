import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public', 'images', 'crops');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Using highly reliable Wikimedia direct image URLs to avoid hotlinking/bot protection blocks
const images = {
  'tomato.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/440px-Tomato_je.jpg',
  'potato.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Potato_plant_and_tubers.jpg/440px-Potato_plant_and_tubers.jpg',
  'wheat.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Wheat_close-up.JPG/440px-Wheat_close-up.JPG',
  'onion.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Onion_on_White.JPG/440px-Onion_on_White.JPG',
  'mango.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mangoes_pic.jpg/440px-Mangoes_pic.jpg',
  'rice.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice.jpg/440px-White_rice.jpg',
  'mustard.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Sinapis_alba_flowers.jpg/440px-Sinapis_alba_flowers.jpg',
  'maize.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Corn-sweet-corn-pop-corn.jpg/440px-Corn-sweet-corn-pop-corn.jpg',
  'gram.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Chickpea.jpg/440px-Chickpea.jpg',
  'cotton.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Gossypium_hirsutum.jpg/440px-Gossypium_hirsutum.jpg',
  'sugarcane.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sugarcane_plantation.jpg/440px-Sugarcane_plantation.jpg',
  'apple.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Apples.jpg/440px-Apples.jpg',
  'tea-leaves.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Tea_leaves_at_a_plantation_in_Malaysia.jpg/440px-Tea_leaves_at_a_plantation_in_Malaysia.jpg',
  'coconut.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Coconut_on_white_background.jpg/440px-Coconut_on_white_background.jpg',
  'black-pepper.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Black_pepper.jpg/440px-Black_pepper.jpg',
  'soyabean.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Soybean.jpg/440px-Soybean.jpg',
  'groundnut.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Peanut_9417.jpg/440px-Peanut_9417.jpg'
};

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed with status code: ${response.statusCode}`));
      }

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('image/')) {
        return reject(new Error(`Invalid content-type: ${contentType}`));
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 1024) {
          return reject(new Error(`File too small, possibly an error page. Size: ${buffer.length} bytes`));
        }

        // Extremely basic signature check for JPG/PNG
        const hex = buffer.toString('hex', 0, 4);
        if (hex !== 'ffd8ffe0' && hex !== 'ffd8ffe1' && hex !== 'ffd8ffe2' && hex !== '89504e47') {
          console.warn(`Warning: Signature ${hex} may not be a standard JPG/PNG, but saving anyway.`);
        }
        
        fs.writeFileSync(dest, buffer);
        resolve(buffer.length);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

async function run() {
  console.log('Downloading crops...');
  for (const [filename, url] of Object.entries(images)) {
    const dest = path.join(dir, filename);
    
    // Delete existing invalid file if any
    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);
      if (stats.size < 1024) {
        console.log(`Deleting invalid small file: ${filename} (${stats.size} bytes)`);
        fs.unlinkSync(dest);
      } else {
        console.log(`Valid file already exists: ${filename} (${stats.size} bytes)`);
        continue;
      }
    }

    try {
      console.log(`Downloading ${filename}...`);
      const size = await download(url, dest);
      console.log(`✅ Success: ${filename} (${Math.round(size/1024)} KB)`);
    } catch (err) {
      console.error(`❌ Failed to download ${filename}:`, err.message);
    }
  }
  console.log('Done downloading crop images!');
}

run();
