import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';
import terser from '@rollup/plugin-terser';
import livereload from 'rollup-plugin-livereload';
import clear from 'rollup-plugin-clear';

const buildQueue = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'umd',
        name: 'WarpvasPerspective',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      clear({
        targets: ['dist'],
        watch: process.env.ROLLUP_WATCH === 'true',
      }),
      resolve(),
      commonjs(),
      typescript({
        exclude: ['src/example/**/*'],
      }),
      babel({
        babelHelpers: 'bundled',
      }),
      terser(),
    ],
  },
];

if (process.env.NODE_ENV === 'development') {
  buildQueue.push({
    input: 'src/example/index.ts',
    output: [
      {
        file: 'public/index.js',
        format: 'iife',
        sourcemap: true,
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        declaration: false
      }),
      babel({
        babelHelpers: 'bundled'
      }),
      terser(),
      serve({
        open: true,
        contentBase: 'public/',
        port: 8080,
        verbose: true
      }),
      livereload({
        watch: ['public'],
        verbose: false
      })
    ]
  })
}

export default buildQueue;
