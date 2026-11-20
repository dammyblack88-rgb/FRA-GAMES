#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "FRAWorldTypes.h"
#include "FRAPlayerSaveGame.generated.h"

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRASavedLifeRecord
{
    GENERATED_BODY()
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FGuid LifeId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FString DisplayName;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FString Country;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FString Region;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FString City;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") int32 AgeYears = 0;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName AgeStage = TEXT("baby");
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FString> LifeEventIds;
};

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRASavedItemStack
{
    GENERATED_BODY()
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName ItemId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save", meta=(ClampMin="1")) int32 Quantity = 1;
};

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRASavedBusinessRecord
{
    GENERATED_BODY()
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName BusinessId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FGuid OwnerLifeId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") int64 CashNaira = 0;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FFRASavedItemStack> Stock;
};

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRASavedNpcState
{
    GENERATED_BODY()
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName NpcId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName LocationId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName Activity;
};

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRASavedMissionObjective
{
    GENERATED_BODY()
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName ObjectiveId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName ObjectiveType;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save", meta=(ClampMin="1")) int32 Target = 1;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save", meta=(ClampMin="0")) int32 Progress = 0;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") bool bCompleted = false;
};

USTRUCT(BlueprintType)
struct FRAGAMES_API FFRASavedMissionRun
{
    GENERATED_BODY()
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName MissionId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FString RunId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName Status = TEXT("active");
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FDateTime StartedAt;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FDateTime CompletedAt;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") bool bHasCompletedAt = false;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") bool bRewardClaimed = false;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FFRASavedMissionObjective> Objectives;
};

/** Versioned local player snapshot. Online authoritative persistence is a later layer. */
UCLASS(BlueprintType)
class FRAGAMES_API UFRAPlayerSaveGame : public USaveGame
{
    GENERATED_BODY()

public:
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") int32 SchemaVersion = 1;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FString PlayerId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FDateTime SavedAt;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FFRASavedLifeRecord> Lives;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FGuid ActiveLifeId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FName DistrictId;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") FFRAWorldClockState WorldClock;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") int64 WalletNaira = 0;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") int64 Experience = 0;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FFRASavedItemStack> Inventory;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FFRASavedBusinessRecord> Businesses;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FFRASavedNpcState> NpcStates;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FFRASavedMissionRun> MissionRuns;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FName> ConsumedInteractionTargetIds;
    UPROPERTY(SaveGame, EditAnywhere, BlueprintReadWrite, Category="FRA|Save") TArray<FString> InteractionEventIds;
};
