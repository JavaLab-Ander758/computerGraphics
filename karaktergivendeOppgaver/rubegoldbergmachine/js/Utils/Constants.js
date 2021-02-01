/**
 * Global object-literal containing collision-groups
 */
export const CollisionGroups = {
    Plane: 1,
    Sphere: 2,
    Box: 4,
    Tube:8
};

/**
 * Global object-literal containing collision-masks
 */
export const CollisionMasks = {
    Plane: CollisionGroups.Box
        | CollisionGroups.Sphere,

    Sphere: CollisionGroups.Plane
        | CollisionGroups.Sphere
        | CollisionGroups.Box
        | CollisionGroups.Tube,

    Box: CollisionGroups.Plane
        | CollisionGroups.Sphere
        | CollisionGroups.Box,

    Tube: CollisionGroups.Sphere,

}