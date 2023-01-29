/*
  A class that keeps track of the mana value of a certain color.
  This class does not care about its color; that is handled in Sketch/Strip.js.
  API:
    Constructor: initialize mana value. TODO consider initializing mana color?
    incrementMV: increments the mana value.
    decrementMV: decrements the mana value. TODO deselect → mana value = 0?
    getMV: returns the mana value. TODO return color as well?
*/

class ColorSelector {
    constructor() {
        // initialize the mana value
        this.mv = 0
    }

    // increments mana value
    incrementMV() {
        // restrain mana value to 8
        this.mv++

        if (this.mv > 8) {
            this.mv = 8
        }
    }

    // decrements mana value. TODO maybe make this function make mana value 0
    decrementMV() {
        // restrain mana value to 0
        this.mv--

        if (this.mv < 0) {
            this.mv = 0
        }
    }

    // returns the mana value. TODO maybe implement color, return color here?
    getMV() {
        return this.mv
    }
}
