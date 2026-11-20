# FRA GAMES — Unreal World Simulation Bridge

## Purpose
UFRAWorldSimulationSubsystem is the first native Unreal bridge for the deterministic world model. It is scoped to one UWorld, so separate loaded worlds do not accidentally share district state.

## Current contract
- FFRAWorldClockState stores simulation date/time, time scale and pause state.
- ConfigureClock validates the initial date and supported time scale.
- AdvanceSimulationSeconds advances deterministically when unpaused and rejects negative or excessively large single-step inputs.
- SetDistrict validates unique location/road IDs, road endpoints, positive travel costs and no self-connections before replacing the active district.
- FindRoute uses Dijkstra's algorithm, respects one-way roads and returns false for disconnected or invalid endpoints.
- Blueprint-callable functions expose the subsystem to the future interaction/UI layer without coupling gameplay to the JavaScript test core.

## Persistence boundary
The subsystem is transient runtime state. It is not the save system. A future versioned USaveGame object must explicitly serialize player identity, life progression, clock state, district identity, business state, NPC state and migration version. Do not serialize raw pointers or rely on transient subsystem memory surviving map travel.

## Current limitations
- The C++ implementation has not been compiled against Unreal Engine 5.8 in this environment.
- There is no level, district art, player interaction, save/load UI or persistence integration yet.
- AdvanceSimulationSeconds is explicit; a future authoritative simulation coordinator should decide when and how often to call it, rather than allowing every actor to advance time independently.
- Road travel cost is a logical gameplay cost, not metres or a physical navigation path.
- The JavaScript core and C++ subsystem are parallel implementations of the same contract; parity tests and runtime validation remain required.
