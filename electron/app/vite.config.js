import { defineConfig, loadEnv } from 'vite';
import reactSwc from '@vitejs/plugin-react-swc';
import reactBabel from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useReactCompiler = env.REACT_COMPILER === '1';

  const reactPlugin = useReactCompiler
    ? reactBabel({
        babel: {
          plugins: [['babel-plugin-react-compiler', { runtimeModule: 'react/jsx-runtime' }]],
        },
      })
    : reactSwc();

  return {
    plugins: [reactPlugin],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    build: {
      outDir: 'dist',
    },
  };
});
