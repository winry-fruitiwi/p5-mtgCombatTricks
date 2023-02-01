// represents a strip of color selectors. to be rendered later.
class Strip {
    constructor() {
        // the dictionary of colors for the strip, represented by ColorSelectors
        this.stripDict = {
            "c": new ColorSelector(),
            "w": new ColorSelector(),
            "u": new ColorSelector(),
            "b": new ColorSelector(),
            "r": new ColorSelector(),
            "g": new ColorSelector()
        }
    }

    // increments value of a color
    incrementColor(color) {
        let selectedColor = this.stripDict[color]
        selectedColor.incrementMV()
    }

    // decrements value of a color
    decrementColor(color) {
        let selectedColor = this.stripDict[color]
        selectedColor.decrementMV()
    }

    // renders the strip with SVGs, to be implemented much later.
    show() {

    }

    // returns the current mana value of the strip, or the sum of all color
    // selectors.
    getCMC() {
        let cmc = 0

        for (let c in this.stripDict) {
            let Color = this.stripDict[c]
            cmc += Color.getMV()
        }

        return cmc
    }

    // I'm considering instead setting the value of a color to 0 instead of
    // just decrementing it.
    deselectColor(color) {
        let selectedColor = this.stripDict[color]
        selectedColor.mv = 0
    }

    // checks if the given color is selected
    colorSelected(color) {
        let selectedColor = this.stripDict[color]
        return selectedColor.getMV() !== 0
    }

    // returns a list of all colors that have been selected
    colorsSelected() {
        // the list of selected colors
        let selectedColors = []

        for (let color in this.stripDict) {
            let selectedColor = this.stripDict[color]
            if (this.colorSelected(color)) {
                selectedColors.push(color)
            }
        }

        return selectedColors
    }

    getColorMV(color) {
        let selectedColor = this.stripDict[color]
        return selectedColor.getMV()
    }
}
