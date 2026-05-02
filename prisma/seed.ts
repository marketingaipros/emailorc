import { PrismaClient, CampaignMode, ProcessingStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({ where: { email: "demo@vrf.local" }, update: {}, create: { email: "demo@vrf.local", name: "Demo Admin" } });
  const campaign = await prisma.campaign.create({ data: { name: "Q2 Sage Renewal", description: "Demo campaign", createdById: user.id, status: "ACTIVE" } });
  await prisma.campaignRow.createMany({ data: [
    { campaignId: campaign.id, sourceRowId: "1", businessName: "Acme Services", decisionMaker: "Jordan Lee", email: "jordan@acme.com", renewalDate: new Date(Date.now()+1000*60*60*24*22), daysToRenew: 22, industry: "Professional Services", offerType: "Sage50cloud upgrade", notes: "Interested in cloud access", campaignMode: CampaignMode.RENEWAL_UPSELL, processingStatus: ProcessingStatus.VALID },
    { campaignId: campaign.id, sourceRowId: "2", businessName: "Northwind", decisionMaker: "Casey", email: "casey@northwind.com", renewalDate: new Date(Date.now()+1000*60*60*24*80), daysToRenew: 80, industry: "Retail", offerType: "continuity", notes: "out of window", processingStatus: ProcessingStatus.NEEDS_REVIEW },
    { campaignId: campaign.id, sourceRowId: "3", businessName: null, decisionMaker: null, email: "", renewalDate: null, daysToRenew: null, industry: "", offerType: "", notes: "", processingStatus: ProcessingStatus.NEEDS_REVIEW }
  ]});
}
main().finally(()=>prisma.$disconnect());
