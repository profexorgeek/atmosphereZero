// BehaviorState indicates the current behavior for a ship
// at a specific moment. This may differ from its broader
// intended action. For instance, a ship may intend to Mine
// but be defending itself at the current time.

enum BehaviorState {

    // The ship is just sitting in space
    Idle = 0,

    // The ship is flying towards a movement point
    Flying = 1,

    // The ship is aggressively attacking a target
    Attacking = 2,

    // // The ship is fleeing a target
    // Fleeing = 3,

    // // The ship is docking at a station
    // Docking = 4,

    // // The ship is unloading at a station
    // Unloading = 5
}

export default BehaviorState;