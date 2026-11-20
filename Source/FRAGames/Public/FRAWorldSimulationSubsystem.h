#pragma once
#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "FRAWorldTypes.h"
#include "FRAWorldSimulationSubsystem.generated.h"

/** Per-world deterministic simulation bridge. Persistence belongs to a versioned save object. */
UCLASS()
class FRAGAMES_API UFRAWorldSimulationSubsystem : public UWorldSubsystem
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintPure, Category="FRA|World")
    FFRAWorldClockState GetClockState() const { return ClockState; }

    UFUNCTION(BlueprintCallable, Category="FRA|World")
    bool ConfigureClock(const FDateTime& StartDateTime, int32 InMinutesPerRealSecond, bool bStartPaused);

    UFUNCTION(BlueprintCallable, Category="FRA|World")
    bool AdvanceSimulationSeconds(int32 ElapsedRealSeconds);

    UFUNCTION(BlueprintCallable, Category="FRA|World")
    void SetSimulationPaused(bool bPaused);

    UFUNCTION(BlueprintCallable, Category="FRA|World")
    bool SetDistrict(const TArray<FFRADistrictLocation>& Locations, const TArray<FFRADistrictRoad>& Roads);

    UFUNCTION(BlueprintPure, Category="FRA|World")
    bool FindRoute(FName StartLocationId, FName DestinationLocationId, FFRARouteResult& OutRoute) const;

private:
    UPROPERTY(VisibleAnywhere, Category="FRA|World")
    FFRAWorldClockState ClockState;
    UPROPERTY()
    TArray<FFRADistrictLocation> DistrictLocations;
    UPROPERTY()
    TArray<FFRADistrictRoad> DistrictRoads;
    bool HasLocation(FName LocationId) const;
};
