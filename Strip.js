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
        // a list of colors for each color represented in the strip
        let colors = [
            color(266, 7, 60),
            color(52, 15, 89),
            color(218, 45, 85),
            color(259, 13, 47),
            color(9, 69, 85),
            color(89, 100, 68)
        ]

        // the starting x- and y-position of the dots
        let startX = 50
        let startY = 50

        // half of the length of the edge of the square so I can calculate
        // margin properly
        let r = 30

        // the x-margin between each color representation and the next. There
        // will be no y-margin.
        let xMargin = r + 15

        // how rounded the square will be
        let rounding = 10

        // the keys of the strip dictionary
        let stripDictKeys = Object.keys(this.stripDict)

        // add a rectangle behind the strip dictionary key display to make it
        // look like it's part of the background
        stroke(237, 37, 20)
        fill(237, 37, 20)
        strokeWeight(20)
        // the y-position should end exactly where the color selectors
        // vertically end
        rect(0, 0, width, startY + r)

        noFill()
        noStroke()

        // set the stroke weight
        strokeWeight(4)

        // iterate through the dictionary using its length
        for (let i = 0; i < stripDictKeys.length; i++) {
            // draw a circle. x-coordinate should be startingX + (r + xMargin)*i
            // y-coordinate should be startingY
            // set the color. if the color isn't selected, make the circle
            // hollow.
            fill(colors[i])
            if (!this.colorSelected(stripDictKeys[i])) {
                fill(0, 0, 80, 20)
                noStroke()
                // write the letter in the middle of the rounded square about to
                // be drawn with no stroke or fill
                text(stripDictKeys[i].toUpperCase(),
                    startX + (r + xMargin) * i,
                    startY + textAscent()/2)
                stroke(0, 0, 80, 20)
            } else {
                noStroke()
                // do the same here. we need there to be no stroke and no fill
                text(stripDictKeys[i].toUpperCase(),
                    startX + (r + xMargin) * i,
                    startY + textAscent()/2)
                stroke(colors[i])
            }

            noFill()

            rectMode(CENTER)
            square(startX + (r + xMargin) * i, startY, r * 2, rounding)
        }
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
                selectedColors.push(color.toUpperCase())
            }
        }

        return selectedColors
    }

    getColorMV(color) {
        let selectedColor = this.stripDict[color]
        return selectedColor.getMV()
    }
}
