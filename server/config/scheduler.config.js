const schedule = require('node-schedule');
 
class SchedulerConfig {
  static init() {
    return schedule.scheduleJob('10 * * * *', () => {
      console.log('The answer to life, the universe, and everything!');
    });
  }
}

module.exports = { SchedulerConfig }
