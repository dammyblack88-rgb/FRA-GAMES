#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "FRAPlayerSaveSubsystem.generated.h"

class UFRAPlayerSaveGame;

/** Local versioned save-slot access. Server-authoritative multiplayer saves are separate. */
UCLASS()
class FRAGAMES_API UFRAPlayerSaveSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category="FRA|Save")
    bool SaveToSlot(UFRAPlayerSaveGame* SaveData, const FString& SlotName, int32 UserIndex = 0) const;

    UFUNCTION(BlueprintCallable, Category="FRA|Save")
    UFRAPlayerSaveGame* LoadFromSlot(const FString& SlotName, int32 UserIndex, bool& bSuccess) const;

    UFUNCTION(BlueprintPure, Category="FRA|Save")
    bool ValidateSaveData(const UFRAPlayerSaveGame* SaveData) const;
};
