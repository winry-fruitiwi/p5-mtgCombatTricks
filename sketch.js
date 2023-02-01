/**
 *  @author 
 *  @date 2023.1.20
 *
 */

let font
let fixedWidthFont
let variableWidthFont
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */
let cardList = [] // a list of all cards in the set I'm querying from
// let cMana, wMana, uMana, bMana, rMana, gMana // color selectors
// let wMana
// let cmv // total mana value of current mana pool
let strip

function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
}


function setup() {
    let cnv = createCanvas(600, 300)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch
        z → query</pre>`)

    debugCorner = new CanvasDebugCorner(5)
    loadJSON("https://api.scryfall.com/cards/search?q=set:bro", gotData)

    // cMana = 0
    // wMana = new ColorSelector()
    // uMana = 0
    // bMana = 0
    // rMana = 0
    // gMana = 0
    // cmv = 0

    strip = new Strip()
}


function gotData(data) {
    for (let i = 0; i < Object.keys(data["data"]).length; i++) {

        let currentData = data["data"][i]
        cardList.push(currentData)
    }

    if (data["has_more"]) {
        loadJSON(data["next_page"], gotData)
    }
}


function draw() {
    background(234, 34, 24)

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()

    if (frameCount > 3000)
        noLoop()
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
    }

    if (key === '`') { /* toggle debug corner visibility */
        debugCorner.visible = !debugCorner.visible
        console.log(`debugCorner visibility set to ${debugCorner.visible}`)
    }

    // when user presses z, basically query the card list
    if (key === "z") {
        print("\n")
        for (let card of cardList) {
            /*
                Check if:
                type line is instant or
                oracle text includes Flash, but not lowercase flash
                    this is case-sensitive, so it should not register flashback
                and this has to be true, then the following has to be true:
                card's mana cost has "W" in it, does not include colorless
                CMV of mana pool is greater than or equal to card's cmc
                    Currently, CMV of current mana pool is just wMana
                card is colorless

                My current approach happens to handle Phyrexian mana because
                that's just {C/P}
            */
            if ((card['type_line'] === "Instant" ||
                card['oracle_text'].indexOf("Flash") !== -1) &&
                ((card['mana_cost'].indexOf("W") !== -1 ||
                card['colors'].length === 0) &&
                strip.getCMC() >= card['cmc'])
            ) {
                let cardText = ''
                cardText += card['name'] + " " + card['mana_cost']
                cardText += " " + card["cmc"]
                cardText += "\n" + card['type_line']
                cardText += "\n" + card['oracle_text']
                print(cardText)
            }

            // if (isCardColorless(card)) {
            //     let cardText = ''
            //     cardText += card['name'] + " " + card['mana_cost']
            //     cardText += " " + card["cmc"]
            //     cardText += "\n" + card['type_line']
            //     cardText += "\n" + card['oracle_text']
            //     print(cardText)
            // }
        }

        print("\n")
    }

    // when user presses one key in "cwubrg", increase corresponding selector
    /*
    if (key === "c") {
        print(key)
        cMana++
        console.log("cMana is now " + cMana)
    }


    if (key === "u") {
        print(key)
        uMana++
        console.log("uMana is now " + uMana)
    }

    if (key === "b") {
        print(key)
        bMana++
        console.log("bMana is now " + bMana)
    }

    if (key === "r") {
        print(key)
        rMana++
        console.log("rMana is now " + rMana)
    }

    if (key === "g") {
        print(key)
        gMana++
        console.log("gMana is now " + gMana)
    }

    // when user presses one key in "CWUBRG", decrease corresponding selector
    if (key === "C") {
        print(key)
        cMana--
        console.log("cMana is now " + cMana)
    }

    if (key === "U") {
        print(key)
        uMana--
        console.log("uMana is now " + uMana)
    }

    if (key === "B") {
        print(key)
        bMana--
        console.log("bMana is now " + bMana)
    }

    if (key === "R") {
        print(key)
        rMana--
        console.log("rMana is now " + rMana)
    }

    if (key === "G") {
        print(key)
        gMana--
        console.log("gMana is now " + gMana)
    }

    */

    const color = key.toLowerCase()
    if (color in strip.stripDict) {
        if (color === key) {
            strip.incrementColor(color)
            console.log(color + "Mana is now " + strip.getColorMV(color))
        }
        else {
            strip.decrementColor(color)
            console.log(color + "Mana is now " + strip.getColorMV(color))
        }
    }

    // update CMV
    // cmv = wMana.getMV()
}


// checks if a given card is colorless
// function isCardColorless(card) {
//     let mc = card['mana_cost']
//
//     // if a given card is colorless, it should only contain {s, }s, and numbers.
//     // this is a list of all acceptable numbers.
//     // TODO Does snow count as colorless?
//     let charsInColorlessMC = [
//         "{",
//         "}",
//         "1",
//         "2",
//         "3",
//         "4",
//         "5",
//         "6",
//         "7",
//         "8",
//         "9",
//         "0"
//     ]
//
//     for (let char of mc) {
//         if (charsInColorlessMC.indexOf(char) !== -1) {
//             return false
//         }
//     }
//
//     return true
// }


/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.visible = true
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    showBottom() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */
            rect(
                0,
                height,
                width,
                DEBUG_Y_OFFSET - LINE_HEIGHT * this.debugMsgList.length - TOP_PADDING
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            for (let index in this.debugMsgList) {
                const msg = this.debugMsgList[index]
                text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
            }
        }
    }

    showTop() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */

            /* offset from top of canvas */
            const DEBUG_Y_OFFSET = textAscent() + TOP_PADDING
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background, a console-like feel */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)

            rect( /* x, y, w, h */
                0,
                0,
                width,
                DEBUG_Y_OFFSET + LINE_HEIGHT*this.debugMsgList.length/*-TOP_PADDING*/
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            textAlign(LEFT)
            for (let i in this.debugMsgList) {
                const msg = this.debugMsgList[i]
                text(msg, LEFT_MARGIN, LINE_HEIGHT*i + DEBUG_Y_OFFSET)
            }
        }
    }
}
