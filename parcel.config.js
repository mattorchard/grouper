const Bundler = require("parcel-bundler");
const Path = require("path");
const fs = require("fs");

const resolvePath = (relativePath) => Path.join(__dirname, relativePath);

const entryFiles = [
  "./src/popup.html",
  "./src/options.html",
  "./src/background.ts",
].map(resolvePath);

const options = { hmr: false };

const bundler = new Bundler(entryFiles, options);

const copyManifest = () => {
  const manifestContent = fs.readFileSync(resolvePath("./manifest.json"));
  fs.writeFileSync(resolvePath("./dist/manifest.json"), manifestContent);
};

const copyIcons = () => {
  const icons = ["icon16.png", "icon48.png", "icon128.png"];
  icons.forEach((icon) => {
    fs.copyFileSync(
      resolvePath(`./src/icons/${icon}`),
      resolvePath(`./dist/${icon}`)
    );
  });
};

bundler.on("buildEnd", copyManifest);
bundler.on("buildEnd", copyIcons);

bundler.bundle();
