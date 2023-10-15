import { defineConfig } from "vite";
import unocss from 'unocss/vite'
import { presetMini } from 'unocss'

export default defineConfig({
  plugins: [
    unocss({
      presets: [
        presetMini(),
      ],
    }),
  ],
})
