/**
 *  @author Winry
 *  @date 2023.01.20
 *
 */

let setCode
let mainSetCode = "fin"
let bonusSheetCode
let additionalCodes

let inputBox
let saveButton

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
let cmcBuckets = {}
// convokeCards: same as cmcBuckets, but for convoke cards.
let c, w, u, b, r, g, p // images for CWUBRG and Phyrexian mana symbols
let dc // drawing context
let state = 0 /* integer with values saying what to do when querying for cards.
 States in function this variable is used in. */
let myStyles

// constants
const NEO_COLLECTOR_ID_CAP = 302 // constant for when NEO jumpstart cards start
const ONE_COLLECTOR_ID_CAP = 403 // constant for when ONE jumpstart cards start
const BRO_COLLECTOR_ID_CAP = 287 // constant for when BRO jumpstart cards start
const MOM_COLLECTOR_ID_CAP = 291
const LTR_COLLECTOR_ID_CAP = 281
const WOE_COLLECTOR_ID_CAP = 261
const LCI_COLLECTOR_ID_CAP = 286
const MKM_COLLECTOR_ID_CAP = 271
const MH3_COLLECTOR_ID_CAP = 319
const BLB_COLLECTOR_ID_CAP = 281
const DSK_COLLECTOR_ID_CAP = 286
const FDN_COLLECTOR_ID_CAP = 281
const DFT_COLLECTOR_ID_CAP = 291
const TDM_COLLECTOR_ID_CAP = 286
const FIN_COLLECTOR_ID_CAP = 309

const CARD_WIDTH = 240 // ideal width of each card
const CARD_HEIGHT = 340 // hardcoded height of each card
const SIDE_WIDTH = 80 // the width of the whitish sidebar
const CARD_START_DISPLAY_X = 20 + SIDE_WIDTH // the x-pos of the first card
const CARD_START_DISPLAY_Y = 55 // the y-pos of the first card
const CARD_PADDING_X = 20 // x-padding of each card
const CARD_PADDING_Y = 20 // y-padding of each card
const X_DIST_TO_NEXT_CARD = CARD_WIDTH + CARD_PADDING_X
const Y_DIST_TO_NEXT_CARD = CARD_HEIGHT + CARD_PADDING_Y
const LINE_MARGIN = 20 // margin between lines
const Y_DIST_TO_NEXT_CARD_ROW = CARD_HEIGHT + CARD_PADDING_Y * 2 + LINE_MARGIN
// the y-margin for the text describing the current state
const STATE_TEXT_MARGIN = 10
// a dictionary of names for the values that state can take on
const STATE_VALUES = {0: "all tricks and non-tricks", 1: "only tricks", 2:"only non-tricks"}
// all sets that this program supports
const COMPATIBLE_SETS = ["dft", "dsk", "fdn", "tdm", "fin"]

// constant list of backgrounds available, changes every format or when I find
// a new cycle of bomb rares that I like the art for
const ALL_BACKGROUNDS = {
    "fin": [
        // "fin/lalacasterhero.png",
        "fin/whiteauracite.png",
        "fin/drglance.png",
        "fin/sgenouliths.png",
        "fin/deliverymoogle.png",
    ],
    "tdm": [
        "tdm/fangkeepersfamiliar.png",
        "tdm/runescalestormbrood.png",
        "tdm/dragonstormglobe.png",
        "tdm/callthespiritdragons.png",
    ],
    "dft": [
        "dft/hulldrifter.png",
        "dft/monument.png",
        "dft/cursecloth.png",
        "dft/aetherjacket.png",
    ],
    "fdn": [
        "fdn/helpfulhunter.png",
        "fdn/highfaetrickster.png",
        "fdn/lunarinsight.png",
        "fdn/ninelivesfamiliar.png",
    ],
    "dsk": [
        "dsk/glimmer.png",
        "dsk/curiosity.png",
        "dsk/gremlin.png",
        "dsk/watchdog.png",
        "dsk/beartrap.png",
    ],
    "blb": [
        "blb/fish.png",
        "blb/manifoldmouse.png",
        "blb/stockingpantry.png",
        "blb/whiskerquillscribe.png",
        "blb/embersfestival.png",
        "blb/feather.png",
        "blb/wishingwell.png",
        "blb/grotto.png",
        "blb/stargaze.png"
    ],
    "mh3": [
        "mh3/axe.png",
        "mh3/bauble.png",
        "mh3/condor.png",
        "mh3/falls.png",
        "mh3/powerbalance.png"
    ],
    "otj": [
        "otj/luxurious_locomotive.png",
        "otj/vault_key.png",
        "otj/brigled_bidhorn.png",
        "otj/wanted_griffin.png"
    ],
    "mkm": [
        "mkm/candlestick.jpg",
        "mkm/knife.jpg",
        "mkm/pipe.jpg",
        "mkm/rope.jpg",
        "mkm/wrench.jpg"
    ],
    "lci": [
        "lci/cavern.png",
        "lci/captivating.png",
        "lci/sunken.png",
        "lci/belligerent.png",
        "lci/schooner.png",
        "lci/galleon.png"
    ],
    "ltr": [
        "ltr/palantir.png",
        "ltr/sting.png",
        "ltr/thering.png"
    ],
    "mom": [
        "mom/angelicintervention.png",
        "mom/archangelelspeth.png",
        "mom/eleshnorn.png",
        "mom/radiantheliod.png",
        "mom/theargentetchings.png"
    ],
    "one": [
        "one/blacktwilight.png",
        "one/bluetwilight.png",
        "one/redtwilight.png",
        "one/whitetwilight.png"
    ],
    "woe": [
        "woe/archon.png",
        "woe/knight_of_doves.png",
        "woe/moonshakers.png",
        "woe/pie_wielder.png",
        "woe/porridge.png"
    ],
    "neo": [

    ]
}

