const { APIClient } = require('../src/api/client');

async function main() {
  const client = new APIClient();
  const address = 'a77f1799de0148c07bc6ef630fb75ac267f31d147cd28797ad145afe72302632';
  const project = 'haike0513@gmail.com';

  try {
    // Get direct invites
    const directInvites = await client.getDirectInvites(address, project);
    console.log('\nDirect invites:', directInvites);
    console.log('Direct invite count:', directInvites.items[0]?.count || 0);

    // Get total invites (returns a number)
    const totalInvites = await client.getTotalInvites(address, project);
    console.log('\nTotal invites:', totalInvites);

    // Get indirect invites
    const indirectInvites = await client.getIndirectInvites(address, project);
    console.log('\nIndirect invites:', indirectInvites);
    console.log('Indirect invite count:', indirectInvites.items[0]?.count || 0);

    // Get incentives
    const incentives = await client.getIncentives(address, project);
    console.log('\nIncentives:', incentives);

    // Print summary
    console.log('\nSummary:');
    console.log('-------------------');
    console.log('Direct invites:', directInvites.items[0]?.count || 0);
    console.log('Indirect invites:', indirectInvites.items[0]?.count || 0);
    console.log('Total invites:', totalInvites);
    console.log('Incentives:', incentives);

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);