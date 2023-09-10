/*
  A class that keeps track of the mana value of a certain color.
  This class does not care about its color; that is handled in Sketch/Strip.js.
  API:
    Constructor: initialize mana value. TODO consider initializing mana color?
    toggleColorOn: increments the mana value.
    decrementMV: decrements the mana value. TODO deselect → mana value = 0?
    getMV: returns the mana value. TODO return color as well?
*/

class ColorSelector {
    constructor() {
        // initialize the mana value
        this.on = false
    }

    // increments mana value
    toggleColor() {
        this.on = !this.on
    }

    // returns the mana value.
    ifOn() {
        return this.on
    }
}