function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
}

// helper function that constructs the set code from multiple global variables,
// including cards from The List, SPG, and bonus sheets
function defineSetCode() {
    // retrieve the locally stored set code from storage
    let locallyStoredCode = localStorage.getItem("setCode")
    if (!locallyStoredCode)
        locallyStoredCode = "dft"

    mainSetCode = locallyStoredCode

    // this code structure makes it easier to switch sets quickly
    if (mainSetCode === "dsk") {
        bonusSheetCode = "dsk"
        additionalCodes = "e:spg+cn≥64+cn≤74"
    } else if (mainSetCode === "fdn") {
        bonusSheetCode = "fdn"
        additionalCodes = "e:spg+cn≥74+cn≤83"
    } else if (mainSetCode === "dft") {
        // there are only 10 SPG cards but there are gold foils for each
        additionalCodes = "e:spg+cn≥84+cn≤103"
        bonusSheetCode = "dft"
    } else if (mainSetCode === "tdm") {
        // there are only 10 SPG cards but there are gold foils for each
        additionalCodes = "e:spg+cn≥104+cn≤113"
        bonusSheetCode = "tdm"
    } else if (mainSetCode === "fin") {
        // the final fantasy set does not have any additional codes
        additionalCodes = "e:fca"
        bonusSheetCode = "fin"
    }

    setCode = "https://api.scryfall.com/cards/search?q="
    setCode +=`(e:${mainSetCode})+or+(e:${bonusSheetCode})+or+(${additionalCodes})`
}


