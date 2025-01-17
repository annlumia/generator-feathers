const p = require('path');
const semver = require('semver');

module.exports = function(generator) {
  const major = semver.major(process.version);
  const envConfigDir = process.env['NODE_CONFIG_DIR'];
  const configDirectory = envConfigDir ? p.join(envConfigDir) : 'config/';
  const { props } = generator;
  const lib = props.src;
  const [ packager, version ] = props.packager.split('@');
  const isTypescript = props.language === 'ts';
  const pkg = {
    name: props.name,
    description: props.description,
    version: '0.0.0',
    homepage: '',
    main: lib,
    keywords: [
      'feathers'
    ],
    author: {
      name: generator.user.git.name(),
      email: generator.user.git.email()
    },
    contributors: [],
    bugs: {},
    directories: {
      lib,
      test: 'test/',
      config: configDirectory
    },
    engines: {
      node: `^${major}.0.0`,
      [packager]: version
    },
    'scripts': {
      test: `${packager} run eslint && ${packager} run ${props.tester}`,
      eslint: `eslint ${lib}/. test/. --config .eslintrc.json`,
      dev: `nodemon ${lib}/`,
      start: `node ${lib}/`
    }
  };

  if ('mocha' === props.tester) {
    pkg.scripts['mocha'] = isTypescript ? 'ts-mocha "test/**/*.ts" --recursive --exit' : 'mocha test/ --recursive --exit';
  } else {
    pkg.scripts['jest'] = 'jest  --forceExit';
  }

  if (isTypescript) {
    pkg.scripts = {
      ...pkg.scripts,
      compile: 'shx rm -rf lib/ && tsc',
      dev: `ts-node-dev --no-notify ${lib}/`,
      test: `${packager} run compile && ${packager} run ${props.tester}`,
      start: `${packager} run compile && node lib/`
    };
    pkg.types = 'lib/';

    delete pkg.scripts.eslint;
  }

  return pkg;
};
