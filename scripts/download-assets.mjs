/**
 * Download all real Hotel Ambrosia assets from their existing website.
 * Skips gracefully on 404s and logs warnings.
 */
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const assets = [
  // Logo
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/02/Main-Logo-White.svg", dest: "public/images/logo/Main-Logo-White.svg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/02/Main-Logo.svg", dest: "public/images/logo/Main-Logo.svg" },

  // Exterior / Home hero
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/Hotel-Ambrosia-Outside-3.jpg", dest: "public/images/home/Hotel-Ambrosia-Outside-3.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/Hotel-Ambrosia-Outside-2.jpg", dest: "public/images/home/Hotel-Ambrosia-Outside-2.jpg" },

  // Rooms
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/ROOM-101.jpg", dest: "public/images/rooms/ROOM-101.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/ROOM-11.jpg", dest: "public/images/rooms/ROOM-11.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/02/ROOM-18.jpg", dest: "public/images/rooms/ROOM-18.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/ROOM-161.jpg", dest: "public/images/rooms/ROOM-161.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/ROOM-11-1-qkt66w15niy3d01nf1z47eoim5ewkuqsluluort5yo.jpg", dest: "public/images/rooms/ROOM-11-1-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/ROOM-111-qkt66pgabop33qb7hh4q7ycaggbc2z0o8y1gbu2x68.jpg", dest: "public/images/rooms/ROOM-111-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/ROOM-131-qkt66s9sw6sy2k7410clxfmo8lxfq2bv9bzwrnyqnk.jpg", dest: "public/images/rooms/ROOM-131-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/ROOM-141-qkt66t7n30u8e65qvir8hxe4tzssxrfllgne8xxchc.jpg", dest: "public/images/rooms/ROOM-141-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/ROOM-101-1-qkt66xwu170o07yx42sdce7fsx5n08y9a3wtnbqdm8.jpg", dest: "public/images/rooms/ROOM-101-1-thumb.jpg" },

  // Room tariff PDF
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/Ambrosia-Templte-1.pdf", dest: "public/docs/room-tariff.pdf" },

  // Restaurant
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/REASTURANT-191-1-1024x670.jpg", dest: "public/images/restaurant/REASTURANT-191-1-1024x670.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/02/REASTURANT-16-1024x683.jpg", dest: "public/images/restaurant/REASTURANT-16-1024x683.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/REASTURANT-201.jpg", dest: "public/images/restaurant/REASTURANT-201.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/REASTURANT-161.jpg", dest: "public/images/restaurant/REASTURANT-161.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/REASTURANT-181.jpg", dest: "public/images/restaurant/REASTURANT-181.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/REASTURANT-191.jpg", dest: "public/images/restaurant/REASTURANT-191.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/REASTURANT-181-1-qkt5vmwom2r2r28dprzqqo2hjqo2rjuricuep40mfc.jpg", dest: "public/images/restaurant/REASTURANT-181-1-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/REASTURANT-151-qkt5vk361kn7s8ch68rv16s3rl1z4gjkhyvy9a4sy0.jpg", dest: "public/images/restaurant/REASTURANT-151-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/REASTURANT-141-1-qkt5vj5buqlxgmdubqd8gp0n676lwrfu5u8gs06748.jpg", dest: "public/images/restaurant/REASTURANT-141-1-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/REASTURANT-20-qkf5t3xbrpivht2qouacwvqgzolb85ed9dw3ee1y88.jpg", dest: "public/images/restaurant/REASTURANT-20-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/REASTURANT-91-qkt5vqo1dew81i2x3tm90n4bxa5jmc9ouvgcm7v1qg.jpg", dest: "public/images/restaurant/REASTURANT-91-thumb.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/elementor/thumbs/REASTURANT-71-qkt5vosczqtnea5nesszvnleqiet6y286m5dnnxu2w.jpg", dest: "public/images/restaurant/REASTURANT-71-thumb.jpg" },

  // Food menu PDF
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/file_F19B3585_E5B8_F085_41C2_534354FE8ED0-2.pdf", dest: "public/docs/food-menu.pdf" },

  // Banquet
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-191-1024x671.jpg", dest: "public/images/banquet/BANQUTE-191-1024x671.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-81-1024x671.jpg", dest: "public/images/banquet/BANQUTE-81-1024x671.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/reception-1.jpg", dest: "public/images/banquet/reception-1.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-91.jpg", dest: "public/images/banquet/BANQUTE-91.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-281.jpg", dest: "public/images/banquet/BANQUTE-281.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-81.jpg", dest: "public/images/banquet/BANQUTE-81-full.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-181.jpg", dest: "public/images/banquet/BANQUTE-181.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-251.jpg", dest: "public/images/banquet/BANQUTE-251.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-101.jpg", dest: "public/images/banquet/BANQUTE-101.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-181-1.jpg", dest: "public/images/banquet/BANQUTE-181-1.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-71.jpg", dest: "public/images/banquet/BANQUTE-71.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-111.jpg", dest: "public/images/banquet/BANQUTE-111.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-21.jpg", dest: "public/images/banquet/BANQUTE-21.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-191.jpg", dest: "public/images/banquet/BANQUTE-191.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-132.jpg", dest: "public/images/banquet/BANQUTE-132.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/BANQUTE-211.jpg", dest: "public/images/banquet/BANQUTE-211.jpg" },
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/Hotel-Ambrosia-Banqute-1-1.jpg", dest: "public/images/banquet/Hotel-Ambrosia-Banqute-1-1.jpg" },

  // Facilities icon
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/02/Services-2.svg", dest: "public/images/banquet/Services-2.svg" },

  // Party menu PDF
  { url: "https://hotel-ambrosia.com/wp-content/uploads/2024/03/Party-Menu.pdf", dest: "public/docs/party-menu.pdf" },
];

function download(url, destPath) {
  return new Promise((resolve) => {
    const fullDest = path.join(ROOT, destPath);
    fs.mkdirSync(path.dirname(fullDest), { recursive: true });

    const protocol = url.startsWith("https") ? https : http;

    const request = (targetUrl, redirects = 0) => {
      if (redirects > 5) {
        console.warn(`⚠️  SKIP (too many redirects): ${destPath}`);
        return resolve();
      }
      protocol.get(targetUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          console.warn(`⚠️  SKIP (HTTP ${res.statusCode}): ${destPath} — ${url}`);
          res.resume();
          return resolve();
        }
        const file = fs.createWriteStream(fullDest);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`✅ ${destPath}`);
          resolve();
        });
      }).on("error", (err) => {
        console.warn(`⚠️  SKIP (error): ${destPath} — ${err.message}`);
        resolve();
      });
    };

    request(url);
  });
}

async function main() {
  console.log(`\nDownloading ${assets.length} assets...\n`);

  // Download in batches of 5 to avoid overwhelming the server
  for (let i = 0; i < assets.length; i += 5) {
    const batch = assets.slice(i, i + 5);
    await Promise.all(batch.map((a) => download(a.url, a.dest)));
  }

  console.log("\n✨ Done!\n");
}

main();
