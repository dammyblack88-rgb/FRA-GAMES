#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "FRAFirstDistrictBlockout.generated.h"

class UStaticMesh;
class UStaticMeshComponent;
class USceneComponent;

/** Editor-previewable low-cost greybox for the first fictional Lagos neighbourhood. */
UCLASS()
class FRAGAMES_API AFRAFirstDistrictBlockout : public AActor
{
    GENERATED_BODY()

public:
    AFRAFirstDistrictBlockout();

protected:
    virtual void OnConstruction(const FTransform& Transform) override;

private:
    UPROPERTY(VisibleAnywhere, Category="FRA|District")
    TObjectPtr<USceneComponent> SceneRoot;

    UPROPERTY(EditAnywhere, Category="FRA|District")
    TObjectPtr<UStaticMesh> BlockoutMesh;

    UPROPERTY(EditAnywhere, Category="FRA|District", meta=(ClampMin="1000.0"))
    float GridUnit = 5000.0f;

    UPROPERTY(EditAnywhere, Category="FRA|District", meta=(ClampMin="300.0"))
    float RoadWidth = 1000.0f;

    UPROPERTY(Transient)
    TArray<TObjectPtr<UStaticMeshComponent>> GeneratedComponents;

    FVector GridPoint(int32 X, int32 Y) const;
    void ClearGeneratedComponents();
    void AddBlock(const FName ComponentName, const FVector& Center, const FVector& Dimensions, const FRotator& Rotation);
    void BuildDistrict();
};
