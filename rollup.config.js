import babel from 'rollup-plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from 'rollup-plugin-commonjs';
import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const FORMATS = ['umd', 'cjs', 'esm'];

const name = pkg.name;

const basePath = path.resolve(__dirname);
const distPath = path.resolve(basePath, 'dist');
const inputPath = path.resolve(basePath, pkg.index);

const bannerText = `/*! ${name} v${pkg.version} | Copyright (c) 2016-2019 Jacob Müller */`;
const banner = text => ({
  name: 'banner',
  renderChunk: code => ({ code: `${text}\n${code}`, map: null })
});

const getFileName = (baseName, format, minify) =>
  [baseName, format !== 'umd' ? format : null, minify ? 'min' : null, 'js']
    .filter(Boolean)
    .join('.');

const createConfig = (format, minify = false) => ({
  input: inputPath,
  output: {
    format,
    file: path.resolve(distPath, getFileName(name, format, minify)),
    sourcemap: true
  },
  plugins: [
    resolve(),
    format === 'umd' ? commonjs() : null,
    babel({ exclude: 'node_modules/**' }),
    sourceMaps(),
    cleanup({ comments: 'none' }),
    minify
      ? terser({
          sourcemap: true,
          compress: { passes: 10 },
          ecma: 5,
          toplevel: format === 'cjs',
          warnings: true
        })
      : null,
    banner(bannerText)
  ].filter(Boolean)
});

export default [
  ...FORMATS.map(format => createConfig(format)),
  ...FORMATS.map(format => createConfig(format, true))
];
