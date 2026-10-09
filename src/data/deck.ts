/**
 * The starter deck: a hand-picked set to get going before the full JLPT and HSK lists are imported.
 *
 * Japanese cards say how the word relates to Chinese, because that is where a Chinese speaker's head start
 * (or interference) comes from:
 * - `same`: the characters mean the same thing in Chinese, so only the Japanese reading is new.
 * - `different`: a false friend. The same characters mean something else in Chinese.
 * - `none`: Chinese uses a different word; `zh` is that word.
 *
 * JLPT levels are approximate. There has been no official JLPT word list since 2010, so they follow the common
 * community lists.
 */

export type Relation = 'same' | 'different' | 'none';

export interface JapaneseCard {
  id: string;
  lang: 'ja';
  word: string;
  kana: string;
  romaji: string;
  meaning: string;
  level: 'N5' | 'N4' | 'N3';
  relation: Relation;
  /** For `same`: the Chinese spelling. For `different`: the same characters in Chinese and what they mean there. For `none`: the Chinese word for it. */
  zh: { word: string; pinyin: string; meaning?: string };
}

export interface ChineseCard {
  id: string;
  lang: 'zh';
  word: string;
  pinyin: string;
  meaning: string;
  /** `mine` is a phrase you added yourself; the rest come with the app. */
  kind: 'word' | 'chengyu' | 'phrase' | 'mine';
  /** Where you came across it: a show, a song, a conversation. */
  source?: string;
  /** The line you heard it in, or your own sentence using it. */
  example?: string;
}

export type Card = JapaneseCard | ChineseCard;

type JaRow = [word: string, kana: string, romaji: string, meaning: string, level: JapaneseCard['level'], relation: Relation, zhWord: string, zhPinyin: string, zhMeaning?: string];

