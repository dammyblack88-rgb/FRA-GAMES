#pragma once
#include "CoreMinimal.h"
#include "FRAWorldTypes.generated.h"

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRAWorldClockState
{
    GENERATED_BODY()
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    FDateTime CurrentDateTime = FDateTime(2026, 1, 1, 8, 0, 0);
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World", meta=(ClampMin="1"))
    int32 MinutesPerRealSecond = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    bool bPaused = false;
};

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRADistrictLocation
{
    GENERATED_BODY()
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    FName Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    FText DisplayName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    FName LocationType;
};

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRADistrictRoad
{
    GENERATED_BODY()
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    FName Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    FName FromLocationId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    FName ToLocationId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World", meta=(ClampMin="1"))
    int32 TravelCost = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|World")
    bool bOneWay = false;
};

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRARouteResult
{
    GENERATED_BODY()
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="FRA|World")
    TArray<FName> LocationIds;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="FRA|World")
    TArray<FName> RoadIds;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="FRA|World")
    int32 TotalTravelCost = 0;
};
