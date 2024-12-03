const { NostrClient, NOSTR_KINDS } = require('../src/api/index.js');

async function fetchHistory() {
  const client = new NostrClient('wss://relay1.nostrchat.io');
  
  try {
    // 连接到 relay
    console.log('Connecting to relay...');
    await client.connect();
    console.log('Connected to relay');

    // 获取历史邀请事件
    console.log('Fetching historical invites...');
    const historicalEvents = await new Promise((resolve) => {
      const events = [];
      let completed = false;

      // 设置超时
      const timeout = setTimeout(() => {
        if (!completed) {
          console.log('Query timed out after 15 seconds');
          completed = true;
          resolve(events);
        }
      }, 15000);

      client.subscribe([
        {
          kinds: [NOSTR_KINDS.INVITE],
          limit: 100,
          // 获取最近30天的数据
          since: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
        }
      ], (event) => {
        console.log('Received event:', JSON.stringify(event, null, 2));
        events.push(event);
      }, () => {
        console.log('End of stored events');
        if (!completed) {
          completed = true;
          clearTimeout(timeout);
          resolve(events);
        }
      });
    });

    // 按时间排序
    historicalEvents.sort((a, b) => b.created_at - a.created_at);

    // 打印历史事件
    if (historicalEvents.length > 0) {
      console.log('\nFound', historicalEvents.length, 'invite events:');
      historicalEvents.forEach((event, index) => {
        console.log('\n-------------------------------------------');
        console.log(`Event ${index + 1}:`);
        console.log('-------------------------------------------');
        console.log('ID:', event.id);
        console.log('Author:', event.pubkey);
        console.log('Created:', new Date(event.created_at * 1000).toISOString());
        console.log('Kind:', event.kind);
        
        try {
          const content = JSON.parse(event.content);
          console.log('Invite details:');
          console.log('  From:', content.inviter);
          console.log('  To:', content.invitee);
          console.log('  Project:', content.projectId);
          console.log('  Message:', content.metadata.message);
          console.log('  Additional metadata:', JSON.stringify(content.metadata, null, 2));
        } catch {
          console.log('Content:', event.content);
        }

        if (event.tags && event.tags.length > 0) {
          console.log('\nTags:');
          event.tags.forEach(tag => {
            if (tag[0] === 'p') {
              console.log(`  - Invitee: ${tag[1]}`);
            } else {
              console.log(`  - ${tag[0]}: ${tag.slice(1).join(', ')}`);
            }
          });
        }
      });
      console.log('\n-------------------------------------------');

      // 统计信息
      console.log('\nStatistics:');
      console.log('-------------------------------------------');
      console.log('Total events:', historicalEvents.length);

      // 按作者分组
      const authorStats = new Map();
      historicalEvents.forEach(event => {
        const count = authorStats.get(event.pubkey) || 0;
        authorStats.set(event.pubkey, count + 1);
      });

      console.log('\nEvents by author:');
      for (const [author, count] of authorStats.entries()) {
        console.log(`  ${author}: ${count} events`);
      }

      // 时间分布
      const now = Math.floor(Date.now() / 1000);
      const timeStats = historicalEvents.reduce((stats, event) => {
        const age = now - event.created_at;
        if (age <= 3600) stats.lastHour++;
        if (age <= 86400) stats.lastDay++;
        if (age <= 604800) stats.lastWeek++;
        if (age <= 2592000) stats.lastMonth++;
        return stats;
      }, { lastHour: 0, lastDay: 0, lastWeek: 0, lastMonth: 0 });

      console.log('\nTime distribution:');
      console.log('  Last hour:', timeStats.lastHour);
      console.log('  Last 24 hours:', timeStats.lastDay);
      console.log('  Last 7 days:', timeStats.lastWeek);
      console.log('  Last 30 days:', timeStats.lastMonth);

    } else {
      console.log('\nNo invite events found');
      console.log('Note: This relay might not have any kind 1111 events');
      console.log('Try querying a different time range or relay');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('\nClosing connection...');
    client.close();
  }
}

// 命令行参数
const args = process.argv.slice(2);
const options = {
  days: parseInt(args[0]) || 30,
  limit: parseInt(args[1]) || 100
};

console.log('Starting with options:', options);
fetchHistory().catch(console.error); 