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
    toggleColorOn(color) {
        let selectedColor = this.stripDict[color]
        selectedColor.toggleColor()
    }

    show() {
        // a list of colors for each color represented in the strip
        let colors = [
            [34, 6, 74], // c
            [62, 20, 94], // w
            [208, 20, 89], // u
            [26, 10, 67], // b
            [17, 54, 85], // r
            [100, 27, 70] // g
        ]

        // my old colors that I made myself
        // let colors = [
        //     [266, 7, 60], // c
        //     [52, 15, 89], // w
        //     [218, 45, 85], // u
        //     [259, 13, 47], // b
        //     [9, 69, 85], // r
        //     [89, 100, 68] // g
        // ]

        // a list of mana symbols for each color represented in Strip
        let manaSymbolImages = [
            c,
            w,
            u,
            b,
            r,
            g
        ]

        // half of the length of the edge of the square so I can calculate
        // margin properly
        let radius = 15

        // the x-margin between each color representation and the next. There
        // will be no color selector wrapping unless people use this on their
        // iPod and iPhones.
        let xMargin = radius + 10

        // the y-margin under the color selectors that I want to erase.
        let yMargin = 10

        // // how rounded the square will be (obsolete)
        // let rounding = 10

        // the starting x- and y-position of the dots
        let startX = radius + 1
        let startY = radius + 1

        // the keys of the strip dictionary
        let stripDictKeys = Object.keys(this.stripDict)

        // // add a rectangle behind the strip dictionary key display to make it
        // // look like it's part of the background (obsolete)
        // stroke(237, 37, 20)
        // fill(237, 37, 20)
        // strokeWeight(20)

        // the y-position should end exactly where the color selectors
        // vertically end
        erase()
        rect(0, 0, width, startY + radius + yMargin)
        noErase()

        noFill()
        noStroke()

        // set the stroke weight
        strokeWeight(2)

        // iterate through the dictionary using its length
        for (let i = 0; i < stripDictKeys.length; i++) {
            // draw a circle. x-coordinate should be startingX + (r + xMargin)*i
            // y-coordinate should be startingY
            // set the color. if the color isn't selected, make the circle
            // hollow and transparent instead.
            let manaImg = manaSymbolImages[i]

            manaImg.resize(radius*1.5, 0)

            if (!this.colorSelected(stripDictKeys[i])) {
                // tint transparent black
                tint(0, 0, 0, 20)

                // set a transparent black stroke
                stroke(0, 0, 0, 20)

                // set a transparent but still colored fill
                fill(colors[i][0], colors[i][1], colors[i][2], 20)
            } else {
                tint(0, 0, 0, 100)

                // set black stroke
                stroke(0, 0, 0)

                // set colored fill
                fill(colors[i][0], colors[i][1], colors[i][2])
            }

            // draw the circle
            circle(startX + (radius + xMargin) * i, startY, radius * 2)

            // draw the current mana symbol image in the center of the
            // current color selector
            image(manaImg,
                startX + (radius + xMargin) * i - manaImg.width/2,
                startY - manaImg.height/2)
        }

        // reset the tint and stroke
        noTint()
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
        return selectedColor.ifOn()
    }

    // returns a list of all colors that have been selected
    colorsSelected() {
        // the list of selected colors
        let selectedColors = []

        // for every color in the strip dict, push it to a list of selected
        // colors
        for (let color in this.stripDict) {
            if (this.colorSelected(color)) {
                selectedColors.push(color.toUpperCase())
            }
        }

        return selectedColors
    }

    getColorMV(color) {
        let selectedColor = this.stripDict[color]
        return selectedColor.ifOn()
    }

    // if the mouse clicked a selector, then toggle it
    checkIfMouseClickedSelector() {
        // half of the length of the edge of the square so I can calculate
        // margin properly
        let radius = 15

        // the x-margin between each color representation and the next. There
        // will be no color selector wrapping unless people use this on their
        // iPod and iPhones.
        let xMargin = radius + 10

        // the starting x- and y-position of the dots
        let startX = radius + 1
        let startY = radius + 1

        // the keys of the strip dictionary
        let stripDictKeys = Object.keys(this.stripDict)

        for (let i = 0; i < stripDictKeys.length; i++) {
            let circlePos = new p5.Vector(startX + (radius + xMargin) * i, startY)

            let distCircleToMouse = dist(circlePos.x, circlePos.y,
                mouseX, mouseY
            )

            if (distCircleToMouse <= radius && mouseIsPressed) {
                this.stripDict[stripDictKeys[i]].toggleColor()
            }
        }
    }
}
