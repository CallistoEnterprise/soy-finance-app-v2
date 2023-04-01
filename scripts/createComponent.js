const args = process.argv.slice(2);

const componentName = args[0];
const indexText = `export { default } from "./${componentName}";
`;

const componentText = `import React from "react";
import styles from "./${componentName}.module.scss";

export default function ${componentName}() {
  return <div></div>;
}
`;

const fs = require("fs");
const dir = `./${componentName}`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(
    dir,
    { recursive: true }
  );
}

fs.writeFileSync(
  `./${componentName}/${componentName}.tsx`,
  componentText
);

fs.writeFileSync(
  `./${componentName}/index.ts`,
  indexText
);

fs.writeFileSync(
  `./${componentName}/${componentName}.module.scss`,
  ""
);

