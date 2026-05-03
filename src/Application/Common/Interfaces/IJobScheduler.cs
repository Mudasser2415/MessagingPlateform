using System;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Abstraction over the Hangfire job scheduler. Keeps Application layer free of Hangfire dependency.
    /// </summary>
    public interface IJobScheduler
    {
        /// <summary>Schedules a ScheduledMessage processing job and returns the Hangfire job ID.</summary>
        string ScheduleMessage(Guid scheduledMessageId, DateTimeOffset runAt);

        /// <summary>Deletes a scheduled job by its Hangfire job ID. Returns false if job was not found.</summary>
        bool Delete(string jobId);
    }
}
