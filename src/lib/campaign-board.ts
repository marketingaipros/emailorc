export type CampaignBoardColumn =
  | "Uploaded"
  | "Ready"
  | "Draft Generated"
  | "Needs Review"
  | "Approved"
  | "Exported"
  | "Replied"
  | "Not Interested"
  | "Do Not Contact";

export interface CampaignBoardCard {
  id: number;
  name: string;
  company: string;
  product: string;
  owner: string;
  column: CampaignBoardColumn;
}

export const CAMPAIGN_BOARD_COLUMNS: CampaignBoardColumn[] = [
  "Uploaded",
  "Ready",
  "Draft Generated",
  "Needs Review",
  "Approved",
  "Exported",
  "Replied",
  "Not Interested",
  "Do Not Contact",
];

export const INITIAL_CAMPAIGN_BOARD_CARDS: CampaignBoardCard[] = [
  { id: 1, name: "Sarah Johnson", company: "Apex Logistics", product: "Pro Plan", owner: "JR", column: "Approved" },
  { id: 2, name: "Marcus Webb", company: "Greenfield Capital", product: "Starter", owner: "DK", column: "Approved" },
  { id: 3, name: "Carlos Mena", company: "Mena Retail Group", product: "Starter", owner: "DK", column: "Needs Review" },
  { id: 4, name: "Olivia Stern", company: "Stern & Associates", product: "Enterprise", owner: "JR", column: "Needs Review" },
  { id: 5, name: "Rina Patel", company: "BluePath Health", product: "Growth Plan", owner: "JR", column: "Draft Generated" },
  { id: 6, name: "Tom Hargrove", company: "Hargrove.io", product: "Pro Plan", owner: "DK", column: "Draft Generated" },
  { id: 7, name: "Janet Liu", company: "Skyline Dev Co.", product: "Pro Plan", owner: "JR", column: "Ready" },
  { id: 8, name: "Howard Grant", company: "Grant Manufacturing", product: "Enterprise", owner: "DK", column: "Do Not Contact" },
  { id: 9, name: "Priya Nair", company: "NairTech Solutions", product: "Starter", owner: "JR", column: "Replied" },
  { id: 10, name: "Leon Brandt", company: "Brandt Consulting", product: "Pro Plan", owner: "DK", column: "Uploaded" },
  { id: 11, name: "Amara Osei", company: "Osei Ventures", product: "Growth Plan", owner: "JR", column: "Exported" },
  { id: 12, name: "Chris Yamamoto", company: "Yama Digital", product: "Starter", owner: "DK", column: "Not Interested" },
];

export function moveCampaignBoardCard(
  cards: CampaignBoardCard[],
  cardId: number,
  targetColumn: CampaignBoardColumn,
) {
  return cards.map((card) => (card.id === cardId ? { ...card, column: targetColumn } : card));
}

export function cardsForCampaignBoardColumn(
  cards: CampaignBoardCard[],
  column: CampaignBoardColumn,
) {
  return cards.filter((card) => card.column === column);
}
