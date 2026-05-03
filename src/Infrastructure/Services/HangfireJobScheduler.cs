using Application.Common.Interfaces;
using Hangfire;
using System;

namespace Infrastructure.Services
{
    public class HangfireJobScheduler : IJobScheduler
    {
        private readonly IBackgroundJobClient _client;

        public HangfireJobScheduler(IBackgroundJobClient client)
        {
            _client = client;
        }

        public string ScheduleMessage(Guid scheduledMessageId, DateTimeOffset runAt)
        {
            return _client.Schedule<IScheduledMessageProcessor>(
                p => p.ProcessAsync(scheduledMessageId),
                runAt);
        }

        public bool Delete(string jobId)
        {
            return _client.Delete(jobId);
        }
    }
}