const japanese: JaRow[] = [
  // Same meaning in Chinese
  ['学生', 'がくせい', 'gakusei', 'student', 'N5', 'same', '学生', 'xuésheng'],
  ['学校', 'がっこう', 'gakkō', 'school', 'N5', 'same', '学校', 'xuéxiào'],
  ['大学', 'だいがく', 'daigaku', 'university', 'N5', 'same', '大学', 'dàxué'],
  ['時間', 'じかん', 'jikan', 'time; hours', 'N5', 'same', '时间', 'shíjiān'],
  ['天気', 'てんき', 'tenki', 'weather', 'N5', 'same', '天气', 'tiānqì'],
  ['電話', 'でんわ', 'denwa', 'telephone', 'N5', 'same', '电话', 'diànhuà'],
  ['銀行', 'ぎんこう', 'ginkō', 'bank', 'N5', 'same', '银行', 'yínháng'],
  ['図書館', 'としょかん', 'toshokan', 'library', 'N5', 'same', '图书馆', 'túshūguǎn'],
  ['外国', 'がいこく', 'gaikoku', 'foreign country', 'N5', 'same', '外国', 'wàiguó'],
  ['旅行', 'りょこう', 'ryokō', 'travel, trip', 'N5', 'same', '旅行', 'lǚxíng'],
  ['散歩', 'さんぽ', 'sanpo', 'a walk, stroll', 'N5', 'same', '散步', 'sànbù'],
  ['練習', 'れんしゅう', 'renshū', 'practice', 'N5', 'same', '练习', 'liànxí'],
  ['有名', 'ゆうめい', 'yūmei', 'famous', 'N5', 'same', '有名', 'yǒumíng'],
  ['便利', 'べんり', 'benri', 'convenient', 'N5', 'same', '便利', 'biànlì'],
  ['毎日', 'まいにち', 'mainichi', 'every day', 'N5', 'same', '每日', 'měirì'],
  ['水', 'みず', 'mizu', 'water', 'N5', 'same', '水', 'shuǐ'],
  ['山', 'やま', 'yama', 'mountain', 'N5', 'same', '山', 'shān'],
  ['雨', 'あめ', 'ame', 'rain', 'N5', 'same', '雨', 'yǔ'],
  ['花', 'はな', 'hana', 'flower', 'N5', 'same', '花', 'huā'],
  ['人', 'ひと', 'hito', 'person', 'N5', 'same', '人', 'rén'],
  ['東', 'ひがし', 'higashi', 'east', 'N5', 'same', '东', 'dōng'],
  ['読む', 'よむ', 'yomu', 'to read', 'N5', 'same', '读', 'dú'],
  ['来る', 'くる', 'kuru', 'to come', 'N5', 'same', '来', 'lái'],
  ['買う', 'かう', 'kau', 'to buy', 'N5', 'same', '买', 'mǎi'],
  ['大きい', 'おおきい', 'ōkii', 'big', 'N5', 'same', '大', 'dà'],
  ['小さい', 'ちいさい', 'chiisai', 'small', 'N5', 'same', '小', 'xiǎo'],
  ['新しい', 'あたらしい', 'atarashii', 'new', 'N5', 'same', '新', 'xīn'],
  ['売る', 'うる', 'uru', 'to sell', 'N4', 'same', '卖', 'mài'],
  ['簡単', 'かんたん', 'kantan', 'simple, easy', 'N4', 'same', '简单', 'jiǎndān'],
  ['必要', 'ひつよう', 'hitsuyō', 'necessary', 'N4', 'same', '必要', 'bìyào'],
  ['準備', 'じゅんび', 'junbi', 'preparation', 'N4', 'same', '准备', 'zhǔnbèi'],
  ['会話', 'かいわ', 'kaiwa', 'conversation', 'N4', 'same', '会话', 'huìhuà'],

  // False friends
  ['手紙', 'てがみ', 'tegami', 'letter (mail)', 'N5', 'different', '手纸', 'shǒuzhǐ', 'toilet paper'],
  ['勉強', 'べんきょう', 'benkyō', 'study', 'N5', 'different', '勉强', 'miǎnqiǎng', 'reluctantly; barely enough'],
  ['先生', 'せんせい', 'sensei', 'teacher', 'N5', 'different', '先生', 'xiānsheng', 'Mr.; husband'],
  ['新聞', 'しんぶん', 'shinbun', 'newspaper', 'N5', 'different', '新闻', 'xīnwén', 'news (a newspaper is 报纸)'],
  ['机', 'つくえ', 'tsukue', 'desk', 'N5', 'different', '机', 'jī', 'machine (the simplified form of 機)'],
  ['走る', 'はしる', 'hashiru', 'to run', 'N5', 'different', '走', 'zǒu', 'to walk'],
  ['階段', 'かいだん', 'kaidan', 'stairs', 'N5', 'different', '阶段', 'jiēduàn', 'stage, phase'],
  ['野菜', 'やさい', 'yasai', 'vegetables', 'N5', 'different', '野菜', 'yěcài', 'wild herbs'],
  ['質問', 'しつもん', 'shitsumon', 'question', 'N5', 'different', '质问', 'zhìwèn', 'to interrogate'],
  ['写真', 'しゃしん', 'shashin', 'photograph', 'N5', 'different', '写真', 'xiězhēn', 'portrait; glamour photo shoot'],
  ['聞く', 'きく', 'kiku', 'to hear; to ask', 'N5', 'different', '闻', 'wén', 'to smell'],
  ['高い', 'たかい', 'takai', 'tall; expensive', 'N5', 'different', '高', 'gāo', 'tall, high, but never "expensive" (that is 贵)'],
  ['安い', 'やすい', 'yasui', 'cheap', 'N5', 'different', '安', 'ān', 'peaceful, safe'],
  ['行く', 'いく', 'iku', 'to go', 'N5', 'different', '行', 'xíng', 'OK, will do; to walk'],
  ['意味', 'いみ', 'imi', 'meaning', 'N5', 'different', '意味', 'yìwèi', 'implication, flavour (meaning is 意思)'],
  ['娘', 'むすめ', 'musume', 'daughter', 'N4', 'different', '娘', 'niáng', 'mother'],
  ['丈夫', 'じょうぶ', 'jōbu', 'sturdy, robust', 'N4', 'different', '丈夫', 'zhàngfu', 'husband'],
  ['大丈夫', 'だいじょうぶ', 'daijōbu', 'OK, all right', 'N4', 'different', '大丈夫', 'dàzhàngfu', 'a real man'],
  ['留守', 'るす', 'rusu', 'being out, away from home', 'N4', 'different', '留守', 'liúshǒu', 'to stay behind'],
  ['床', 'ゆか', 'yuka', 'floor', 'N3', 'different', '床', 'chuáng', 'bed'],
  ['迷惑', 'めいわく', 'meiwaku', 'nuisance, trouble', 'N3', 'different', '迷惑', 'míhuò', 'puzzled, confused'],
  ['工夫', 'くふう', 'kufū', 'ingenuity; devising a way', 'N3', 'different', '工夫', 'gōngfu', 'time, effort'],

  // Different word in Chinese
  ['友達', 'ともだち', 'tomodachi', 'friend', 'N5', 'none', '朋友', 'péngyou'],
  ['名前', 'なまえ', 'namae', 'name', 'N5', 'none', '名字', 'míngzi'],
  ['子供', 'こども', 'kodomo', 'child', 'N5', 'none', '孩子', 'háizi'],
  ['会社', 'かいしゃ', 'kaisha', 'company', 'N5', 'none', '公司', 'gōngsī'],
  ['食べる', 'たべる', 'taberu', 'to eat', 'N5', 'none', '吃', 'chī'],
  ['飲む', 'のむ', 'nomu', 'to drink', 'N5', 'none', '喝', 'hē'],
  ['見る', 'みる', 'miru', 'to see, watch', 'N5', 'none', '看', 'kàn'],
  ['映画', 'えいが', 'eiga', 'movie', 'N5', 'none', '电影', 'diànyǐng'],
  ['駅', 'えき', 'eki', 'train station', 'N5', 'none', '车站', 'chēzhàn'],
  ['自転車', 'じてんしゃ', 'jitensha', 'bicycle', 'N5', 'none', '自行车', 'zìxíngchē'],
  ['切手', 'きって', 'kitte', 'postage stamp', 'N5', 'none', '邮票', 'yóupiào'],
  ['時計', 'とけい', 'tokei', 'clock, watch', 'N5', 'none', '钟表', 'zhōngbiǎo'],
  ['今日', 'きょう', 'kyō', 'today', 'N5', 'none', '今天', 'jīntiān'],
  ['明日', 'あした', 'ashita', 'tomorrow', 'N5', 'none', '明天', 'míngtiān'],
  ['大切', 'たいせつ', 'taisetsu', 'important, precious', 'N4', 'none', '重要', 'zhòngyào'],
];

