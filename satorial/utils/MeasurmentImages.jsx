const measurementImages = {};
const imageModules = import.meta.glob("../assets/images/measurement/*.svg", { eager: true });

Object.keys(imageModules).forEach((key) => {
  const name = key
    .replace("../assets/images/measurement/mes-", "")
    .replace(".svg", "")
    .replace("/", "_");
  measurementImages[name] = imageModules[key].default;
});

export default measurementImages;
