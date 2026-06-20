export type AvatarCategory = "Animals";
export type AvatarRarity = "Common" | "Rare" | "Epic" | "Legendary";

export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  imageSrc: string;
  category: AvatarCategory;
  rarity: AvatarRarity;
  bgGradient: string;
  borderColor?: string;
  glowColor?: string;
}

export const MOCK_AVATARS: AvatarItem[] = [
  {
    id: "av-rhinoceros",
    name: "Rhinoceros",
    emoji: "/avatars/rhinoceros.png",
    imageSrc: "/avatars/rhinoceros.png",
    category: "Animals",
    rarity: "Rare",
    bgGradient: "linear-gradient(135deg, #DDEEEF 0%, #B9D5D8 100%)",
  },
  {
    id: "av-lion",
    name: "Lion",
    emoji: "/avatars/lion.png",
    imageSrc: "/avatars/lion.png",
    category: "Animals",
    rarity: "Legendary",
    bgGradient: "linear-gradient(135deg, #FFE7A3 0%, #FFB36A 100%)",
    borderColor: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.28)",
  },
  {
    id: "av-zebra",
    name: "Zebra",
    emoji: "/avatars/zebra.png",
    imageSrc: "/avatars/zebra.png",
    category: "Animals",
    rarity: "Rare",
    bgGradient: "linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 100%)",
  },
  {
    id: "av-wolf",
    name: "Wolf",
    emoji: "/avatars/wolf.png",
    imageSrc: "/avatars/wolf.png",
    category: "Animals",
    rarity: "Epic",
    bgGradient: "linear-gradient(135deg, #BFD5D7 0%, #FF9A76 100%)",
    borderColor: "#8B5CF6",
    glowColor: "rgba(139, 92, 246, 0.22)",
  },
  {
    id: "av-giraffe",
    name: "Giraffe",
    emoji: "/avatars/giraffe.png",
    imageSrc: "/avatars/giraffe.png",
    category: "Animals",
    rarity: "Epic",
    bgGradient: "linear-gradient(135deg, #FFF176 0%, #FF8A65 100%)",
  },
  {
    id: "av-monkey",
    name: "Monkey",
    emoji: "/avatars/monkey.png",
    imageSrc: "/avatars/monkey.png",
    category: "Animals",
    rarity: "Common",
    bgGradient: "linear-gradient(135deg, #B5E46D 0%, #A6633A 100%)",
  },
  {
    id: "av-weasel",
    name: "Weasel",
    emoji: "/avatars/weasel.png",
    imageSrc: "/avatars/weasel.png",
    category: "Animals",
    rarity: "Common",
    bgGradient: "linear-gradient(135deg, #FFE082 0%, #AAB2C5 100%)",
  },
  {
    id: "av-dog",
    name: "Dog",
    emoji: "/avatars/dog.png",
    imageSrc: "/avatars/dog.png",
    category: "Animals",
    rarity: "Common",
    bgGradient: "linear-gradient(135deg, #FFE27A 0%, #D87945 100%)",
  },
  {
    id: "av-panda",
    name: "Panda Bear",
    emoji: "/avatars/panda-bear.png",
    imageSrc: "/avatars/panda-bear.png",
    category: "Animals",
    rarity: "Rare",
    bgGradient: "linear-gradient(135deg, #F8F0E6 0%, #7AA0A3 100%)",
  },
];
