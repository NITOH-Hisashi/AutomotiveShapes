// CSVパース用の関数をCDN経由で読み込み
import { parseCSV2 } from "https://cdn.jsdelivr.net/gh/Nitro2031/Utilities@1.1.1/csvParser.min.js?v=20250927"

const { createApp, ref, onMounted, onBeforeUnmount, computed } = Vue
const { createVuetify, useTheme } = Vuetify

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'dark',
        themes: { light: { dark: false }, dark: { dark: true } },
    },
    icons: { defaultSet: 'mdi' }
})

createApp({
    setup() {
        const loading = ref(true)       // ローディング状態を管理
        const items = ref([])           // アイテムリスト
        const selectedCategory = ref([])
        const margin = 104              // マージン調整用の値
        const tableHeight = ref(window.innerHeight - margin)
        const theme = useTheme()        // テーマ切替用

        const filteredItems = computed(() => {
            return items.value.filter(item =>
                !selectedCategory.value.length || selectedCategory.value.includes(item.区分)
            )
        })

        /**
         * テーマ切替
         */
        const toggleTheme = () => {
            theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
        }

        /**
         * ウィンドウサイズ監視用
         */
        const resizeHandler = () => {
            tableHeight.value = window.innerHeight - margin
        }

        /**
         * 初期化
         */
        onMounted(async () => {
            // ウィンドウリサイズ時のイベントリスナーを登録
            window.addEventListener('resize', resizeHandler)
            try {
                const csvText = await fetch('./車体の形状 - コード.csv').then(r => r.text())
                // CSVパース関数
                const result = parseCSV2(csvText)
                items.value = result.items
            } catch (error) {
                console.error('CSV読み込みエラー:', error)
            }
            loading.value = false       // ローディング終了
        })

        onBeforeUnmount(() => {
            window.removeEventListener('resize', resizeHandler)
        })

        return {
            loading,
            items,
            selectedCategory,
            filteredItems,
            tableHeight,
            toggleTheme,
            theme,
        }
    },
    template: `
    <v-app>
      <v-app-bar>
        <v-app-bar-title>
          <div style="display: flex; align-items: center; width: 100%;">
            <h1 style="font-size: medium;">車体の形状</h1>
            <v-spacer></v-spacer>
            <v-select
              v-model="selectedCategory"
              :items="Array.from(new Set(items.map(i => i.区分)))"
              label="区分"
              multiple
              chips
              clearable
              class="mt-5"
            ></v-select>
            <v-spacer></v-spacer>
            <v-btn @click="toggleTheme" icon>
              <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
            </v-btn>
          </div>
        </v-app-bar-title>
      </v-app-bar>
      <v-main>
        <v-data-table
          :items="filteredItems"
          :loading="loading"
          :height="tableHeight + 'px'"
          dense
          hide-default-footer
          :items-per-page="-1"
          multi-sort
          fixed-header
          hover
          class="mb-4"
        ></v-data-table>
      </v-main>
      <a href="https://github.com/NITOH-Hisashi/AutomotiveShapes" target="_blank" rel="noopener noreferrer">自動車の用途等の区分について（依命通達）</a>
    </v-app>
  `
}).use(vuetify).mount('#app')
