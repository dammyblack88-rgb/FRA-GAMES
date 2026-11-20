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
