# NEXT WORLD Family and Generational Lineage

This engine-independent module records family/household links between distinct life records. It supports a player character's descendants across generations without assuming a particular narrative, culture, gender, or family structure.

## Capabilities
- A family tree rooted in an existing life ID.
- Parent links to up to two existing life records.
- Supported relationship labels: self, parent, child, sibling, partner, guardian and dependent.
- Descendant traversal in generation order.
- Immutable-style updates that return detached state.
- Validation against duplicate life IDs, missing parents and self-parenting.

## Integration
The save layer should persist the returned tree alongside life records. Create a tree when a player starts a family storyline, then add family members only after their life records exist. A future life-event system can connect births, adoption, partnership, separation, ageing and inheritance.

## Scope boundary
This is lineage data only. It does not simulate pregnancy, generate family members, decide legal guardianship, transfer property, or provide online/cloud persistence. Those systems need separate design, player consent and save migration rules.
