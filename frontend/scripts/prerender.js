/**
 * Pré-rendu statique post-build.
 * Génère un HTML déjà rendu pour les pages marketing publiques ("/" et "/commander")
 * afin que les crawlers sans JS (WhatsApp, Facebook, Twitter, certains bots SEO)
 * reçoivent directement le contenu, tout en gardant l'app 100% CSR pour le reste.
 * Best-effort : si Puppeteer échoue (environnement de build restreint), le build
 * ne doit pas planter, on garde simplement le index.html standard généré par CRA.
 */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const PORT = 45123;
const ROUTES = ["/", "/commander"];

function startServer() {
  return new Promise((resolve, reject) => {
    const serveBin = path.resolve(__dirname, "..", "node_modules", ".bin", "serve");
    const server = spawn(serveBin, ["-s", BUILD_DIR, "-l", String(PORT)], {
      stdio: "ignore",
    });
    server.on("error", reject);
    // Laisse le temps au serveur de démarrer.
    setTimeout(() => resolve(server), 1500);
  });
}

async function renderRoute(browser, route) {
  const page = await browser.newPage();
  const url = `http://localhost:${PORT}${route}`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  const html = await page.content();
  await page.close();
  return html;
}

async function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.warn("[prerender] build/ introuvable, étape ignorée.");
    return;
  }

  let server;
  let browser;
  try {
    server = await startServer();
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // On rend d'abord TOUTES les routes à partir du build/index.html d'origine
    // (servi tel quel comme fallback SPA par `serve`), puis on écrit les fichiers
    // seulement à la fin — sinon écrire build/index.html après le premier rendu
    // contaminerait le fallback SPA utilisé pour rendre les routes suivantes.
    const rendered = [];
    for (const route of ROUTES) {
      const html = await renderRoute(browser, route);
      rendered.push({ route, html });
    }

    for (const { route, html } of rendered) {
      const outDir = route === "/" ? BUILD_DIR : path.join(BUILD_DIR, route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
      console.log(`[prerender] ${route} -> ${path.join(outDir, "index.html")}`);
    }
  } catch (err) {
    console.warn("[prerender] Échec du pré-rendu, on garde le build CSR standard.");
    console.warn(err.message);
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }
}

main();
