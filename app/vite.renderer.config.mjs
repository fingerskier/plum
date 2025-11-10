import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import reactSwc from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useReactCompiler = env.REACT_COMPILER === '1';

  const plugins = useReactCompiler
    ? [
        react({
          babel: {
            plugins: [['babel-plugin-react-compiler', { runtimeModule: 'react/jsx-runtime' }]],
          },
        }),
      ]
    : [reactSwc()];

  return {
    plugins,
  };
});
