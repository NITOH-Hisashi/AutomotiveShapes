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
        const items = ref([])
        const selectedCategory = ref([])

        const filteredItems = computed(() => {
            return items.value.filter(item => {
                const matchCategory = !selectedCategory.value.length || selectedCategory.value.includes(item.区分)
                return matchCategory
            })
        })

        // テーマ切替用
        const theme = useTheme()
        const toggleTheme = () => {
            theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
        }

        const margin = 190  // マージン調整用の値
        const tableHeight = ref(window.innerHeight - margin)
        // ウィンドウサイズ監視用
        const resizeHandler = () => {
            tableHeight.value = window.innerHeight - margin
        }

        // 初期化フラグ
        let initializing = true

        onMounted(async () => {
            loading.value = true // ローディング開始
            // ウィンドウリサイズ時のイベントリスナーを登録
            window.addEventListener('resize', resizeHandler)
            // CSVパース関数
            try {
                const csvText = await fetch('./車体の形状 - コード.csv').then(r => r.text());
                const result = parseCSV2(csvText);
                console.info(result);
                items.value = result.items;
            } catch (error) {
                console.error('Error fetching CSV files:', error);
            }
            loading.value = false // ローディング終了
            initializing = false
        });
        onBeforeUnmount(() => {
            // コンポーネントがアンマウントされる際にイベントリスナーを削除
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
}).use(vuetify).mount('#app')
