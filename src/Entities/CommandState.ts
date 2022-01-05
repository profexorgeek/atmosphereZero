
// CommandState indicates the player intent for the ship:
// it's overall objective, which may be different than it's
// specific action at a given moment.

enum CommandState {

    // Idle ships will just sit in space and not move.
    // This state should only exist as an "unknown" before
    // the player has issued any command. Otherwise a ship
    // should always either be guarding or mining
    Idle = 0,

    // Mine state indicates the ship should focus on mining
    // and ignore nearby aggressors.
    // If attacked they may defend themselves and flee but
    // should return to mining when out of threat range
    Mine = 1,

    // Guard state indicates the ship should guard an area
    // it will periodically scan for enemies and aggressively
    // move to attack when enemies are discovered
    Guard = 2
}

export default CommandState;