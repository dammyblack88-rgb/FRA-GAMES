import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Unreal project descriptor targets UE 5.8 and declares the FRA GAMES runtime module", () => {
  const project = JSON.parse(read("FRAGames.uproject"));
  assert.equal(project.EngineAssociation, "5.8");
  assert.deepEqual(project.Modules, [
    { Name: "FRAGames", Type: "Runtime", LoadingPhase: "Default" }
  ]);
});

test("Game and Editor targets both include the FRA GAMES module", () => {
  for (const path of ["Source/FRAGames.Target.cs", "Source/FRAGamesEditor.Target.cs"]) {
    assert.match(read(path), /ExtraModuleNames\.Add\("FRAGames"\)/);
  }
});

test("Native player and prototype GameMode source files are present and connected", () => {
  assert.ok(existsSync(new URL("../Source/FRAGames/Public/FRAPlayerCharacter.h", import.meta.url)));
  assert.ok(existsSync(new URL("../Source/FRAGames/Private/FRAPlayerCharacter.cpp", import.meta.url)));
  assert.match(read("Source/FRAGames/Private/FRAPrototypeGameMode.cpp"), /DefaultPawnClass\s*=\s*AFRAPlayerCharacter::StaticClass\(\)/);
});

test("basic movement, mouse look and jump input mappings are present", () => {
  const input = read("Config/DefaultInput.ini");
  for (const mapping of [
    'AxisName="MoveForward"',
    'AxisName="MoveRight"',
    'AxisName="Turn"',
    'AxisName="LookUp"',
    'ActionName="Jump"'
  ]) assert.ok(input.includes(mapping), `Missing input mapping: ${mapping}`);
});

test("third-party modules are not forced into the initial runtime build", () => {
  const build = read("Source/FRAGames/FRAGames.Build.cs");
  assert.match(build, /"Core"/);
  assert.match(build, /"Engine"/);
  assert.doesNotMatch(build, /CityForm|KinetiForge|AsyncTickPhysics/);
});


test("native world simulation subsystem exposes validated clock, district and route contracts", () => {
  assert.ok(existsSync(new URL("../Source/FRAGames/Public/FRAWorldTypes.h", import.meta.url)));
  assert.ok(existsSync(new URL("../Source/FRAGames/Public/FRAWorldSimulationSubsystem.h", import.meta.url)));
  assert.ok(existsSync(new URL("../Source/FRAGames/Private/FRAWorldSimulationSubsystem.cpp", import.meta.url)));
  const header = read("Source/FRAGames/Public/FRAWorldSimulationSubsystem.h");
  const implementation = read("Source/FRAGames/Private/FRAWorldSimulationSubsystem.cpp");
  for (const method of ["ConfigureClock", "AdvanceSimulationSeconds", "SetDistrict", "FindRoute"]) {
    assert.ok(header.includes(method), `Missing subsystem API: ${method}`);
  }
  assert.match(implementation, /Road\.bOneWay/);
  assert.match(implementation, /Algo::Reverse/);
  assert.ok(existsSync(new URL("../docs/UNREAL_WORLD_SIMULATION_BRIDGE.md", import.meta.url)));
});

test("native player interaction component, interface and E-key binding are connected", () => {
  for (const path of [
    "Source/FRAGames/Public/FRAInteractable.h",
    "Source/FRAGames/Public/FRAPlayerInteractionComponent.h",
    "Source/FRAGames/Private/FRAPlayerInteractionComponent.cpp"
  ]) assert.ok(existsSync(new URL("../" + path, import.meta.url)), `Missing interaction source: ${path}`);
  const playerHeader = read("Source/FRAGames/Public/FRAPlayerCharacter.h");
  const playerSource = read("Source/FRAGames/Private/FRAPlayerCharacter.cpp");
  const input = read("Config/DefaultInput.ini");
  assert.match(playerHeader, /UFRAPlayerInteractionComponent/);
  assert.match(playerSource, /BindAction\(TEXT\("Interact"\), IE_Pressed/);
  assert.match(playerSource, /InteractionComponent->TryInteract\(\)/);
  assert.match(input, /ActionName="Interact",Key=E/);
  const interaction = read("Source/FRAGames/Private/FRAPlayerInteractionComponent.cpp");
  assert.match(interaction, /LineTraceSingleByChannel/);
  assert.match(interaction, /TickInterval = 0\.1f/);
  assert.match(interaction, /Execute_Interact/);
});

test("native Unreal save object and slot subsystem preserve versioned player-world state", () => {
  for (const path of [
    "Source/FRAGames/Public/FRAPlayerSaveGame.h",
    "Source/FRAGames/Public/FRAPlayerSaveSubsystem.h",
    "Source/FRAGames/Private/FRAPlayerSaveSubsystem.cpp"
  ]) assert.ok(existsSync(new URL("../" + path, import.meta.url)), `Missing save source: ${path}`);
  const saveType = read("Source/FRAGames/Public/FRAPlayerSaveGame.h");
  const subsystem = read("Source/FRAGames/Private/FRAPlayerSaveSubsystem.cpp");
  for (const field of ["Lives", "ActiveLifeId", "WalletNaira", "Experience", "Inventory", "EconomyTransactions", "Businesses", "NpcStates", "MissionRuns", "ConsumedInteractionTargetIds"]) {
    assert.ok(saveType.includes(field), `Missing saved field: ${field}`);
  }
  assert.match(subsystem, /SaveGameToSlot/);
  assert.match(subsystem, /LoadGameFromSlot/);
  assert.match(subsystem, /ValidateSaveData/);
  assert.match(subsystem, /SchemaVersion != 1/);
});

test("reusable Unreal interactable actor exposes Blueprint interaction behavior", () => {
  assert.ok(existsSync(new URL("../Source/FRAGames/Public/FRAWorldInteractableActor.h", import.meta.url)));
  assert.ok(existsSync(new URL("../Source/FRAGames/Private/FRAWorldInteractableActor.cpp", import.meta.url)));
  const header = read("Source/FRAGames/Public/FRAWorldInteractableActor.h");
  const source = read("Source/FRAGames/Private/FRAWorldInteractableActor.cpp");
  assert.match(header, /Blueprintable/);
  assert.match(header, /ReceiveInteraction/);
  assert.match(source, /GetInteractionPrompt_Implementation/);
  assert.match(source, /CanInteract_Implementation/);
  assert.match(source, /ReceiveInteraction\(InteractingActor\)/);
});

test("first Lagos district has a procedural Unreal greybox builder using the engine cube mesh", () => {
  assert.ok(existsSync(new URL("../Source/FRAGames/Public/FRAFirstDistrictBlockout.h", import.meta.url)));
  assert.ok(existsSync(new URL("../Source/FRAGames/Private/FRAFirstDistrictBlockout.cpp", import.meta.url)));
  const source = read("Source/FRAGames/Private/FRAFirstDistrictBlockout.cpp");
  assert.match(source, /BasicShapes\/Cube\.Cube/);
  assert.match(source, /OnConstruction/);
  assert.match(source, /DistrictGround/);
  assert.match(source, /NeighbourhoodMarket/);
  assert.match(source, /WorkshopGarage/);
  assert.match(source, /RoadWidth/);
});
