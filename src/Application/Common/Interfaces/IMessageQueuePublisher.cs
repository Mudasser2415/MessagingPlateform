using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Publishes message IDs to the outbound processing queue.
    /// </summary>
    public interface IMessageQueuePublisher
    {
        Task PublishAsync(IReadOnlyList<Guid> messageIds, CancellationToken cancellationToken = default);
    }
}
