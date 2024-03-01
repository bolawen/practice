export default {
    presets: [
      [
        '@babel/env',
        {
          "modules": false 
        }
      ]
    ],
    plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]]
  };
  