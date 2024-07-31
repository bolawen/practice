const packageJson = require('./package.json');

// 列出需要覆盖版本的依赖包名称
const packagesToOverride = ['lodash'];

/**
 * 构建需要覆盖版本的依赖映射
 * @returns {Object} 包含需要覆盖版本的依赖映射
 */
function createDependencyOverrides() {
  const overrides = {};

  // 从 dependencies 中添加需要覆盖的包
  for (const [pkgName, pkgVersion] of Object.entries(packageJson.dependencies)) {
    if (packagesToOverride.includes(pkgName)) {
      overrides[pkgName] = pkgVersion;
    }
  }

  // 从 devDependencies 中添加需要覆盖的包
  for (const [pkgName, pkgVersion] of Object.entries(packageJson.devDependencies)) {
    if (packagesToOverride.includes(pkgName)) {
      overrides[pkgName] = pkgVersion;
    }
  }

  return overrides;
}

const dependencyOverrides = createDependencyOverrides();

/**
 * 根据配置覆盖包的依赖版本
 * @param {Object} pkg - 当前处理的包
 * @param {Object} context - 钩子上下文
 * @returns {Object} 修改后的包
 */
function applyVersionOverrides(pkg, context) {
  // 遍历 dependencies 并覆盖版本
  Object.entries(pkg.dependencies).forEach(([depName, depVersion]) => {
    if (dependencyOverrides[depName]) {
      pkg.dependencies[depName] = dependencyOverrides[depName];
      context.log(`Overridden ${depName} to version ${dependencyOverrides[depName]}`);
    }
  });

  // 遍历 devDependencies 并覆盖版本
  Object.entries(pkg.devDependencies).forEach(([depName, depVersion]) => {
    if (dependencyOverrides[depName]) {
      pkg.devDependencies[depName] = dependencyOverrides[depName];
      context.log(`Overridden ${depName} to version ${dependencyOverrides[depName]}`);
    }
  });

  return pkg;
}

module.exports = {
  hooks: {
    readPackage: applyVersionOverrides,
  },
};