type ZhRow = [word: string, pinyin: string, meaning: string];

const chineseWords: ZhRow[] = [
  ['犹豫', 'yóuyù', 'to hesitate'],
  ['尴尬', 'gāngà', 'awkward, embarrassing'],
  ['忐忑', 'tǎntè', 'uneasy, on edge'],
  ['邋遢', 'lāta', 'sloppy, slovenly'],
  ['喷嚏', 'pēntì', 'a sneeze'],
  ['鼻涕', 'bítì', 'nasal mucus, snot'],
  ['骆驼', 'luòtuo', 'camel'],
  ['玻璃', 'bōli', 'glass (the material)'],
  ['疙瘩', 'gēda', 'a lump; a pimple'],
  ['憔悴', 'qiáocuì', 'haggard, worn out'],
  ['琢磨', 'zuómo', 'to turn over in your mind, ponder'],
  ['酝酿', 'yùnniàng', 'to brew; to work out (a plan or idea)'],
  ['斟酌', 'zhēnzhuó', 'to weigh up carefully'],
  ['惦记', 'diànjì', 'to keep thinking about (someone)'],
  ['挑剔', 'tiāoti', 'picky, fussy'],
  ['吝啬', 'lìnsè', 'stingy'],
  ['腼腆', 'miǎntiǎn', 'shy, bashful'],
  ['踌躇', 'chóuchú', 'to hesitate, waver'],
  ['蹒跚', 'pánshān', 'to hobble, stagger'],
  ['澎湃', 'péngpài', 'surging, tempestuous'],
  ['璀璨', 'cuǐcàn', 'dazzling, resplendent'],
  ['觊觎', 'jìyú', 'to covet'],
  ['揶揄', 'yéyú', 'to mock, tease'],
  ['龃龉', 'jǔyǔ', 'friction, disagreement'],
  ['耄耋', 'màodié', 'very old age (eighty to ninety)'],
];

