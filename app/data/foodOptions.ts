export interface FoodOption {
    name: string;
    category: string;
    query: string;
}

export const FOOD_OPTIONS: FoodOption[] = [
    // 台式與中式經典
    { name: "滷肉飯/雞肉飯", category: "台式與中式經典", query: "滷肉飯 雞肉飯" },
    { name: "牛肉麵", category: "台式與中式經典", query: "牛肉麵" },
    { name: "排骨飯/雞腿飯", category: "台式與中式經典", query: "排骨飯 雞腿飯" },
    { name: "水餃/鍋貼", category: "台式與中式經典", query: "水餃 鍋貼" },
    { name: "炒飯", category: "台式與中式經典", query: "炒飯" },
    { name: "炒麵/炒米粉", category: "台式與中式經典", query: "炒麵 炒米粉" },
    { name: "廣東粥/皮蛋瘦肉粥", category: "台式與中式經典", query: "廣東粥 皮蛋瘦肉粥" },
    { name: "小籠包/蒸餃", category: "台式與中式經典", query: "小籠包 蒸餃" },
    { name: "潤餅", category: "台式與中式經典", query: "潤餅" },
    { name: "熱炒", category: "台式與中式經典", query: "熱炒" },
    { name: "烤鴨", category: "台式與中式經典", query: "烤鴨" },
    { name: "清粥小菜", category: "台式與中式經典", query: "清粥小菜" },

    // 日式風味
    { name: "拉麵", category: "日式風味", query: "拉麵" },
    { name: "烏龍麵", category: "日式風味", query: "烏龍麵" },
    { name: "日式咖哩飯", category: "日式風味", query: "日式咖哩飯" },
    { name: "丼飯", category: "日式風味", query: "丼飯" },
    { name: "生魚片/壽司", category: "日式風味", query: "壽司 生魚片" },
    { name: "壽喜燒", category: "日式風味", query: "壽喜燒" },
    { name: "大阪燒/廣島燒", category: "日式風味", query: "大阪燒 廣島燒" },
    { name: "蕎麥麵", category: "日式風味", query: "蕎麥麵" },
    { name: "天婦羅定食", category: "日式風味", query: "天婦羅" },

    // 火鍋與暖湯
    { name: "個人小火鍋", category: "火鍋與暖湯", query: "小火鍋 涮涮鍋" },
    { name: "麻辣鍋", category: "火鍋與暖湯", query: "麻辣鍋" },
    { name: "羊肉爐", category: "火鍋與暖湯", query: "羊肉爐" },
    { name: "薑母鴨", category: "火鍋與暖湯", query: "薑母鴨" },
    { name: "壽喜燒吃到飽", category: "火鍋與暖湯", query: "壽喜燒吃到飽" },
    { name: "部隊鍋", category: "火鍋與暖湯", query: "部隊鍋" },
    { name: "關東煮", category: "火鍋與暖湯", query: "關東煮" },
    { name: "牛肉湯/羊肉湯", category: "火鍋與暖湯", query: "牛肉湯 羊肉湯" },

    // 西式與美墨料理
    { name: "牛排", category: "西式與美墨料理", query: "牛排" },
    { name: "義大利麵", category: "西式與美墨料理", query: "義大利麵" },
    { name: "燉飯", category: "西式與美墨料理", query: "燉飯" },
    { name: "美式漢堡", category: "西式與美墨料理", query: "美式漢堡" },
    { name: "披薩", category: "西式與美墨料理", query: "披薩 Pizza" },
    { name: "墨西哥捲餅", category: "西式與美墨料理", query: "墨西哥料理" },
    { name: "凱薩沙拉/溫沙拉", category: "西式與美墨料理", query: "沙拉 輕食" },
    { name: "三明治/帕尼尼", category: "西式與美墨料理", query: "三明治 帕尼尼" },

    // 韓式與泰越南洋風
    { name: "韓式炸雞", category: "韓式與泰越南洋風", query: "韓式炸雞" },
    { name: "石鍋拌飯", category: "韓式與泰越南洋風", query: "石鍋拌飯" },
    { name: "韓式烤肉", category: "韓式與泰越南洋風", query: "韓式烤肉" },
    { name: "辣炒年糕", category: "韓式與泰越南洋風", query: "辣炒年糕" },
    { name: "泰式打拋豬飯", category: "韓式與泰越南洋風", query: "泰式料理 打拋豬" },
    { name: "泰式綠咖哩", category: "韓式與泰越南洋風", query: "泰式料理 綠咖哩" },
    { name: "越南河粉", category: "韓式與泰越南洋風", query: "越南河粉" },
    { name: "越南法國麵包", category: "韓式與泰越南洋風", query: "越南法國麵包" },
    { name: "海南雞飯", category: "韓式與泰越南洋風", query: "海南雞飯" },
    { name: "肉骨茶", category: "韓式與泰越南洋風", query: "肉骨茶" },

    // 夜市小吃與其他
    { name: "鹹酥雞/炸物", category: "夜市小吃與其他", query: "鹹酥雞 炸物" },
    { name: "加熱滷味/冷滷味", category: "夜市小吃與其他", query: "滷味" },
    { name: "夏威夷拌飯", category: "夜市小吃與其他", query: "夏威夷拌飯 Poke" },
];
