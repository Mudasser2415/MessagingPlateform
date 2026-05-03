using System;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    /// <summary>Processes a scheduled message at execution time.</summary>
    public interface IScheduledMessageProcessor
    {
        Task ProcessAsync(Guid scheduledMessageId);
    }
}
