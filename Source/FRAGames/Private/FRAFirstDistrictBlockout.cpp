#include "FRAFirstDistrictBlockout.h"

#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "UObject/ConstructorHelpers.h"

AFRAFirstDistrictBlockout::AFRAFirstDistrictBlockout()
{
    PrimaryActorTick.bCanEverTick = false;
    SceneRoot = CreateDefaultSubobject<USceneComponent>(TEXT("SceneRoot"));
    SetRootComponent(SceneRoot);

    static ConstructorHelpers::FObjectFinder<UStaticMesh> DefaultCube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    if (DefaultCube.Succeeded()) BlockoutMesh = DefaultCube.Object;
}

void AFRAFirstDistrictBlockout::OnConstruction(const FTransform& Transform)
{
    Super::OnConstruction(Transform);
    ClearGeneratedComponents();
    BuildDistrict();
}

FVector AFRAFirstDistrictBlockout::GridPoint(int32 X, int32 Y) const
{
    return FVector(static_cast<float>(X) * GridUnit, static_cast<float>(Y) * GridUnit, 0.0f);
}

void AFRAFirstDistrictBlockout::ClearGeneratedComponents()
{
    for (UStaticMeshComponent* Component : GeneratedComponents)
    {
        if (IsValid(Component))
        {
            RemoveInstanceComponent(Component);
            Component->DestroyComponent();
        }
    }
    GeneratedComponents.Reset();
}

void AFRAFirstDistrictBlockout::AddBlock(const FName ComponentName, const FVector& Center, const FVector& Dimensions, const FRotator& Rotation)
{
    if (!BlockoutMesh || Dimensions.X <= 0.0f || Dimensions.Y <= 0.0f || Dimensions.Z <= 0.0f) return;

    const FName UniqueName = MakeUniqueObjectName(this, UStaticMeshComponent::StaticClass(), ComponentName);
    UStaticMeshComponent* Component = NewObject<UStaticMeshComponent>(this, UniqueName, RF_Transactional);
    if (!Component) return;

    Component->CreationMethod = EComponentCreationMethod::Instance;
    AddInstanceComponent(Component);
    Component->SetupAttachment(SceneRoot);
    Component->SetStaticMesh(BlockoutMesh);
    Component->SetRelativeLocation(Center);
    Component->SetRelativeRotation(Rotation);
    Component->SetRelativeScale3D(Dimensions / 100.0f);
    Component->SetCollisionProfileName(TEXT("BlockAll"));
    Component->RegisterComponent();
    GeneratedComponents.Add(Component);
}

void AFRAFirstDistrictBlockout::BuildDistrict()
{
    if (!BlockoutMesh || GridUnit < 1000.0f || RoadWidth < 300.0f) return;

    // A 300 m square ground plane; the logical seed uses 50 m grid intervals.
    AddBlock(TEXT("DistrictGround"), GridPoint(3, 3) + FVector(0.0f, 0.0f, -50.0f),
        FVector(GridUnit * 6.0f, GridUnit * 6.0f, 100.0f), FRotator::ZeroRotator);

    // Road corridors follow the authored first-district graph.
    const TArray<TPair<FIntPoint, FIntPoint>> Roads = {
        { FIntPoint(1, 1), FIntPoint(3, 1) },
        { FIntPoint(3, 1), FIntPoint(4, 1) },
        { FIntPoint(3, 1), FIntPoint(3, 3) },
        { FIntPoint(3, 3), FIntPoint(4, 3) },
        { FIntPoint(1, 1), FIntPoint(1, 3) },
        { FIntPoint(1, 3), FIntPoint(1, 4) },
        { FIntPoint(3, 3), FIntPoint(5, 4) },
        { FIntPoint(1, 4), FIntPoint(3, 1) }
    };
    for (int32 Index = 0; Index < Roads.Num(); ++Index)
    {
        const FVector Start = GridPoint(Roads[Index].Key.X, Roads[Index].Key.Y);
        const FVector End = GridPoint(Roads[Index].Value.X, Roads[Index].Value.Y);
        const FVector Delta = End - Start;
        const float Length = Delta.Size2D();
        const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(Delta.Y, Delta.X));
        AddBlock(FName(*FString::Printf(TEXT("Road_%02d"), Index + 1)),
            (Start + End) * 0.5f + FVector(0.0f, 0.0f, 12.0f),
            FVector(Length, RoadWidth, 24.0f), FRotator(0.0f, Yaw, 0.0f));
    }

    // Simple blockout masses sit beside the road centre lines; replace with authored art later.
    AddBlock(TEXT("HomeCompound"), GridPoint(1, 1) + FVector(1200, 1200, 400), FVector(2600, 2200, 800), FRotator::ZeroRotator);
    AddBlock(TEXT("BusStopCanopy"), GridPoint(4, 1) + FVector(900, 900, 160), FVector(1400, 700, 320), FRotator::ZeroRotator);
    AddBlock(TEXT("NeighbourhoodMarket"), GridPoint(3, 3) + FVector(1200, 1200, 350), FVector(3000, 2200, 700), FRotator::ZeroRotator);
    AddBlock(TEXT("AkaraStand"), GridPoint(4, 3) + FVector(1100, 1000, 180), FVector(1000, 800, 360), FRotator::ZeroRotator);
    AddBlock(TEXT("CommunityClinic"), GridPoint(1, 4) + FVector(1200, 1100, 380), FVector(2400, 1900, 760), FRotator::ZeroRotator);
    AddBlock(TEXT("SchoolFrontage"), GridPoint(1, 3) + FVector(1200, 1200, 360), FVector(2600, 2000, 720), FRotator::ZeroRotator);
    AddBlock(TEXT("WorkshopGarage"), GridPoint(5, 4) + FVector(1200, 1100, 330), FVector(2600, 1800, 660), FRotator::ZeroRotator);
}
