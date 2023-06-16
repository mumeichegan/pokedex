
import { defineConfig } from "unocss";
import { presetMini } from 'unocss'
import { presetAttributify } from 'unocss'


export default defineConfig({
    presets: [
        presetAttributify({
            
        }),
        presetMini()
    ]
})