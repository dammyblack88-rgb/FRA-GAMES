#include "FRAPlayerSaveSubsystem.h"

#include "FRAPlayerSaveGame.h"
#include "Kismet/GameplayStatics.h"

bool UFRAPlayerSaveSubsystem::ValidateSaveData(const UFRAPlayerSaveGame* SaveData) const
{
    if (!IsValid(SaveData) || SaveData->SchemaVersion != 1 || SaveData->PlayerId.IsEmpty()
        || SaveData->Lives.IsEmpty() || !SaveData->ActiveLifeId.IsValid() || SaveData->DistrictId.IsNone()
        || SaveData->WalletNaira < 0 || SaveData->Experience < 0
        || SaveData->WorldClock.MinutesPerRealSecond < 1 || SaveData->WorldClock.MinutesPerRealSecond > 1440
        || SaveData->WorldClock.CurrentDateTime.GetYear() < 1)
    {
        return false;
    }

    TSet<FGuid> LifeIds;
    bool bFoundActiveLife = false;
    for (const FFRASavedLifeRecord& Life : SaveData->Lives)
    {
        if (!Life.LifeId.IsValid() || Life.DisplayName.IsEmpty() || Life.AgeYears < 0 || LifeIds.Contains(Life.LifeId)) return false;
        LifeIds.Add(Life.LifeId);
        bFoundActiveLife |= Life.LifeId == SaveData->ActiveLifeId;
    }
    if (!bFoundActiveLife) return false;

    TSet<FName> ItemIds;
    for (const FFRASavedItemStack& Item : SaveData->Inventory)
    {
        if (Item.ItemId.IsNone() || Item.Quantity < 1 || ItemIds.Contains(Item.ItemId)) return false;
        ItemIds.Add(Item.ItemId);
    }

    TSet<FName> BusinessIds;
    for (const FFRASavedBusinessRecord& Business : SaveData->Businesses)
    {
        if (Business.BusinessId.IsNone() || BusinessIds.Contains(Business.BusinessId)
            || !LifeIds.Contains(Business.OwnerLifeId) || Business.CashNaira < 0) return false;
        BusinessIds.Add(Business.BusinessId);
    }

    TSet<FName> NpcIds;
    for (const FFRASavedNpcState& Npc : SaveData->NpcStates)
    {
        if (Npc.NpcId.IsNone() || Npc.LocationId.IsNone() || NpcIds.Contains(Npc.NpcId)) return false;
        NpcIds.Add(Npc.NpcId);
    }

    TSet<FString> MissionRunIds;
    for (const FFRASavedMissionRun& Mission : SaveData->MissionRuns)
    {
        if (Mission.MissionId.IsNone() || Mission.RunId.IsEmpty() || MissionRunIds.Contains(Mission.RunId)
            || Mission.Objectives.IsEmpty() || (Mission.Status != FName(TEXT("active")) && Mission.Status != FName(TEXT("completed")))
            || (Mission.Status == FName(TEXT("active")) && (Mission.bHasCompletedAt || Mission.bRewardClaimed))
            || (Mission.Status == FName(TEXT("completed")) && !Mission.bHasCompletedAt)) return false;
        MissionRunIds.Add(Mission.RunId);
        TSet<FString> MissionEventIds;
        for (const FString& EventId : Mission.EventIds)
        {
            if (EventId.IsEmpty() || MissionEventIds.Contains(EventId)) return false;
            MissionEventIds.Add(EventId);
        }
        TSet<FName> ObjectiveIds;
        bool bAllObjectivesComplete = true;
        for (const FFRASavedMissionObjective& Objective : Mission.Objectives)
        {
            if (Objective.ObjectiveId.IsNone() || Objective.ObjectiveType.IsNone() || Objective.Target < 1
                || Objective.Progress < 0 || Objective.Progress > Objective.Target
                || Objective.bCompleted != (Objective.Progress >= Objective.Target)
                || ObjectiveIds.Contains(Objective.ObjectiveId)) return false;
            ObjectiveIds.Add(Objective.ObjectiveId);
            bAllObjectivesComplete &= Objective.bCompleted;
        }
        if ((Mission.Status == TEXT("completed")) != bAllObjectivesComplete) return false;
    }

    TSet<FString> TransactionIds;
    for (const FFRASavedEconomyTransaction& Transaction : SaveData->EconomyTransactions)
    {
        if (Transaction.TransactionId.IsEmpty() || Transaction.TransactionType.IsNone()
            || Transaction.AmountNaira < 0 || Transaction.Experience < 0 || TransactionIds.Contains(Transaction.TransactionId)) return false;
        TransactionIds.Add(Transaction.TransactionId);
    }

    TSet<FName> ConsumedIds;
    for (const FName TargetId : SaveData->ConsumedInteractionTargetIds)
    {
        if (TargetId.IsNone() || ConsumedIds.Contains(TargetId)) return false;
        ConsumedIds.Add(TargetId);
    }
    TSet<FString> EventIds;
    for (const FString& EventId : SaveData->InteractionEventIds)
    {
        if (EventId.IsEmpty() || EventIds.Contains(EventId)) return false;
        EventIds.Add(EventId);
    }
    return true;
}

bool UFRAPlayerSaveSubsystem::SaveToSlot(UFRAPlayerSaveGame* SaveData, const FString& SlotName, int32 UserIndex) const
{
    if (SlotName.IsEmpty() || UserIndex < 0 || !ValidateSaveData(SaveData)) return false;
    SaveData->SavedAt = FDateTime::UtcNow();
    return UGameplayStatics::SaveGameToSlot(SaveData, SlotName, UserIndex);
}

UFRAPlayerSaveGame* UFRAPlayerSaveSubsystem::LoadFromSlot(const FString& SlotName, int32 UserIndex, bool& bSuccess) const
{
    bSuccess = false;
    if (SlotName.IsEmpty() || UserIndex < 0 || !UGameplayStatics::DoesSaveGameExist(SlotName, UserIndex)) return nullptr;
    UFRAPlayerSaveGame* LoadedSave = Cast<UFRAPlayerSaveGame>(UGameplayStatics::LoadGameFromSlot(SlotName, UserIndex));
    if (!ValidateSaveData(LoadedSave)) return nullptr;
    bSuccess = true;
    return LoadedSave;
}