function setup() {
    let locallyStoredCode = localStorage.getItem("setCode")
    if (!locallyStoredCode) {
        locallyStoredCode = "dft"
        localStorage.setItem("setCode", locallyStoredCode)
    }

    let cnv = createCanvas(1200, 600)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>numpad 1 → freeze sketch
use dropdown menu to change set code, then reload
c, w, u, b, r, g → change colors of tricks selected 
t → change state (WARNING: outdated, untested feature)
</pre>`)

    defineSetCode()

    debugCorner = new CanvasDebugCorner(5)
    loadJSON(`${setCode}`, gotData)

    strip = new Strip()

    c = loadImage("svg/c.svg")
    w = loadImage("svg/w.svg")
    u = loadImage("svg/u.svg")
    b = loadImage("svg/b.svg")
    r = loadImage("svg/r.svg")
    g = loadImage("svg/g.svg")

    // not sure if we are going to use Phyrexian mana.
    p = loadImage("svg/p.svg")

    // Defining all our CSS styles.
    /*
      Background color is the default color for if the background image
      isn't loaded for some reason. I don't know what "gainsboro" means! My
      best guess is that it colors the text of the "what this program does"
      part of the webpage. The background image is a random image from the
      hard-coded BACKGROUNDS constant. background-repeat: no-repeat;
      prevents the image from repeating if it's too small. The rest of the
      styles cover the background staying where it is, its top edge always being
      visible, and the background image covering the entire background.
    */
    let setBackgrounds = ALL_BACKGROUNDS[mainSetCode]
    let bg = `backgrounds/${random(setBackgrounds)}`

    if (mainSetCode === "dsk") {
        myStyles = `
    background-color: rgb(32, 33, 51);
    color: gainsboro;
    background-image: url(` + bg + `);
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center;
    background-size: cover;
    `
    } else {
        myStyles = `
    background-color: rgb(32, 33, 51);
    color: gainsboro;
    background-image: url(` + bg + `);
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: top;
    background-size: cover;
    `
    }

    // make element the html's body and assign myStyles to it. This will
    // give it a random background image and properly colored text.
    const element = document.querySelector('html, body');

    element.style.cssText = myStyles;

    // findCMC tests
    {
        console.assert(findCMC("{1}") === 1)
        console.assert(findCMC("{1}{U}") === 2)
        console.assert(findCMC("{U}{B}{G}") === 3)
        console.assert(findCMC("{5}{B}{G}") === 7)
        console.assert(findCMC("{2}{B}{G}") === 4)
        console.assert(findCMC("{X}{X}{G}{G}") === 2)
    }

    dc = drawingContext

    // inputBox = createInput()
    // inputBox.parent("#ins")
    // inputBox.size(50)

    inputBox = createSelect()
    inputBox.parent("#ins")

    inputBox.option("FIN")
    inputBox.option("TDM")
    inputBox.option("DSK")
    inputBox.option("DFT")
    inputBox.option("FDN")


    inputBox.selected(localStorage.getItem("setCode").toUpperCase())

    // saveButton = createButton("Select Set")
    // saveButton.parent("#ins")
    inputBox.changed(saveSet)
}


// saves a set code to local storage when the save button is pressed! Only
// works if the selected set is actually compatible.
function saveSet() {
    let set = inputBox.value()
    if (COMPATIBLE_SETS.includes(set.toLowerCase())) {
        localStorage.setItem("setCode", set.toLowerCase())
        console.log("Set code stored in local storage. Reload to view")
    } else {
        console.log("Set not compatible")
    }
}


// callback function for loadJSON when loading a page of the API for a Magic set
function gotData(data) {
    // optimization so that set code collector ID cap changes automatically
    // based on the currently selected set
    let collectorIDCap
    switch (setCode) {
        case "fin":
            collectorIDCap = FIN_COLLECTOR_ID_CAP
            break
        case "tdm":
            collectorIDCap = TDM_COLLECTOR_ID_CAP
            break
        case "dft":
            collectorIDCap = DFT_COLLECTOR_ID_CAP
            break
        case "fdn":
            collectorIDCap = FDN_COLLECTOR_ID_CAP
            break
        case "dsk":
            collectorIDCap = DSK_COLLECTOR_ID_CAP
            break

        case "mkm":
            collectorIDCap = MKM_COLLECTOR_ID_CAP
            break

        case "lci":
            collectorIDCap = LCI_COLLECTOR_ID_CAP
            break

        case "woe":
            collectorIDCap = WOE_COLLECTOR_ID_CAP
            break

        case "one":
            collectorIDCap = ONE_COLLECTOR_ID_CAP
            break

        case "bro":
            collectorIDCap = BRO_COLLECTOR_ID_CAP
            break

        case "mom":
            collectorIDCap = MOM_COLLECTOR_ID_CAP
            break

        case "ltr":
            collectorIDCap = LTR_COLLECTOR_ID_CAP
            break

        case "neo":
            collectorIDCap = NEO_COLLECTOR_ID_CAP
            break

        case "mh3":
            collectorIDCap = MH3_COLLECTOR_ID_CAP
            break

        case "blb":
            collectorIDCap = BLB_COLLECTOR_ID_CAP
            break
    }

    let channelCards = 0

    // loop through all the keys in data
    for (let i = 0; i < Object.keys(data["data"]).length; i++) {
        let currentCard = data["data"][i]

        // there are often 5 jumpstart cards in some sets (Zz was tricked by
        // one) so I hardcoded the maximum ID of cards in boosters. If the
        // current card's collector number is over the max ID, continue.
        if (currentCard['collector_number'] > collectorIDCap) {
            continue
        }

        let originalKeywords = currentCard["keywords"]
        let cardOracle = currentCard['oracle_text']

        // if image_uris doesn't exist, then the card is not an adventure but
        // still has two faces
        if (!(currentCard["image_uris"])) {
            let keywords = originalKeywords.slice()
            let frontFace = currentCard["card_faces"][0]
            let oracle = frontFace["oracle_text"]
            let cmc = findCMC(frontFace["mana_cost"])

            if (oracle.includes(`You may cast ${frontFace["name"]} as though it had flash if you pay {`)
                && oracle.includes(`} more to cast it`)) {
                keywords.push("Flash")
                // we can cheat here because the only cards that have extra
                // costs to play with flash add 2 generic mana :p
                cmc += 2
            }

            print(frontFace["name"])

            cmc = disguiseCheck(oracle, keywords, cmc)

            let condensedCard = {
                "type_line": currentCard["type_line"],
                "keywords": keywords.slice(),
                "colors": findColors(frontFace["mana_cost"]),
                "cmc": cmc,
                "oracle_text": frontFace["oracle_text"],
                "name": currentCard["name"],
                "mana_cost": currentCard["mana_cost"],
                "png": frontFace["image_uris"]["png"]
            }

            // append the current card to the card list
            cardList.push(condensedCard)
            continue
        }

        // if the card does have an adventure, then there will be card faces
        else if (currentCard['card_faces']) {
            let keywords = originalKeywords.slice()
            for (let face of currentCard['card_faces']) {
                let oracle = face["oracle_text"]
                let cmc = findCMC(face["mana_cost"])

                if (oracle.includes(`You may cast ${face["name"]} as though it had flash if you pay {`)
                    && oracle.includes(`} more to cast it`)) {
                    keywords.push("Flash")

                    print("can pay to flash in")

                    cmc += 2 // assuming that the "pay to flash" cost stays at 2
                }

                cmc = disguiseCheck(oracle, keywords, cmc)

                let condensedCard

                // check if the card face contains flash because each face will
                // share the same keywords, which include flash and can cause
                // funny issues. Example: Whirlwing Stormbrood has a sorcery
                // omen that still appears like it has flash due to the keyword
                // bug mentioned earlier this time.
                if (!oracle.includes(`Flash`)) {
                    let index = keywords.indexOf("Flash");
                    if (index !== -1) {
                        keywords.splice(index, 1);
                    }
                }

                condensedCard = {
                    "type_line": face["type_line"],
                    "keywords": keywords.slice(),
                    "colors": findColors(face["mana_cost"]),
                    "cmc": cmc,
                    "oracle_text": face["oracle_text"],
                    "name": face["name"],
                    "mana_cost": face["mana_cost"],
                    "png": currentCard["image_uris"]["png"]
                }

                // append the current card to the card list
                cardList.push(condensedCard)
            }
            continue
        }

        else {
            let keywords = originalKeywords.slice()
            let oracle = currentCard["oracle_text"]
            let cmc = findCMC(currentCard["mana_cost"])

            cmc = disguiseCheck(oracle, keywords, cmc)

            if (oracle.includes(`${currentCard["name"]} has flash as long as`)) {
                keywords.push("Flash")
            }

            if (oracle.includes(`You may cast ${currentCard["name"]} as though it had flash if you pay {`
                )
                && oracle.includes(`} more to cast it`)) {
                keywords.push("Flash")
                print("can pay to flash in")

                cmc += 2 // hack: all cards of this type require only 2 mana
            }

            if (keywords.includes("Spree")) {
                // split the oracle by newline, remove the first element,
                // and start computing the mana value of each Spree branch.
                // use the same strategy as for channel cards: find the
                // beginning and end of all the mana symbols
                let cardLines = oracle.split("\n")
                let lowestSpreeMV = 99999999999999999

                for (let line of cardLines) {
                    if (line === "Spree") {
                        continue
                    }

                    let mcEnd = 0

                    // this loop should iterate forever, until we find a space
                    for (let i = 2; i; i++) {
                        if (line[i] === " ") {
                            mcEnd = i
                            break
                        }
                    }

                    let spreeCMC = findCMC(line.slice(0, mcEnd))

                    if (spreeCMC < lowestSpreeMV) {
                        lowestSpreeMV = spreeCMC
                    }
                }

                // add that branch's CMC to the mana value
                cmc += lowestSpreeMV
            }

            let condensedCard = {
                "type_line": currentCard["type_line"],
                "keywords": keywords.slice(),
                "colors": findColors(currentCard["mana_cost"]),
                "cmc": cmc,
                "oracle_text": currentCard["oracle_text"],
                "name": currentCard["name"],
                "mana_cost": currentCard["mana_cost"],
                "png": currentCard["image_uris"]["png"]
            }

            // append the current card to the card list
            cardList.push(condensedCard)
        }

        // added splitting for legendary cards
        let firstName = currentCard["name"].split(",")[0]
        let discardIndex = cardOracle.indexOf(`Discard ${firstName}`)

        // if there's a discard index, that means somewhere in the string
        // there's a channel-type ability
        if (discardIndex !== -1) {
            let keywords = originalKeywords.slice()
            channelCards++
            // mc string start/end
            let mcStart = 0
            let mcEnd = 0
            let ifFirstRightBracket = false

            for (let i = discardIndex; i > 0; i--) {
                let charI = cardOracle[i]

                // if we're at a newline, that means we've reached
                // the end of the mc end string
                if (charI === "\n") {
                    if (mcEnd === 0)
                        mcEnd = i
                    mcStart = i + 1
                    break
                }

                // if this is the first right bracket we've seen,
                // track the mana cost end
                if (charI === "}" && !ifFirstRightBracket) {
                    mcEnd = i + 1
                    ifFirstRightBracket = true
                }
            }

            let mana_cost = cardOracle.slice(mcStart, mcEnd)
            let cmc = findCMC(mana_cost)
            let colors = findColors(mana_cost)
            keywords.push("Flash")

            let condensedCard = {
                "type_line": currentCard["type_line"],
                "keywords": keywords.slice(),
                "colors": colors,
                "cmc": cmc,
                "oracle_text": currentCard["oracle_text"],
                "name": currentCard["name"],
                // remove channel text
                "mana_cost": mana_cost.replace("Channel — ", ""),
                "png": currentCard["image_uris"]["png"]
            }

            // append the current card to the card list
            cardList.push(condensedCard)
        }

        // support for the Reinforce mechanic
        let reinforceIndex = cardOracle.indexOf(`Reinforce`)
        if (reinforceIndex !== -1) {
            let keywords = originalKeywords.slice()
            let mcStart = reinforceIndex + "Reinforce 2—".length
            let mcEnd = cardOracle.length

            for (let i = mcStart; i < cardOracle.length; i++) {
                // go up to the end of the card oracle or until there is a
                // newline/space
                if (cardOracle[i] === " " || cardOracle[i] === "\n") {
                    mcEnd = i - 1
                    break
                }
            }

            let mana_cost = cardOracle.slice(mcStart, mcEnd)
            let cmc = findCMC(mana_cost)
            let colors = findColors(mana_cost)


            let condensedCard = {
                "type_line": currentCard["type_line"],
                "keywords": keywords.slice(),
                "colors": colors,
                "cmc": cmc,
                "oracle_text": currentCard["oracle_text"],
                "name": currentCard["name"],
                // remove channel text
                "mana_cost": mana_cost,
                "png": currentCard["image_uris"]["png"]
            }

            cardList.push(condensedCard)
        }

        // some cards have an effect when cycled, which is always preceded
        // by the clause "when you cycle this card"
        let cycleIndex = cardOracle.indexOf(`When you cycle this card, `)
        if (cycleIndex !== -1) {
            let keywords = originalKeywords.slice()
            keywords.push("Flash")
            let cycleMcStart = cardOracle.indexOf("Cycling ") + "Cycling ".length
            let mcEnd = cardOracle.length

            for (let i = cycleMcStart; i < cardOracle.length; i++) {
                // go up to the end of the card oracle or until there is a
                // newline/space
                if (cardOracle[i] === " " || cardOracle[i] === "\n") {
                    mcEnd = i - 1
                    break
                }
            }

            let mana_cost = cardOracle.slice(cycleMcStart, mcEnd)
            let cmc = findCMC(mana_cost)
            let colors = findColors(mana_cost)

            let condensedCard = {
                "type_line": currentCard["type_line"],
                "keywords": keywords.slice(),
                "colors": colors,
                "cmc": cmc,
                "oracle_text": currentCard["oracle_text"],
                "name": currentCard["name"],
                "mana_cost": mana_cost,
                "png": currentCard["image_uris"]["png"]
            }

            cardList.push(condensedCard)
        }
    }

    // Scryfall only allows 175 cards or so per query, so sometimes they will
    // use the has_more attribute to signal that there is another page. We
    // need to query that if has_more is true.
    if (data["has_more"]) {
        loadJSON(data["next_page"], gotData)
    }
}


function draw() {
    // clear the canvas, then make a transparent background
    clear()
    background(234, 34, 24, 40)

    textAlign(LEFT)
    textSize(14)

    /* debugCorner needs to be last so its z-index is highest */
    // debugCorner.setText(`frameCount: ${frameCount}`, 2)
    // debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    // debugCorner.showBottom()

    textSize(50)
    textAlign(CENTER)

    // this is just a test
    // stroke(237, 37, 20)
    // strokeWeight(10)
    // line(0, height/2, width, height/2)

    displayCardImages()

    strip.show()

    // display the current state on the top-right of the screen. since text
    // is displayed from the bottom-right in right align mode, the
    // coordinates are the width of the screen and the textAscent() +
    // stateTextMargin
    noStroke()
    textAlign(RIGHT)
    textSize(20)
    fill(0, 0, 100)
    text("state: " + STATE_VALUES[state], width, textAscent() + STATE_TEXT_MARGIN)

    // b.resize(50, 0)
    // image(b, width/2, height/2)

    // test
    // stroke(0, 0, 100)
    // strokeWeight(10)
    // line(100, 100, 500, 500)
    // filter(BLUR, 2)

    // if (frameCount > 3000)
    //     noLoop()
}


// display all the card images in cmcBuckets
function displayCardImages() {
    // before anything else, draw a transparent rect from the top to the bottom
    // of the canvas with a constant width
    fill(0, 0, 80, 30)
    rect(0, 0, SIDE_WIDTH, height)

    // the current image's position for the loops below
    let currentImgPos = new p5.Vector(CARD_START_DISPLAY_X, CARD_START_DISPLAY_Y)
    let savedImg
    for (let i=0; i<Object.keys(cmcBuckets).length; i++) {
        // the selected cmc bucket
        let cmcBucket = cmcBuckets[Object.keys(cmcBuckets)[i]]
        // print(cmcBucket)

        // save the current image's y-position
        let savedImgYPos = currentImgPos.y

        for (let j=0; j<cmcBucket.length; j++) {
            // the current image
            let img = cmcBucket[j][0]

            // if the image will go farther than the width of the screen, wrap
            // the photo around to the next line before displaying it.
            if (currentImgPos.x + CARD_WIDTH > width) {
                currentImgPos.x = CARD_START_DISPLAY_X
                currentImgPos.y += Y_DIST_TO_NEXT_CARD
            }

            // if user is hovering over image, save the image and enable the
            // shadow
            if (currentImgPos.x < mouseX &&
                mouseX < currentImgPos.x + CARD_WIDTH &&

                currentImgPos.y < mouseY &&
                mouseY < currentImgPos.y + CARD_HEIGHT) {
                savedImg = cmcBucket[j][1]
                // enable the drawing context shadow
                enableDcShadow()
            }
            // resize the image every frame TODO find a way to not need this
            img.resize(CARD_WIDTH, 0)

            // display the image at the correct x- and y-position if the mouse
            // is not within the width of the photo
            image(img,
                currentImgPos.x,
                currentImgPos.y
            )

            // update the current image's position
            currentImgPos.x += X_DIST_TO_NEXT_CARD

            // disable the shadow
            resetDcShadow()
        }
        stroke(237, 37, 20)
        strokeWeight(20)

        if (i !== 0) {
            // half of all the padding and margin so that I can center the line
            // I'm about to draw.
            let halfAllSpacing = (CARD_PADDING_X + CARD_PADDING_Y + LINE_MARGIN)/2
            erase()
            line(0, savedImgYPos - halfAllSpacing, width, savedImgYPos - halfAllSpacing)
            noErase()
        }

        // reset the image x-position and update the y-position
        currentImgPos.x = CARD_START_DISPLAY_X
        currentImgPos.y += Y_DIST_TO_NEXT_CARD_ROW

        // draw text for the current CMC bucket's number at the average of the
        // current and saved image position
        let cmcBucketDisplayY = (savedImgYPos + currentImgPos.y)/2
        let cmcBucketDisplayX = SIDE_WIDTH/2

        let cmcBucketValue = Object.keys(cmcBuckets)[i]
        stroke(0, 0, 0)
        strokeWeight(2)
        fill(34, 6, 74)

        // constant that adjusts for numbers not being the tallest letter
        const centeringConst = 2

        // draw a gray circle behind the upcoming text with a black stroke,
        // centered at the middle of the text
        circle(cmcBucketDisplayX,
            cmcBucketDisplayY - textAscent()/2 + centeringConst,
            textAscent()*1.5)

        fill(0, 0, 0)
        noStroke()

        // draw text for the bucket's value
        text(str(cmcBucketValue), cmcBucketDisplayX, cmcBucketDisplayY)
    }

    if (height !== currentImgPos.y)
        resizeCanvas(1200, currentImgPos.y)

    if (savedImg) {
        enableDcShadow()
        // imageMode(CENTER)
        savedImg.resize(1.5 * CARD_WIDTH, 0)
        image(savedImg,
            width/2 + scrollX - savedImg.width/2,
            windowHeight/2 + scrollY - savedImg.height/2
        )
        resetDcShadow()

        // image(savedImg,
        //     windowWidth/2 + scrollX,
        //     windowHeight/2 + scrollY
        // )
        // imageMode(CORNER)
    }
}

function keyPressed() {
    // when focusing on an input field, disable keybinds and shortcuts
    if (document.activeElement.tagName === "INPUT") return

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
        // print("\n")
        //
        // cmcBuckets = {}
        // for (let card of cardList) {
        //     /*
        //        Check if:
        //        type line is instant or
        //        oracle text includes Flash, but not lowercase flash
        //            this is case-sensitive, so it should not register flashback
        //        and this has to be true, then the following has to be true:
        //        card's mana cost has any selected mana symbol inside
        //        CMV of mana pool is greater than or equal to card's cmc
        //            Currently, CMV of current mana pool is just wMana
        //        card is colorless
        //
        //        My current approach happens to handle Phyrexian mana because
        //        that's just {C/P}
        //     */
        //
        //     // a dictionary of cards sorted into buckets of mana value. This
        //     // sounds a lot like the sorting algorithm that sorts values
        //     // with buckets, which is unique in that it only has an O(N)
        //     // runtime. (that's Radix sort)
        //
        //     /*
        //         Check if the card is an instant or has titlecase Flash and is
        //         in the current mana pool's colors. Colorless cards are included.
        //     */
        //     if ((card['type_line'].indexOf("Instant") !== -1 ||
        //         card['keywords'].indexOf("Flash") !== -1)
        //     ) {
        //
        //         // flag that checks if the card is within the current colors
        //         let notWithinColors = false
        //         // for every color list in the card's colors:
        //         for (let colorList of card["colors"]) {
        //             // checks if a match between the color list and the
        //             // currently selected colors is found during the next
        //             // color list loop
        //             let noMatch = true
        //             for (let color of strip.colorsSelected()) {
        //                 // check if it's within the current colors
        //                 if ((colorList.includes(color))) {
        //                     noMatch = false
        //                     break
        //                 }
        //             }
        //
        //             // make sure that there is a match and the color list
        //             // is not empty (due to being the list associated with
        //             // colorless mana). then exit the loop
        //             if (noMatch && (colorList.length !== 0)) {
        //                 notWithinColors = true
        //                 break
        //             }
        //         }
        //
        //         if (notWithinColors) {
        //             continue
        //         }
        //
        //         let cmc = card['cmc']
        //         let cardOracle = card['oracle_text']
        //
        //         /*
        //             If the card's lowercase oracle text contains creature,
        //             it's probably a combat trick. It is also likely a combat
        //             trick if it says "any target". However, Essence Scatter
        //             is not a combat trick, so I have to look out for that.
        //
        //             Examples: Thrill of Possibility is not a combat trick,
        //             but Volt Charge is because it can target anything, not
        //             just creatures.
        //
        //             The purpose of this is to eventually be part of a toggle
        //             that only inputs cards that are a trick when toggled on.
        //         */
        //
        //         // skip the card if the card oracle does not contain
        //         // "creature" or "any target" and the state is equal to
        //         // "tricks only"
        //         if (((cardOracle.toLowerCase().indexOf("creature") !== -1 ||
        //                 cardOracle.toLowerCase().indexOf("any target") !== -1) &&
        //             state === 2)) {
        //             // print the card name and its oracle, then avoid adding
        //             // the card to the cards to be displayed
        //             print(card["name"] + " is a trick. oracle: " + cardOracle)
        //             continue
        //         }
        //
        //         if ((!(cardOracle.toLowerCase().indexOf("creature") !== -1 ||
        //                 cardOracle.toLowerCase().indexOf("any target") !== -1) &&
        //             state === 1)) {
        //             // print the card name and its oracle, then avoid adding
        //             // the card to the cards to be displayed
        //             print(card["name"] + " is not a trick. oracle: " + cardOracle)
        //             continue
        //         }
        //
        //         // if a card has "affinity for" in its name, remove all the
        //         // colorless mana in its cost
        //         if (cardOracle.indexOf("Affinity for") !== -1) {
        //             // mana color strings have the format {colorless}{color}...
        //             let colorlessManaCost = int(card["mana_cost"][1])
        //             cmc -= colorlessManaCost
        //         }
        //
        //             // if a card has cost reduction that isn't affinity, remove
        //         // the cost reduction's cmc from the CMC.
        //         else if (cardOracle.indexOf("This spell costs ") !== -1 &&
        //             cardOracle.indexOf(" less to cast") !== -1) {
        //             let indexOfLessToCast = cardOracle.indexOf(" less to" +
        //                 " cast") - 1
        //             let indexOfSpellCosts = cardOracle.indexOf("This spell" +
        //                 " costs ") + "This spell costs ".length
        //
        //             // the mana string of the cost reduction's CMC
        //             let manaString = cardOracle.slice(indexOfSpellCosts,
        //                 indexOfLessToCast)
        //
        //             let costReductionCMC = findCMC(manaString)
        //
        //             cmc -= costReductionCMC
        //
        //             // console.log(indexOfLessToCast, indexOfSpellCosts)
        //         }
        //
        //         // If Convoke is in the card's oracle:
        //         if (cardOracle.indexOf("Convoke") !== -1) {
        //             // make its CMC 0 because you can convoke a card until its
        //             // mana cost becomes 0
        //             cmc = 0
        //         }
        //
        //         let cardText = loadImage(card['png'])
        //         let cardText2 = loadImage(card['png'])
        //
        //         // initialize or get a CMC bucket.
        //         let targetBucket = cmcBuckets[str(cmc)] ?? []
        //         targetBucket.push([cardText, cardText2])
        //         cmcBuckets[str(cmc)] = targetBucket
        //         print(card["name"], card)
        //     }
        // }
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
            strip.toggleColorOn(color)
            console.log(color + "Mana is now " + strip.getColorMV(color))
        }
    }

    // if T is pressed, call updateState()
    if (key === "t") {
        updateState()
    }
}


// finds the CMC of any mana string
function findCMC(manaString) {
    // for every } that isn't the last character in the string, add a space to
    // the "splittableManaString".
    let splittableManaString = ""

    // the CMC of the mana string
    let cmc = 0

    for (let i=0; i<manaString.length; i++) {
        let char = manaString[i]

        splittableManaString += char

        // checks if the character is } and it's not the last character in the
        // string
        if (char === "}" && i !== manaString.length - 1) {
            splittableManaString += " "
        }
    }

    // split the splittable mana string
    let splitString = splittableManaString.split(" ")

    // for each mana string in splitString, strip away the surrounding brackets
    for (let mana of splitString) {
        mana = mana.replace('{', '')
        mana = mana.replace('}', '')

        if (int(mana)) {
            let intMana = int(mana)
            cmc += intMana
        } else {
            if (mana !== "X" && mana !== "Channel" && mana !== "—") {
                cmc++
            }
        }

    }

    return cmc
}


// finds colors of mana string. actually outputs them as a list of lists,
// where each list is one mana. This design is supposed to represent hybrid
// mana costs in an easy-to-convert way, but it's more cumbersome to debug.
function findColors(manaString) {
    let colors = []

    // deprecated from the time when I only used a single list
    // for (let manaSymbol of manaString) {
    //     if (manaSymbol === "W" || manaSymbol === "U" || manaSymbol === "B" ||
    //         manaSymbol === "R" || manaSymbol === "G") {
    //         if (!(colors.includes(manaSymbol))) {
    //             colors.push(manaSymbol)
    //         }
    //     }
    // }

    let splittableManaString = ""

    for (let i=0; i<manaString.length; i++) {
        let char = manaString[i]

        splittableManaString += char

        // checks if the character is } and it's not the last character in the
        // string
        if (char === "}" && i !== manaString.length - 1) {
            splittableManaString += " "
        }
    }

    // split the splittable mana string
    let splitString = splittableManaString.split(" ")

    // for each mana string in splitString, strip away the surrounding brackets
    for (let mana of splitString) {
        let currentManaColors = []

        for (let char of mana) {
            if (char === "W" || char === "U" || char === "B" ||
                char === "R" || char === "G") {
                currentManaColors.push(char)
            }
        }

        colors.push(currentManaColors)
    }

    // print(colors)
    return colors
}

// checks for disguise text in a card
function disguiseCheck(oracle, keywords, ogCMC) {
    if (oracle.indexOf(`Disguise {`) !== -1) {
        // note that the length of "Disguise " is 9 chars
        let indexOfDisguise = oracle.indexOf("Disguise {") + 9

        // face-down cards can be turned up at any time
        keywords.push("Flash")

        // iterate over each character to find the CMC string that
        // is the cost to flip up the disguised creature
        for (let i = indexOfDisguise; i < oracle.length; i++) {
            let char = oracle[i]
            if (char === " " || char === "\n" || char === ".") {
                let disguiseCost = oracle.slice(indexOfDisguise, i)

                let disguiseCMC = findCMC(disguiseCost)

                // afterward, if there is a set of text that requires cost
                // reduction, handle that here.
                if (oracle.indexOf("This cost is reduced by {", indexOfDisguise) !== -1) {
                    print("cost reduction found in this card")

                    // handles "if" conditions that reduce a cost if a
                    // single condition is met.
                    if (oracle.indexOf("} if ", indexOfDisguise) !== -1) {
                        let reductionIndex = oracle.indexOf("this cost is" +
                            " reduced by {") + 24

                        for (let j=reductionIndex; j < oracle.length; j++) {
                            let char = oracle[j]

                            if (char === " " || char === "\n" || char === ".") {
                                let reduction = oracle.slice(reductionIndex, j)

                                let reductionCMC = findCMC(reduction)

                                return disguiseCMC - reductionCMC
                            }
                        }
                    }

                    // handles "for each" conditions that reduce the cost
                    // for each time the condition is met (similar to the
                    // cost reduction keyword Affinity)
                    if (oracle.indexOf("} for each ", indexOfDisguise) !== -1) {
                        // in this case, just assume that the mana
                        // reduction is {1} and remove the first 3
                        // characters from the disguise cost's CMC
                        let reductionCMC = int(disguiseCost[1])

                        return disguiseCMC - reductionCMC
                    }
                }

                return disguiseCMC
            }
        }
    }
    return ogCMC
}

// resets the drawing context's shadow
function resetDcShadow() {
    dc.shadowBlur = 0
    dc.shadowOffsetY = 0
    dc.shadowOffsetX = 0
}


// turns on the drawing context's shadow/back glow
function enableDcShadow() {
    let milk = color(207, 7, 100)
    let white = color(0, 0, 255)
    /* call this before drawing an image */
    dc.shadowBlur = 20
    dc.shadowColor = milk
}


/* increments state and wraps it around to state 0. States:
     state=0: both tricks and non-tricks
     state=1: only tricks
     state=2: only non-tricks
*/
function updateState() {
    state++

    // if the state is now over the limit, reset it
    if (state > 2) {
        state = 0
    }
}


function mousePressed() {
    // console.log("Mouse clicked!")
    strip.checkIfMouseClickedSelector()
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
