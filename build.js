import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const common = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: true,
  target: ['es2019'],
  logLevel: 'info',
};

const builds = [
  {
    ...common,
    format: 'esm',
    outfile: 'dist/panda-forms.esm.js',
  },
  {
    ...common,
    format: 'iife',
    globalName: 'PandaForm',
    // IIFE default export → expose the default object as the global itself.
    footer: { js: 'if (typeof PandaForm!=="undefined"&&PandaForm.default) PandaForm=PandaForm.default;' },
    outfile: 'dist/panda-forms.umd.js',
    minify: true,
  },
];

if (watch) {
  for (const b of builds) {
    const ctx = await esbuild.context(b);
    await ctx.watch();
  }
  console.log('watching…');
} else {
  await Promise.all(builds.map((b) => esbuild.build(b)));
  console.log('built dist/');
}
