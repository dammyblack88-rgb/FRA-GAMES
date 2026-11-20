#include "FRAWorldSimulationSubsystem.h"
#include "Algo/Reverse.h"

bool UFRAWorldSimulationSubsystem::ConfigureClock(const FDateTime& StartDateTime, int32 InMinutesPerRealSecond, bool bStartPaused)
{
    if (!StartDateTime.GetYear() || InMinutesPerRealSecond < 1 || InMinutesPerRealSecond > 1440)
    {
        return false;
    }
    ClockState.CurrentDateTime = StartDateTime;
    ClockState.MinutesPerRealSecond = InMinutesPerRealSecond;
    ClockState.bPaused = bStartPaused;
    return true;
}

bool UFRAWorldSimulationSubsystem::AdvanceSimulationSeconds(int32 ElapsedRealSeconds)
{
    if (ElapsedRealSeconds < 0 || ElapsedRealSeconds > 86400) return false;
    if (ClockState.bPaused || ElapsedRealSeconds == 0) return true;
    const int64 MinutesToAdvance = static_cast<int64>(ElapsedRealSeconds) * ClockState.MinutesPerRealSecond;
    ClockState.CurrentDateTime += FTimespan::FromMinutes(static_cast<double>(MinutesToAdvance));
    return true;
}

void UFRAWorldSimulationSubsystem::SetSimulationPaused(bool bPaused)
{
    ClockState.bPaused = bPaused;
}

bool UFRAWorldSimulationSubsystem::HasLocation(FName LocationId) const
{
    return DistrictLocations.ContainsByPredicate([LocationId](const FFRADistrictLocation& Location)
    {
        return Location.Id == LocationId;
    });
}

bool UFRAWorldSimulationSubsystem::SetDistrict(const TArray<FFRADistrictLocation>& Locations, const TArray<FFRADistrictRoad>& Roads)
{
    if (Locations.IsEmpty()) return false;
    TSet<FName> LocationIds;
    for (const FFRADistrictLocation& Location : Locations)
    {
        if (Location.Id.IsNone() || Location.DisplayName.IsEmpty() || Location.LocationType.IsNone() || LocationIds.Contains(Location.Id)) return false;
        LocationIds.Add(Location.Id);
    }
    TSet<FName> RoadIds;
    for (const FFRADistrictRoad& Road : Roads)
    {
        if (Road.Id.IsNone() || RoadIds.Contains(Road.Id) || Road.FromLocationId == Road.ToLocationId
            || !LocationIds.Contains(Road.FromLocationId) || !LocationIds.Contains(Road.ToLocationId) || Road.TravelCost < 1) return false;
        RoadIds.Add(Road.Id);
    }
    DistrictLocations = Locations;
    DistrictRoads = Roads;
    return true;
}

bool UFRAWorldSimulationSubsystem::FindRoute(FName StartLocationId, FName DestinationLocationId, FFRARouteResult& OutRoute) const
{
    OutRoute = FFRARouteResult();
    if (!HasLocation(StartLocationId) || !HasLocation(DestinationLocationId)) return false;
    if (StartLocationId == DestinationLocationId)
    {
        OutRoute.LocationIds.Add(StartLocationId);
        return true;
    }

    TMap<FName, int64> Distances;
    TMap<FName, FName> PreviousLocations;
    TMap<FName, FName> PreviousRoads;
    TSet<FName> Visited;
    Distances.Add(StartLocationId, 0);

    while (Visited.Num() < DistrictLocations.Num())
    {
        FName Current = NAME_None;
        int64 BestDistance = TNumericLimits<int64>::Max();
        for (const TPair<FName, int64>& Pair : Distances)
        {
            if (!Visited.Contains(Pair.Key) && Pair.Value < BestDistance)
            {
                Current = Pair.Key;
                BestDistance = Pair.Value;
            }
        }
        if (Current.IsNone()) return false;
        if (Current == DestinationLocationId) break;
        Visited.Add(Current);

        for (const FFRADistrictRoad& Road : DistrictRoads)
        {
            FName Neighbor = NAME_None;
            if (Road.FromLocationId == Current) Neighbor = Road.ToLocationId;
            else if (!Road.bOneWay && Road.ToLocationId == Current) Neighbor = Road.FromLocationId;
            if (Neighbor.IsNone() || Visited.Contains(Neighbor)) continue;

            const int64 Candidate = BestDistance + Road.TravelCost;
            if (!Distances.Contains(Neighbor) || Candidate < Distances.FindRef(Neighbor))
            {
                Distances.Add(Neighbor, Candidate);
                PreviousLocations.Add(Neighbor, Current);
                PreviousRoads.Add(Neighbor, Road.Id);
            }
        }
    }

    if (!Distances.Contains(DestinationLocationId)) return false;
    TArray<FName> ReverseLocations;
    TArray<FName> ReverseRoads;
    FName Cursor = DestinationLocationId;
    ReverseLocations.Add(Cursor);
    while (Cursor != StartLocationId)
    {
        const FName* Previous = PreviousLocations.Find(Cursor);
        const FName* Road = PreviousRoads.Find(Cursor);
        if (!Previous || !Road) return false;
        ReverseRoads.Add(*Road);
        Cursor = *Previous;
        ReverseLocations.Add(Cursor);
    }
    Algo::Reverse(ReverseLocations);
    Algo::Reverse(ReverseRoads);
    OutRoute.LocationIds = MoveTemp(ReverseLocations);
    OutRoute.RoadIds = MoveTemp(ReverseRoads);
    OutRoute.TotalTravelCost = static_cast<int32>(Distances.FindRef(DestinationLocationId));
    return true;
}
