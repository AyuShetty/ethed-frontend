const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const nfts = await prisma.nFT.findMany({});
  console.log(nfts.filter(n => n.image && n.image.includes('gateway.pinata')).map(n => n.image));
}
main();
