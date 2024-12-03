const { CSBPClock, initializeClock } = require('../src/core/clock.js');
const { InviteEvent } = require('../src/events/invite.js');

async function main() {
  await initializeClock();
  const clock = new CSBPClock();

  const invite = new InviteEvent('eventId', 'alice', 'bob', {
    ProjectId: 'project123',
    message: 'Join our project!',
    platform: 'CSBP',
    version: '1.0.0'
  });

  clock.addEvent(invite);
  console.log('Created invite:', invite);

  // 接受邀请
  invite.accept();

  // 获取所有事件
  console.log('All events:', clock.getAllEvents());
}

main().catch(console.error); 