const chengyu: ZhRow[] = [
  ['一丝不苟', 'yī sī bù gǒu', 'meticulous, not careless in the slightest'],
  ['半途而废', 'bàn tú ér fèi', 'to give up halfway'],
  ['画蛇添足', 'huà shé tiān zú', 'to spoil something by adding what is not needed'],
  ['守株待兔', 'shǒu zhū dài tù', 'to wait idly for a windfall'],
  ['津津有味', 'jīn jīn yǒu wèi', 'with great relish'],
  ['迫不及待', 'pò bù jí dài', 'too impatient to wait'],
  ['锲而不舍', 'qiè ér bù shě', 'to keep chipping away, persevere'],
  ['熙熙攘攘', 'xī xī rǎng rǎng', 'bustling with people'],
  ['囫囵吞枣', 'hú lún tūn zǎo', 'to swallow whole: learn without understanding'],
  ['塞翁失马', 'sài wēng shī mǎ', 'a loss may turn out to be a blessing'],
  ['对牛弹琴', 'duì niú tán qín', 'to talk to someone who cannot appreciate it'],
  ['亡羊补牢', 'wáng yáng bǔ láo', 'to fix the pen after losing sheep: better late than never'],
  ['杞人忧天', 'qǐ rén yōu tiān', 'to worry about nothing'],
  ['胸有成竹', 'xiōng yǒu chéng zhú', 'to have a well-thought-out plan'],
];

/** Everyday expressions you hear in conversations, shows and online, rather than in textbooks. */
const phrases: ZhRow[] = [
  ['内卷', 'nèijuǎn', 'rat race; pointless over-competition'],
  ['躺平', 'tǎngpíng', 'to "lie flat": opt out of the rat race'],
  ['摆烂', 'bǎilàn', 'to give up and let things get worse'],
  ['破防', 'pòfáng', 'to have your emotional defences broken; be deeply moved or hurt'],
  ['内耗', 'nèihào', 'draining yourself with overthinking'],
  ['凡尔赛', 'fán\'ěrsài', 'a humblebrag (from "Versailles")'],
  ['社恐', 'shèkǒng', 'socially anxious (short for 社交恐惧)'],
  ['佛系', 'fóxì', 'laid-back, going with the flow'],
  ['吃瓜', 'chīguā', 'to watch drama or gossip unfold as a bystander'],
  ['种草', 'zhòngcǎo', 'to make someone want to buy something'],
  ['打卡', 'dǎkǎ', 'to check in; to visit a popular spot and post about it'],
  ['画饼', 'huàbǐng', 'to make empty promises (draw a cake)'],
  ['甩锅', 'shuǎiguō', 'to pass the blame onto someone else'],
  ['靠谱', 'kàopǔ', 'reliable, makes sense'],
  ['接地气', 'jiē dìqì', 'down-to-earth, relatable'],
];

const idFrom =(lang: string, text: string) => `${lang}-${text.toLowerCase().replace(/[^a-z0-9āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+/g, '-')}`;

export const deck: Card[] = [
  ...japanese.map(([word, kana, romaji, meaning, level, relation, zhWord, zhPinyin, zhMeaning]): JapaneseCard => ({
    id: idFrom('ja', romaji),
    lang: 'ja',
    word,
    kana,
    romaji,
    meaning,
    level,
    relation,
    zh: zhMeaning === undefined ? { word: zhWord, pinyin: zhPinyin } : { word: zhWord, pinyin: zhPinyin, meaning: zhMeaning },
  })),
  ...chineseWords.map(([word, pinyin, meaning]): ChineseCard => ({ id: idFrom('zh', pinyin), lang: 'zh', word, pinyin, meaning, kind: 'word' })),
  ...chengyu.map(([word, pinyin, meaning]): ChineseCard => ({ id: idFrom('zh', pinyin), lang: 'zh', word, pinyin, meaning, kind: 'chengyu' })),
  ...phrases.map(([word, pinyin, meaning]): ChineseCard => ({ id: idFrom('zh', pinyin), lang: 'zh', word, pinyin, meaning, kind: 'phrase' })),
];

export const deckById = new Map(deck.map((card) => [card.id, card]));
