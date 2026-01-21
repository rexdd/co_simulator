
import { GameCard, GameEvent, ResourceType, Talent } from './types';

export const INITIAL_RENT = 120;

export const CARDS: GameCard[] = [
  {
    id: "huleng",
    name: "糊弄学",
    desc: "敷衍当前需求，拖延战线。",
    cost: { [ResourceType.SANITY]: 5, [ResourceType.ENERGY]: 1 },
    gain: { [ResourceType.STRESS]: 3 },
  },
  {
    id: "allnighter",
    name: "通宵爆肝",
    desc: "硬刚需求，换来 KPI 飙升。",
    cost: { [ResourceType.HEALTH]: 15, [ResourceType.ENERGY]: 2, [ResourceType.SANITY]: 5 },
    gain: { [ResourceType.KPI]: 15, [ResourceType.STRESS]: 10 },
  },
  {
    id: "toilet",
    name: "带薪拉屎",
    desc: "摸鱼回血，但老板怒气上升。",
    cost: { [ResourceType.ENERGY]: 1 },
    gain: { [ResourceType.SANITY]: 8, [ResourceType.STRESS]: 4 },
  },
  {
    id: "throw",
    name: "推卸责任",
    desc: "把锅甩给队友，声望受损。",
    cost: { [ResourceType.SANITY]: 2, [ResourceType.ENERGY]: 1 },
    gain: { [ResourceType.KPI]: 5, [ResourceType.REPUTATION]: -8, [ResourceType.STRESS]: -2 },
  },
  {
    id: "ppt",
    name: "PPT 画饼",
    desc: "给老板画大饼，短暂提振士气。",
    cost: { [ResourceType.ENERGY]: 1 },
    gain: { [ResourceType.SANITY]: 6, [ResourceType.KPI]: 3 },
  },
  {
    id: "coffee",
    name: "双倍冰美式",
    desc: "牺牲健康换取能量。",
    cost: { [ResourceType.HEALTH]: 10 },
    gain: { [ResourceType.ENERGY]: 2, [ResourceType.STRESS]: 5 },
  }
];

export const NIGHT_ACTIONS: GameCard[] = [
  { id: "ramen", name: "深夜拉面", desc: "花钱回血，微增压力", cost: { [ResourceType.MONEY]: 35 }, gain: { [ResourceType.HEALTH]: 12, [ResourceType.SANITY]: 5, [ResourceType.STRESS]: 2 } },
  { id: "clinic", name: "小诊所挂水", desc: "砸钱保命", cost: { [ResourceType.MONEY]: 120 }, gain: { [ResourceType.HEALTH]: 30, [ResourceType.SANITY]: 4, [ResourceType.ENERGY]: -1 } },
  { id: "gacha", name: "彩票一注", desc: "小赌怡情，大赌伤身", cost: { [ResourceType.MONEY]: 20 }, gain: { [ResourceType.MONEY]: (s) => (Math.random() < 0.1 ? 500 : 0), [ResourceType.SANITY]: 2 } },
  { id: "waimai", name: "外卖接单", desc: "副业赚点小钱，但很累", cost: { [ResourceType.ENERGY]: 1, [ResourceType.HEALTH]: 5 }, gain: { [ResourceType.MONEY]: 60, [ResourceType.STRESS]: 8 } },
  { id: "binge", name: "刷剧放空", desc: "纯恢复精神", cost: { [ResourceType.ENERGY]: 1 }, gain: { [ResourceType.SANITY]: 15, [ResourceType.STRESS]: -5 } },
];

export const TALENTS: Talent[] = [
  { id: "juan", name: "卷王", desc: "睡眠需求-1，初始能量上限+1，压力增长缓慢" },
  { id: "moyu", name: "摸鱼达人", desc: "摸鱼卡牌效果翻倍，KPI 需求降低 20%" },
  { id: "xieg", name: "斜杠青年", desc: "副业收益+50%，但健康消耗增加" },
];

export const EVENTS: GameEvent[] = [
  { 
    id: 'rent_up', 
    title: "房东敲门", 
    desc: "房东说要涨房租，下月起租金+50。", 
    effect: (s) => { s.stress += 10; }, 
    tone: "neg" 
  },
  { 
    id: 'cat_sick', 
    title: "主子微恙", 
    desc: "猫咪生病急诊，钱包大放血。", 
    effect: (s) => { s.money -= 150; s.sanity -= 10; }, 
    tone: "neg" 
  },
  { 
    id: 'subway', 
    title: "地铁故障", 
    desc: "迟到被记过，全勤奖飞了。", 
    effect: (s) => { s.kpi -= 10; s.money -= 50; }, 
    tone: "neg" 
  },
  { 
    id: 'bonus', 
    title: "项目奖金", 
    desc: "由于 KPI 表现优异，获得了一笔微薄奖金。", 
    effect: (s) => { s.money += 300; s.sanity += 10; }, 
    tone: "pos" 
  },
  { 
    id: 'sunset', 
    title: "橘子色晚霞", 
    desc: "下班路上看到了绝美的晚霞，心被治愈了。", 
    effect: (s) => { s.sanity += 20; s.stress -= 15; }, 
    tone: "pos" 
  },
];
