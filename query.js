const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const nfts = await prisma.nFT.findMany({ take: 5 });
  console.log(nfts.map(n => n.image));
}
main();
