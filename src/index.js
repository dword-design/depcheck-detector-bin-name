import fs from 'fs-extra';
import moduleRoot from 'module-root';

let packageName;

const getDepFromBin = (bin, deps) =>
  deps.find(dep => {
    const packageConfig = fs.readJsonSync(`${moduleRoot(dep)}/package.json`);
    const packageBin = packageConfig.bin || {};

    const packageBins =
      typeof packageBin === 'string'
        ? [packageConfig.name]
        : Object.keys(packageBin);

    return packageBins.includes(bin);
  });

export default (node, deps) => {
  switch (node.type) {
    case 'Program':
      packageName = undefined;
      break;
    case 'ImportDeclaration':
      if (node.source.value === 'depcheck-bin-name') {
        packageName = node.specifiers[0].local.name;
      }

      break;
    case 'TaggedTemplateExpression':
      if (packageName !== undefined && node.tag.name === packageName) {
        const dep = getDepFromBin(node.quasi.quasis[0].value.raw, deps);
        return dep ? [dep] : [];
      }

      break;
    default:
      break;
  }

  return [];
};
