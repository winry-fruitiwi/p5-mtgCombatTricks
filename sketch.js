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
const BRO_COLLECTOR_ID_CAP = 287 // constant for when the jumpstart cards start

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

    strip = new Strip()
}


// callback function for loadJSON when loading a page of the API for a Magic set
function gotData(data) {
    // loop through all the keys in data
    for (let i = 0; i < Object.keys(data["data"]).length; i++) {
        let currentCard = data["data"][i]

        // there are often 5 jumpstart cards in every set (Zz was tricked by
        // one) so I hardcoded the maximum ID of cards in boosters. If the
        // current card's collector number is over the max ID, continue.
        if (currentCard['collector_number'] > BRO_COLLECTOR_ID_CAP) {
            continue
        }

        // append the current card to the card list
        cardList.push(currentCard)
    }

    // Scryfall only allows 175 cards or so per query, so sometimes they will
    // use the has_more attribute to signal that there is another page. We
    // need to query that if has_more is true.
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

        let cmcBuckets = {}
        for (let card of cardList) {
            /*
               Check if:
               type line is instant or
               oracle text includes Flash, but not lowercase flash
                   this is case-sensitive, so it should not register flashback
               and this has to be true, then the following has to be true:
               card's mana cost has any selected mana symbol inside
               CMV of mana pool is greater than or equal to card's cmc
                   Currently, CMV of current mana pool is just wMana
               card is colorless

               My current approach happens to handle Phyrexian mana because
               that's just {C/P}

               if ((card['type_line'] === "Instant" ||
                   card['oracle_text'].indexOf("Flash") !== -1) &&
                   ((strip.colorsSelected().indexOf(...card['colors']) !== -1 ||
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

            */

            // a dictionary of cards sorted into buckets of mana value. This
            // sounds a lot like the sorting algorithm that sorts values
            // with buckets, which is unique in that it only has an O(N)
            // runtime.

            /*
                Check if the card is an instant or has titlecase Flash and is
                in the current mana pool's colors. Colorless cards are included.
            */
            if ((card['type_line'] === "Instant" ||
                card['keywords'].indexOf("Flash") !== -1) &&
                (strip.colorsSelected().indexOf(...card['colors']) !== -1 ||
                card['colors'].length === 0)
            ) {
                // the text of the card I want to print. Will become obsolete
                // when photos are used instead.
                let cardText = ''
                // add the name, mana cost, and CMC to the card text.
                cardText += card['name'] + " " + card['mana_cost']
                cardText += " " + card["cmc"]

                // add the type line (usually Instant) and oracle text.
                cardText += "\n" + card['type_line']
                cardText += "\n" + card['oracle_text']

                // initialize or get a CMC bucket.
                let targetBucket = cmcBuckets[str(card['cmc'])] ?? []
                targetBucket.push(cardText)
                cmcBuckets[str(card['cmc'])] = targetBucket
            }
        }

        // print all the cards in buckets
        print(cmcBuckets)

        print("\n")
    }

    // the color that the key is. Since JavaScript dictionary access is
    // case-sensitive, we have to convert this to lowercase first. It also
    // makes future operations easier.
    const color = key.toLowerCase()

    // is the lowercase key a color in the strip dict?
    if (color in strip.stripDict) {
        // if the key itself was also lowercase, then we increment the color.
        // Note: I helped Zz implement this function when he was writing his
        // mtgCombatTricks, which is why I remembered the algorithm so fast.
        if (color === key) {
            strip.incrementColor(color)
            console.log(color + "Mana is now " + strip.getColorMV(color))
        }

        // otherwise, decrement the color because the key is uppercase.
        else {
            strip.decrementColor(color)
            console.log(color + "Mana is now " + strip.getColorMV(color))
        }
    }
}


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
