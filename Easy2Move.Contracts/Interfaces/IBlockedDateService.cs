using Easy2Move.Contracts.Models;

namespace Easy2Move.Contracts.Interfaces;

public interface IBlockedDateService
{
    Task<List<BlockedDateDto>> GetAll();
    Task<BlockedDateDto> Create(BlockedDateDto blockedDate);
    Task<List<BlockedDateDto>> CreateRange(DateTime van, DateTime tot, string reden);
    Task<bool> Delete(int id);
}
